import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const addChild = mutation({
  args: {
    fullName: v.string(),
    gender: v.union(v.literal("male"), v.literal("female")),
    avatar: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");

    const childId = await ctx.db.insert("children", {
      fullName: args.fullName,
      gender: args.gender,
      avatar: args.avatar,
    });

    return childId;
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
