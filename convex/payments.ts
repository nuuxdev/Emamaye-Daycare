import { v } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

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
    },
    handler: async (ctx, args) => {
        let payments;

        if (args.status) {
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
                    childAvatar: child?.avatar,
                    paymentSchedule: child?.paymentSchedule,
                };
            })
        );

        return enrichedPayments;
    },
});

export const markAsPaid = mutation({
    args: {
        paymentId: v.id("payments"),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Unauthorized");

        await ctx.db.patch(args.paymentId, {
            status: "paid",
            paidAt: new Date().toISOString(),
        });
    },
});

// This mutation checks all children and creates payments if they are due.
// Logic: Children pay on either month-end (30th) or month-half (15th) based on their paymentSchedule.
export const generateMonthlyPayments = mutation({
    args: {
        year: v.number(),
        month: v.number(), // 0-indexed (0=Jan, 11=Dec)
    },
    handler: async (ctx, { year, month }) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Unauthorized");

        const children = await ctx.db.query("children").collect();
        const paymentSettings = await ctx.db.query("paymentSettings").collect();
        const settingsMap = new Map(paymentSettings.map(s => [s.ageGroup, s.amount]));

        let createdCount = 0;

        for (const child of children) {
            // Use paymentSchedule to determine due day (15 or 30)
            const dueDay = child.paymentSchedule === "month_half" ? 15 : 30;

            // Calculate due date for this month
            const dueDate = new Date(year, month, dueDay);
            const dueDateStr = dueDate.toISOString().split('T')[0]; // YYYY-MM-DD

            // Check if payment already exists for this child and due date
            const existingPayments = await ctx.db
                .query("payments")
                .withIndex("by_child", (q) => q.eq("childId", child._id))
                .collect();

            const alreadyExists = existingPayments.some(p => p.dueDate === dueDateStr);

            if (!alreadyExists) {
                const amount = settingsMap.get(child.ageGroup) || child.paymentAmount || 0;

                await ctx.db.insert("payments", {
                    childId: child._id,
                    amount,
                    dueDate: dueDateStr,
                    status: "pending",
                });
                createdCount++;
            }
        }

        return { createdCount, totalChildren: children.length };
    }
});

// Internal mutation for cron job (no auth check needed)
export const autoGeneratePayments = internalMutation({
    args: {},
    handler: async (ctx) => {
        const today = new Date();
        const day = today.getDate();

        // Only run on 15th or 30th of the month
        if (day !== 15 && day !== 30) return { skipped: true };

        const children = await ctx.db.query("children").collect();
        const paymentSettings = await ctx.db.query("paymentSettings").collect();
        const settingsMap = new Map(paymentSettings.map(s => [s.ageGroup, s.amount]));

        let createdCount = 0;

        for (const child of children) {
            // Only process children whose schedule matches today's date
            const shouldProcess =
                (day === 15 && child.paymentSchedule === "month_half") ||
                (day === 30 && child.paymentSchedule === "month_end");

            if (!shouldProcess) continue;

            const dueDateStr = today.toISOString().split('T')[0];

            const existingPayments = await ctx.db
                .query("payments")
                .withIndex("by_child", (q) => q.eq("childId", child._id))
                .collect();

            const alreadyExists = existingPayments.some(p => p.dueDate === dueDateStr);

            if (!alreadyExists) {
                const amount = settingsMap.get(child.ageGroup) || child.paymentAmount || 0;

                await ctx.db.insert("payments", {
                    childId: child._id,
                    amount,
                    dueDate: dueDateStr,
                    status: "pending",
                });
                createdCount++;
            }
        }

        return { createdCount };
    }
});
