import { useState, useEffect, useRef, useCallback } from "react";

interface BookingStats {
  total: number;
  upcoming: number;
  popularEvent: string;
  nextAvailable: string;
}

interface LandingVenue {
  id: string;
  name: string;
  location: string;
  city: string;
  state: string;
  pincode: string;
  capacity: number;
  price: number;
  phone: string;
  email: string;
  description: string;
  hero: string;
  images: string[];
  bookingStats: BookingStats;
}

const fmtPrice = (p: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(p);

const Icon = ({ d, className = "w-4 h-4" }: { d: string; className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d={d} />
  </svg>
);

const ICONS = {
  location: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z",
  guests:   "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z",
};

const PAUSE_MS = 30_000;

/* ─── Hero background crossfade ──────────────────────────────── */
function HeroBackground({ venues, heroId }: { venues: LandingVenue[]; heroId: string }) {
  return (
    <div className="absolute inset-0 z-0 bg-[#060605]">
      {venues.map((v) => (
        <div
          key={v.id}
          className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
          style={{ opacity: v.id === heroId ? 1 : 0 }}
        >
          <img src={v.hero} alt="" className="w-full h-full object-cover opacity-60 mix-blend-screen" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a09] via-[#0a0a09]/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a09]/95 via-[#0a0a09]/40 to-transparent" />
        </div>
      ))}
    </div>
  );
}

/* ─── Cooldown ring SVG ──────────────────────────────────────── */
function CooldownRing({ pauseUntilRef }: { pauseUntilRef: React.MutableRefObject<number> }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const tick = () => {
      const rem = pauseUntilRef.current - Date.now();
      setProgress(rem > 0 ? rem / PAUSE_MS : 0);
    };
    tick();
    const id = setInterval(tick, 200);
    return () => clearInterval(id);
  }, [pauseUntilRef]);

  if (progress <= 0) return null;

  const R = 9;
  const circ = 2 * Math.PI * R;

  return (
    <svg width="24" height="24" viewBox="0 0 24 24" className="absolute top-1 right-2 z-20 opacity-80">
      <circle cx="12" cy="12" r={R} fill="none" stroke="rgba(217,119,6,0.15)" strokeWidth="2" />
      <circle
        cx="12" cy="12" r={R} fill="none"
        stroke="#d97706" strokeWidth="2"
        strokeDasharray={`${circ * progress} ${circ}`}
        strokeLinecap="round"
        transform="rotate(-90 12 12)"
        style={{ transition: "stroke-dasharray 0.2s linear" }}
      />
    </svg>
  );
}

/* ─── Carousel ────────────────────────────────────────────────── */
function VenueCarousel({
  venues, heroId, onHeroChange, onUserSelect, pauseUntilRef,
}: {
  venues: LandingVenue[];
  heroId: string;
  onHeroChange: (v: LandingVenue) => void;
  onUserSelect: (v: LandingVenue) => void;
  pauseUntilRef: React.MutableRefObject<number>;
}) {
  const N = venues.length;
  const shouldLoop = N > 2;
  const items = shouldLoop ? [...venues, ...venues, ...venues] : venues;

  const heroIdx = venues.findIndex((v) => v.id === heroId);
  const [centerIdx, setCenterIdx] = useState(shouldLoop ? N + heroIdx : heroIdx);

  const trackRef = useRef<HTMLDivElement | null>(null);
  const hoverPausedRef = useRef(false);
  const isAnimatingRef = useRef(false);

  const CARD_W = 160;
  const CARD_GAP = 12;
  const STEP = CARD_W + CARD_GAP;

  const scrollToCenter = useCallback((idx: number, animate = true) => {
    const el = trackRef.current;
    if (!el) return;
    const containerW = el.parentElement?.offsetWidth ?? 600;
    const offset = idx * STEP - (containerW / 2 - CARD_W / 2);
    el.style.transition = animate ? "transform 0.65s cubic-bezier(0.25,1,0.5,1)" : "none";
    el.style.transform = `translateX(${-offset}px)`;
    if (animate) {
      isAnimatingRef.current = true;
      setTimeout(() => { isAnimatingRef.current = false; }, 700);
    }
  }, [STEP]);

  useEffect(() => {
    scrollToCenter(centerIdx, true);
    if (!shouldLoop) return;
    const t = setTimeout(() => {
      let next = centerIdx;
      if (centerIdx < N) next = centerIdx + N;
      else if (centerIdx >= 2 * N) next = centerIdx - N;
      if (next !== centerIdx) { setCenterIdx(next); scrollToCenter(next, false); }
    }, 720);
    return () => clearTimeout(t);
  }, [centerIdx, scrollToCenter, N, shouldLoop]);

  // Hero-only on auto change
  useEffect(() => {
    const realIdx = shouldLoop ? ((centerIdx % N) + N) % N : centerIdx % N;
    const venue = venues[realIdx];
    if (venue && venue.id !== heroId) onHeroChange(venue);
  }, [centerIdx]); // eslint-disable-line

  // Auto-advance — respects hover + 30s click pause
  useEffect(() => {
    const maxIdx = items.length - 1;
    const id = setInterval(() => {
      if (hoverPausedRef.current) return;
      if (Date.now() < pauseUntilRef.current) return;
      setCenterIdx(p => (!shouldLoop && p + 1 > maxIdx) ? 0 : p + 1);
    }, 4000);
    return () => clearInterval(id);
  }, [shouldLoop, items.length, pauseUntilRef]);

  if (N <= 1) return null;

  const realCenter = shouldLoop ? ((centerIdx % N) + N) % N : centerIdx % N;

  return (
    <div
      className="relative w-full"
      onMouseEnter={() => { hoverPausedRef.current = true; }}
      onMouseLeave={() => { hoverPausedRef.current = false; }}
    >
      {/* Label + dots */}
      <div className="flex items-center gap-3 mb-3 px-2">
        <span className="font-sans text-[0.52rem] tracking-[0.28em] uppercase text-amber-600/60">Our Spaces</span>
        <div className="flex-1 h-px bg-gradient-to-r from-amber-700/30 to-transparent" />
        <div className="flex items-center gap-1.5">
          {venues.map((v, i) => (
            <button
              key={i}
              onClick={() => {
                setCenterIdx(shouldLoop ? N + i : i);
                pauseUntilRef.current = Date.now() + PAUSE_MS;
                onUserSelect(v);
              }}
              className="border-none cursor-pointer p-0 transition-all duration-300"
              style={{
                width: i === realCenter ? "20px" : "6px",
                height: "4px",
                borderRadius: "2px",
                background: i === realCenter ? "#d97706" : "rgba(180,120,30,0.25)",
              }}
            />
          ))}
        </div>
      </div>

      {/* Cooldown ring */}
      <div className="relative">
        <CooldownRing pauseUntilRef={pauseUntilRef} />

        <div className="relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-[#0a0a09] to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-[#0a0a09] to-transparent z-10 pointer-events-none" />

          <div ref={trackRef} className="flex will-change-transform select-none pb-1" style={{ gap: `${CARD_GAP}px` }}>
            {items.map((venue, i) => {
              const isCenter = i === centerIdx;
              const dist = Math.abs(i - centerIdx);
              const isNear = dist === 1;

              return (
                <button
                  key={`${venue.id}-${i}`}
                  onClick={() => {
                    if (isAnimatingRef.current) return;
                    setCenterIdx(i);
                    pauseUntilRef.current = Date.now() + PAUSE_MS;
                    const realIdx = shouldLoop ? ((i % N) + N) % N : i % N;
                    const clicked = venues[realIdx];
                    if (clicked) onUserSelect(clicked);
                  }}
                  className="flex-shrink-0 border-none bg-transparent p-0 cursor-pointer outline-none text-left transition-all duration-500"
                  style={{
                    width: `${CARD_W}px`,
                    transform: isCenter ? "scale(1.07) translateY(-5px)" : isNear ? "scale(0.95)" : "scale(0.87)",
                    opacity: isCenter ? 1 : isNear ? 0.55 : 0.25,
                  }}
                >
                  <div
                    className="relative overflow-hidden transition-all duration-500"
                    style={{
                      height: "96px", borderRadius: "2px",
                      border: isCenter ? "1px solid rgba(217,119,6,0.7)" : "1px solid rgba(255,255,255,0.06)",
                      boxShadow: isCenter
                        ? "0 0 0 2px rgba(217,119,6,0.15), 0 12px 32px rgba(0,0,0,0.8)"
                        : "0 4px 12px rgba(0,0,0,0.5)",
                    }}
                  >
                    <img
                      src={venue.images[0]} alt={venue.name}
                      className="w-full h-full object-cover block transition-all duration-500"
                      style={{ filter: isCenter ? "brightness(0.7) saturate(1.05)" : "brightness(0.3) saturate(0.5)" }}
                    />
                    <div className="absolute inset-0" style={{
                      background: isCenter
                        ? "linear-gradient(to top, rgba(10,10,9,0.9) 0%, transparent 55%)"
                        : "linear-gradient(to top, rgba(10,10,9,0.7) 0%, transparent 100%)",
                    }} />
                    {isCenter && (
                      <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full animate-pulse"
                        style={{ background: "#d97706", boxShadow: "0 0 8px rgba(217,119,6,0.9)" }} />
                    )}
                    {isCenter && (
                      <div className="absolute bottom-2 left-2 rounded-full px-2 py-0.5 backdrop-blur-sm"
                        style={{ background: "rgba(217,119,6,0.12)", border: "1px solid rgba(217,119,6,0.4)" }}>
                        <span className="font-sans text-[0.46rem] tracking-widest uppercase text-amber-500">Viewing</span>
                      </div>
                    )}
                  </div>
                  <div className="pt-1.5 text-center px-0.5">
                    <p className="font-serif leading-tight mb-0.5 truncate transition-all duration-400"
                      style={{
                        fontSize: isCenter ? "0.78rem" : "0.68rem",
                        color: isCenter ? "#d97706" : "rgba(255,200,80,0.3)",
                        fontStyle: isCenter ? "italic" : "normal",
                      }}>
                      {venue.name}
                    </p>
                    <p className="font-sans text-[0.5rem] tracking-wide truncate transition-colors duration-400"
                      style={{ color: isCenter ? "rgba(217,119,6,0.6)" : "rgba(255,255,255,0.15)" }}>
                      {venue.location}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Main ──────────────────────────────────────────────────── */
export default function PremiumLayout({ tenantData }: { tenantData?: any }) {
  const realVenues: LandingVenue[] = tenantData?.venues?.length > 0
    ? tenantData.venues.map((v: any) => ({
        id: v.id,
        name: v.name,
        location: `${v.city}, ${v.state}`,
        city: v.city, state: v.state,
        pincode: v.pincode || "N/A",
        capacity: v.capacity || 0,
        price: v.price || 0,
        phone: tenantData.phone || "N/A",
        email: tenantData.email || "N/A",
        description: v.description || "An exclusive destination for premier events.",
        hero: v.images?.[0]?.url || "https://images.unsplash.com/photo-1542442828-287217bfb87f?w=1600&q=80",
        images: v.images?.length > 0
          ? v.images.map((i: any) => i.url)
          : ["https://images.unsplash.com/photo-1542442828-287217bfb87f?w=800&q=80"],
        bookingStats: { total: 0, upcoming: 0, popularEvent: "TBD", nextAvailable: new Date().toISOString() },
      }))
    : [];

  const [heroVenue, setHeroVenue]     = useState<LandingVenue | null>(realVenues[0] || null);
  const [detailVenue, setDetailVenue] = useState<LandingVenue | null>(realVenues[0] || null);
  const [transitioning, setTransitioning] = useState(false);
  const [detailPhase, setDetailPhase] = useState<"in" | "out">("in");

  // Shared pause ref — passed down to carousel
  const pauseUntilRef = useRef<number>(0);
  const transTimers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTransTimers = () => {
    transTimers.current.forEach(clearTimeout);
    transTimers.current = [];
  };

  const handleHeroChange = useCallback((venue: LandingVenue) => {
    setHeroVenue(venue);
  }, []);

  const handleUserSelect = useCallback((venue: LandingVenue) => {
    if (venue.id === heroVenue?.id) return;

    // Stamp the 30s pause
    pauseUntilRef.current = Date.now() + PAUSE_MS;

    clearTransTimers();

    // 1. Flash wipe + fade detail out
    setTransitioning(true);
    setDetailPhase("out");

    // 2. Swap hero bg (crossfade handles it smoothly)
    setHeroVenue(venue);

    // 3. After detail has faded (~280ms), swap data and fade in
    const t1 = setTimeout(() => {
      setDetailVenue(venue);
      setDetailPhase("in");
    }, 300);

    // 4. Remove flash overlay
    const t2 = setTimeout(() => {
      setTransitioning(false);
    }, 680);

    transTimers.current = [t1, t2];
  }, [heroVenue?.id]); // eslint-disable-line

  if (realVenues.length === 0 || !heroVenue || !detailVenue) {
    return (
      <div className="min-h-screen bg-[#0a0a09] text-amber-50 flex flex-col items-center justify-center p-8 text-center" style={{ fontFamily: "Inter, sans-serif" }}>
        <div className="w-16 h-16 rounded-full flex items-center justify-center mb-6 bg-gradient-to-br from-amber-700/20 to-amber-900/10 border border-amber-800/30">
          <span className="text-2xl text-amber-500 font-serif italic">❧</span>
        </div>
        <h1 className="text-3xl mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>Unveiling Soon</h1>
        <p className="text-amber-200/50 max-w-md font-light tracking-wide">
          The curated portfolio for {tenantData?.name || "this venue"} is currently being prepared.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a09] text-amber-50 selection:bg-amber-900/50 overflow-x-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600&family=Inter:wght@200;300;400;500&family=Playfair+Display:ital,wght@0,400;0,500;1,400&display=swap');
        .font-serif  { font-family: 'Playfair Display', serif !important; }
        .font-cinzel { font-family: 'Cinzel', serif !important; }
        .font-sans   { font-family: 'Inter', sans-serif !important; }

        @keyframes reveal {
          from { opacity: 0; transform: translateY(15px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .anim-reveal { animation: reveal 0.8s cubic-bezier(0.2,0.8,0.2,1) forwards; }

        /* ── Gold wipe: a diagonal shimmer sweeps left→right ── */
        @keyframes goldWipe {
          0%   { transform: translateX(-110%) skewX(-12deg); opacity: 0; }
          25%  { opacity: 1; }
          75%  { opacity: 0.6; }
          100% { transform: translateX(110%) skewX(-12deg);  opacity: 0; }
        }
        .gold-wipe { animation: goldWipe 0.68s cubic-bezier(0.4,0,0.2,1) forwards; }

        /* ── Detail section transitions ── */
        @keyframes detailFadeIn {
          0%   { opacity: 0; transform: translateY(24px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes detailFadeOut {
          0%   { opacity: 1; transform: translateY(0);    }
          100% { opacity: 0; transform: translateY(-14px); }
        }
        .detail-in  { animation: detailFadeIn  0.55s cubic-bezier(0.2,0.8,0.2,1) forwards; }
        .detail-out { animation: detailFadeOut 0.28s cubic-bezier(0.4,0,1,1)     forwards; }
      `}</style>

      {/* ── Global gold wipe overlay ─────────────────────────────── */}
      {transitioning && (
        <div
          className="fixed inset-0 z-[100] pointer-events-none overflow-hidden gold-wipe"
          style={{
            background: "linear-gradient(105deg, transparent 0%, rgba(251,191,36,0.04) 20%, rgba(251,191,36,0.18) 50%, rgba(217,119,6,0.08) 75%, transparent 100%)",
          }}
        />
      )}

      {/* ══ NAV ════════════════════════════════════════════════════ */}
      <nav className="fixed w-full top-0 z-50 backdrop-blur-md bg-[#0a0a09]/70 border-b border-white/5 py-4 px-10 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <span className="text-amber-500 font-serif italic text-2xl">❧</span>
          <span className="font-cinzel text-sm tracking-[0.2em] font-medium text-amber-50/90 uppercase">
            {tenantData?.name || "Exclusive Collection"}
          </span>
        </div>
        <div className="flex gap-8 items-center text-xs tracking-widest font-sans font-light uppercase text-amber-50/60">
          <a href="#portfolio" className="hover:text-amber-400 transition-colors">Portfolio</a>
          <button className="border border-amber-600/40 text-amber-500 hover:bg-amber-600/10 px-6 py-2 transition-all">
            Inquire
          </button>
        </div>
      </nav>

      {/* ══ HERO ═══════════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex flex-col justify-end pb-0 px-16 lg:px-24 overflow-hidden">
        <HeroBackground venues={realVenues} heroId={heroVenue.id} />

        <div className="relative z-10 grid grid-cols-12 gap-8 items-end pb-8">
          {/* Hero text — follows heroVenue on every change */}
          <div className="col-span-12 lg:col-span-7">
            <p className="font-sans text-xs tracking-[0.3em] uppercase text-amber-500/80 mb-4 anim-reveal">
              The Prestige Series
            </p>
            <div key={heroVenue.id}>
              <h1 className="font-serif text-5xl lg:text-7xl leading-tight mb-8 font-normal anim-reveal text-white">
                {heroVenue.name}
              </h1>
              <div className="flex gap-8 font-sans font-light text-sm text-amber-50/70 anim-reveal">
                <span className="flex items-center gap-2">
                  <Icon d={ICONS.location} className="w-4 h-4 text-amber-600" />
                  {heroVenue.location}
                </span>
                <span className="flex items-center gap-2">
                  <Icon d={ICONS.guests} className="w-4 h-4 text-amber-600" />
                  Max {heroVenue.capacity.toLocaleString()} Guests
                </span>
              </div>
            </div>
          </div>

          {/* Right selector rail — explicit click = full page update */}
          <div className="col-span-12 lg:col-span-5 flex flex-col items-end pb-4">
            <div className="space-y-4 text-right">
              {realVenues.map((v, i) => {
                const isActive = v.id === heroVenue.id;
                return (
                  <button
                    key={v.id}
                    onClick={() => handleUserSelect(v)}
                    className="block text-right w-full font-serif text-lg transition-all duration-300 cursor-pointer border-none bg-transparent"
                    style={{
                      color: isActive ? "#fbbf24" : "rgba(255,240,180,0.25)",
                      fontStyle: isActive ? "italic" : "normal",
                      transform: isActive ? "scale(1.05)" : "scale(1)",
                      transformOrigin: "right center",
                    }}
                  >
                    <span className="font-sans text-[10px] uppercase tracking-widest mr-4 opacity-50">0{i + 1}</span>
                    {v.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Carousel */}
        {realVenues.length > 1 && (
          <div
            className="relative z-10 pb-6 pt-4 border-t"
            style={{ borderColor: "rgba(217,119,6,0.15)" }}
          >
            <VenueCarousel
              venues={realVenues}
              heroId={heroVenue.id}
              onHeroChange={handleHeroChange}
              onUserSelect={handleUserSelect}
              pauseUntilRef={pauseUntilRef}
            />
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 h-px opacity-40"
          style={{ background: "linear-gradient(90deg, transparent, #d97706 35%, #fbbf24 65%, transparent)" }} />
      </section>

      {/* ══ DETAILS ════════════════════════════════════════════════ */}
      <section id="portfolio" className="max-w-7xl mx-auto px-10 py-32">
        {/*
          key={detailVenue.id} forces a full re-mount whenever venue changes,
          which re-triggers the CSS animation from scratch — clean stagger every time.
          detailPhase drives whether we play the in or out animation.
        */}
        <div key={detailVenue.id} className={detailPhase === "in" ? "detail-in" : "detail-out"}>
          <div className="flex flex-col lg:flex-row gap-20">
            <div className="lg:w-1/3">
              <h2 className="font-cinzel text-xl text-amber-500 mb-8 border-b border-amber-900/30 pb-4 inline-block tracking-[0.1em]">
                The Space
              </h2>
              <p className="font-serif italic text-2xl text-white/90 leading-snug mb-6">
                "An unparalleled atmosphere of distinction."
              </p>
              <p className="font-sans font-light text-sm text-white/50 leading-relaxed mb-12">
                {detailVenue.description}
              </p>
              <div className="grid grid-cols-1 gap-6">
                <div className="bg-[#111110] border border-white/5 p-6 flex flex-col gap-1">
                  <span className="font-sans text-[10px] tracking-widest text-amber-600 uppercase">Pricing</span>
                  <span className="font-serif text-xl">
                    {fmtPrice(detailVenue.price)}
                    <span className="text-xs text-white/30 font-sans italic"> / event</span>
                  </span>
                </div>
                <div className="bg-[#111110] border border-white/5 p-6 flex flex-col gap-1">
                  <span className="font-sans text-[10px] tracking-widest text-amber-600 uppercase">Contact Concierge</span>
                  <span className="font-sans font-light text-sm text-white/80 mt-1">{tenantData?.phone || "Not Provided"}</span>
                  <span className="font-sans font-light text-sm text-white/80">{tenantData?.email || "Not Provided"}</span>
                </div>
              </div>
            </div>

            <div className="lg:w-2/3 grid grid-cols-2 gap-4">
              {detailVenue.images.length >= 1 && (
                <img src={detailVenue.images[0]} alt=""
                  className="w-full h-80 object-cover rounded-sm border border-white/5 col-span-2" />
              )}
              {detailVenue.images.length >= 2 && (
                <img src={detailVenue.images[1]} alt=""
                  className="w-full h-64 object-cover rounded-sm border border-white/5" />
              )}
              {detailVenue.images.length >= 3 && (
                <img src={detailVenue.images[2]} alt=""
                  className="w-full h-64 object-cover rounded-sm border border-white/5" />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ══ FOOTER ═════════════════════════════════════════════════ */}
      <footer className="border-t border-amber-900/20 bg-[#060605] py-16 text-center text-xs font-sans font-light text-amber-50/40">
        <p className="mb-2 uppercase tracking-[0.2em]">{tenantData?.name || "Platform"}</p>
        <p>© 2026. All Rights Reserved. Curated by Eventers.</p>
      </footer>
    </div>
  );
}