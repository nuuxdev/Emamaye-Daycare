"use node";

import { action, internalAction } from "./_generated/server";
import { v } from "convex/values";
import webpush from "web-push";
import { internal } from "./_generated/api";

webpush.setVapidDetails(
    "mailto:support@emamayedaycare.com",
    process.env.VAPID_PUBLIC_KEY || "",
    process.env.VAPID_PRIVATE_KEY || ""
);

export const sendNotification = internalAction({
    args: {
        userId: v.optional(v.id("users")),
        title: v.string(),
        body: v.string(),
        link: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const subscriptions = await ctx.runQuery(internal.notifications.getSubscriptions, {
            userId: args.userId,
        });

        const promises = subscriptions.map(async (sub: any) => {
            try {
                await webpush.sendNotification(
                    {
                        endpoint: sub.endpoint,
                        keys: {
                            p256dh: sub.p256dh,
                            auth: sub.auth,
                        },
                    },
                    JSON.stringify({
                        title: args.title,
                        body: args.body,
                        link: args.link || "/",
                    })
                );
            } catch (error: any) {
                if (error.statusCode === 404 || error.statusCode === 410) {
                    // Subscription has expired or is no longer valid
                    // We could call a mutation to delete the sub here, e.g.:
                    // await ctx.runMutation(api.notifications.removeSubscription, { endpoint: sub.endpoint })
                } else {
                    console.error("Push notification error:", error);
                }
            }
        });

        await Promise.all(promises);
    },
});
