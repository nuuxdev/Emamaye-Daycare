import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Run daily at 6 AM (UTC timezone)
// This will check if today is the 15th or 30th and generate payments accordingly
crons.daily(
    "generate-monthly-payments",
    { hourUTC: 6, minuteUTC: 0 },
    internal.payments.autoGeneratePayments
);

// Frequent check to dispatch push notifications reliably based on configurable timestamps.
crons.interval(
    "attendance-reminder-checks",
    { hours: 1 },
    internal.attendance.checkAndSendReminders
);

// Daily check for upcoming birthdays
crons.daily(
    "birthday-reminder-checks",
    { hourUTC: 6, minuteUTC: 0 },
    internal.children.checkAndSendBirthdayReminders
);

export default crons;
