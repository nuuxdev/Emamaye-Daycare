import { describe, it, expect, vi } from "vitest";
import { CalendarDate, EthiopicCalendar } from "@internationalized/date";

// We need to mock the modules that use React hooks / browser APIs
// before importing calculateAge
vi.mock("sonner", () => ({
    toast: { error: vi.fn() },
}));

vi.mock("@/context/LanguageContext", () => ({
    useLanguage: () => ({ language: "en" }),
}));

vi.mock("@/lib/translations", () => ({
    translations: {
        en: {
            childInfo: {
                labels: {
                    justBorn: "Just Born",
                    year: "year",
                    years: "years",
                    month: "month",
                    months: "months",
                    day: "day",
                    days: "days",
                },
            },
        },
    },
}));

// Mock the calendar module to provide a stable todayInEth
vi.mock("./calendar", async () => {
    const { EthiopicCalendar, CalendarDate } = await import(
        "@internationalized/date"
    );
    const cal = new EthiopicCalendar();
    return {
        EthiopianCalendar: cal,
        todayInEth: new CalendarDate(cal, 2018, 7, 16), // Hamle 16, 2018 ET
        todayInGreg: null,
    };
});

import { calculateAge, TAgeResult } from "./calculateAge";

const EC = new EthiopicCalendar();

function ethDate(year: number, month: number, day: number): CalendarDate {
    return new CalendarDate(EC, year, month, day);
}

// Helper: fixed "today" for all tests = Hamle 16, 2018 (month 11, day 16)
const TODAY = ethDate(2018, 7, 16);

describe("calculateAge", () => {
    describe("basic age calculation", () => {
        it("returns 0y 0m 0d for same day (just born)", () => {
            const result = calculateAge(ethDate(2018, 7, 16), TODAY)!;
            expect(result.years).toBe(0);
            expect(result.months).toBe(0);
            expect(result.days).toBe(0);
            expect(result.isJustBorn).toBe(true);
        });

        it("calculates simple age correctly", () => {
            // Born Meskerem 1, 2015 → today Hamle 16, 2018 = 3y 6m 15d
            const result = calculateAge(ethDate(2015, 1, 1), TODAY)!;
            expect(result.years).toBe(3);
            expect(result.months).toBe(6);
            expect(result.days).toBe(15);
        });

        it("calculates age for exactly 1 year", () => {
            // Born Hamle 16, 2017 → today Hamle 16, 2018 = 1y 0m 0d
            const result = calculateAge(ethDate(2017, 7, 16), TODAY)!;
            expect(result.years).toBe(1);
            expect(result.months).toBe(0);
            expect(result.days).toBe(0);
            expect(result.isBirthday).toBe(true);
        });

        it("calculates age for a few days old", () => {
            // Born Hamle 10, 2018 → today Hamle 16, 2018 = 0y 0m 6d
            const result = calculateAge(ethDate(2018, 7, 10), TODAY)!;
            expect(result.years).toBe(0);
            expect(result.months).toBe(0);
            expect(result.days).toBe(6);
        });

        it("calculates age for a few months old", () => {
            // Born Megabit 16, 2018 (month 7) → today Hamle 16, 2018 (month 11 in greg-month-order but month 7 in ET)
            // Actually: Megabit = month 7, Hamle = month 11
            // Wait, let me re-check Ethiopian months:
            // 1=Meskerem, 2=Tikimt, 3=Hidar, 4=Tahsas, 5=Tir, 6=Yekatit,
            // 7=Megabit, 8=Miazia, 9=Ginbot, 10=Sene, 11=Hamle, 12=Nehase, 13=Pagume
            // TODAY = month 7 = Megabit 16, 2018? No, TODAY is (2018, 7, 16)
            // So month 7 = Megabit. Let me use a clearer example.
            // Born Meskerem 16, 2018 (month 1) → today Megabit 16, 2018 (month 7) = 0y 6m 0d
            const result = calculateAge(ethDate(2018, 1, 16), TODAY)!;
            expect(result.years).toBe(0);
            expect(result.months).toBe(6);
            expect(result.days).toBe(0);
        });
    });

    describe("month borrowing (the key bug fix)", () => {
        it("should NOT produce 12 months — borrows correctly from year", () => {
            // Born Nehase 15, 2015 (month 12) → today Megabit 16, 2018 (month 7)
            // Months: 7 - 12 = -5, Days: 16 - 15 = 1
            // Borrow: years 3→2, months -5 + 12 = 7
            // Result: 2y 7m 1d
            const result = calculateAge(ethDate(2015, 12, 15), TODAY)!;
            expect(result.years).toBe(2);
            expect(result.months).toBe(7);
            expect(result.days).toBe(1);
            // This is the key assertion: months must be < 12
            expect(result.months).toBeLessThan(12);
        });

        it("handles month borrowing when birth month is 1 more than current month", () => {
            // Born Miazia 16, 2015 (month 8) → today Megabit 16, 2018 (month 7)
            // Months: 7 - 8 = -1, Days: 16 - 16 = 0
            // Borrow: years 3→2, months -1 + 12 = 11
            // Result: 2y 11m 0d
            const result = calculateAge(ethDate(2015, 8, 16), TODAY)!;
            expect(result.years).toBe(2);
            expect(result.months).toBe(11);
            expect(result.days).toBe(0);
            expect(result.months).toBeLessThan(12);
        });

        it("handles both month AND day borrowing", () => {
            // Born Miazia 25, 2015 (month 8, day 25) → today Megabit 16, 2018 (month 7, day 16)
            // Days: 16 - 25 = -9 → borrow from month: months becomes (7-8)-1 = -2, days += 30 = 21
            // Months: -2 → borrow from year: years 3→2, months -2 + 12 = 10
            // Result: 2y 10m 21d
            const result = calculateAge(ethDate(2015, 8, 25), TODAY)!;
            expect(result.years).toBe(2);
            expect(result.months).toBe(10);
            expect(result.days).toBe(21);
            expect(result.months).toBeLessThan(12);
        });
    });

    describe("13th month (Pagume) handling", () => {
        it("calculates age for birth in Pagume", () => {
            // Born Pagume 3, 2015 (month 13) → today Megabit 16, 2018 (month 7)
            // Months: 7 - 13 = -6, Days: 16 - 3 = 13
            // Borrow: years 3→2, months -6 + 12 = 6
            // Result: 2y 6m 13d
            const result = calculateAge(ethDate(2015, 13, 3), TODAY)!;
            expect(result.years).toBe(2);
            expect(result.months).toBe(6);
            expect(result.days).toBe(13);
        });

        it("handles Pagume birthday with day borrowing", () => {
            // Born Pagume 5, 2015 (month 13, day 5) → today Megabit 3, 2018 (month 7, day 3)
            const todayAlt = ethDate(2018, 7, 3);
            // Days: 3 - 5 = -2 → borrow: months (7-13)-1 = -7, days += prev month days
            // Prev month of month 7 is month 6 = 30 days → days = -2 + 30 = 28
            // Months: -7 → borrow: years 3→2, months -7 + 12 = 5
            // Result: 2y 5m 28d
            const result = calculateAge(ethDate(2015, 13, 5), todayAlt)!;
            expect(result.years).toBe(2);
            expect(result.months).toBe(5);
            expect(result.days).toBe(28);
        });
    });

    describe("birthday detection", () => {
        it("detects birthday correctly", () => {
            const result = calculateAge(ethDate(2015, 7, 16), TODAY)!;
            expect(result.isBirthday).toBe(true);
            expect(result.years).toBe(3);
            expect(result.months).toBe(0);
            expect(result.days).toBe(0);
        });

        it("does not flag non-birthday", () => {
            const result = calculateAge(ethDate(2015, 7, 15), TODAY)!;
            expect(result.isBirthday).toBe(false);
        });

        it("isJustBorn is false for non-zero age", () => {
            const result = calculateAge(ethDate(2015, 7, 16), TODAY)!;
            expect(result.isJustBorn).toBe(false);
        });
    });

    describe("edge cases", () => {
        it("returns undefined for future birth year", () => {
            const result = calculateAge(ethDate(2019, 1, 1), TODAY);
            expect(result).toBeUndefined();
        });

        it("returns undefined for future month in same year", () => {
            const result = calculateAge(ethDate(2018, 8, 1), TODAY);
            expect(result).toBeUndefined();
        });

        it("returns undefined for future day in same month", () => {
            const result = calculateAge(ethDate(2018, 7, 20), TODAY);
            expect(result).toBeUndefined();
        });

        it("handles day borrowing within same year", () => {
            // Born Yekatit 25, 2018 (month 6, day 25) → today Megabit 16, 2018 (month 7, day 16)
            // Months: 7 - 6 = 1, Days: 16 - 25 = -9
            // Borrow from month: months 1→0, days -9 + 30 = 21
            // Result: 0y 0m 21d
            const result = calculateAge(ethDate(2018, 6, 25), TODAY)!;
            expect(result.years).toBe(0);
            expect(result.months).toBe(0);
            expect(result.days).toBe(21);
        });

        it("months are always < 12 for various ages", () => {
            // Test a range of birth months to ensure no 12+ month results
            for (let m = 1; m <= 13; m++) {
                const bd = ethDate(2016, m, Math.min(16, m === 13 ? 5 : 30));
                const result = calculateAge(bd, TODAY);
                if (result) {
                    expect(result.months).toBeLessThan(12);
                    expect(result.months).toBeGreaterThanOrEqual(0);
                    expect(result.days).toBeGreaterThanOrEqual(0);
                }
            }
        });
    });

    describe("accepts today override", () => {
        it("produces different results with different today values", () => {
            const bd = ethDate(2015, 1, 1);
            const today1 = ethDate(2018, 1, 1); // exactly 3 years
            const today2 = ethDate(2018, 7, 1); // 3 years 6 months

            const r1 = calculateAge(bd, today1)!;
            const r2 = calculateAge(bd, today2)!;

            expect(r1.years).toBe(3);
            expect(r1.months).toBe(0);
            expect(r2.years).toBe(3);
            expect(r2.months).toBe(6);
        });
    });
});
