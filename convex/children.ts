import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { VAgeGroup, VGender } from "./types/children";
import { VRelationToChild } from "./types/guardians";

export const addChild = mutation({
  args: {
    childData: v.object({
      fullName: v.string(),
      gender: VGender,
      dateOfBirth: v.string(),
      ageGroup: VAgeGroup,
      paymentAmount: v.number(),
      paymentSchedule: v.union(v.literal("month_end"), v.literal("month_half")),
      avatar: v.optional(v.id("_storage")),
    }),
    guardianData: v.object({
      fullName: v.string(),
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
      relationToChild: args.guardianData.relationToChild,
      address: args.guardianData.address,
      phoneNumber: args.guardianData.phoneNumber,
      avatar: await getGuadianAvatarUrl(),
    });

    const getChildAvatarUrl = async () => {
      if (args.childData.avatar) {
        return await ctx.storage.getUrl(args.childData.avatar) || undefined
      }
      return
    }
    const childId = await ctx.db.insert("children", {
      fullName: args.childData.fullName,
      gender: args.childData.gender,
      dateOfBirth: args.childData.dateOfBirth,
      ageGroup: args.childData.ageGroup,
      paymentAmount: args.childData.paymentAmount,
      paymentSchedule: args.childData.paymentSchedule,
      avatar: await getChildAvatarUrl(),
      primaryGuardian: guardianId,
      isActive: true,
    });
    if (!childId) throw new Error("Child not added");

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
