import { CalendarDate, toCalendar } from "@internationalized/date";
import { EthiopianCalendar, todayInEth, todayInGreg } from "./calendar";
import { toast } from "sonner";
import { TAgeGroup } from "@/convex/types/children";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/lib/translations";

/**
 * Gets the number of days in the previous month for an Ethiopian calendar date.
 * Handles the 13th month (Pagume) correctly, which is 5 or 6 days depending on leap year.
 */
function getDaysInPreviousMonth(date: CalendarDate): number {
  // Get the previous month's date to determine its days
  const prevMonth = date.month === 1 ? 13 : date.month - 1;
  const prevYear = date.month === 1 ? date.year - 1 : date.year;

  // Create a date in the previous month to get its day count
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

export function calculateAge(dateOfBirth: CalendarDate): TAgeResult | undefined {
  const isEthiopic = dateOfBirth.calendar.identifier === "ethiopic";
  const bdInEth = isEthiopic ? dateOfBirth : toCalendar(dateOfBirth, EthiopianCalendar);
  const { year: thisYear, month: thisMonth, day: thisDay } = todayInEth;
  const { year: bdYear, month: bdMonth, day: bdDay } = bdInEth;

  let ageInYears = thisYear - bdYear;
  let ageInMonths = thisMonth - bdMonth;
  let ageInDays = thisDay - bdDay;

  // Get the number of days in the previous month (relative to today) for borrowing
  const daysInPrevMonth = getDaysInPreviousMonth(todayInEth);

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
    }
    else {
      if (ageInDays < 0) {
        ageInMonths--;
        ageInDays += daysInPrevMonth;
      }
    }
  }
  else {
    if (ageInMonths < 0) {
      ageInYears--;
      ageInMonths += 13;
      if (ageInDays < 0) {
        ageInMonths--;
        ageInDays += daysInPrevMonth;
      }
    }
    else if (ageInMonths === 0) {
      if (ageInDays < 0) {
        ageInYears--;
        ageInMonths = 12; // In Ethiopian 13 months, month indices are 1-13
        ageInDays += daysInPrevMonth;
      }
    }
    else {
      if (ageInDays < 0) {
        ageInMonths--;
        ageInDays += daysInPrevMonth;
      }
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

  const formatAge = (age: TAgeResult | undefined) => {
    if (!age) return "";
    if (age.isJustBorn) return t.justBorn;

    const parts = [];
    if (age.years > 0) {
      parts.push(`${age.years} ${age.years === 1 ? t.year : t.years}`);
    }
    if (age.months > 0) {
      parts.push(`${age.months} ${age.months === 1 ? t.month : t.months}`);
    }
    if (age.years === 0 && age.months === 0 && age.days > 0) {
      parts.push(`${age.days} ${age.days === 1 ? t.day : t.days}`);
    }

    if (language === "am") {
      return parts.join(" ከ ");
    }
    return parts.join(", ");
  };

  const formatAgeShort = (age: TAgeResult | undefined) => {
    if (!age) return "";
    if (age.isJustBorn) return t.justBorn;

    const parts = [];
    if (age.years > 0) {
      parts.push(`<span>${age.years}</span>${language === 'am' ? t.year : 'y'}`);
    }
    if (age.months > 0) {
      parts.push(`<span>${age.months}</span>${language === 'am' ? t.month : 'm'}`);
    }
    if (age.years === 0 && age.months === 0 && age.days > 0) {
      parts.push(`<span>${age.days}</span>${language === 'am' ? t.day : 'd'}`);
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
