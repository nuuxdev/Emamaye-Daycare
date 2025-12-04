// export function calculateAge(dateOfBirth: string) {
//   const today = new Date();
//   const birthDate = new Date(dateOfBirth);

import { CalendarDate, toCalendar, today } from "@internationalized/date";
import { EthiopianCalendar, todayInEth, todayInGreg } from "./calendar";
import { toast } from "sonner";
import { TAgeGroup } from "@/convex/types/children";

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

export function calculateAge(dateOfBirth: CalendarDate) {
  const isEthiopic = dateOfBirth.calendar.identifier === "ethiopic";
  const { year: thisYear, month: thisMonth, day: thisDay } = isEthiopic ? todayInEth : todayInGreg;


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
  if (ageInYears <= 0) {
    if (ageInMonths <= 0) {
      if (ageInDays > 0) {
        age = `${ageInDays}ቀናት`;
      } else {
        age = "";
      }
    } else {
      if (ageInDays > 0) {
        age = `${ageInMonths} ዓመት ከ${ageInDays}ቀናት`;
      } else {
        age = `${ageInMonths} ወር`;
      }
    }
  } else {
    if (ageInMonths <= 0) {
      if (ageInDays > 0) {
        age = `${ageInYears} ዓመት, ${ageInDays}ቀናት`;
      } else {
        age = `${ageInYears} ዓመት`;
      }
    } else {
      if (ageInDays > 0) {
        age = `${ageInYears} ዓመት ከ${ageInMonths} ወር ከ${ageInDays}ቀናት`;
      } else {
        age = `${ageInYears} ዓመት ከ${ageInMonths} ወር`;
      }
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
