// CalendarModal.tsx

import { useEffect, useRef, useState, useCallback } from "react";
import type { BookedDateRange } from "../../../services/booking.service";

const GOLD = "#d4af37";
const GOLD_LIGHT = "#fdf6dc";

export type SelectionMode = "single" | "range" | "multi";

export interface DateRange {
  start: string;
  end: string;
}

export interface CalendarSelection {
  mode: SelectionMode;
  ranges: DateRange[];
  dates: string[];
}

interface CalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  venueName: string;
  bookedRanges: BookedDateRange[];
  onConfirm: (selection: CalendarSelection) => void;
}

// ─── helpers ─────────────────────────────────────────────────────────────────

const toYMD = (d: Date): string => d.toISOString().slice(0, 10);

const todayDate = (): Date => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

const parseYMD = (s: string): Date => {
  const [y, m, d] = s.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setHours(0, 0, 0, 0);
  return dt;
};

function expandRange(start: string, end: string): string[] {
  const result: string[] = [];
  const cur = parseYMD(start);
  const endD = parseYMD(end);
  while (cur <= endD) {
    result.push(toYMD(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return result;
}

function buildBookedSet(ranges: BookedDateRange[]): Set<string> {
  const set = new Set<string>();
  for (const r of ranges)
    expandRange(r.startDate.slice(0, 10), r.endDate.slice(0, 10)).forEach((d) => set.add(d));
  return set;
}

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];
const DAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

// ─── component ───────────────────────────────────────────────────────────────

export default function CalendarModal({
  isOpen,
  onClose,
  venueName,
  bookedRanges,
  onConfirm,
}: CalendarModalProps) {
  const now = todayDate();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [visible, setVisible] = useState(false);
  const backdropRef = useRef<HTMLDivElement>(null);

  const [mode, setMode] = useState<SelectionMode>("single");
  const [ranges, setRanges] = useState<DateRange[]>([]);
  const [pendingStart, setPendingStart] = useState<string | null>(null);
  const [multiDates, setMultiDates] = useState<string[]>([]);
  const [hoverDate, setHoverDate] = useState<string | null>(null);
  const [conflictError, setConflictError] = useState<string | null>(null);

  const bookedSet = buildBookedSet(bookedRanges);

  const resetSelection = () => {
    setRanges([]);
    setPendingStart(null);
    setMultiDates([]);
    setHoverDate(null);
    setConflictError(null);
  };

  const switchMode = (m: SelectionMode) => {
    setMode(m);
    resetSelection();
  };

  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => setVisible(true));
      document.body.style.overflow = "hidden";
      resetSelection();
      setMode("single");
    } else {
      setVisible(false);
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  const isPast = (ymd: string) => parseYMD(ymd) < now;
  const isBooked = (ymd: string) => bookedSet.has(ymd);
  const isDisabled = (ymd: string) => isPast(ymd) || isBooked(ymd);

  const rangeConflicts = (s: string, e: string) =>
    expandRange(s, e).some((d) => bookedSet.has(d));

  const selSet = useCallback((): Set<string> => {
    const set = new Set<string>();
    ranges.forEach((r) => expandRange(r.start, r.end).forEach((d) => set.add(d)));
    return set;
  }, [ranges]);

  const hovSet = useCallback((): Set<string> => {
    if (!pendingStart || !hoverDate || mode !== "range") return new Set();
    const [s, e] =
      pendingStart <= hoverDate
        ? [pendingStart, hoverDate]
        : [hoverDate, pendingStart];
    const set = new Set<string>();
    expandRange(s, e).forEach((d) => set.add(d));
    return set;
  }, [pendingStart, hoverDate, mode]);

  const handleDateClick = (ymd: string) => {
    if (isDisabled(ymd)) return;
    setConflictError(null);

    if (mode === "single") {
      setRanges([{ start: ymd, end: ymd }]);
      return;
    }

    if (mode === "range") {
      if (!pendingStart) {
        setPendingStart(ymd);
        return;
      }
      const [s, e] =
        pendingStart <= ymd ? [pendingStart, ymd] : [ymd, pendingStart];
      if (rangeConflicts(s, e)) {
        setConflictError("Range includes booked dates. Please choose a different range.");
        setPendingStart(null);
        return;
      }
      const newDates = new Set(expandRange(s, e));
      const existing = selSet();
      if ([...newDates].some((d) => existing.has(d))) {
        setConflictError("This range overlaps with an already-selected range.");
        setPendingStart(null);
        return;
      }
      setRanges((prev) => [...prev, { start: s, end: e }]);
      setPendingStart(null);
      return;
    }

    if (mode === "multi") {
      setMultiDates((prev) =>
        prev.includes(ymd)
          ? prev.filter((d) => d !== ymd)
          : [...prev, ymd].sort()
      );
    }
  };

  const removeRange = (idx: number) =>
    setRanges((prev) => prev.filter((_, i) => i !== idx));

  // ── day visual state ──────────────────────────────────────────────────────

  const ss = selSet();
  const hs = hovSet();

  const getDayBg = (ymd: string): string => {
    if (mode === "multi" && multiDates.includes(ymd)) return GOLD;
    if (ymd === pendingStart) return GOLD;
    if (ss.has(ymd)) return GOLD;
    if (hs.has(ymd)) return GOLD_LIGHT;
    return "transparent";
  };

  const getDayRadius = (ymd: string): string => {
    // FIX: multi mode — every selected date is an isolated pill, never a strip
    if (mode === "multi") return "10px";
    // Single mode — always a standalone pill
    if (mode === "single") return "10px";
    // Range mode — pending anchor is a standalone pill until end is clicked
    if (ymd === pendingStart) return "10px";
    // Range mode — only apply strip logic to dates actually in selected/hover set
    if (!ss.has(ymd) && !hs.has(ymd)) return "0";

    const prevDay = toYMD(new Date(parseYMD(ymd).setDate(parseYMD(ymd).getDate() - 1)));
    const nextDay = toYMD(new Date(parseYMD(ymd).setDate(parseYMD(ymd).getDate() + 1)));
    const hasBefore = ss.has(prevDay) || hs.has(prevDay);
    const hasAfter  = ss.has(nextDay) || hs.has(nextDay);

    if (!hasBefore && !hasAfter) return "10px";
    if (!hasBefore) return "10px 0 0 10px";
    if (!hasAfter)  return "0 10px 10px 0";
    return "0";
  };

  const getDayTextClass = (ymd: string): string => {
    if (isBooked(ymd)) return "text-red-300 cursor-not-allowed";
    if (isPast(ymd))   return "text-gray-300 cursor-not-allowed";
    if (mode === "multi" && multiDates.includes(ymd)) return "text-stone-900 font-bold";
    if (ymd === pendingStart) return "text-stone-900 font-bold";
    if (ss.has(ymd))   return "text-stone-900 font-semibold";
    if (hs.has(ymd))   return "text-amber-800";
    return "text-gray-700";
  };

  // ── calendar grid ─────────────────────────────────────────────────────────

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const numDays  = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells: Array<string | null> = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: numDays }, (_, i) =>
      toYMD(new Date(viewYear, viewMonth, i + 1))
    ),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const canGoPrev =
    viewYear > now.getFullYear() || viewMonth > now.getMonth();

  const canConfirm =
    (mode === "single" && ranges.length === 1) ||
    (mode === "range"  && ranges.length >= 1 && !pendingStart) ||
    (mode === "multi"  && multiDates.length >= 1);

  const summaryText = (): string => {
    if (mode === "single")
      return ranges.length === 1
        ? `Selected: ${ranges[0].start}`
        : "Click a date to select";
    if (mode === "range") {
      if (pendingStart) return `Start: ${pendingStart} — now click an end date`;
      if (ranges.length === 0) return "Click a start date";
      return `${ranges.length} range${ranges.length > 1 ? "s" : ""} selected`;
    }
    return multiDates.length === 0
      ? "Click dates to select"
      : `${multiDates.length} date${multiDates.length > 1 ? "s" : ""} selected`;
  };

  if (!isOpen) return null;

  return (
    <div
      ref={backdropRef}
      onClick={(e) => { if (e.target === backdropRef.current) onClose(); }}
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{
        background: visible ? "rgba(0,0,0,0.55)" : "rgba(0,0,0,0)",
        backdropFilter: visible ? "blur(3px)" : "none",
        transition: "background 0.2s ease",
      }}
    >
      <div
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl border flex flex-col"
        style={{
          borderColor: `${GOLD}30`,
          maxHeight: "90vh",
          opacity: visible ? 1 : 0,
          transform: visible ? "scale(1)" : "scale(0.96) translateY(16px)",
          transition: "opacity 0.25s ease, transform 0.25s ease",
        }}
      >
        <div className="h-1 w-full rounded-t-2xl flex-shrink-0" style={{ background: GOLD }} />

        {/* ── Header ── */}
        <div className="px-6 pt-5 pb-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Select Dates</h2>
              <p className="text-sm text-gray-500 mt-0.5 truncate max-w-xs">{venueName}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex gap-2 mt-3">
            {(["single", "range", "multi"] as SelectionMode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => switchMode(m)}
                className="px-3 py-1 rounded-full text-xs font-medium border transition-all"
                style={
                  m === mode
                    ? { background: GOLD, borderColor: GOLD, color: "#1c1917", fontWeight: 600 }
                    : { background: "white", borderColor: "#e5e7eb", color: "#6b7280" }
                }
              >
                {m === "single" ? "Single Day" : m === "range" ? "Date Range" : "Multiple Days"}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-2">
            {mode === "single" && "Click any available date."}
            {mode === "range"  && "Click start then end. Repeat to add more ranges."}
            {mode === "multi"  && "Click individual dates. Click again to deselect."}
          </p>
        </div>

        {/* ── Scrollable body ── */}
        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="px-6 py-5">
            {/* Month nav */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => {
                  if (!canGoPrev) return;
                  const d = new Date(viewYear, viewMonth - 1, 1);
                  setViewYear(d.getFullYear());
                  setViewMonth(d.getMonth());
                }}
                disabled={!canGoPrev}
                className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div className="flex items-center gap-2">
                <select
                  value={viewMonth}
                  onChange={(e) => setViewMonth(Number(e.target.value))}
                  className="text-sm font-semibold text-gray-800 bg-transparent outline-none cursor-pointer"
                >
                  {MONTHS.map((m, i) => <option key={m} value={i}>{m}</option>)}
                </select>
                <select
                  value={viewYear}
                  onChange={(e) => setViewYear(Number(e.target.value))}
                  className="text-sm font-semibold text-gray-800 bg-transparent outline-none cursor-pointer"
                >
                  {Array.from({ length: 5 }, (_, i) => now.getFullYear() + i).map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={() => {
                  const d = new Date(viewYear, viewMonth + 1, 1);
                  setViewYear(d.getFullYear());
                  setViewMonth(d.getMonth());
                }}
                className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Day-of-week headers */}
            <div className="grid grid-cols-7 mb-1">
              {DAY_LABELS.map((d) => (
                <div key={d} className="text-center text-xs font-semibold text-gray-400 py-1">{d}</div>
              ))}
            </div>

            {/* Day cells */}
            <div className="grid grid-cols-7 gap-y-0.5">
              {cells.map((ymd, i) => {
                if (!ymd) return <div key={`e-${i}`} />;
                const disabled = isDisabled(ymd);
                const isToday  = ymd === toYMD(now);
                const bg       = getDayBg(ymd);
                const radius   = getDayRadius(ymd);
                const txtCls   = getDayTextClass(ymd);

                return (
                  <div
                    key={ymd}
                    className="relative flex items-center justify-center"
                    style={{ background: bg, borderRadius: radius }}
                  >
                    <button
                      type="button"
                      onClick={() => handleDateClick(ymd)}
                      onMouseEnter={() => {
                        if (!disabled && mode === "range" && pendingStart)
                          setHoverDate(ymd);
                      }}
                      onMouseLeave={() => setHoverDate(null)}
                      disabled={disabled}
                      className={[
                        "w-9 h-9 rounded-xl text-sm flex items-center justify-center transition-colors duration-100",
                        !disabled && bg === "transparent" ? "hover:bg-gray-100" : "",
                        txtCls,
                        isToday && bg === "transparent" ? "ring-2 ring-amber-300 font-bold" : "",
                      ].join(" ")}
                    >
                      {new Date(viewYear, viewMonth, parseInt(ymd.slice(8))).getDate()}
                    </button>
                    {isBooked(ymd) && (
                      <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-red-300 pointer-events-none" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Range list */}
          {mode === "range" && ranges.length > 0 && (
            <div className="px-6 pb-4 space-y-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Selected Ranges</p>
              {ranges.map((r, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between px-3 py-2 rounded-xl text-sm border"
                  style={{ borderColor: `${GOLD}40`, background: `${GOLD}08` }}
                >
                  <span className="text-gray-700 font-medium">
                    {r.start === r.end ? r.start : `${r.start} → ${r.end}`}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeRange(idx)}
                    className="text-gray-400 hover:text-red-500 transition-colors ml-3"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Multi date chips */}
          {mode === "multi" && multiDates.length > 0 && (
            <div className="px-6 pb-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Selected ({multiDates.length})
              </p>
              <div className="flex flex-wrap gap-1.5">
                {multiDates.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setMultiDates((prev) => prev.filter((x) => x !== d))}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border hover:border-red-300 hover:bg-red-50 hover:text-red-600 transition-all"
                    style={{ borderColor: `${GOLD}50`, background: `${GOLD}10`, color: "#92720a" }}
                  >
                    {d}
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Legend */}
          <div className="px-6 pb-4 flex items-center gap-4 text-xs text-gray-400">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full inline-block" style={{ background: GOLD }} />Selected
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-red-200 inline-block" />Booked
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full ring-2 ring-amber-300 bg-white inline-block" />Today
            </span>
          </div>
        </div>

        {/* ── Footer ── */}
        <div
          className="px-6 py-4 border-t rounded-b-2xl flex-shrink-0"
          style={{ borderColor: `${GOLD}20`, background: `${GOLD}05` }}
        >
          {conflictError && (
            <div className="flex items-center gap-2 mb-3 px-3 py-2 rounded-xl bg-red-50 border border-red-200 text-xs text-red-600">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
              {conflictError}
              <button type="button" onClick={() => setConflictError(null)} className="ml-auto font-bold">×</button>
            </div>
          )}
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">{summaryText()}</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-sm font-medium text-gray-700 border border-gray-200 bg-white hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => canConfirm && onConfirm({ mode, ranges, dates: multiDates })}
                disabled={!canConfirm}
                className="px-5 py-2 rounded-xl text-sm font-semibold hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                style={{ background: GOLD, color: "#1c1917" }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}