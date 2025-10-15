import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const addChild = mutation({
  args: {
    childData: v.object({
      fullName: v.string(),
      gender: v.union(v.literal("male"), v.literal("female")),
      dateOfBirth: v.string(),
      ageGroup: v.string(),
      avatar: v.id("_storage"),
    }),
    guardianData: v.object({
      fullName: v.string(),
      relationToChild: v.string(),
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
      avatar: childAvatarUrl ?? "",
      primaryGuardian: guardianId,
    });
    if (!childId) throw new Error("Child not added");

    return "Child and Guardian added successfully";
  },
});

export const getChildren = query({
  args: {},
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const children = await ctx.db.query("children").collect();

    return children;
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
