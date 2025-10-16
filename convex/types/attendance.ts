import { Infer, v } from "convex/values";

export const VStatus = v.optional(
  v.union(v.literal("present"), v.literal("absent")),
);

export type TStatus = Infer<typeof VStatus>;
