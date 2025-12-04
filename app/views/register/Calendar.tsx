import { TChildInfo } from "@/app/register/page";
import { CalendarDate, parseDate, toCalendar } from "@internationalized/date";
import { useEffect, useRef, useState } from "react";
import { UseFormRegister } from "react-hook-form";
import { EthiopianCalendar, todayInEth } from "@/utils/calendar";

const { year: thisYear, month: thisMonth, day: thisDay } = todayInEth;

const years = Array.from({ length: 5 }, (_, i) => thisYear - i);

export const months = [
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

const days = Array.from({ length: 30 }, (_, i) => i + 1);

export const InputDate = ({ register, onSelect, value }: { register: UseFormRegister<TChildInfo>, onSelect: (date: CalendarDate) => void, value: string }) => {

  const dialogRef = useRef<HTMLDialogElement>(null);

  return <div className="mb-1">
    <label htmlFor="dateOfBirth">የልደት ቀን</label>
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
        <i className="hgi hgi-stroke hgi-calendar-01"></i>
      </div>
    </div>
    <Dialog dialogRef={dialogRef} onSelect={onSelect} value={value} />
  </div>
}

export const SelectDate = ({ onSelect, value }: { onSelect: (date: CalendarDate) => void, value: string }) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  return <>
    <div style={{ cursor: "pointer" }} role="button" onClick={() => dialogRef.current?.showModal()}>
      <i className="hgi hgi-stroke hgi-calendar-01"></i>
    </div>
    <Dialog dialogRef={dialogRef} onSelect={onSelect} value={value} />
  </>
}


const Dialog = ({ dialogRef, onSelect, value }: { dialogRef: React.RefObject<HTMLDialogElement | null>, onSelect: (date: CalendarDate) => void, value: string }) => {


  const [currentMonth, setCurrentMonth] = useState<number>();
  const [currentDate, setCurrentDate] = useState<number>();
  const [currentYear, setCurrentYear] = useState<number>();
  const [daysInMonth, setDaysInMonth] = useState<number>(30);
  const [monthsArray, setMonthsArray] = useState<string[]>(months);
  const [yearsArray] = useState<number[]>(years);
  const [initialized, setInitialized] = useState(false);
  const monthsRef = useRef<HTMLUListElement>(null);
  const daysRef = useRef<HTMLUListElement>(null);
  const yearsRef = useRef<HTMLUListElement>(null);


  useEffect(() => {
    if (!initialized) return;
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
  }, [currentMonth, currentYear, initialized]);

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
              setCurrentYear(yearsArray[index]);
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

  useEffect(() => {
    if (!dialogRef.current?.open) return;
    console.log("dialog opened");
    const selectedDate = value ? toCalendar(parseDate(value), EthiopianCalendar) : todayInEth;

    // Initial scroll with FULL lists
    setCurrentDate(selectedDate.day);
    setCurrentMonth(selectedDate.month);
    setCurrentYear(selectedDate.year);

    daysRef.current?.children[selectedDate.day - 1]?.scrollIntoView({ behavior: "smooth", block: "center" });
    monthsRef.current?.children[selectedDate.month - 1]?.scrollIntoView({ behavior: "smooth", block: "center" });
    yearsRef.current?.children[yearsArray.indexOf(selectedDate.year)]?.scrollIntoView({ behavior: "smooth", block: "center" });

    setInitialized(true);
  }, [value, dialogRef.current?.open]);







  const handleClose = (type: "cancel" | "set") => {
    if (type === "cancel") {
      dialogRef.current?.close();
    } else if (type === "set") {
      const dateInEt = new CalendarDate(
        EthiopianCalendar,
        currentYear!,
        currentMonth!,
        currentDate!,
      )
      onSelect(dateInEt);
      dialogRef.current?.close();
    }
  };





  return <dialog ref={dialogRef}>
    <h3 className="dialog-title">ቀን ይምረጡ</h3>
    <div className="scroller-wrapper">
      <div className="scroller">
        <ul ref={monthsRef} style={{ listStyle: "none" }}>
          {monthsArray?.map((month) => (
            <li key={month} className="months">
              {month}
            </li>
          ))}
        </ul>
      </div>
      <div className="scroller">
        <ul ref={daysRef} style={{ listStyle: "none" }}>
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
        <ul ref={yearsRef} style={{ listStyle: "none" }}>
          {yearsArray.map((year) => (
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
}
