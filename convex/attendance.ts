import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { VStatus } from "./types/attendance";
import { todayInEth } from "../utils/calendar"; // Ensure relative path or use standard date logic string generator.

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
    // 1. Fetch all existing records for the given date
    const existingRecords = await ctx.db
      .query("attendance")
      .withIndex("by_date", (q) => q.eq("date", args.date))
      .collect();

    // 2. Map existing records by childId for fast lookup
    const existingByChild = new Map();
    for (const record of existingRecords) {
      existingByChild.set(record.childId, record);
    }

    // 3. Upsert attendees safely
    for (const childAttendance of args.attendanceData) {
      const existing = existingByChild.get(childAttendance.childId);
      if (existing) {
        // Prevent strictly duplicating by patching only if state drifted
        if (existing.status !== childAttendance.status) {
          await ctx.db.patch(existing._id, { status: childAttendance.status });
        }
      } else {
        await ctx.db.insert("attendance", {
          childId: childAttendance.childId,
          status: childAttendance.status,
          date: args.date,
        });
      }
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

export const getAttendanceByDateRange = query({
  args: {
    startDate: v.string(),
    endDate: v.string(),
  },
  handler: async (ctx, args) => {
    return ctx.db
      .query("attendance")
      .filter((q) =>
        q.and(
          q.gte(q.field("date"), args.startDate),
          q.lte(q.field("date"), args.endDate)
        )
      )
      .collect();
  },
});

export const checkAndSendReminders = internalMutation({
  handler: async (ctx) => {
    const setting = await ctx.db
      .query("appSettings")
      .withIndex("by_key", (q) => q.eq("key", "notificationTime"))
      .first();

    const targetHour = setting?.value?.hour ?? 20;
    const targetMinute = setting?.value?.minute ?? 30; // Default to 8:30

    const now = new Date();
    const currentUTC = now.getUTCHours();
    const currentEAT = (currentUTC + 3) % 24;
    const currentMinute = now.getUTCMinutes();

    const currentTotalMinutes = currentEAT * 60 + currentMinute;
    const targetTotalMinutes = targetHour * 60 + targetMinute;

    // Prevent execution if we haven't reached the target time of the day yet.
    if (currentTotalMinutes < targetTotalMinutes) {
      return;
    }

    const twelveHoursAgo = Date.now() - 12 * 60 * 60 * 1000;
    const recentNotif = await ctx.db
      .query("notifications")
      .withIndex("by_timestamp", (q) => q.gte("timestamp", twelveHoursAgo))
      .filter((q) => q.eq(q.field("title"), "የአቴንዳንስ ማሳሰቢያ!"))
      .first();

    if (recentNotif) {
      return;
    }

    await ctx.db.insert("notifications", {
      title: "የአቴንዳንስ ማሳሰቢያ!",
      body: "የዛሬውን የልጆች አቴንዳንስ ሞልተዋል? አሁን ይሙሉ!",
      link: "/attendance",
      isRead: false,
      timestamp: Date.now(),
    });

    await ctx.scheduler.runAfter(0, internal.push.sendNotification, {
      title: "የአቴንዳንስ ማሳሰቢያ!",
      body: "የዛሬውን የልጆች አቴንዳንስ ሞልተዋል? አሁን ይሙሉ!",
      link: "/attendance",
    });
  },
});
