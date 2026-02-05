import { query } from "./_generated/server";
import { v } from "convex/values";

export const getSummary = query({
    args: {},
    handler: async (ctx) => {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
        const todayStr = now.toISOString().split("T")[0];

        // --- Children Stats ---
        const allChildren = await ctx.db.query("children").collect();
        const activeChildren = allChildren.filter((c) => c.isActive).length;
        const inactiveChildren = allChildren.filter((c) => !c.isActive).length;
        const newChildren = allChildren.filter((c) => c._creationTime >= startOfMonth).length;

        // --- Attendance Stats ---
        const attendanceToday = await ctx.db
            .query("attendance")
            .withIndex("by_date", (q) => q.eq("date", todayStr))
            .collect();

        const presentToday = attendanceToday.filter((a) => a.status === "present").length;
        const absentToday = attendanceToday.filter((a) => a.status === "absent").length;
        const isFilled = attendanceToday.length > 0;

        // --- Payment Stats (Current Month) ---
        // Due to limited index querying, filter after collection or refine if schema allows
        const allPayments = await ctx.db.query("payments").collect();

        // Filter payments due in current month (YYYY-MM)
        const currentMonthStr = todayStr.substring(0, 7);
        const monthlyPayments = allPayments.filter(p => p.dueDate.startsWith(currentMonthStr));

        const totalExpected = monthlyPayments.reduce((sum, p) => sum + p.amount, 0);
        const totalPaid = monthlyPayments.filter(p => p.status === "paid").reduce((sum, p) => sum + p.amount, 0);
        const totalUnpaid = monthlyPayments.filter(p => p.status === "pending").reduce((sum, p) => sum + p.amount, 0);

        return {
            children: {
                active: activeChildren,
                inactive: inactiveChildren,
                new: newChildren,
            },
            attendance: {
                present: presentToday,
                absent: absentToday,
                isFilled,
            },
            payments: {
                expected: totalExpected,
                paid: totalPaid,
                unpaid: totalUnpaid,
            },
        };
    },
});
