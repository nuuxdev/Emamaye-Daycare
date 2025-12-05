"use node";
import { v } from "convex/values";
import { action } from "./_generated/server";
import tinify from "tinify";

tinify.key = process.env.TINIFY_KEY!;

// Upload and optimize image using Tinify
export const uploadOptimizedImage = action({
    args: { imageData: v.bytes() },
    handler: async (ctx, args): Promise<string> => {
        try {
            const buffer = Buffer.from(args.imageData);

            // Optimize, resize to 100x100, and convert to webp using Tinify
            const source = tinify.fromBuffer(buffer);

            // Resize using "cover" method - scales and crops to exact 100x100
            // This is ideal for avatar images as it maintains aspect ratio and fills the square
            const resized = source.resize({
                method: "cover",
                width: 100,
                height: 100
            });

            // Convert to webp for smaller file size
            const converted = resized.convert({ type: ["image/webp"] });
            const optimizedBuffer = await converted.toBuffer();

            // Create blob from optimized buffer
            const imageBlob = new Blob([new Uint8Array(optimizedBuffer)], {
                type: "image/webp",
            });

            // Store in Convex storage
            const storageId = await ctx.storage.store(imageBlob);
            return storageId;
        } catch (error) {
            console.error("Image optimization failed:", error);
            throw new Error("Failed to optimize and upload image");
        }
    },
});
