import { useEffect, useMemo, useState } from "react";
import CreateBookingModal from "./components/CreateBookingModal";
import type { CreateBookingFormData } from "./components/CreateBookingModal";
import {
  createBooking,
  createMultipleBookings,
  cancelBooking,
  getBookings,
  type Booking,
} from "../../services/booking.service";
import { getVenues, type Venue } from "../../services/venue.service";

const GOLD = "#d4af37";

type StatusType = "CONFIRMED" | "PENDING" | "CANCELLED";
type VenueSort = "DEFAULT" | "VENUE_ASC" | "VENUE_DESC";

function StatusBadge({ status }: { status: StatusType }) {
  const styles: Record<StatusType, string> = {
    CONFIRMED: "bg-green-100 text-green-700",
    PENDING: "bg-amber-100 text-amber-700",
    CANCELLED: "bg-red-100 text-red-700",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}>
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
}

function formatCurrency(amount: number) {
  return "₹" + amount.toLocaleString("en-IN");
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | StatusType>("ALL");
  const [dateFilter, setDateFilter] = useState("");
  const [venueFilter, setVenueFilter] = useState<string>("ALL");
  const [venueSort, setVenueSort] = useState<VenueSort>("DEFAULT");

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [bookingsData, venuesData] = await Promise.all([
        getBookings(),
        getVenues(),
      ]);
      setBookings(bookingsData);
      setVenues(venuesData);
    } catch {
      setError("Failed to load bookings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = useMemo(() => {
    const base = bookings.filter((b) => {
      const venueName = b.venue?.name ?? "";
      const matchesSearch =
        search.trim() === "" ||
        b.clientName.toLowerCase().includes(search.toLowerCase()) ||
        venueName.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "ALL" || b.status === statusFilter;
      const matchesDate = dateFilter === "" || b.startDate.slice(0, 10) === dateFilter;
      const matchesVenue = venueFilter === "ALL" || b.venueId === venueFilter;
      return matchesSearch && matchesStatus && matchesDate && matchesVenue;
    });

    if (venueSort === "DEFAULT") return base;

    return [...base].sort((a, b) => {
      const nameA = a.venue?.name?.toLowerCase() ?? "";
      const nameB = b.venue?.name?.toLowerCase() ?? "";
      if (nameA === nameB) return 0;
      if (venueSort === "VENUE_ASC") return nameA < nameB ? -1 : 1;
      return nameA > nameB ? -1 : 1;
    });
  }, [bookings, search, statusFilter, dateFilter, venueFilter, venueSort]);

  const handleCancel = async (bookingId: string) => {
    if (!confirm("Are you sure you want to cancel this booking?")) return;
    setCancellingId(bookingId);
    try {
      const updated = await cancelBooking(bookingId);
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: "CANCELLED" as const } : b))
      );
    } catch {
      setError("Failed to cancel booking.");
    } finally {
      setCancellingId(null);
    }
  };

  const handleCreate = async (form: CreateBookingFormData) => {
    if (form.ranges && form.ranges.length > 1) {
      for (const r of form.ranges) {
        await createBooking({
          venueId: form.venueId,
          clientName: form.clientName,
          clientEmail: form.clientEmail || undefined,
          clientPhone: form.clientPhone || undefined,
          startDate: r.start,
          endDate: r.end,
          totalPrice: Number(form.totalPrice),
        });
      }
      await fetchData();
      return;
    }

    if (form.dates && form.dates.length > 1) {
      await createMultipleBookings({
        venueId: form.venueId,
        clientName: form.clientName,
        clientEmail: form.clientEmail || undefined,
        clientPhone: form.clientPhone || undefined,
        dates: form.dates,
        totalPrice: Number(form.totalPrice),
      });
      await fetchData();
      return;
    }

    const created = await createBooking({
      venueId: form.venueId,
      clientName: form.clientName,
      clientEmail: form.clientEmail || undefined,
      clientPhone: form.clientPhone || undefined,
      startDate: form.startDate,
      endDate: form.endDate,
      totalPrice: Number(form.totalPrice),
    });
    setBookings((prev) => [created, ...prev]);
  };

  return (
    <div
      className="flex flex-col h-full overflow-hidden"
      style={{ fontFamily: "var(--font-body)" }}
    >
      {/* HEADER — static */}
      <div className="flex items-center justify-between flex-shrink-0 mb-6">
        <div>
          <h1 className="text-3xl text-white font-bold" style={{ fontFamily: "var(--font-heading)" }}>
            Bookings
          </h1>
          <p className="mt-1 text-sm text-gray-400">Manage and track all event reservations</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-transform duration-200 hover:scale-[1.02] shadow-md"
          style={{ background: GOLD, color: "#1c1917" }}
        >
          <span className="text-base leading-none">+</span>
          Create Booking
        </button>
      </div>

      {/* FILTERS — static */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 flex-shrink-0 mb-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search by client or venue..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-400 outline-none transition-shadow"
              onFocus={(e) => { e.target.style.boxShadow = `0 0 0 2px ${GOLD}50`; e.target.style.borderColor = GOLD; }}
              onBlur={(e) => { e.target.style.boxShadow = ""; e.target.style.borderColor = ""; }}
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as "ALL" | StatusType)}
            className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 bg-white outline-none cursor-pointer"
            onFocus={(e) => { e.target.style.boxShadow = `0 0 0 2px ${GOLD}50`; e.target.style.borderColor = GOLD; }}
            onBlur={(e) => { e.target.style.boxShadow = ""; e.target.style.borderColor = ""; }}
          >
            <option value="ALL">All Statuses</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="PENDING">Pending</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 bg-white outline-none cursor-pointer"
            onFocus={(e) => { e.target.style.boxShadow = `0 0 0 2px ${GOLD}50`; e.target.style.borderColor = GOLD; }}
            onBlur={(e) => { e.target.style.boxShadow = ""; e.target.style.borderColor = ""; }}
          />

          <select
            value={venueFilter}
            onChange={(e) => setVenueFilter(e.target.value)}
            className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 bg-white outline-none cursor-pointer"
            onFocus={(e) => { e.target.style.boxShadow = `0 0 0 2px ${GOLD}50`; e.target.style.borderColor = GOLD; }}
            onBlur={(e) => { e.target.style.boxShadow = ""; e.target.style.borderColor = ""; }}
          >
            <option value="ALL">All Event Spaces</option>
            {venues.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </select>

          <select
            value={venueSort}
            onChange={(e) => setVenueSort(e.target.value as VenueSort)}
            className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 bg-white outline-none cursor-pointer"
            onFocus={(e) => { e.target.style.boxShadow = `0 0 0 2px ${GOLD}50`; e.target.style.borderColor = GOLD; }}
            onBlur={(e) => { e.target.style.boxShadow = ""; e.target.style.borderColor = ""; }}
          >
            <option value="DEFAULT">Default Order</option>
            <option value="VENUE_ASC">Event Space A–Z</option>
            <option value="VENUE_DESC">Event Space Z–A</option>
          </select>

          {(search || statusFilter !== "ALL" || dateFilter || venueFilter !== "ALL" || venueSort !== "DEFAULT") && (
            <button
              onClick={() => { setSearch(""); setStatusFilter("ALL"); setDateFilter(""); setVenueFilter("ALL"); setVenueSort("DEFAULT"); }}
              className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-500 hover:bg-gray-50 transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* ERROR — static */}
      {error && (
        <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 flex-shrink-0 mb-4">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
          {error}
          <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600">×</button>
        </div>
      )}

      {/* TABLE — scrollable */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col flex-1 min-h-0">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <p className="text-gray-400 text-sm">Loading bookings...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <svg className="w-10 h-10 text-gray-300" fill="none" viewBox="0 0 24 24" strokeWidth={1.2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-gray-400 text-sm">No bookings found.</p>
          </div>
        ) : (
          <div className="overflow-y-auto flex-1">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100 sticky top-0 z-10">
                <tr>
                  {["Client", "Event Space", "Dates", "Amount", "Status", "Actions"].map((col) => (
                    <th key={col} className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div>
                        <p className="font-medium text-gray-900">{booking.clientName}</p>
                        {booking.clientEmail && (
                          <p className="text-xs text-gray-400 mt-0.5">{booking.clientEmail}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-gray-600">
                      {booking.venue?.name ?? "—"}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-gray-600">
                      {formatDate(booking.startDate)}
                      {booking.startDate !== booking.endDate && (
                        <> — {formatDate(booking.endDate)}</>
                      )}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap font-semibold text-gray-900">
                      {formatCurrency(booking.totalPrice)}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <StatusBadge status={booking.status} />
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      {booking.status !== "CANCELLED" && (
                        <button
                          onClick={() => handleCancel(booking.id)}
                          disabled={cancellingId === booking.id}
                          className="text-xs px-3 py-1.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {cancellingId === booking.id ? "Cancelling..." : "Cancel"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <CreateBookingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        venues={venues}
        onSubmit={handleCreate}
      />
    </div>
  );
}
