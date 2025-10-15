import { v } from "convex/values";
import { action, query } from "./_generated/server";
import { api } from "./_generated/api";

export const getPhoneNumber = action({
  args: {
    field: v.string(),
    id: v.id("guardians"),
  },
  handler: async (ctx, args): Promise<string> => {
    const guardianData = await ctx.runQuery(api.guardians.getGuardian, {
      id: args.id,
    });
    if (!guardianData) throw new Error("Guardian not found");
    return guardianData[args.field as "phoneNumber"];
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
