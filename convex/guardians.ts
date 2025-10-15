import { v } from "convex/values";
import { query } from "./_generated/server";
import { api } from "./_generated/api";

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
