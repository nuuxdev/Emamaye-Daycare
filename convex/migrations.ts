import { v } from "convex/values";
import { mutation } from "./_generated/server";

export const backfillIsActive = mutation({
    args: {},
    handler: async (ctx) => {
        const children = await ctx.db.query("children").collect();
        let count = 0;
        for (const child of children) {
            if (child.isActive === undefined) {
                await ctx.db.patch(child._id, { isActive: true });
                count++;
            }
        }
        return `Backfilled ${count} children with isActive: true`;
    },
});
