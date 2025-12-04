import {
  CalendarDate,
  EthiopicCalendar,
  getLocalTimeZone,
  GregorianCalendar,
  toCalendar,
  today,
} from "@internationalized/date";

export const EthiopianCalendar = new EthiopicCalendar();
export const todayInGreg = today(getLocalTimeZone());
export const todayInEth = toCalendar(todayInGreg, EthiopianCalendar);
export const currentDate = todayInEth.day;
export const currentMonth = todayInEth.month;
export const currentYear = todayInEth.year;
export function fromEthDateString(dateString: string) {
  const [month, date, year] = dateString.split("-");
  console.log(month, date, year);
  const dateInEt = new CalendarDate(
    new EthiopicCalendar(),
    parseInt(year),
    parseInt(month),
    parseInt(date),
  );
  return dateInEt.toString();
}
export const todayInEthString = `${currentMonth < 10 ? `0${currentMonth}` : currentMonth}-${currentDate < 10 ? `0${currentDate}` : currentDate}-${currentYear}`;
