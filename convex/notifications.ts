import { mutation, query, internalQuery, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { internal } from "./_generated/api";

export const saveSubscription = mutation({
    args: {
        endpoint: v.string(),
        p256dh: v.string(),
        auth: v.string(),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Unauthorized");

        // Check if it already exists
        const existing = await ctx.db
            .query("pushSubscriptions")
            .withIndex("by_endpoint", (q) => q.eq("endpoint", args.endpoint))
            .first();

        if (!existing) {
            await ctx.db.insert("pushSubscriptions", {
                userId,
                endpoint: args.endpoint,
                p256dh: args.p256dh,
                auth: args.auth,
            });
        }
    },
});

export const getSubscriptions = internalQuery({
    args: { userId: v.optional(v.id("users")) },
    handler: async (ctx, args) => {
        if (args.userId) {
            return await ctx.db
                .query("pushSubscriptions")
                .withIndex("by_user", (q) => q.eq("userId", args.userId as typeof getAuthUserId extends () => Promise<infer U> ? Extract<U, string> : any))
                .collect();
        }
        return await ctx.db.query("pushSubscriptions").collect();
    },
});

export const removeSubscription = mutation({
    args: { endpoint: v.string() },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("pushSubscriptions")
            .withIndex("by_endpoint", (q) => q.eq("endpoint", args.endpoint))
            .first();
        if (existing) {
            await ctx.db.delete(existing._id);
        }
    },
});

export const getNotifications = query({
    handler: async (ctx) => {
        return await ctx.db.query("notifications").order("desc").collect();
    },
});

export const markAsRead = mutation({
    args: { notificationId: v.id("notifications") },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.notificationId, { isRead: true });
    },
});

export const markAllAsRead = mutation({
    handler: async (ctx) => {
        const unread = await ctx.db
            .query("notifications")
            .filter((q) => q.eq(q.field("isRead"), false))
            .collect();

        await Promise.all(
            unread.map((n) => ctx.db.patch(n._id, { isRead: true }))
        );
    },
});

export const sendTestPush = internalMutation({
    handler: async (ctx) => {
        await ctx.db.insert("notifications", {
            title: "የአቴንዳንስ ማሳሰቢያ (ሙከራ)",
            body: "የዛሬውን የልጆች አቴንዳንስ ሞልተዋል? አሁን ይሙሉ!",
            link: "/attendance",
            isRead: false,
            timestamp: Date.now(),
        });

        await ctx.scheduler.runAfter(0, internal.push.sendNotification, {
            title: "የአቴንዳንስ ማሳሰቢያ (ሙከራ)",
            body: "የዛሬውን የልጆች አቴንዳንስ ሞልተዋል? አሁን ይሙሉ!",
            link: "/attendance",
        });
    }
});
