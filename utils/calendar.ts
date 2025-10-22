import {
  EthiopicCalendar,
  getLocalTimeZone,
  toCalendar,
  today,
} from "@internationalized/date";

export const EthiopianCalendar = new EthiopicCalendar();
export const todayInGreg = today(getLocalTimeZone());
export const todayInEth = toCalendar(todayInGreg, EthiopianCalendar);
