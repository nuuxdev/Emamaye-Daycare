import {
  EthiopicCalendar,
  getLocalTimeZone,
  toCalendar,
  today,
} from "@internationalized/date";

export const EthiopianCalendar = new EthiopicCalendar();
export const todayInGreg = today(getLocalTimeZone());
export const todayInEth = toCalendar(todayInGreg, EthiopianCalendar);
export const currentDate = todayInEth.day;
export const currentMonth = todayInEth.month;
export const currentYear = todayInEth.year;
