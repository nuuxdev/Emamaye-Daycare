// export function calculateAge(dateOfBirth: string) {
//   const today = new Date();
//   const birthDate = new Date(dateOfBirth);

import { CalendarDate } from "@internationalized/date";
import { todayInEth } from "./calendar";
import { toast } from "sonner";

//   let years = today.getFullYear() - birthDate.getFullYear();
//   let months = today.getMonth() - birthDate.getMonth();
//   let days = today.getDate() - birthDate.getDate();

//   if (days < 0) {
//     months -= 1;
//   }

//   if (months < 0) {
//     years -= 1;
//     months += 12;
//   }

//   if (years < 1) {
//     return `${months} month${months === 1 ? "" : "s"}`;
//   }

//   return `${years} year${years === 1 ? "" : "s"}`;
// }

const { year: thisYear, month: thisMonth, day: thisDay } = todayInEth;

export function calculateAge(dateOfBirth: CalendarDate) {
  let ageInYears = thisYear - dateOfBirth.year;
  let ageInMonths = thisMonth - dateOfBirth.month;
  let ageInDays = thisDay - dateOfBirth.day;
  if (ageInYears < 0) {
    toast.error("Invalid date");
    return;
  } else {
    if (ageInMonths < 0) {
      ageInYears--;
      ageInMonths += 12;
    } else if (ageInMonths === 0) {
      if (ageInDays < 0) {
        ageInMonths--;
      }
    }
  }
  let age: string;
  if (ageInYears === 0) {
    if (ageInMonths === 0) {
      age = `${ageInDays} days`;
    } else {
      age = `${ageInMonths} months, ${ageInDays} days`;
    }
  } else {
    if (ageInMonths === 0) {
      age = `${ageInYears} years, ${ageInDays} days`;
    } else {
      age = `${ageInYears} years, ${ageInMonths} months`;
    }
  }
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
