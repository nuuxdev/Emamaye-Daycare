import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { VStatus } from "./types/attendance";

export const recordAttendance = mutation({
  args: {
    attendanceData: v.array(
      v.object({
        childId: v.id("children"),
        status: VStatus,
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

export const updateSingleAttendance = mutation({
  args: {
    attendanceId: v.id("attendance"),
    status: VStatus,
  },
  handler: async (ctx, args) => {
    const result = await ctx.db.patch(args.attendanceId, {
      status: args.status,
    });
    console.log(result);
    return result;
  },
});
