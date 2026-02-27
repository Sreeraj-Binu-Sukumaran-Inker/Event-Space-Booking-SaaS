import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

const GOLD = "#d4af37";

interface BookingSummary {
  id: string;
  clientName: string;
  startDate: string;
  status: "CONFIRMED" | "CANCELLED" | "PENDING";
  venue: {
    name: string;
  };
}

function Button({
  children,
  onClick,
  variant = "primary",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "outline";
}) {
  const base =
    "inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 cursor-pointer";
  if (variant === "primary") {
    return (
      <button
        onClick={onClick}
        className={`${base} text-stone-900 hover:opacity-90 hover:scale-[1.02] active:scale-100`}
        style={{ background: GOLD }}
      >
        {children}
      </button>
    );
  }
  return (
    <button
      onClick={onClick}
      className={`${base} border border-gray-600 text-gray-300 hover:bg-white/5 hover:border-gray-500`}
    >
      {children}
    </button>
  );
}

function StatusBadge({ status }: { status: BookingSummary["status"] }) {
  const map: Record<BookingSummary["status"], { bg: string; text: string; dot: string }> = {
    CONFIRMED: { bg: "bg-green-100", text: "text-green-700", dot: "bg-green-500" },
    PENDING: { bg: "bg-amber-100", text: "text-amber-700", dot: "bg-amber-500" },
    CANCELLED: { bg: "bg-red-100", text: "text-red-600", dot: "bg-red-500" },
  };
  const { bg, text, dot } = map[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${bg} ${text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: GOLD }} />
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            {label}
          </p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: `${GOLD}15`, color: GOLD }}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

function RoomsIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
    </svg>
  );
}

function BookingsIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
    </svg>
  );
}

function EventsIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
    </svg>
  );
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function StaffDashboard() {
  const navigate = useNavigate();

  const [venueCount, setVenueCount] = useState(0);
  const [bookingCount, setBookingCount] = useState(0);
  const [upcomingCount, setUpcomingCount] = useState(0);
  const [recentBookings, setRecentBookings] = useState<BookingSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError(null);

        const [venueRes, bookingRes] = await Promise.all([
          api.get("/venues/count"),
          api.get("/bookings"),
        ]);

        const allBookings: BookingSummary[] = bookingRes.data.data;

        setVenueCount(venueRes.data.data.count);
        setBookingCount(allBookings.length);
        setUpcomingCount(
          allBookings.filter((b) => b.status === "CONFIRMED").length
        );
        setRecentBookings(allBookings.slice(0, 5));
      } catch {
        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  return (
    <div className="flex flex-col h-full overflow-hidden gap-6" style={{ fontFamily: "var(--font-body, 'Inter', sans-serif)" }}>
      <div className="flex-shrink-0">
        <h1 className="text-2xl text-white" style={{ fontFamily: "var(--font-heading, 'Playfair Display', serif)" }}>
          Staff Dashboard
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Overview of your assigned venues and bookings.
        </p>
      </div>

      {error && <div className="flex-shrink-0 text-red-500 text-sm">{error}</div>}

      <div className="flex-shrink-0 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        <StatCard label="Assigned Event Spaces" value={loading ? "..." : venueCount} icon={<RoomsIcon />} />
        <StatCard label="Total Bookings" value={loading ? "..." : bookingCount} icon={<BookingsIcon />} />
        <StatCard label="Upcoming Events" value={loading ? "..." : upcomingCount} icon={<EventsIcon />} />
      </div>

      <div className="flex flex-col flex-1 min-h-0 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="flex-shrink-0 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900">Recent Bookings</h2>
          <button
            onClick={() => navigate("/staff/bookings")}
            className="text-xs font-medium hover:underline transition-colors duration-150"
            style={{ color: GOLD }}
          >
            View all →
          </button>
        </div>

        {loading ? (
          <div className="px-6 py-10 text-center text-sm text-gray-400">Loading...</div>
        ) : recentBookings.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-gray-400">No bookings yet.</div>
        ) : (
          <div className="overflow-y-auto flex-1">
            <table className="w-full min-w-[580px] text-sm">
              <thead className="sticky top-0 z-10">
                <tr className="bg-gray-50 border-b border-gray-100">
                  {["Venue", "Client", "Start Date", "Status"].map((col) => (
                    <th
                      key={col}
                      className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50 transition-colors duration-100">
                    <td className="px-5 py-3.5 font-medium text-gray-900">
                      {booking.venue?.name ?? "-"}
                    </td>
                    <td className="px-5 py-3.5 text-gray-500">{booking.clientName}</td>
                    <td className="px-5 py-3.5 text-gray-500">
                      {formatDate(booking.startDate)}
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={booking.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="flex-shrink-0">
        <h2 className="text-sm font-semibold text-gray-300 mb-3">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => navigate("/staff/event-spaces")}>
            View Event Spaces
          </Button>
          <Button variant="outline" onClick={() => navigate("/staff/bookings")}>
            View Bookings
          </Button>
          <Button variant="outline" onClick={() => navigate("/staff/images")}>
            Manage Images
          </Button>
        </div>
      </div>
    </div>
  );
}
