import { TChildInfo } from "@/app/register/page";
import { CalendarDate, parseDate, toCalendar } from "@internationalized/date";
import { useCallback, useEffect, useRef, useState } from "react";
import { UseFormRegister } from "react-hook-form";
import { EthiopianCalendar, todayInEth } from "@/utils/calendar";
import { CalendarIcon } from "@/components/Icons";
import { useLanguage } from "@/context/LanguageContext";

// ── Wheel Physics Constants ──
const ITEM_HEIGHT = 44;       // matches CSS li height
const RADIUS = 75;            // virtual cylinder radius (controls curve tightness)
const MAX_ANGLE = 65;         // max rotation degrees

// Scale range: center = max, edges = min
const SCALE_CENTER = 1.08;
const SCALE_EDGE = 0.8;

/**
 * Applies 3D cylindrical drum transforms to scroller items.
 * Center item is scaled up and front-facing; items above/below
 * progressively shrink, fade, and rotate away on the X-axis.
 */
function applyWheelTransforms(scroller: HTMLElement) {
  const ul = scroller.children[0] as HTMLElement;
  if (!ul) return;
  const items = ul.children;
  const scrollCenter = scroller.scrollTop + scroller.clientHeight / 2;
  const ulOffset = ul.offsetTop; // accounts for scroller padding-top

  for (let i = 0; i < items.length; i++) {
    const item = items[i] as HTMLElement;
    const itemCenter = ulOffset + item.offsetTop + ITEM_HEIGHT / 2;
    const offset = itemCenter - scrollCenter;

    // Convert pixel offset to angle on the cylinder
    const angle = (offset / RADIUS) * (180 / Math.PI);
    const clampedAngle = Math.max(-MAX_ANGLE, Math.min(MAX_ANGLE, angle));

    // t = 0 at center, 1 at edge
    const t = Math.abs(clampedAngle) / MAX_ANGLE;
    const scale = SCALE_CENTER - t * (SCALE_CENTER - SCALE_EDGE);  // 1.15 → 0.8
    const opacity = 1 - t * 0.65;                                  // 1.0 → 0.35

    item.style.transform = `rotateX(${-clampedAngle}deg) scale(${scale})`;
    item.style.opacity = String(Math.max(0.2, opacity));
  }
}

/** Hook: attach wheel-physics scroll listener to a scroller ref */
function useWheelPhysics(scrollerRef: React.RefObject<HTMLElement | null>) {
  const rafId = useRef(0);

  const onScroll = useCallback(() => {
    cancelAnimationFrame(rafId.current);
    rafId.current = requestAnimationFrame(() => {
      if (scrollerRef.current) applyWheelTransforms(scrollerRef.current);
    });
  }, [scrollerRef]);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    // Apply immediately for initial state
    applyWheelTransforms(el);
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(rafId.current);
    };
  }, [scrollerRef, onScroll]);

  // Re-apply when list changes
  const refresh = useCallback(() => {
    requestAnimationFrame(() => {
      if (scrollerRef.current) applyWheelTransforms(scrollerRef.current);
    });
  }, [scrollerRef]);

  return refresh;
}

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

export const InputDate = ({ register, onSelect, value, minDate, maxDate, label, inputId }: { register: UseFormRegister<any>, onSelect: (date: CalendarDate) => void, value: string, minDate?: string, maxDate?: string, label: string, inputId: string }) => {
  const { t } = useLanguage();
  const dialogRef = useRef<HTMLDialogElement>(null);

  return <div className="mb-1">
    <label htmlFor={inputId}>{label}</label>
    <div className="relative">
      <input
        className="neo-input"
        style={{ cursor: "pointer" }}
        onClick={() => dialogRef.current?.showModal()}
        onBeforeInput={() => dialogRef.current?.showModal()}
        type="text"
        id={inputId}
        placeholder={t("childInfo.labels.birthDatePlaceholder")}
        {...register(inputId, { required: true })}
        readOnly
      />
      <div style={{ position: "absolute", right: "1.5rem", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", opacity: 0.5 }}>
        <CalendarIcon />
      </div>
    </div>
    <Dialog dialogRef={dialogRef} onSelect={onSelect} value={value} minDate={minDate} maxDate={maxDate} />
  </div>
}

export const SelectDate = ({ onSelect, value, minDate, maxDate }: { onSelect: (date: CalendarDate) => void, value?: string, minDate?: string, maxDate?: string }) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const { t } = useLanguage();
  return <>
    <div style={{ cursor: "pointer", height: "1.5rem" }} role="button" onClick={() => dialogRef.current?.showModal()} title={t("childInfo.labels.birthDate")}>
      <CalendarIcon />
    </div>
    <Dialog dialogRef={dialogRef} onSelect={onSelect} value={value} minDate={minDate} maxDate={maxDate} />
  </>
}


const Dialog = ({ dialogRef, onSelect, value, minDate, maxDate }: { dialogRef: React.RefObject<HTMLDialogElement | null>, onSelect: (date: CalendarDate) => void, value?: string, minDate?: string, maxDate?: string }) => {


  const [currentMonth, setCurrentMonth] = useState<number>();
  const [currentDate, setCurrentDate] = useState<number>();
  const [currentYear, setCurrentYear] = useState<number>();
  const [daysArray, setDaysArray] = useState<number[]>(days);
  const [monthsArray, setMonthsArray] = useState<string[]>(months);
  const [yearsArray, setYearsArray] = useState<number[]>(years);
  const [initialized, setInitialized] = useState(false);
  const monthsRef = useRef<HTMLUListElement>(null);
  const daysRef = useRef<HTMLUListElement>(null);
  const yearsRef = useRef<HTMLUListElement>(null);

  // Scroller container refs for wheel physics
  const monthsScrollerRef = useRef<HTMLDivElement>(null);
  const daysScrollerRef = useRef<HTMLDivElement>(null);
  const yearsScrollerRef = useRef<HTMLDivElement>(null);

  // Attach 3D wheel physics to each scroller column
  const refreshMonthsWheel = useWheelPhysics(monthsScrollerRef);
  const refreshDaysWheel = useWheelPhysics(daysScrollerRef);
  const refreshYearsWheel = useWheelPhysics(yearsScrollerRef);


  useEffect(() => {
    // Generate years array once
    const minEthDate = minDate ? toCalendar(parseDate(minDate), EthiopianCalendar) : null;
    const maxEthDate = maxDate ? toCalendar(parseDate(maxDate), EthiopianCalendar) : null;

    let computedYears = [...years];
    if (minEthDate && maxEthDate) {
      computedYears = Array.from({ length: maxEthDate.year - minEthDate.year + 1 }, (_, i) => maxEthDate.year - i);
    } else if (minEthDate) {
      computedYears = Array.from({ length: 5 }, (_, i) => minEthDate.year + 4 - i); // 5 years future
    } else if (maxEthDate) {
      computedYears = Array.from({ length: 5 }, (_, i) => maxEthDate.year - i); // 5 years past from max
    }
    setYearsArray(computedYears);
  }, [minDate, maxDate]);

  useEffect(() => {
    if (!initialized || !currentMonth || !currentYear) return;

    const minEthDate = minDate ? toCalendar(parseDate(minDate), EthiopianCalendar) : null;
    const maxEthDate = maxDate ? toCalendar(parseDate(maxDate), EthiopianCalendar) : null;

    const selectedDate = new CalendarDate(EthiopianCalendar, currentYear, currentMonth, 1);
    const maxDays = EthiopianCalendar.getDaysInMonth(selectedDate);

    let computedMonths = [...months];
    let computedDays = Array.from({ length: maxDays }, (_, i) => i + 1);

    if (maxEthDate && currentYear === maxEthDate.year) {
      computedMonths = computedMonths.filter((_, i) => i + 1 <= maxEthDate.month);
      if (currentMonth === maxEthDate.month) {
        computedDays = computedDays.filter(d => d <= maxEthDate.day);
      }
    }

    if (minEthDate && currentYear === minEthDate.year) {
      computedMonths = computedMonths.filter((name) => {
        const index = months.indexOf(name) + 1;
        return index >= minEthDate.month;
      });
      if (currentMonth === minEthDate.month) {
        computedDays = computedDays.filter(d => d >= minEthDate.day);
      }
    }

    setMonthsArray(computedMonths);
    setDaysArray(computedDays);
  }, [currentMonth, currentYear, initialized, minDate, maxDate]);

  // Refresh wheel transforms when arrays change
  useEffect(() => {
    refreshMonthsWheel();
    refreshDaysWheel();
    refreshYearsWheel();
  }, [daysArray, monthsArray, yearsArray, refreshMonthsWheel, refreshDaysWheel, refreshYearsWheel]);

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
            const index = Array.from(entry.target.parentElement!.children).indexOf(entry.target);
            if (entry.target.className.includes("months") && monthsArray[index]) {
              setCurrentMonth(months.indexOf(monthsArray[index]) + 1);
            } else if (entry.target.className.includes("dates") && daysArray[index]) {
              setCurrentDate(daysArray[index]);
            } else if (entry.target.className.includes("years") && yearsArray[index]) {
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
  }, [daysArray, monthsArray, yearsArray]);

  useEffect(() => {
    if (!dialogRef.current?.open) return;
    console.log("dialog opened");
    const selectedDate = value ? toCalendar(parseDate(value), EthiopianCalendar) : todayInEth;

    // Initial scroll with FULL lists
    setCurrentDate(selectedDate.day);
    setCurrentMonth(selectedDate.month);
    setCurrentYear(selectedDate.year);

    setTimeout(() => {
      daysRef.current?.children[daysArray.indexOf(selectedDate.day)]?.scrollIntoView({ behavior: "smooth", block: "center" });
      monthsRef.current?.children[monthsArray.indexOf(months[selectedDate.month - 1])]?.scrollIntoView({ behavior: "smooth", block: "center" });
      yearsRef.current?.children[yearsArray.indexOf(selectedDate.year)]?.scrollIntoView({ behavior: "smooth", block: "center" });
      // Refresh 3D transforms after scroll settles
      setTimeout(() => {
        refreshMonthsWheel();
        refreshDaysWheel();
        refreshYearsWheel();
      }, 350);
    }, 100);

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
      <div className="scroller" ref={monthsScrollerRef}>
        <ul ref={monthsRef} style={{ listStyle: "none" }}>
          {monthsArray?.map((month) => (
            <li key={month} className="months">
              {month}
            </li>
          ))}
        </ul>
      </div>
      <div className="scroller" ref={daysScrollerRef}>
        <ul ref={daysRef} style={{ listStyle: "none" }}>
          {daysArray.map(
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
      <div className="scroller" ref={yearsScrollerRef}>
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
        ሰርዝ
      </button>
      <button
        className="neo-btn primary w-full"
        type="button"
        onClick={() => handleClose("set")}
      >
        አረጋግጥ
      </button>
    </div>
  </dialog>
}
