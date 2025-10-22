import { Infer, v } from "convex/values";

export const VRelationToChild = v.union(
  v.literal("mother"),
  v.literal("father"),
  v.literal("grandparent"),
  v.literal("aunt"),
  v.literal("uncle"),
  v.literal("other"),
);

export type TRelationToChild = Infer<typeof VRelationToChild>;
