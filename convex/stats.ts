import { query } from "./_generated/server";
import { v } from "convex/values";

export const getSummary = query({
    args: {},
    handler: async (ctx) => {
        // 1. Total Active Children
        const activeChildren = await ctx.db
            .query("children")
            .filter((q) => q.eq(q.field("isActive"), true))
            .collect();

        // 2. Present Today
        const today = new Date().toISOString().split("T")[0];
        const attendanceToday = await ctx.db
            .query("attendance")
            .withIndex("by_date", (q) => q.eq("date", today))
            .filter((q) => q.eq(q.field("status"), "present"))
            .collect();

        // 3. Pending Payments Sum
        const pendingPayments = await ctx.db
            .query("payments")
            .withIndex("by_status", (q) => q.eq("status", "pending"))
            .collect();

        const totalPendingAmount = pendingPayments.reduce(
            (sum, p) => sum + p.amount,
            0
        );

        return {
            totalActiveChildren: activeChildren.length,
            presentToday: attendanceToday.length,
            pendingPaymentsTotal: totalPendingAmount,
        };
    },
});
