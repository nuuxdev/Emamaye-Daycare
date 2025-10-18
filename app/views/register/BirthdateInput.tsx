import { TChildInfo } from "@/app/register/page";
import {
  CalendarDate,
  EthiopicCalendar,
  getLocalTimeZone,
  toCalendar,
  today,
} from "@internationalized/date";
import { useEffect, useMemo, useRef, useState } from "react";
import { UseFormRegister, UseFormSetValue } from "react-hook-form";

const years: number[] = [];
const todayInGreg = today(getLocalTimeZone());
const todayInEt = toCalendar(todayInGreg, new EthiopicCalendar());
const currentYear = todayInEt.year;
for (let year = currentYear; year > currentYear - 5; year--) {
  years.push(year);
}
const months = [
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
const days: number[] = [];
for (let day = 1; day <= 30; day++) {
  days.push(day);
}

export default function BirthdateInput({
  register,
  setValue,
}: {
  register: UseFormRegister<TChildInfo>;
  setValue: UseFormSetValue<TChildInfo>;
}) {
  // const todayDate = today(getLocalTimeZone());
  // const todayInEt = toCalendar(todayDate, new EthiopicCalendar());

  const [currentMonth, setCurrentMonth] = useState<number>();
  const [currentDate, setCurrentDate] = useState<number>();
  const [currentYear, setCurrentYear] = useState<number>();

  useEffect(() => {
    const scrollers = document.querySelectorAll(".scroller");
    const observers: IntersectionObserver[] = [];
    scrollers.forEach((scroller) => {
      const childOptions = scroller.children[0].childNodes;
      const options = {
        root: scroller,
        threshold: 1.0,
      };
      const callback = (entries: IntersectionObserverEntry[]) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            navigator.vibrate(2);
            const index = Array.from(
              entry.target.parentElement!.children,
            ).indexOf(entry.target);
            if (entry.target.className === "months") {
              setCurrentMonth(index + 1);
            } else if (entry.target.className === "dates") {
              setCurrentDate(days[index]);
            } else if (entry.target.className === "years") {
              setCurrentYear(years[index]);
            }
          }
        });
      };
      const observer = new IntersectionObserver(callback, options);
      childOptions.forEach((option) => {
        observer.observe(option as Element);
      });
      observers.push(observer);
    });
    return () => observers.forEach((observer) => observer.disconnect());
  }, []);

  const dialogRef = useRef<HTMLDialogElement>(null);

  const handleClose = (type: "cancel" | "set") => {
    if (type === "cancel") {
      dialogRef.current?.close();
    } else if (type === "set") {
      const dateString = currentDate! < 10 ? `0${currentDate}` : currentDate;
      const monthString =
        currentMonth! < 10 ? `0${currentMonth}` : currentMonth;
      setValue("dateOfBirth", `${monthString}-${dateString}-${currentYear}`);
      dialogRef.current?.close();
    }
  };

  const daysArray = useMemo(() => {
    if (currentMonth !== 13) {
      return days;
    }
    const eth = new EthiopicCalendar();
    const selectedDate = new CalendarDate(
      new EthiopicCalendar(),
      currentYear!,
      currentMonth!,
      currentDate!,
    );
    return Array.from(
      { length: eth.getDaysInMonth(selectedDate) },
      (_, i) => i + 1,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentMonth, currentYear]);

  return (
    <div style={{ display: "flex" }}>
      <input
        style={{ flex: "1" }}
        onClick={() => dialogRef.current?.showModal()}
        onBeforeInput={() => dialogRef.current?.showModal()}
        type="text"
        id="dateOfBirth"
        placeholder="MMM-DD-YYYY"
        {...register("dateOfBirth", { required: true })}
      />
      <dialog ref={dialogRef}>
        <div className="scroller-wrapper">
          <div className="scroller">
            <ul style={{ listStyle: "none" }}>
              {months.map((month) => (
                <li key={month} className="months">
                  {month}
                </li>
              ))}
            </ul>
          </div>
          <div className="scroller">
            <ul style={{ listStyle: "none" }}>
              {daysArray.map((day) => {
                if (day < 10) {
                  return (
                    <li key={day} className="dates">
                      0{day}
                    </li>
                  );
                }
                return (
                  <li key={day} className="dates">
                    {day}
                  </li>
                );
              })}
            </ul>
          </div>
          <div className="scroller">
            <ul style={{ listStyle: "none" }}>
              {years.map((year) => (
                <li key={year} className="years">
                  {year}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div style={{ display: "flex", gap: "1rem", marginBlock: "3rem" }}>
          <button
            style={{ flex: "1" }}
            type="button"
            onClick={() => handleClose("cancel")}
          >
            Cancel
          </button>
          <button
            style={{ flex: "1" }}
            type="button"
            onClick={() => handleClose("set")}
          >
            Set
          </button>
        </div>
      </dialog>
    </div>
  );
}
