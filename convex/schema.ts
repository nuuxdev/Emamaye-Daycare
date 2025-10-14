import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

// The schema is normally optional, but Convex Auth
// requires indexes defined on `authTables`.
// The schema provides more precise TypeScript types.
export default defineSchema({
  ...authTables,
  numbers: defineTable({
    value: v.number(),
  }),
  children: defineTable({
    fullName: v.string(),
    gender: v.union(v.literal("male"), v.literal("female")),
    dateOfBirth: v.string(),
    ageGroup: v.string(),
    avatar: v.string(),
    primaryGuardian: v.id("guardians"),
  }),
  guardians: defineTable({
    fullName: v.string(),
    relationToChild: v.string(),
    address: v.string(),
    phoneNumber: v.string(),
    avatar: v.string(),
  }),
  attendance: defineTable({
    childId: v.id("children"),
    status: v.optional(v.union(v.literal("present"), v.literal("absent"))),
    date: v.string(),
  }).index("by_date", ["date"]),
});
