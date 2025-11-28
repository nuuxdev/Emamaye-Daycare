import { TChildInfo } from "@/app/register/page";
import {
  calculateAge,
  getAgeGroup,
  getPaymentAmount,
} from "@/utils/calculateAge";
import { CalendarDate } from "@internationalized/date";
import { useEffect, useRef, useState } from "react";
import { UseFormRegister, UseFormSetValue } from "react-hook-form";
import { EthiopianCalendar, todayInEth } from "@/utils/calendar";

const { year: thisYear, month: thisMonth, day: thisDay } = todayInEth;

const years: number[] = [];
for (let year = thisYear; year > thisYear - 5; year--) {
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
  const [currentMonth, setCurrentMonth] = useState<number>();
  const [currentDate, setCurrentDate] = useState<number>();
  const [currentYear, setCurrentYear] = useState<number>();
  const [daysInMonth, setDaysInMonth] = useState<number>(30);
  const [monthsArray, setMonthsArray] = useState<string[]>([]);

  useEffect(() => {
    if (currentYear === thisYear) {
      if (monthsArray.length === 13) {
        const newMonthsArray = months.filter((_, i) => i + 1 <= thisMonth);
        setMonthsArray(newMonthsArray);
      }
      if (currentMonth === thisMonth) {
        if (daysInMonth !== thisDay) {
          setDaysInMonth(thisDay);
        }
        return;
      }
    } else {
      if (monthsArray.length !== 13) {
        setMonthsArray(months);
      }
    }
    if (!currentMonth || !currentYear) {
      return;
    }
    const selectedDate = new CalendarDate(
      EthiopianCalendar,
      currentYear,
      currentMonth,
      1, //the current date doesn't matter to get the number of days in the month
    );
    const daysInCurrentMonth = EthiopianCalendar.getDaysInMonth(selectedDate);
    setDaysInMonth(daysInCurrentMonth);
  }, [currentMonth, currentYear]);

  useEffect(() => {
    const scrollers = document.querySelectorAll(".scroller");
    const observers: IntersectionObserver[] = [];
    scrollers.forEach((scroller) => {
      const childOptions = scroller.children[0].childNodes;
      const options = {
        root: scroller,
        rootMargin: "-50% 0px -50% 0px",
        threshold: 0,
      };
      const callback = (entries: IntersectionObserverEntry[]) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("selected");
            entry.target.nextElementSibling?.classList.remove("selected");
            entry.target.previousElementSibling?.classList.remove("selected");
            if (navigator.vibrate) {
              navigator.vibrate(1);
            }
            const index = Array.from(
              entry.target.parentElement!.children,
            ).indexOf(entry.target);
            if (entry.target.className.includes("months")) {
              setCurrentMonth(index + 1);
            } else if (entry.target.className.includes("dates")) {
              setCurrentDate(days[index]);
            } else if (entry.target.className.includes("years")) {
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
  }, [daysInMonth, monthsArray]);

  const dialogRef = useRef<HTMLDialogElement>(null);

  const handleClose = (type: "cancel" | "set") => {
    if (type === "cancel") {
      dialogRef.current?.close();
    } else if (type === "set") {
      const age = calculateAge(
        new CalendarDate(
          EthiopianCalendar,
          currentYear!,
          currentMonth!,
          currentDate!,
        ),
      );
      if (age) {
        const ageGroup = getAgeGroup(age.ageInYears);
        setValue("ageGroup", ageGroup);
        setValue("paymentAmount", getPaymentAmount(ageGroup));
      }
      const dateString = currentDate! < 10 ? `0${currentDate}` : currentDate;
      const monthString =
        currentMonth! < 10 ? `0${currentMonth}` : currentMonth;
      setValue("dateOfBirth", `${monthString}-${dateString}-${currentYear}`);
      dialogRef.current?.close();
    }
  };

  return (
    <div className="mb-1">
      <label htmlFor="dateOfBirth" className="mb-1" style={{ display: "block", marginLeft: "1rem" }}>የልደት ቀን</label>
      <div className="relative">
        <input
          className="neo-input"
          style={{ cursor: "pointer" }}
          onClick={() => dialogRef.current?.showModal()}
          onBeforeInput={() => dialogRef.current?.showModal()}
          type="text"
          id="dateOfBirth"
          placeholder="ወር-ቀን-አመት"
          {...register("dateOfBirth", { required: true })}
          readOnly
        />
       <div style={{ position: "absolute", right: "1.5rem", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", opacity: 0.5 }}>
                    📆
       </div>
    </div>
      <dialog ref={dialogRef}>
        <h3 className="dialog-title">ቀን ይምረጡ</h3>
        <div className="scroller-wrapper">
          <div className="scroller">
            <ul style={{ listStyle: "none" }}>
              {monthsArray?.map((month) => (
                <li key={month} className="months">
                  {month}
                </li>
              ))}
            </ul>
          </div>
          <div className="scroller">
            <ul style={{ listStyle: "none" }}>
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(
                (day) => {
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
                },
              )}
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
        <div className="dialog-actions">
          <button
            className="neo-btn secondary w-full"
            type="button"
            onClick={() => handleClose("cancel")}
          >
            Cancel
          </button>
          <button
            className="neo-btn primary w-full"
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
