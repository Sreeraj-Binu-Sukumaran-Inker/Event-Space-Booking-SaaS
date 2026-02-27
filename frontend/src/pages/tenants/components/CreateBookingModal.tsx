// CreateBookingModal.tsx

import React, { useEffect, useRef, useState } from "react";
import type { Venue } from "../../../services/venue.service";
import type { CalendarSelection, DateRange } from "./CalendarModal";
import VenueSelectModal from "./VenueSelectModal";
import CalendarModal from "./CalendarModal";
import { getBookedDates, type BookedDateRange } from "../../../services/booking.service";

const GOLD = "#d4af37";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CreateBookingFormData {
  venueId: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  startDate: string;
  endDate: string;
  totalPrice: string;
  dates?: string[];     // multi mode: individual dates
  ranges?: DateRange[]; // range mode: multiple ranges
}

interface CreateBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  venues: Venue[];
  onSubmit: (data: CreateBookingFormData) => Promise<void>;
}

type FieldErrors = Partial<Record<keyof CreateBookingFormData, string>>;

const EMPTY_FORM: CreateBookingFormData = {
  venueId: "",
  clientName: "",
  clientEmail: "",
  clientPhone: "",
  startDate: "",
  endDate: "",
  totalPrice: "",
};

// ─── Price day-count helper ───────────────────────────────────────────────────
//
// Each booking mode needs its own day-count logic:
//
//  multi  → form.dates.length          (only actually-clicked dates)
//  ranges → sum of each range's span   (not first-to-last span)
//  single → (endDate - startDate) + 1  (inclusive)
//
function calcDays(form: CreateBookingFormData): number {
  // Multi: count of individually selected dates — NOT the span between them
  if (form.dates && form.dates.length > 0) {
    return form.dates.length;
  }

  // Multiple ranges: sum of every range's own inclusive day count
  if (form.ranges && form.ranges.length > 1) {
    return form.ranges.reduce((total, r) => {
      const diff =
        Math.ceil(
          (new Date(r.end).getTime() - new Date(r.start).getTime()) / 86_400_000
        ) + 1;
      return total + Math.max(1, diff);
    }, 0);
  }

  // Single day or single range: simple inclusive span
  if (!form.startDate || !form.endDate) return 0;
  return Math.max(
    1,
    Math.ceil(
      (new Date(form.endDate).getTime() - new Date(form.startDate).getTime()) /
        86_400_000
    ) + 1
  );
}

// ─── Small UI helpers ─────────────────────────────────────────────────────────

function XIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
    </svg>
  );
}

function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-sm font-medium text-gray-700 mb-1.5">
      {children}
      {required && <span className="ml-0.5" style={{ color: GOLD }}>*</span>}
    </label>
  );
}

function ErrorMsg({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="mt-1.5 text-xs text-red-500">{msg}</p>;
}

const inputBase =
  "w-full px-4 py-2.5 text-sm text-gray-900 bg-white border rounded-xl outline-none transition-all duration-150 placeholder-gray-400";
const inputNormal = "border-gray-200 hover:border-gray-300";
const inputError  = "border-red-300 bg-red-50";

const focusGold = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
  e.target.style.boxShadow   = `0 0 0 2px ${GOLD}40`;
  e.target.style.borderColor = GOLD;
};
const blurReset = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
  e.target.style.boxShadow   = "";
  e.target.style.borderColor = "";
};

// ─── Main Component ───────────────────────────────────────────────────────────

export default function CreateBookingModal({
  isOpen,
  onClose,
  venues,
  onSubmit,
}: CreateBookingModalProps) {
  const [form, setForm]       = useState<CreateBookingFormData>(EMPTY_FORM);
  const [errors, setErrors]   = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);

  const [showVenueSelect, setShowVenueSelect] = useState(false);
  const [showCalendar, setShowCalendar]       = useState(false);
  const [selectedVenue, setSelectedVenue]     = useState<Venue | null>(null);
  const [bookedRanges, setBookedRanges]       = useState<BookedDateRange[]>([]);
  const [loadingDates, setLoadingDates]       = useState(false);
  const [calendarMode, setCalendarMode]       = useState<"single" | "range" | "multi">("single");

  const backdropRef = useRef<HTMLDivElement>(null);

  // ── open / close lifecycle ────────────────────────────────────────────────
  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => setVisible(true));
      document.body.style.overflow = "hidden";
      setForm(EMPTY_FORM);
      setErrors({});
      setSelectedVenue(null);
      setBookedRanges([]);
      setCalendarMode("single");
    } else {
      setVisible(false);
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !showVenueSelect && !showCalendar)
        handleClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, showVenueSelect, showCalendar]);

  // ── auto-calculate price ──────────────────────────────────────────────────
  // Depends on form.dates and form.ranges too so all modes recalculate correctly
  useEffect(() => {
    if (!selectedVenue) return;
    const days = calcDays(form);
    if (days === 0) return;
    setForm((p) => ({ ...p, totalPrice: (selectedVenue.price * days).toString() }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedVenue, form.startDate, form.endDate, form.dates, form.ranges]);

  const setField =
    <K extends keyof CreateBookingFormData>(key: K) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setForm((p) => ({ ...p, [key]: e.target.value }));
      setErrors((p) => ({ ...p, [key]: undefined }));
    };

  // ── venue select ──────────────────────────────────────────────────────────
  const handleVenueSelect = async (venue: Venue) => {
    setSelectedVenue(venue);
    setForm((p) => ({
      ...p,
      venueId: venue.id,
      startDate: "",
      endDate: "",
      totalPrice: "",
      dates: [],
      ranges: [],
    }));
    setShowVenueSelect(false);
    setErrors((p) => ({ ...p, venueId: undefined }));

    setLoadingDates(true);
    try {
      const r = await getBookedDates(venue.id);
      setBookedRanges(r);
    } catch {
      setBookedRanges([]);
    } finally {
      setLoadingDates(false);
    }
  };

  // ── calendar confirm ──────────────────────────────────────────────────────
  const handleOpenCalendar = () => {
    if (!selectedVenue) { setShowVenueSelect(true); return; }
    setShowCalendar(true);
  };

  const handleCalendarConfirm = (selection: CalendarSelection) => {
    setShowCalendar(false);
    setErrors((p) => ({ ...p, startDate: undefined, endDate: undefined }));

    if (selection.mode === "multi") {
      // Store individual dates; calcDays will use dates.length — NOT date span
      setForm((p) => ({
        ...p,
        startDate: selection.dates[0] ?? "",
        endDate:   selection.dates[selection.dates.length - 1] ?? "",
        dates:     selection.dates,
        ranges:    [],
      }));
      return;
    }

    if (selection.mode === "range" && selection.ranges.length > 1) {
      // Store all ranges; calcDays sums each range individually
      setForm((p) => ({
        ...p,
        startDate: selection.ranges[0].start,
        endDate:   selection.ranges[selection.ranges.length - 1].end,
        dates:     [],
        ranges:    selection.ranges,
      }));
      return;
    }

    // Single day or single range
    const r = selection.ranges[0];
    setForm((p) => ({
      ...p,
      startDate: r?.start ?? "",
      endDate:   r?.end   ?? r?.start ?? "",
      dates:     [],
      ranges:    [],
    }));
  };

  // ── validation ────────────────────────────────────────────────────────────
  const validate = (): boolean => {
    const next: FieldErrors = {};
    if (!form.venueId) next.venueId = "Event space is required.";
    if (!form.clientName.trim()) next.clientName = "Client name is required.";
    if (
      form.clientEmail &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.clientEmail)
    )
      next.clientEmail = "Enter a valid email address.";
    if (
      form.clientPhone &&
      !/^\d{10}$/.test(form.clientPhone.replace(/\s/g, ""))
    )
      next.clientPhone = "Enter a valid 10-digit number.";
    if (!form.startDate) next.startDate = "Please select dates.";
    if (!form.endDate)   next.endDate   = "Please select dates.";
    if (!form.totalPrice) next.totalPrice = "Total price is required.";
    else if (Number(form.totalPrice) < 0) next.totalPrice = "Price cannot be negative.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await onSubmit(form);
      handleClose();
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setForm(EMPTY_FORM);
    setErrors({});
    setSelectedVenue(null);
    setBookedRanges([]);
    onClose();
  };

  // ── date display text ─────────────────────────────────────────────────────
  const dateDisplay = (): string | null => {
    if (form.ranges && form.ranges.length > 1)
      return `${form.ranges.length} ranges selected`;
    if (form.dates && form.dates.length > 1)
      return `${form.dates.length} dates selected`;
    if (!form.startDate) return null;
    if (form.startDate === form.endDate) return form.startDate;
    return `${form.startDate} → ${form.endDate}`;
  };

  const days      = calcDays(form);
  const multiCount = form.dates?.length ?? 0;

  if (!isOpen) return null;

  return (
    <>
      {/* ── Main modal ── */}
      <div
        ref={backdropRef}
        onClick={(e) => { if (e.target === backdropRef.current) handleClose(); }}
        className="fixed inset-0 z-40 flex items-start justify-center overflow-y-auto px-4 py-8 sm:py-12"
        style={{
          background:    visible ? "rgba(0,0,0,0.55)" : "rgba(0,0,0,0)",
          backdropFilter: visible ? "blur(3px)" : "none",
          transition:    "background 0.2s ease",
          pointerEvents: showVenueSelect || showCalendar ? "none" : "auto",
        }}
      >
        <div
          className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border my-auto"
          style={{
            borderColor: `${GOLD}30`,
            opacity:   visible ? 1 : 0,
            transform: visible ? "scale(1) translateY(0)" : "scale(0.96) translateY(16px)",
            transition: "opacity 0.25s ease, transform 0.25s ease",
          }}
        >
          <div className="h-1 w-full rounded-t-2xl" style={{ background: GOLD }} />

          {/* Header */}
          <div className="flex items-center justify-between px-8 pt-6 pb-5 border-b border-gray-100">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Create Booking</h2>
              <p className="text-sm text-gray-500 mt-0.5">Reserve an event space for a client.</p>
            </div>
            <button
              onClick={handleClose}
              className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <XIcon />
            </button>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div className="px-8 py-6 space-y-6">

              {/* ── Venue ── */}
              <div>
                <Label required>Event Space</Label>
                {selectedVenue ? (
                  <div
                    className="flex items-center justify-between p-3 rounded-xl border cursor-pointer hover:border-amber-300 transition-all"
                    style={{ borderColor: `${GOLD}50`, background: `${GOLD}08` }}
                    onClick={() => setShowVenueSelect(true)}
                  >
                    <div className="flex items-center gap-3">
                      {selectedVenue.images[0] && (
                        <img
                          src={selectedVenue.images[0].url}
                          alt=""
                          className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                        />
                      )}
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{selectedVenue.name}</p>
                        <p className="text-xs text-gray-500">
                          {selectedVenue.city ? `${selectedVenue.city} · ` : ""}
                          {selectedVenue.location}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 px-2 py-1 rounded-lg hover:bg-white transition-all"
                      onClick={(e) => { e.stopPropagation(); setShowVenueSelect(true); }}
                    >
                      <EditIcon /> Change
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowVenueSelect(true)}
                    className={`${inputBase} ${errors.venueId ? inputError : inputNormal} flex items-center gap-2 text-gray-400 cursor-pointer`}
                  >
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5V10.75M2.25 21h1.5m18 0h-18M2.25 9l4.5-1.636M18.75 3l-1.5.545m0 6.205l3 1m1.5.5l-1.5-.5M6.75 7.364V3h-3v18m3-13.636l10.5-3.819" />
                    </svg>
                    Select event space...
                  </button>
                )}
                <ErrorMsg msg={errors.venueId} />
              </div>

              {/* ── Dates ── */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <Label required>Dates</Label>
                  {selectedVenue && (
                    <div className="flex items-center gap-1">
                      {(["single", "range", "multi"] as const).map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setCalendarMode(m)}
                          className="px-2 py-0.5 rounded-full text-xs border transition-all"
                          style={
                            calendarMode === m
                              ? { background: GOLD, borderColor: GOLD, color: "#1c1917", fontWeight: 600 }
                              : { background: "white", borderColor: "#e5e7eb", color: "#6b7280" }
                          }
                        >
                          {m === "single" ? "Day" : m === "range" ? "Range" : "Multi"}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleOpenCalendar}
                  disabled={loadingDates}
                  className={`${inputBase} ${errors.startDate ? inputError : inputNormal} flex items-center gap-2 text-left cursor-pointer disabled:opacity-60`}
                >
                  <CalendarIcon />
                  {loadingDates ? (
                    <span className="text-gray-400 text-sm">Loading availability…</span>
                  ) : dateDisplay() ? (
                    <span className="text-gray-900 text-sm">
                      {multiCount > 1
                        ? `${multiCount} dates selected (${form.startDate} → ${form.endDate})`
                        : dateDisplay()}
                    </span>
                  ) : (
                    <span className="text-gray-400 text-sm">
                      {selectedVenue ? "Click to pick dates" : "Select a venue first"}
                    </span>
                  )}
                </button>
                <ErrorMsg msg={errors.startDate} />
              </div>

              {/* ── Client info ── */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label required>Client Name</Label>
                  <input
                    type="text"
                    value={form.clientName}
                    onChange={setField("clientName")}
                    placeholder="Client full name"
                    className={`${inputBase} ${errors.clientName ? inputError : inputNormal}`}
                    onFocus={focusGold} onBlur={blurReset}
                  />
                  <ErrorMsg msg={errors.clientName} />
                </div>

                <div>
                  <Label>Email</Label>
                  <input
                    type="email"
                    value={form.clientEmail}
                    onChange={setField("clientEmail")}
                    placeholder="client@email.com"
                    className={`${inputBase} ${errors.clientEmail ? inputError : inputNormal}`}
                    onFocus={focusGold} onBlur={blurReset}
                  />
                  <ErrorMsg msg={errors.clientEmail} />
                </div>

                <div>
                  <Label>Phone</Label>
                  <input
                    type="tel"
                    value={form.clientPhone}
                    onChange={setField("clientPhone")}
                    placeholder="10-digit mobile number"
                    className={`${inputBase} ${errors.clientPhone ? inputError : inputNormal}`}
                    onFocus={focusGold} onBlur={blurReset}
                  />
                  <ErrorMsg msg={errors.clientPhone} />
                </div>

                <div>
                  <Label required>Total Price (₹)</Label>
                  <input
                    type="number"
                    min="0"
                    value={form.totalPrice}
                    onChange={setField("totalPrice")}
                    placeholder="Auto-calculated or enter manually"
                    className={`${inputBase} ${errors.totalPrice ? inputError : inputNormal}`}
                    onFocus={focusGold} onBlur={blurReset}
                  />
                  {selectedVenue && form.startDate && days > 0 && (
                    <p className="mt-1 text-xs text-gray-400">
                      ₹{selectedVenue.price.toLocaleString("en-IN")}/day
                      {" · "}
                      {days} day{days !== 1 ? "s" : ""}
                      {" · "}auto-calculated
                    </p>
                  )}
                  <ErrorMsg msg={errors.totalPrice} />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div
              className="flex items-center justify-end gap-3 px-8 py-5 border-t rounded-b-2xl"
              style={{ borderColor: `${GOLD}20`, background: `${GOLD}05` }}
            >
              <button
                type="button"
                onClick={handleClose}
                className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-700 border border-gray-200 bg-white hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90 hover:scale-[1.02] active:scale-100 disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100"
                style={{ background: GOLD, color: "#1c1917", boxShadow: `0 4px 20px ${GOLD}50` }}
              >
                {loading ? "Creating…" : "Create Booking"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Venue Select sub-modal */}
      <VenueSelectModal
        isOpen={showVenueSelect}
        onClose={() => setShowVenueSelect(false)}
        venues={venues}
        onSelect={handleVenueSelect}
      />

      {/* Calendar sub-modal */}
      {selectedVenue && (
        <CalendarModal
          isOpen={showCalendar}
          onClose={() => setShowCalendar(false)}
          venueName={selectedVenue.name}
          bookedRanges={bookedRanges}
          onConfirm={handleCalendarConfirm}
        />
      )}
    </>
  );
}