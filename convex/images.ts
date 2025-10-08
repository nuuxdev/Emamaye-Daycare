"use node";
import { v } from "convex/values";
import { action } from "./_generated/server";
import tinify from "tinify";
tinify.key = process.env.TINIFY_KEY!;

export const uploadImage = action({
  args: { imageArrayBuffer: v.bytes() },
  handler: async (ctx, args) => {
    const buffer = Buffer.from(args.imageArrayBuffer);
    const source = tinify.fromBuffer(buffer);
    const converted = source.convert({ type: "image/webp" });
    const optimizedBuffer = await converted.toBuffer();
    const imageBlob = new Blob([new Uint8Array(optimizedBuffer)], {
      type: "image/webp",
    });
    const storageId = await ctx.storage.store(imageBlob);
    return storageId;
  },
});
