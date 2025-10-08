import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const recordAttendance = mutation({
  args: {
    attendanceRecord: v.array(v.id("children")),
    date: v.string(),
  },
  handler: async (ctx, args) => {
    for (const childId of args.attendanceRecord) {
      const id = await ctx.db.insert("attendance", {
        childId,
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
