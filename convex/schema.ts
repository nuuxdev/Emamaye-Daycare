import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";
import { VAgeGroup, VGender } from "./types/children";
import { VStatus } from "./types/attendance";
import { VRelationToChild } from "./types/guardians";
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
    gender: VGender,
    dateOfBirth: v.string(),
    ageGroup: VAgeGroup,
    paymentAmount: v.number(),
    avatar: v.string(),
    primaryGuardian: v.id("guardians"),
  }),
  guardians: defineTable({
    fullName: v.string(),
    relationToChild: VRelationToChild,
    address: v.string(),
    phoneNumber: v.string(),
    avatar: v.string(),
  }),
  attendance: defineTable({
    childId: v.id("children"),
    status: VStatus,
    date: v.string(),
  }).index("by_date", ["date"]),
});
