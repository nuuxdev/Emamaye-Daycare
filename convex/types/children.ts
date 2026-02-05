import { Infer, v } from "convex/values";

export const VAgeGroup = v.union(
  v.literal("infant"),
  v.literal("toddler"),
  v.literal("preschooler"),
);
export type TAgeGroup = Infer<typeof VAgeGroup>;

export const VGender = v.union(v.literal("male"), v.literal("female"));
export type TGender = Infer<typeof VGender>;

export const VLeaveType = v.union(
  v.literal("graduated"),
  v.literal("moved"),
  v.literal("financial"),
  v.literal("other"),
);
export type TLeaveType = Infer<typeof VLeaveType>;
