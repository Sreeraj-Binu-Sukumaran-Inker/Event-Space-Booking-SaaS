import React, { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const GOLD = "#d4af37";

interface NavItem {
  label: string;
  to: string;
  icon: React.ReactNode;
}

function DashboardIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
    </svg>
  );
}

function RoomsIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
    </svg>
  );
}

function BookingsIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
    </svg>
  );
}

function ImagesIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5A2.25 2.25 0 015.25 5.25h13.5A2.25 2.25 0 0121 7.5v9A2.25 2.25 0 0118.75 18.75H5.25A2.25 2.25 0 013 16.5v-9z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 15l4.5-4.5a2.25 2.25 0 013.182 0L15 15l1.5-1.5a2.25 2.25 0 013.182 0L21 15" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 9.75h.008v.008h-.008V9.75z" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
    </svg>
  );
}

function HamburgerIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function VenueIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.3} stroke={GOLD} className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
    </svg>
  );
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const navItems: NavItem[] = [
    { label: "Dashboard", to: "/staff", icon: <DashboardIcon /> },
    { label: "Event Spaces", to: "/staff/event-spaces", icon: <RoomsIcon /> },
    { label: "Bookings", to: "/staff/bookings", icon: <BookingsIcon /> },
    { label: "Images", to: "/staff/images", icon: <ImagesIcon /> },
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex flex-col h-full" style={{ fontFamily: "var(--font-body)" }}>
      <div className="h-16 flex items-center px-5 flex-shrink-0" style={{ borderBottom: `1px solid ${GOLD}20` }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${GOLD}18`, border: `1px solid ${GOLD}35` }}>
            <VenueIcon />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white leading-tight truncate" style={{ fontFamily: "var(--font-heading)" }}>
              Venue Staff
            </p>
            <p className="text-xs leading-tight" style={{ color: `${GOLD}99` }}>
              Staff Console
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-5">
        <p className="px-3 mb-3 text-xs font-medium uppercase tracking-widest" style={{ color: `${GOLD}60` }}>
          Menu
        </p>
        <ul className="space-y-0.5">
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                onClick={onNavigate}
                className={({ isActive }) =>
                  [
                    "group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                    isActive ? "text-stone-900 shadow-md" : "text-gray-400 hover:text-white",
                  ].join(" ")
                }
                style={({ isActive }) => (isActive ? { background: GOLD } : {})}
                onMouseEnter={(e) => {
                  const el = e.currentTarget;
                  if (!el.classList.contains("text-stone-900")) el.style.background = "rgba(255,255,255,0.08)";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget;
                  if (!el.classList.contains("text-stone-900")) el.style.background = "";
                }}
              >
                <span className="flex-shrink-0">{item.icon}</span>
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="px-3 py-4 flex-shrink-0" style={{ borderTop: `1px solid ${GOLD}15` }}>
        <div className="flex items-center gap-3 px-3 py-2 mb-2 rounded-lg" style={{ background: "rgba(255,255,255,0.04)" }}>
          <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold" style={{ background: `${GOLD}22`, color: GOLD }}>
            {user?.email?.charAt(0).toUpperCase() ?? "U"}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-white truncate">{user?.email ?? "user@venue.com"}</p>
            <p className="text-xs" style={{ color: `${GOLD}70` }}>{user?.role ?? "STAFF"}</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 transition-all duration-200 hover:text-red-400"
          onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(239,68,68,0.1)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = ""; }}
        >
          <LogoutIcon />
          Sign out
        </button>
      </div>
    </div>
  );
}

export default function StaffLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={
        {
          "--font-heading": "'Playfair Display', serif",
          "--font-body": "'Inter', sans-serif",
          background: "#0f0e0d",
        } as React.CSSProperties
      }
    >
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 flex-shrink-0" style={{ background: "#151412", borderRight: `1px solid ${GOLD}15` }}>
        <SidebarContent />
      </aside>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 md:hidden" style={{ background: "rgba(0,0,0,0.7)" }} onClick={() => setSidebarOpen(false)} />
      )}

      {/* Mobile Sidebar Drawer */}
      <aside
        className="fixed inset-y-0 left-0 z-40 w-64 flex flex-col md:hidden transition-transform duration-200 ease-in-out"
        style={{
          background: "#151412",
          borderRight: `1px solid ${GOLD}15`,
          transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)",
        }}
      >
        <SidebarContent onNavigate={() => setSidebarOpen(false)} />
      </aside>

      {/* Main */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Header */}
        <header
          className="h-16 flex items-center justify-between px-4 md:px-6 flex-shrink-0"
          style={{ background: "#151412", borderBottom: `1px solid ${GOLD}18` }}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen((v) => !v)}
              className="md:hidden p-1.5 rounded-lg transition-colors duration-150 text-gray-400 hover:text-white"
              aria-label="Toggle sidebar"
              style={{ fontFamily: "var(--font-body)" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = ""; }}
            >
              {sidebarOpen ? <CloseIcon /> : <HamburgerIcon />}
            </button>

            <div className="hidden md:block">
              <p className="text-base text-white" style={{ fontFamily: "var(--font-heading)" }}>
                Staff <em style={{ color: GOLD }}>Console</em>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${GOLD}15` }}>
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ background: `${GOLD}22`, color: GOLD, fontFamily: "var(--font-body)" }}>
                {user?.email?.charAt(0).toUpperCase() ?? "U"}
              </div>
              <div className="text-right">
                <p className="text-xs font-medium text-white max-w-[160px] truncate" style={{ fontFamily: "var(--font-body)" }}>
                  {user?.email ?? "user@venue.com"}
                </p>
                <p className="text-xs" style={{ color: `${GOLD}70`, fontFamily: "var(--font-body)" }}>
                  {user?.role ?? "STAFF"}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6" style={{ background: "#111010" }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
