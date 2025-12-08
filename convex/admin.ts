import { internalAction } from "./_generated/server";
import { v } from "convex/values";
import { createAccount } from "@convex-dev/auth/server";

export const adminCreateUser = internalAction({
    args: {
        email: v.string(),
        password: v.string(),
    },
    handler: async (ctx, args) => {
        const providerId = "password"; // must match your Convex Auth password provider id
        const account = {
            id: args.email,      // account identifier (e.g. email)
            secret: args.password, // raw password; Convex Auth will hash it
        };
        const profile = {
            email: args.email,
            // add any extra profile fields your app expects
        };

        const newUser = await createAccount(ctx, {
            provider: providerId,
            account,
            profile,
            shouldLinkViaEmail: false,
            shouldLinkViaPhone: false,
        });

        return newUser;
    },
});