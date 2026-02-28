import {
  CalendarDate,
  EthiopicCalendar,
  getLocalTimeZone,
  GregorianCalendar,
  toCalendar,
  today,
  parseDate,
} from "@internationalized/date";

export const EthiopianCalendar = new EthiopicCalendar();
export const todayInGreg = today(getLocalTimeZone());
export const todayInEth = toCalendar(todayInGreg, EthiopianCalendar);
export const currentDate = todayInEth.day;
export const currentMonth = todayInEth.month;
export const currentYear = todayInEth.year;

// Ethiopian month names in Amharic
export const ethMonthNames = [
  "መስከረም",
  "ጥቅምት",
  "ህዳር",
  "ታህሳስ",
  "ጥር",
  "የካቲት",
  "መጋቢት",
  "ሚያዝያ",
  "ግንቦት",
  "ሰኔ",
  "ሀምሌ",
  "ነሃሴ",
  "ጳጉሜ",
];

// Format a Gregorian date string to Ethiopian date format
// Input: "2024-12-04" (Gregorian)
// Output: "ታህሳስ 25, 2017"
export function formatEthiopianDate(gregorianDateString: string): string {
  const gregDate = parseDate(gregorianDateString);
  const ethDate = toCalendar(gregDate, EthiopianCalendar);
  const monthName = ethMonthNames[ethDate.month - 1];
  return `${monthName} ${ethDate.day}, ${ethDate.year}`;
}

export function fromEthDateString(dateString: string) {
  const [month, date, year] = dateString.split("-");
  console.log(month, date, year);
  const dateInEt = new CalendarDate(
    new EthiopicCalendar(),
    parseInt(year),
    parseInt(month),
    parseInt(date),
  );
  // Convert to Gregorian and return as string (YYYY-MM-DD)
  return toCalendar(dateInEt, new GregorianCalendar()).toString();
}

export function gregorianToEthDateString(gregorianDateString: string): string {
  try {
    const gregDate = parseDate(gregorianDateString);
    const ethDate = toCalendar(gregDate, EthiopianCalendar);
    const month = ethDate.month < 10 ? `0${ethDate.month}` : ethDate.month;
    const day = ethDate.day < 10 ? `0${ethDate.day}` : ethDate.day;
    return `${month}-${day}-${ethDate.year}`;
  } catch (error) {
    console.error("Error converting date:", error);
    return todayInEthString;
  }
}

export const todayInEthString = `${currentMonth < 10 ? `0${currentMonth}` : currentMonth}-${currentDate < 10 ? `0${currentDate}` : currentDate}-${currentYear}`;

