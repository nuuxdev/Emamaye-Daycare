import { CalendarDate, toCalendar } from "@internationalized/date";
import { EthiopianCalendar, todayInEth } from "./calendar";
import { toast } from "sonner";
import { TAgeGroup } from "@/convex/types/children";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/lib/translations";

/**
 * Gets the number of days in the previous month for an Ethiopian calendar date.
 * Handles the 13th month (Pagume) correctly, which is 5 or 6 days depending on leap year.
 */
function getDaysInPreviousMonth(date: CalendarDate): number {
  const prevMonth = date.month === 1 ? 13 : date.month - 1;
  const prevYear = date.month === 1 ? date.year - 1 : date.year;

  const prevMonthDate = new CalendarDate(EthiopianCalendar, prevYear, prevMonth, 1);
  return EthiopianCalendar.getDaysInMonth(prevMonthDate);
}

export type TAgeResult = {
  years: number;
  months: number;
  days: number;
  isBirthday: boolean;
  isJustBorn: boolean;
  ageInYears: number;
};

/**
 * Calculates the age from a date of birth using the Ethiopian calendar.
 *
 * Ethiopian calendar has 12 months of 30 days each, plus a 13th month (Pagume)
 * of 5 days (6 in a leap year). Age is expressed conventionally as years (0+),
 * months (0-11), and days (0-29).
 *
 * @param dateOfBirth - The birth date (Ethiopian or Gregorian CalendarDate)
 * @param today - Optional override for "today" (for testing). Defaults to todayInEth.
 */
export function calculateAge(dateOfBirth: CalendarDate, today?: CalendarDate): TAgeResult | undefined {
  const isEthiopic = dateOfBirth.calendar.identifier === "ethiopic";
  const bdInEth = isEthiopic ? dateOfBirth : toCalendar(dateOfBirth, EthiopianCalendar);
  const currentDate = today ?? todayInEth;
  const { year: thisYear, month: thisMonth, day: thisDay } = currentDate;
  const { year: bdYear, month: bdMonth, day: bdDay } = bdInEth;

  let ageInYears = thisYear - bdYear;
  let ageInMonths = thisMonth - bdMonth;
  let ageInDays = thisDay - bdDay;

  // Get the number of days in the previous month (relative to today) for borrowing
  const daysInPrevMonth = getDaysInPreviousMonth(currentDate);

  if (ageInYears < 0) {
    toast.error("Invalid year");
    return;
  } else if (ageInYears === 0) {
    if (ageInMonths < 0) {
      toast.error("Invalid month");
      return;
    } else if (ageInMonths === 0) {
      if (ageInDays < 0) {
        toast.error("Invalid day");
        return;
      }
    } else {
      if (ageInDays < 0) {
        ageInMonths--;
        ageInDays += daysInPrevMonth;
      }
    }
  } else {
    if (ageInDays < 0) {
      ageInMonths--;
      ageInDays += daysInPrevMonth;
    }
    if (ageInMonths < 0) {
      ageInYears--;
      ageInMonths += 12;
    }
  }

  const isJustBorn = ageInYears + ageInMonths + ageInDays === 0;
  const isBirthday = ageInYears > 0 && ageInMonths + ageInDays === 0;

  return {
    years: ageInYears,
    months: ageInMonths,
    days: ageInDays,
    isBirthday,
    isJustBorn,
    ageInYears,
  };
}

export function useAge() {
  const { language } = useLanguage();
  const t = translations[language].childInfo.labels;

  /**
   * Formats an age result as a human-readable string.
   * @param age - The age result from calculateAge
   * @param long - If true, always include days (e.g. "2 years, 8 months, 12 days" / "2y 8m 12d")
   */
  const formatAge = (age: TAgeResult | undefined, long?: boolean) => {
    if (!age) return "";
    if (age.isJustBorn) return t.justBorn;

    const parts = [];
    if (age.years > 0) {
      parts.push(`${age.years} ${age.years === 1 ? t.year : t.years}`);
    }
    if (age.months > 0) {
      parts.push(`${age.months} ${age.months === 1 ? t.month : t.months}`);
    }
    if (long || (age.years === 0 && age.months === 0 && age.days > 0)) {
      if (age.days > 0) {
        parts.push(`${age.days} ${age.days === 1 ? t.day : t.days}`);
      }
    }

    if (language === "am") {
      return parts.join(" ከ ");
    }
    return parts.join(", ");
  };

  /**
   * Formats an age result as a short HTML string.
   * @param age - The age result from calculateAge
   * @param long - If true, always include days (e.g. "2y 8m 12d")
   */
  const formatAgeShort = (age: TAgeResult | undefined, long?: boolean) => {
    if (!age) return "";
    if (age.isJustBorn) return t.justBorn;

    const parts = [];
    if (age.years > 0) {
      parts.push(`<span>${age.years}</span>${language === 'am' ? t.year : 'y'}`);
    }
    if (age.months > 0) {
      parts.push(`<span>${age.months}</span>${language === 'am' ? t.month : 'm'}`);
    }
    if (long || (age.years === 0 && age.months === 0 && age.days > 0)) {
      if (age.days > 0) {
        parts.push(`<span>${age.days}</span>${language === 'am' ? t.day : 'd'}`);
      }
    }

    return parts.join(" ");
  };

  return { formatAge, formatAgeShort };
}

export function getAgeGroup(ageInYears: number) {
  if (ageInYears < 1) {
    return "infant";
  } else if (ageInYears < 2) {
    return "toddler";
  } else {
    return "preschooler";
  }
}

export function getPaymentAmount(ageGroup: TAgeGroup) {
  switch (ageGroup) {
    case "infant":
      return 2500;
    case "toddler":
      return 2000;
    case "preschooler":
      return 1500;
  }
}
