import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../hooks/useAuth";

type Role = "SUPER_ADMIN" | "TENANT_ADMIN" | "STAFF";

const GOLD = "#d4af37";

function EyeOpenIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function EyeClosedIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
    </svg>
  );
}

function Spinner() {
  return (
    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

export default function TenantLogin() {
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [mounted, setMounted] = useState(false);
  const userRole = useRef<string | null>(null);
  const pendingNavigation = useRef(false);

  const { user, login } = useAuth();
  const navigate = useNavigate();
  
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || "/tenant";

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  // Navigate after auth state updates - only trigger once when user becomes available
  useEffect(() => {
    if (pendingNavigation.current && user) {
      pendingNavigation.current = false;
      
      if (userRole.current === "TENANT_ADMIN") {
        navigate(from, { replace: true });
      } else if (userRole.current === "STAFF") {
        navigate("/staff", { replace: true });
      }
    }
  }, [user, navigate, from]);

  const validate = (): boolean => {
    const errors: { email?: string; password?: string } = {};
    if (!email.trim()) {
      errors.email = "Email address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Please enter a valid email address.";
    }
    if (!password) {
      errors.password = "Password is required.";
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!validate()) return;

    setLoading(true);
    try {
      const response = await api.post("/auth/login", { email, password });
      const { accessToken, user } = response.data;

      if (user.role === "SUPER_ADMIN") {
        setError("Super Admin accounts must login via /platform/login");
        setLoading(false);
        return;
      }

      // Mark pending navigation and store role
      userRole.current = user.role;
      pendingNavigation.current = true;
      
      // This triggers the state update which will fire the useEffect
      login(accessToken, user);

    } catch (err: unknown) {
      if (
        typeof err === "object" &&
        err !== null &&
        "response" in err &&
        typeof (err as { response?: { data?: { message?: string } } }).response?.data?.message === "string"
      ) {
        setError((err as { response: { data: { message: string } } }).response.data.message);
      } else {
        setError("Invalid credentials. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex"
      style={
        {
          "--font-heading": "'Playfair Display', serif",
          "--font-body": "'Inter', sans-serif",
        } as React.CSSProperties
      }
    >
      {/* ── LEFT BRANDING ── */}
      <div className="hidden md:flex md:w-1/2 relative overflow-hidden flex-col items-center justify-center">
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-[10000ms] ease-out"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1600&q=85')",
            transform: mounted ? "scale(1.07)" : "scale(1)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-stone-950/90 via-stone-900/80 to-stone-950/95" />

        <div
          className="relative z-10 px-14 text-center flex flex-col items-center gap-6 transition-all duration-1000 ease-out"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateY(0)" : "translateY(20px)",
          }}
        >
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-2 shadow-xl"
            style={{ background: `${GOLD}20`, border: `1px solid ${GOLD}40` }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.2} stroke={GOLD} className="w-8 h-8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
            </svg>
          </div>

          <p
            className="text-xs tracking-[0.4em] uppercase"
            style={{ color: GOLD, fontFamily: "var(--font-body)" }}
          >
            EventSpace SaaS
          </p>

          <h1
            className="text-5xl xl:text-6xl text-white leading-tight"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Welcome
            <br />
            <em style={{ color: GOLD }}>Back</em>
          </h1>

          <div className="w-10 h-px" style={{ background: GOLD }} />

          <p
            className="text-stone-400 text-base leading-8 max-w-xs"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Manage your venue, bookings and operations seamlessly.
          </p>

          <div className="mt-6 flex flex-col gap-3 w-full max-w-xs">
            {[
              "Real-time booking management",
              "Staff scheduling & access control",
              "Revenue analytics & reporting",
            ].map((feat) => (
              <div key={feat} className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: GOLD }} />
                <span className="text-stone-400 text-sm" style={{ fontFamily: "var(--font-body)" }}>
                  {feat}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="absolute bottom-8 left-0 right-0 text-center">
          <p className="text-stone-700 text-xs tracking-widest uppercase" style={{ fontFamily: "var(--font-body)" }}>
            Tenant Portal
          </p>
        </div>
      </div>

      {/* ── RIGHT LOGIN ── */}
      <div className="w-full md:w-1/2 flex items-center justify-center bg-stone-950 px-4 py-16">
        <div
          className="w-full max-w-md transition-all duration-700 ease-out"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateY(0)" : "translateY(24px)",
          }}
        >
          {/* Mobile-only logo */}
          <div className="flex md:hidden flex-col items-center mb-10 gap-2">
            <span
              className="text-2xl tracking-widest uppercase"
              style={{ fontFamily: "var(--font-heading)", color: GOLD }}
            >
              EventSpace
            </span>
            <p className="text-stone-500 text-xs tracking-widest uppercase" style={{ fontFamily: "var(--font-body)" }}>
              Tenant Portal
            </p>
          </div>

          <div
            className="rounded-2xl p-8 md:p-10 shadow-2xl"
            style={{
              background: "rgba(255,255,255,0.05)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              border: `1px solid ${GOLD}25`,
              boxShadow: `0 0 60px rgba(0,0,0,0.5), inset 0 1px 0 ${GOLD}15`,
            }}
          >
            <div className="mb-8">
              <h2
                className="text-3xl text-white mb-2"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Tenant <em style={{ color: GOLD }}>Login</em>
              </h2>
              <p
                className="text-stone-500 text-sm"
                style={{ fontFamily: "var(--font-body)" }}
              >
                Sign in to access your venue dashboard.
              </p>
            </div>

            {error && (
              <div
                className="mb-6 flex items-start gap-3 rounded-xl px-4 py-3 text-sm"
                style={{
                  background: "rgba(239,68,68,0.1)",
                  border: "1px solid rgba(239,68,68,0.3)",
                  color: "#fca5a5",
                  fontFamily: "var(--font-body)",
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 flex-shrink-0 mt-0.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-xs tracking-widest uppercase mb-2"
                  style={{ color: GOLD, fontFamily: "var(--font-body)" }}
                >
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setFieldErrors((p) => ({ ...p, email: undefined }));
                  }}
                  placeholder="you@venue.com"
                  className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-stone-600 outline-none transition-all duration-200"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: fieldErrors.email
                      ? "1px solid rgba(239,68,68,0.6)"
                      : `1px solid rgba(255,255,255,0.1)`,
                    fontFamily: "var(--font-body)",
                  }}
                  onFocus={(e) => {
                    if (!fieldErrors.email) {
                      e.currentTarget.style.border = `1px solid ${GOLD}80`;
                      e.currentTarget.style.boxShadow = `0 0 0 3px ${GOLD}18`;
                    }
                  }}
                  onBlur={(e) => {
                    if (!fieldErrors.email) {
                      e.currentTarget.style.border = "1px solid rgba(255,255,255,0.1)";
                      e.currentTarget.style.boxShadow = "none";
                    }
                  }}
                />
                {fieldErrors.email && (
                  <p className="mt-1.5 text-xs text-red-400" style={{ fontFamily: "var(--font-body)" }}>
                    {fieldErrors.email}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-xs tracking-widest uppercase mb-2"
                  style={{ color: GOLD, fontFamily: "var(--font-body)" }}
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setFieldErrors((p) => ({ ...p, password: undefined }));
                    }}
                    placeholder="Enter your password"
                    className="w-full px-4 py-3 pr-12 rounded-xl text-sm text-white placeholder-stone-600 outline-none transition-all duration-200"
                    style={{
                      background: "rgba(255,255,255,0.06)",
                      border: fieldErrors.password
                        ? "1px solid rgba(239,68,68,0.6)"
                        : "1px solid rgba(255,255,255,0.1)",
                      fontFamily: "var(--font-body)",
                    }}
                    onFocus={(e) => {
                      if (!fieldErrors.password) {
                        e.currentTarget.style.border = `1px solid ${GOLD}80`;
                        e.currentTarget.style.boxShadow = `0 0 0 3px ${GOLD}18`;
                      }
                    }}
                    onBlur={(e) => {
                      if (!fieldErrors.password) {
                        e.currentTarget.style.border = "1px solid rgba(255,255,255,0.1)";
                        e.currentTarget.style.boxShadow = "none";
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg transition-colors duration-200"
                    style={{ color: "#78716c" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = GOLD)}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "#78716c")}
                  >
                    {showPassword ? <EyeClosedIcon /> : <EyeOpenIcon />}
                  </button>
                </div>
                {fieldErrors.password && (
                  <p className="mt-1.5 text-xs text-red-400" style={{ fontFamily: "var(--font-body)" }}>
                    {fieldErrors.password}
                  </p>
                )}
              </div>

              <div className="flex justify-end">
                <a
                  href="#"
                  className="text-xs tracking-wider transition-colors duration-200"
                  style={{ color: "#78716c", fontFamily: "var(--font-body)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = GOLD)}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "#78716c")}
                >
                  Forgot password?
                </a>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-xl text-sm tracking-[0.15em] uppercase font-semibold transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                style={{
                  background: loading ? `${GOLD}90` : GOLD,
                  color: "#1a1a1a",
                  fontFamily: "var(--font-body)",
                  boxShadow: loading ? "none" : `0 4px 24px ${GOLD}35`,
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.currentTarget.style.transform = "scale(1.02)";
                    e.currentTarget.style.boxShadow = `0 6px 32px ${GOLD}55`;
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.boxShadow = `0 4px 24px ${GOLD}35`;
                }}
                onMouseDown={(e) => {
                  if (!loading) e.currentTarget.style.transform = "scale(0.98)";
                }}
                onMouseUp={(e) => {
                  if (!loading) e.currentTarget.style.transform = "scale(1.02)";
                }}
              >
                {loading ? (
                  <>
                    <Spinner />
                    <span>Signing in…</span>
                  </>
                ) : (
                  "Sign In to Dashboard"
                )}
              </button>
            </form>

            <div className="mt-8 pt-6" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
              <p
                className="text-center text-xs text-stone-600"
                style={{ fontFamily: "var(--font-body)" }}
              >
                Access restricted to authorised venue staff only.
                <br />
                <a
                  href="/"
                  className="transition-colors duration-200 mt-1 inline-block"
                  style={{ color: "#57534e" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = GOLD)}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "#57534e")}
                >
                  ← Back to venue website
                </a>
              </p>
            </div>
          </div>

          <p
            className="text-center text-xs text-stone-700 mt-6"
            style={{ fontFamily: "var(--font-body)" }}
          >
            © {new Date().getFullYear()} EventSpace SaaS. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
