import { CalendarDate, toCalendar } from "@internationalized/date";
import { EthiopianCalendar, todayInEth, todayInGreg } from "./calendar";
import { toast } from "sonner";
import { TAgeGroup } from "@/convex/types/children";

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

export function calculateAge(dateOfBirth: CalendarDate) {
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
      else if (ageInDays === 0) {
        toast.info("just born");
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
      ageInMonths += 13; // Ethiopian calendar has 13 months
      if (ageInDays < 0) {
        ageInMonths--;
        ageInDays += daysInPrevMonth;
      }
    }
    else if (ageInMonths === 0) {
      if (ageInDays < 0) {
        ageInYears--;
        ageInMonths = 12; // Borrow from previous year (12 months, as we're now in month 13 conceptually)
        ageInDays += daysInPrevMonth;
      }
      if (ageInDays === 0) {
        toast.info("happy birthday!");
      }
    }
    else {
      if (ageInDays < 0) {
        ageInMonths--;
        ageInDays += daysInPrevMonth;
      }
    }
  }
  const yearsString = ageInYears > 0 ? `<strong>${ageInYears}</strong> ዓመት ` : ""
  const monthsString = ageInMonths > 0 ? `<strong>${ageInMonths}</strong> ወር ` : ""
  const daysString = ageInDays > 0 ? `<strong>${ageInDays}</strong> ቀናት` : "";
  const age: string = `${yearsString}${monthsString}${daysString}`;


  return { age, ageInYears };
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
