import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getGuardianPhoneNumber = query({
  args: {
    id: v.id("guardians"),
  },
  handler: async (ctx, args) => {
    const guardianData = await ctx.db.get(args.id);
    if (!guardianData) throw new Error("Guardian not found");
    return guardianData.phoneNumber;
  },
});
export const getGuardian = query({
  args: {
    id: v.id("guardians"),
  },
  handler: async (ctx, args) => {
    const guardianData = await ctx.db.get(args.id);
    return guardianData;
  },
});

export const updateGuardianAvatar = mutation({
  args: {
    guardianId: v.id("guardians"),
    avatarStorageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const guardian = await ctx.db.get(args.guardianId);
    if (!guardian) throw new Error("Guardian not found");

    const avatarUrl = await ctx.storage.getUrl(args.avatarStorageId);
    if (!avatarUrl) throw new Error("Could not get avatar URL");

    await ctx.db.patch(args.guardianId, { avatar: avatarUrl });
    return "Avatar updated successfully";
  },
});
