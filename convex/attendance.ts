import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const recordAttendance = mutation({
  args: {
    attendanceData: v.array(
      v.object({
        childId: v.id("children"),
        status: v.optional(v.union(v.literal("present"), v.literal("absent"))),
      }),
    ),
    date: v.string(),
  },
  handler: async (ctx, args) => {
    for (const childAttendance of args.attendanceData) {
      const id = await ctx.db.insert("attendance", {
        childId: childAttendance.childId,
        status: childAttendance.status,
        date: args.date,
      });
    }
  },
});

export const getAttendanceByDate = query({
  args: { date: v.string() },
  handler: async (ctx, args) => {
    return ctx.db
      .query("attendance")
      .withIndex("by_date", (q) => q.eq("date", args.date))
      .collect();
  },
});
