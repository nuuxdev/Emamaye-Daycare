import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { parseDate, toCalendar, EthiopicCalendar } from "@internationalized/date";
import { getAuthUserId } from "@convex-dev/auth/server";
import { VAgeGroup, VGender } from "./types/children";
import { VRelationToChild } from "./types/guardians";

export const addChild = mutation({
  args: {
    childData: v.object({
      fullName: v.string(),
      fullNameAmh: v.optional(v.string()),
      gender: VGender,
      dateOfBirth: v.string(),
      ageGroup: VAgeGroup,
      paymentAmount: v.number(),
      discount: v.optional(v.number()),
      paymentDate: v.number(),
      startDate: v.string(),
      avatar: v.optional(v.id("_storage")),
    }),
    guardianData: v.object({
      fullName: v.string(),
      fullNameAmh: v.optional(v.string()),
      relationToChild: VRelationToChild,
      address: v.string(),
      phoneNumber: v.string(),
      avatar: v.optional(v.id("_storage")),
    }),
  },
  handler: async (ctx, args): Promise<string> => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");

    const getGuadianAvatarUrl = async () => {
      if (args.guardianData.avatar) {
        return await ctx.storage.getUrl(args.guardianData.avatar) || undefined
      }
      return
    }
    const guardianId = await ctx.db.insert("guardians", {
      fullName: args.guardianData.fullName,
      fullNameAmh: args.guardianData.fullNameAmh,
      relationToChild: args.guardianData.relationToChild,
      address: args.guardianData.address,
      phoneNumber: args.guardianData.phoneNumber,
      avatar: await getGuadianAvatarUrl(),
    });

    const startDay = parseInt(args.childData.startDate.split("-")[1], 10);
    const paymentDay = args.childData.paymentDate;
    const monthlyAmount = args.childData.paymentAmount;
    const discount = args.childData.discount || 0;
    const dailyRate = Math.max(0, monthlyAmount - discount) / 30;

    // Calculate the prorated amount for the first payment
    // This is a prepayment system: payment is due immediately at registration
    let daysToCharge: number;
    if (paymentDay >= startDay) {
      // Payment date is after or on start date (same period)
      // e.g., startDay=7, paymentDay=18 → charge for 11 days (7th to 18th)
      daysToCharge = paymentDay - startDay;
    } else {
      // Payment date already passed relative to start date
      // e.g., startDay=9, paymentDay=7 → charge for 28 days (full month minus 2 days gap)
      daysToCharge = 30 - (startDay - paymentDay);
    }

    const initialPaymentAmount = Math.round(daysToCharge * dailyRate);

    const getChildAvatarUrl = async () => {
      if (args.childData.avatar) {
        return await ctx.storage.getUrl(args.childData.avatar) || undefined
      }
      return
    }
    const childId = await ctx.db.insert("children", {
      fullName: args.childData.fullName,
      fullNameAmh: args.childData.fullNameAmh,
      gender: args.childData.gender,
      dateOfBirth: args.childData.dateOfBirth,
      ageGroup: args.childData.ageGroup,
      paymentAmount: monthlyAmount,
      discount: args.childData.discount,
      paymentDate: paymentDay,
      startDate: args.childData.startDate,
      creditBalance: 0,
      avatar: await getChildAvatarUrl(),
      primaryGuardian: guardianId,
      isActive: true,
    });
    if (!childId) throw new Error("Child not added");

    // Generate the initial payment immediately (prepayment system)
    // dueDate is today's Gregorian date
    const todayDate = new Date();
    const dueDateStr = todayDate.toISOString().split("T")[0]; // YYYY-MM-DD

    if (initialPaymentAmount > 0) {
      await ctx.db.insert("payments", {
        childId,
        amount: initialPaymentAmount,
        dueDate: dueDateStr,
        status: "pending",
      });
    }

    return "Child and Guardian added successfully";
  },
});

export const getChildrenWithPrimaryGuardian = query({
  args: {
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    let childrenQuery = ctx.db.query("children");

    // Default to active only if not specified, 
    // or use the specific value provided
    const activeFilter = args.isActive !== undefined ? args.isActive : true;

    const children = await childrenQuery
      .filter((q) => q.eq(q.field("isActive"), activeFilter))
      .collect();

    return await Promise.all(
      children.map(async (child) => {
        const primaryGuardian = await ctx.db.get(child.primaryGuardian);
        return {
          ...child,
          primaryGuardianFullName: primaryGuardian?.fullName,
          primaryGuardianFullNameAmh: primaryGuardian?.fullNameAmh,
          primaryGuardianPhoneNumber: primaryGuardian?.phoneNumber,
        };
      }),
    );
  },
});
export const getChild = query({
  args: {
    id: v.id("children"),
  },
  handler: async (ctx, args) => {
    const child = await ctx.db.get(args.id);
    if (!child) return null;

    const primaryGuardian = await ctx.db.get(child.primaryGuardian);

    return {
      ...child,
      primaryGuardian: primaryGuardian,
    };
  },
});

export const updateChildAvatar = mutation({
  args: {
    childId: v.id("children"),
    avatarStorageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const child = await ctx.db.get(args.childId);
    if (!child) throw new Error("Child not found");

    const avatarUrl = await ctx.storage.getUrl(args.avatarStorageId);
    if (!avatarUrl) throw new Error("Could not get avatar URL");

    await ctx.db.patch(args.childId, { avatar: avatarUrl });
    return "Avatar updated successfully";
  },
});

export const deactivateChild = mutation({
  args: {
    childId: v.id("children"),
    leaveType: v.string(),
    leaveReason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const child = await ctx.db.get(args.childId);
    if (!child) throw new Error("Child not found");

    await ctx.db.patch(args.childId, {
      isActive: false,
      leaveType: args.leaveType,
      leaveReason: args.leaveReason,
      leaveDate: new Date().toISOString(),
    });
    return "Child deactivated successfully";
  },
});

export const reactivateChild = mutation({
  args: {
    childId: v.id("children"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const child = await ctx.db.get(args.childId);
    if (!child) throw new Error("Child not found");

    await ctx.db.patch(args.childId, {
      isActive: true,
      leaveType: undefined,
      leaveReason: undefined,
      leaveDate: undefined,
    });

    return "Child reactivated successfully";
  },
});

export const updateChild = mutation({
  args: {
    childId: v.id("children"),
    fullName: v.string(),
    fullNameAmh: v.optional(v.string()),
    gender: VGender,
    dateOfBirth: v.string(),
    ageGroup: VAgeGroup,
    paymentAmount: v.number(),
    discount: v.optional(v.number()),
    paymentDate: v.number(),
    startDate: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const { childId, ...fields } = args;
    await ctx.db.patch(childId, fields);
    return "Child updated successfully";
  },
});

export const getChildrenNamesByGuardian = query({
  args: {
    guardianId: v.id("guardians"),
  },
  handler: async (ctx, args) => {
    const children = await ctx.db
      .query("children")
      .filter((q) => q.eq(q.field("primaryGuardian"), args.guardianId))
      .collect();
    return children.map((c) => c.fullName);
  },
});

export const checkAndSendBirthdayReminders = internalMutation({
  handler: async (ctx) => {
    // 1. Get tomorrow's date in EAT (+3)
    const now = new Date();
    // Add 3 hours (EAT) + 24 hours (Tomorrow) = +27 hours
    const tomorrowEAT = new Date(now.getTime() + 27 * 60 * 60 * 1000);
    const tomorrowStr = tomorrowEAT.toISOString().split("T")[0]; // YYYY-MM-DD

    // 2. Map to robust Ethiopian Calendar bounds
    const tomorrowGreg = parseDate(tomorrowStr);
    const tomorrowEth = toCalendar(tomorrowGreg, new EthiopicCalendar());

    // 3. Fetch all active children
    const children = await ctx.db
      .query("children")
      .filter(q => q.eq(q.field("isActive"), true))
      .collect();

    for (const child of children) {
      if (!child.dateOfBirth) continue;

      const bdGreg = parseDate(child.dateOfBirth);
      const bdEth = toCalendar(bdGreg, new EthiopicCalendar());

      // Is tomorrow their birthday in the Ethiopian calendar?
      // (Months and days must match exactly!)
      if (bdEth.month === tomorrowEth.month && bdEth.day === tomorrowEth.day) {
        const childName = child.fullNameAmh || child.fullName;
        const notifTitle = "የልደት ማሳሰቢያ!";
        const notifBody = `ነገ የ ${childName} ልደት ነው! መልካም ምኞትዎን ይግለጹ።`;
        const link = `/children/${child._id}`;

        // Prevent duplicate sending for the same child
        const twentyFourHoursAgo = Date.now() - 24 * 60 * 60 * 1000;
        const existingNotif = await ctx.db
          .query("notifications")
          .withIndex("by_timestamp", q => q.gte("timestamp", twentyFourHoursAgo))
          .filter(q => q.and(
            q.eq(q.field("title"), notifTitle),
            q.eq(q.field("link"), link)
          ))
          .first();

        if (existingNotif) continue;

        // Insert persistent DB notification and securely fire Push API action!
        await ctx.db.insert("notifications", {
          title: notifTitle,
          body: notifBody,
          link: link,
          isRead: false,
          timestamp: Date.now(),
        });

        await ctx.scheduler.runAfter(0, internal.push.sendNotification, {
          title: notifTitle,
          body: notifBody,
          link: link,
        });
      }
    }
  }
});
