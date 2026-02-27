// ============================================================
// VenueSelectModal.tsx
//
// Step 1 of booking flow. Shows venues filtered by role:
//   - TENANT_ADMIN → all active venues
//   - STAFF        → only assigned venues (already filtered by API)
// ============================================================

import { useEffect, useRef, useState } from "react";
import type { Venue } from "../../services/venue.service";

const GOLD = "#d4af37";

interface VenueSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  venues: Venue[];
  onSelect: (venue: Venue) => void;
}

function SearchIcon() {
  return (
    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

export default function VenueSelectModal({
  isOpen,
  onClose,
  venues,
  onSelect,
}: VenueSelectModalProps) {
  const [search, setSearch] = useState("");
  const [visible, setVisible] = useState(false);
  const backdropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => setVisible(true));
      document.body.style.overflow = "hidden";
      setSearch("");
    } else {
      setVisible(false);
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape" && isOpen) onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  const filtered = venues.filter(
    (v) =>
      v.isActive &&
      (search.trim() === "" ||
        v.name.toLowerCase().includes(search.toLowerCase()) ||
        v.city?.toLowerCase().includes(search.toLowerCase()) ||
        v.location.toLowerCase().includes(search.toLowerCase()))
  );

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
        className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border flex flex-col"
        style={{
          borderColor: `${GOLD}30`,
          maxHeight: "80vh",
          opacity: visible ? 1 : 0,
          transform: visible ? "scale(1) translateY(0)" : "scale(0.96) translateY(16px)",
          transition: "opacity 0.25s ease, transform 0.25s ease",
        }}
      >
        {/* Top gold bar */}
        <div className="h-1 w-full rounded-t-2xl flex-shrink-0" style={{ background: GOLD }} />

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100 flex-shrink-0">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Select Event Space</h2>
            <p className="text-sm text-gray-500 mt-0.5">Choose a venue to book</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <XIcon />
          </button>
        </div>

        {/* Search */}
        <div className="px-6 py-4 flex-shrink-0">
          <div className="relative">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <SearchIcon />
            </div>
            <input
              type="text"
              placeholder="Search venues..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 outline-none transition-all"
              onFocus={(e) => {
                e.target.style.boxShadow = `0 0 0 2px ${GOLD}40`;
                e.target.style.borderColor = GOLD;
              }}
              onBlur={(e) => {
                e.target.style.boxShadow = "";
                e.target.style.borderColor = "";
              }}
              autoFocus
            />
          </div>
        </div>

        {/* Venue List — this part scrolls */}
        <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-2 min-h-0">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-gray-400 text-sm">No event spaces found.</p>
            </div>
          ) : (
            filtered.map((venue) => (
              <button
                key={venue.id}
                onClick={() => onSelect(venue)}
                className="w-full text-left p-4 rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-all duration-150 group"
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = `${GOLD}60`;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = "";
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm truncate">{venue.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5 truncate">
                      {venue.city ? `${venue.city} · ` : ""}{venue.location}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 ml-4 flex-shrink-0">
                    <div className="text-right">
                      <p className="text-sm font-semibold" style={{ color: GOLD }}>
                        ₹{venue.price.toLocaleString("en-IN")}
                        <span className="text-xs font-normal text-gray-400">/day</span>
                      </p>
                      <p className="text-xs text-gray-400">{venue.capacity} guests</p>
                    </div>
                    <svg
                      className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors flex-shrink-0"
                      fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>

                {/* Thumbnail strip */}
                {venue.images.length > 0 && (
                  <div className="flex gap-1.5 mt-3">
                    {venue.images.slice(0, 4).map((img) => (
                      <img
                        key={img.id}
                        src={img.url}
                        alt=""
                        className="w-12 h-9 object-cover rounded-lg border border-gray-100"
                      />
                    ))}
                    {venue.images.length > 4 && (
                      <div className="w-12 h-9 rounded-lg border border-gray-100 bg-gray-50 flex items-center justify-center">
                        <span className="text-xs text-gray-400">+{venue.images.length - 4}</span>
                      </div>
                    )}
                  </div>
                )}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
