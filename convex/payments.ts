import { v } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { today, getLocalTimeZone, EthiopicCalendar, toCalendar } from "@internationalized/date";

// --- Payment Settings ---

export const updatePaymentSettings = mutation({
    args: {
        ageGroup: v.string(),
        amount: v.number(),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Unauthorized");

        const existing = await ctx.db
            .query("paymentSettings")
            .withIndex("by_age_group", (q) => q.eq("ageGroup", args.ageGroup))
            .first();

        if (existing) {
            await ctx.db.patch(existing._id, { amount: args.amount });
        } else {
            await ctx.db.insert("paymentSettings", {
                ageGroup: args.ageGroup,
                amount: args.amount,
            });
        }
    },
});

export const getPaymentSettings = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db.query("paymentSettings").collect();
    },
});

// --- Payments ---

export const createPayment = mutation({
    args: {
        childId: v.id("children"),
        amount: v.number(),
        dueDate: v.string(),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Unauthorized");

        await ctx.db.insert("payments", {
            childId: args.childId,
            amount: args.amount,
            dueDate: args.dueDate,
            status: "pending",
        });
    },
});

export const getPayments = query({
    args: {
        status: v.optional(v.string()),
        childId: v.optional(v.id("children")),
        dueDate: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        let payments;

        if (args.dueDate) {
            payments = await ctx.db
                .query("payments")
                .withIndex("by_due_date", (q) => q.eq("dueDate", args.dueDate!))
                .collect();
            if (args.status) {
                payments = payments.filter(p => p.status === args.status);
            }
        } else if (args.status) {
            payments = await ctx.db
                .query("payments")
                .withIndex("by_status", (q) => q.eq("status", args.status!))
                .collect();
        } else {
            payments = await ctx.db.query("payments").collect();
        }

        // Filter by childId in memory if provided
        let result = payments;
        if (args.childId) {
            result = result.filter(p => p.childId === args.childId);
        }

        // Enrich with child info
        const enrichedPayments = await Promise.all(
            result.map(async (payment) => {
                const child = await ctx.db.get(payment.childId);
                return {
                    ...payment,
                    childName: child?.fullName || "Unknown",
                    childNameAmh: child?.fullNameAmh,
                    childAvatar: child?.avatar,
                    paymentDate: child?.paymentDate,
                    childDiscount: child?.discount,
                };
            })
        );

        return enrichedPayments;
    },
});

export const markAsPaid = mutation({
    args: {
        paymentId: v.id("payments"),
        paidAmount: v.optional(v.number()),
        paidDate: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Unauthorized");

        const payment = await ctx.db.get(args.paymentId);
        if (!payment) throw new Error("Payment not found");

        const paidAmount = args.paidAmount ?? payment.amount;
        const paidDate = args.paidDate ?? new Date().toISOString();

        await ctx.db.patch(args.paymentId, {
            status: "paid",
            paidAt: new Date().toISOString(),
            paidAmount,
            paidDate,
        });

        const shortfall = payment.amount - paidAmount;
        if (shortfall !== 0) {
            const child = await ctx.db.get(payment.childId);
            if (child) {
                const newCreditBalance = (child.creditBalance || 0) + shortfall;
                await ctx.db.patch(child._id, { creditBalance: newCreditBalance });
            }
        }
    },
});

export const payCreditBalance = mutation({
    args: {
        childId: v.id("children"),
        amount: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Unauthorized");

        const child = await ctx.db.get(args.childId);
        if (!child) throw new Error("Child not found");

        const creditBalance = child.creditBalance || 0;
        if (creditBalance <= 0) throw new Error("No credit balance to pay");

        const payAmount = args.amount ?? creditBalance;
        if (payAmount <= 0 || payAmount > creditBalance) {
            throw new Error("Invalid payment amount");
        }

        const newBalance = creditBalance - payAmount;
        await ctx.db.patch(args.childId, { creditBalance: newBalance });

        return { paidAmount: payAmount, remainingBalance: newBalance };
    },
});

// This mutation checks all children and creates payments if they are due.
// Logic: Children pay on their specific paymentDate (1-30).
async function performPaymentGeneration(ctx: any, dueDate: string, dayEth: number) {
    const children = await ctx.db.query("children").collect();
    const paymentSettings = await ctx.db.query("paymentSettings").collect();
    const settingsMap = new Map(paymentSettings.map((s: any) => [s.ageGroup, s.amount]));

    let createdCount = 0;

    for (const child of children) {
        if (child.paymentDate !== dayEth) continue;

        // Check if payment already exists for this child and due date
        const existingPayments = await ctx.db
            .query("payments")
            .withIndex("by_child", (q: any) => q.eq("childId", child._id))
            .collect();

        const alreadyExists = existingPayments.some((p: any) => p.dueDate === dueDate);

        if (!alreadyExists) {
            const baseAmount = settingsMap.get(child.ageGroup) || child.paymentAmount || 0;
            const discount = child.discount || 0;
            const adjustedBaseAmount = Math.max(0, baseAmount - discount);
            const creditBalance = child.creditBalance || 0;
            const totalAmount = adjustedBaseAmount + creditBalance;

            await ctx.db.insert("payments", {
                childId: child._id,
                amount: totalAmount,
                dueDate: dueDate,
                status: "pending",
            });
            createdCount++;

            if (creditBalance !== 0) {
                await ctx.db.patch(child._id, { creditBalance: 0 });
            }
        }
    }

    return { createdCount, totalChildren: children.length };
}

export const generateMonthlyPaymentsInternal = internalMutation({
    args: {
        dueDate: v.string(), // YYYY-MM-DD
    },
    handler: async (ctx, { dueDate }) => {
        const [year, month, day] = dueDate.split("-").map(Number);
        const ethCalendar = new EthiopicCalendar();
        // Since we don't have parseDate readily available here without importing it
        // We will just assume the dayEth is the eth day of today, but dueDate could be arbitrary.
        // If dueDate represents the Ethiopian date already? No, it's YYYY-MM-DD of Gregorian usually.
        // Actually, let's just use the current day for dayEth if they use internalMutation
        const todayGreg = today(getLocalTimeZone());
        const todayEth = toCalendar(todayGreg, ethCalendar);
        return await performPaymentGeneration(ctx, dueDate, todayEth.day);
    }
});

export const generateMonthlyPayments = mutation({
    args: {
        dueDate: v.string(),
    },
    handler: async (ctx, { dueDate }) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Unauthorized");

        const todayGreg = today(getLocalTimeZone());
        const todayEth = toCalendar(todayGreg, new EthiopicCalendar());
        return await performPaymentGeneration(ctx, dueDate, todayEth.day);
    }
});

// Internal mutation for cron job (no auth check needed)
export const autoGeneratePayments = internalMutation({
    args: {},
    handler: async (ctx) => {
        const todayGreg = today(getLocalTimeZone());
        const todayEth = toCalendar(todayGreg, new EthiopicCalendar());
        const dayEth = todayEth.day;

        const dueDateStr = todayGreg.toString(); // YYYY-MM-DD
        return await performPaymentGeneration(ctx, dueDateStr, dayEth);
    }
});
