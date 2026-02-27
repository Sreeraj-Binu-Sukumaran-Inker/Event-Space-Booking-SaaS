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
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z" />
    </svg>
  );
}

function StaffIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
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
function SettingsIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
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
  const role = user?.role ?? "TENANT_ADMIN";

  const navItems: NavItem[] = [
    { label: "Dashboard", to: "/tenant", icon: <DashboardIcon /> },
    { label: "Event Spaces", to: "/tenant/event-spaces", icon: <RoomsIcon /> },
    { label: "Bookings", to: "/tenant/bookings", icon: <BookingsIcon /> },
    { label: "Images", to: "/tenant/event-space-images", icon: <ImagesIcon /> },
  ];

  if (role === "TENANT_ADMIN") {
    navItems.push(
      { label: "Staff", to: "/tenant/staff", icon: <StaffIcon /> },
      { label: "Settings", to: "/tenant/settings", icon: <SettingsIcon /> }
    );
  }

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div
      className="flex flex-col h-full"
      style={{ fontFamily: "var(--font-body)" }}
    >
      <div
        className="h-16 flex items-center px-5 flex-shrink-0"
        style={{ borderBottom: `1px solid ${GOLD}20` }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: `${GOLD}18`, border: `1px solid ${GOLD}35` }}
          >
            <VenueIcon />
          </div>
          <div className="min-w-0">
            <p
              className="text-sm font-semibold text-white leading-tight truncate"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Grandeur Venue
            </p>
            <p className="text-xs leading-tight" style={{ color: `${GOLD}99` }}>
              Tenant Portal
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-5">
        <p
          className="px-3 mb-3 text-xs font-medium uppercase tracking-widest"
          style={{ color: `${GOLD}60` }}
        >
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
                    isActive
                      ? "text-stone-900 shadow-md"
                      : "text-gray-400 hover:text-white",
                  ].join(" ")
                }
                style={({ isActive }) =>
                  isActive
                    ? { background: GOLD }
                    : {}
                }
                onMouseEnter={(e) => {
                  const el = e.currentTarget;
                  if (!el.classList.contains("text-stone-900")) {
                    el.style.background = "rgba(255,255,255,0.08)";
                  }
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget;
                  if (!el.classList.contains("text-stone-900")) {
                    el.style.background = "";
                  }
                }}
              >
                <span className="flex-shrink-0">{item.icon}</span>
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div
        className="px-3 py-4 flex-shrink-0"
        style={{ borderTop: `1px solid ${GOLD}15` }}
      >
        <div className="flex items-center gap-3 px-3 py-2 mb-2 rounded-lg" style={{ background: "rgba(255,255,255,0.04)" }}>
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
            style={{ background: `${GOLD}22`, color: GOLD }}
          >
            {user?.email?.charAt(0).toUpperCase() ?? "U"}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-white truncate">{user?.email ?? "user@venue.com"}</p>
            <p className="text-xs" style={{ color: `${GOLD}70` }}>{user?.role ?? "TENANT_ADMIN"}</p>
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

export default function TenantLayout() {
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
      <aside
        className="hidden md:flex flex-col w-64 flex-shrink-0"
        style={{ background: "#151412", borderRight: `1px solid ${GOLD}15` }}
      >
        <SidebarContent />
      </aside>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 md:hidden"
          style={{ background: "rgba(0,0,0,0.7)" }}
          onClick={() => setSidebarOpen(false)}
        />
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
          style={{
            background: "#151412",
            borderBottom: `1px solid ${GOLD}18`,
          }}
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
              <p
                className="text-base text-white"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Venue <em style={{ color: GOLD }}>Console</em>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg"
              style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${GOLD}15` }}
            >
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                style={{ background: `${GOLD}22`, color: GOLD, fontFamily: "var(--font-body)" }}
              >
                {user?.email?.charAt(0).toUpperCase() ?? "U"}
              </div>
              <div className="text-right">
                <p
                  className="text-xs font-medium text-white max-w-[160px] truncate"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  {user?.email ?? "user@venue.com"}
                </p>
                <p className="text-xs" style={{ color: `${GOLD}70`, fontFamily: "var(--font-body)" }}>
                  {user?.role ?? "TENANT_ADMIN"}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main
          className="flex-1 overflow-y-auto p-6"
          style={{ background: "#111010" }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
