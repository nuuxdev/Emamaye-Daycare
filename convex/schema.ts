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
    paymentSchedule: v.optional(v.union(v.literal("month_end"), v.literal("month_half"))), // 30th or 15th
    avatar: v.optional(v.string()),
    primaryGuardian: v.id("guardians"),
  }),
  guardians: defineTable({
    fullName: v.string(),
    relationToChild: VRelationToChild,
    address: v.string(),
    phoneNumber: v.string(),
    avatar: v.optional(v.string()),
  }),
  attendance: defineTable({
    childId: v.id("children"),
    status: VStatus,
    date: v.string(),
  }).index("by_date", ["date"]),
  paymentSettings: defineTable({
    ageGroup: v.string(), // "infant", "toddler", "preschooler"
    amount: v.number(),
  }).index("by_age_group", ["ageGroup"]),
  payments: defineTable({
    childId: v.id("children"),
    amount: v.number(),
    dueDate: v.string(), // ISO date string
    status: v.string(), // "pending", "paid"
    paidAt: v.optional(v.string()),
  }).index("by_child", ["childId"]).index("by_status", ["status"]),
});
