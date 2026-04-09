import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getSetting = query({
    args: { key: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("appSettings")
            .withIndex("by_key", (q) => q.eq("key", args.key))
            .first();
    },
});

export const setSetting = mutation({
    args: { key: v.string(), value: v.any() },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("appSettings")
            .withIndex("by_key", (q) => q.eq("key", args.key))
            .first();

        if (existing) {
            await ctx.db.patch(existing._id, { value: args.value });
        } else {
            await ctx.db.insert("appSettings", { key: args.key, value: args.value });
        }
    },
});
