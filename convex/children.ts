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
      avatar: v.id("_storage"),
    }),
    guardianData: v.object({
      fullName: v.string(),
      relationToChild: VRelationToChild,
      address: v.string(),
      phoneNumber: v.string(),
      avatar: v.id("_storage"),
    }),
  },
  handler: async (ctx, args): Promise<string> => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");
    const guardianAvatarUrl = await ctx.storage.getUrl(
      args.guardianData.avatar,
    );
    const guardianId = await ctx.db.insert("guardians", {
      fullName: args.guardianData.fullName,
      relationToChild: args.guardianData.relationToChild,
      address: args.guardianData.address,
      phoneNumber: args.guardianData.phoneNumber,
      avatar: guardianAvatarUrl ?? "",
    });

    const childAvatarUrl = await ctx.storage.getUrl(args.childData.avatar);

    const childId = await ctx.db.insert("children", {
      fullName: args.childData.fullName,
      gender: args.childData.gender,
      dateOfBirth: args.childData.dateOfBirth,
      ageGroup: args.childData.ageGroup,
      paymentAmount: args.childData.paymentAmount,
      avatar: childAvatarUrl ?? "",
      primaryGuardian: guardianId,
    });
    if (!childId) throw new Error("Child not added");

    return "Child and Guardian added successfully";
  },
});

export const getChildrenWithPrimaryGuardian = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const children = await ctx.db.query("children").collect();
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
    return child;
  },
});
