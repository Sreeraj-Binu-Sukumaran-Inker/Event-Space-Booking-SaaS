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

/* ─── Data ──────────────────────────────────────────────────── */
const venues: LandingVenue[] = [
  {
    id: "1",
    name: "Grand Royal Hall",
    location: "Kochi, Kerala",
    city: "Kochi", state: "Kerala", pincode: "682001",
    capacity: 500, price: 120000,
    phone: "+91 484 123 4567", email: "bookings@grandroyal.com",
    description: "Grand Royal Hall is an opulent celebration space nestled in the heart of Kochi. Adorned with crystal chandeliers, marble floors, and floor-to-ceiling drapery, this hall transforms your most cherished events into timeless memories. Our dedicated concierge team ensures every detail is handled with grace, from floral arrangements to bespoke catering.",
    hero: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1600&q=80",
    images: [
      "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&q=80",
      "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&q=80",
      "https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=800&q=80",
      "https://images.unsplash.com/photo-1478147427282-58a87a433b13?w=800&q=80",
    ],
    bookingStats: { total: 120, upcoming: 5, popularEvent: "Weddings", nextAvailable: "2026-03-15" },
  },
  {
    id: "2",
    name: "Azure Sky Terrace",
    location: "Bangalore, Karnataka",
    city: "Bangalore", state: "Karnataka", pincode: "560001",
    capacity: 250, price: 75000,
    phone: "+91 80 987 6543", email: "events@azuresky.com",
    description: "Perched atop Bangalore's skyline, Azure Sky Terrace offers an alfresco event experience like no other. With panoramic city views, ambient string lighting, and modular open-air setups, it's the perfect canvas for corporate galas, cocktail evenings, and intimate celebrations under the stars.",
    hero: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=1600&q=80",
    images: [
      "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&q=80",
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80",
      "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80",
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80",
    ],
    bookingStats: { total: 87, upcoming: 3, popularEvent: "Corporate Events", nextAvailable: "2026-03-08" },
  },
  {
    id: "3",
    name: "The Heritage Pavilion",
    location: "Jaipur, Rajasthan",
    city: "Jaipur", state: "Rajasthan", pincode: "302001",
    capacity: 800, price: 195000,
    phone: "+91 141 555 7890", email: "reservations@heritagepavilion.com",
    description: "Step into royalty at The Heritage Pavilion — a restored colonial estate dating back to 1887. With intricately carved archways, royal courtyards, and lush manicured gardens, this venue offers a breathtaking backdrop for grand weddings, destination events, and cultural galas.",
    hero: "https://images.unsplash.com/photo-1561488111-5d800fd56b8a?w=1600&q=80",
    images: [
      "https://images.unsplash.com/photo-1561488111-5d800fd56b8a?w=800&q=80",
      "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=800&q=80",
      "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&q=80",
      "https://images.unsplash.com/photo-1578898886225-c7c894047899?w=800&q=80",
    ],
    bookingStats: { total: 214, upcoming: 9, popularEvent: "Destination Weddings", nextAvailable: "2026-04-02" },
  },
];

const tenant = { name: "Verdana Spaces", logo: "❧" };

const fmtDate = (d: string) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
const fmtPrice = (p: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(p);

/* ─── SVG helpers ────────────────────────────────────────────── */
const Icon = ({ d, className = "w-4 h-4" }: { d: string; className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" d={d} />
  </svg>
);

const ICONS = {
  location: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z",
  guests:   "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z",
  price:    "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  phone:    "M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z",
  email:    "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
  clock:    "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
  calendar: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
  star:     "M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z",
  check:    "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4",
};

/* ─── Carousel ──────────────────────────────────────────────── */
function VenueCarousel({
  venues,
  selectedId,
  onSelect,
}: {
  venues: LandingVenue[];
  selectedId: string;
  onSelect: (venue: LandingVenue) => void;
}) {
  const N = venues.length;
  const items = [...venues, ...venues, ...venues]; // triple for infinite loop
  const selectedIdx = venues.findIndex((v) => v.id === selectedId);
  const [centerIdx, setCenterIdx] = useState(N + selectedIdx);

  const trackRef = useRef<HTMLDivElement | null>(null);
  const pausedRef = useRef(false);
  const isAnimatingRef = useRef(false);

  const CARD_W = 200;
  const CARD_GAP = 16;
  const STEP = CARD_W + CARD_GAP;

  const scrollToCenter = useCallback((idx: number, animate = true) => {
    const el = trackRef.current;
    if (!el) return;
    const containerW = el.parentElement?.offsetWidth ?? 800;
    const offset = idx * STEP - (containerW / 2 - CARD_W / 2);
    if (animate) {
      isAnimatingRef.current = true;
      el.style.transition = "transform 0.65s cubic-bezier(0.25,1,0.5,1)";
    } else {
      el.style.transition = "none";
    }
    el.style.transform = `translateX(${-offset}px)`;
    if (animate) setTimeout(() => { isAnimatingRef.current = false; }, 700);
  }, [STEP]);

  // Scroll whenever centerIdx changes + silent teleport to middle copy
  useEffect(() => {
    scrollToCenter(centerIdx, true);
    const t = setTimeout(() => {
      let next = centerIdx;
      if (centerIdx < N) next = centerIdx + N;
      else if (centerIdx >= 2 * N) next = centerIdx - N;
      if (next !== centerIdx) { setCenterIdx(next); scrollToCenter(next, false); }
    }, 720);
    return () => clearTimeout(t);
  }, [centerIdx, scrollToCenter, N]);

  // Notify parent when center changes
  useEffect(() => {
    const realIdx = ((centerIdx % N) + N) % N;
    const venue = venues[realIdx];
    if (venue && venue.id !== selectedId) onSelect(venue);
  }, [centerIdx]); // eslint-disable-line

  // Auto-advance every 3s
  useEffect(() => {
    const id = setInterval(() => {
      if (!pausedRef.current) setCenterIdx(p => p + 1);
    }, 3000);
    return () => clearInterval(id);
  }, []);

  if (N <= 1) return null;

  const realCenter = ((centerIdx % N) + N) % N;

  return (
    <div
      className="relative w-full"
      onMouseEnter={() => { pausedRef.current = true; }}
      onMouseLeave={() => { pausedRef.current = false; }}
    >
      {/* Header row */}
      <div className="flex items-center gap-3 mb-3 px-8">
        <span className="font-sans text-[0.58rem] tracking-[0.26em] uppercase text-emerald-400/60">
          Our Spaces
        </span>
        <div className="flex-1 h-px bg-gradient-to-r from-emerald-500/25 to-transparent" />
        {/* Dot indicators */}
        <div className="flex items-center gap-1.5">
          {venues.map((_, i) => (
            <button
              key={i}
              onClick={() => setCenterIdx(N + i)}
              className={`h-1.5 rounded-full border-none cursor-pointer transition-all duration-400 ${
                i === realCenter
                  ? "w-5 bg-emerald-400"
                  : "w-1.5 bg-emerald-500/25 hover:bg-emerald-500/50"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Mask + track wrapper */}
      <div className="relative overflow-hidden">
        {/* Left fade */}
        <div className="absolute left-0 top-0 bottom-0 w-28 bg-gradient-to-r from-[#07120d] to-transparent z-10 pointer-events-none" />
        {/* Right fade */}
        <div className="absolute right-0 top-0 bottom-0 w-28 bg-gradient-to-l from-[#07120d] to-transparent z-10 pointer-events-none" />

        {/* Sliding track */}
        <div
          ref={trackRef}
          className="flex will-change-transform select-none pb-1"
          style={{ gap: `${CARD_GAP}px` }}
        >
          {items.map((venue, i) => {
            const isCenter = i === centerIdx;
            const dist = Math.abs(i - centerIdx);
            const isNear = dist === 1;

            return (
              <button
                key={`${venue.id}-${i}`}
                onClick={() => { if (!isAnimatingRef.current) setCenterIdx(i); }}
                className="flex-shrink-0 border-none bg-transparent p-0 cursor-pointer outline-none text-left transition-all duration-500"
                style={{
                  width: `${CARD_W}px`,
                  transform: isCenter
                    ? "scale(1.08) translateY(-7px)"
                    : isNear ? "scale(0.95)" : "scale(0.87)",
                  opacity: isCenter ? 1 : isNear ? 0.6 : 0.3,
                }}
              >
                {/* Thumbnail */}
                <div
                  className={`relative rounded-2xl overflow-hidden transition-all duration-500 ${
                    isCenter
                      ? "border-2 border-emerald-500 shadow-[0_0_0_3px_rgba(59,186,116,0.2),0_16px_40px_rgba(0,0,0,0.7)]"
                      : "border-2 border-emerald-900/40 shadow-[0_4px_16px_rgba(0,0,0,0.45)]"
                  }`}
                  style={{ height: "118px" }}
                >
                  <img
                    src={venue.images[0]}
                    alt={venue.name}
                    className="w-full h-full object-cover block transition-all duration-500"
                    style={{
                      filter: isCenter
                        ? "brightness(0.75) saturate(1.1)"
                        : "brightness(0.35) saturate(0.6)",
                    }}
                  />

                  {/* Gradient overlay */}
                  <div
                    className="absolute inset-0 transition-all duration-400"
                    style={{
                      background: isCenter
                        ? "linear-gradient(to top, rgba(7,18,13,0.88) 0%, rgba(7,18,13,0.08) 55%, transparent 100%)"
                        : "linear-gradient(to top, rgba(7,18,13,0.7) 0%, transparent 100%)",
                    }}
                  />

                  {/* Pulse dot – active only */}
                  {isCenter && (
                    <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(59,186,116,0.9)] animate-pulse" />
                  )}

                  {/* "Viewing" badge */}
                  {isCenter && (
                    <div className="absolute bottom-2 left-2 bg-emerald-500/15 border border-emerald-500/50 backdrop-blur-sm rounded-full px-2.5 py-0.5">
                      <span className="font-sans text-[0.5rem] tracking-widest uppercase text-emerald-400">Viewing</span>
                    </div>
                  )}
                </div>

                {/* Name + location */}
                <div className="pt-2 px-0.5 text-center">
                  <p
                    className={`font-serif leading-tight mb-0.5 truncate transition-all duration-400 ${
                      isCenter ? "text-emerald-400 text-[0.88rem]" : "text-emerald-800/80 text-[0.78rem]"
                    }`}
                  >
                    {venue.name}
                  </p>
                  <p className={`font-sans text-[0.57rem] tracking-wide truncate transition-colors duration-400 ${
                    isCenter ? "text-emerald-700" : "text-emerald-900/60"
                  }`}>
                    {venue.location}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ─── Main ──────────────────────────────────────────────────── */
export default function LandingLayout() {
  const [selectedVenue, setSelectedVenue] = useState<LandingVenue>(venues[0]);
  const [heroLoaded, setHeroLoaded] = useState(false);
  const [animKey, setAnimKey] = useState(0);

  const handleVenueSelect = useCallback((venue: LandingVenue) => {
    if (venue.id === selectedVenue.id) return;
    setHeroLoaded(false);
    setSelectedVenue(venue);
    setAnimKey(k => k + 1);
  }, [selectedVenue.id]);

  useEffect(() => { setHeroLoaded(false); }, [selectedVenue]);

  const stats = selectedVenue.bookingStats;

  return (
    <div className="min-h-screen bg-[#07120d] text-[#e8f5ee]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Outfit:wght@300;400;500;600;700&display=swap');
        .font-serif  { font-family: 'DM Serif Display', Georgia, serif !important; }
        .font-sans   { font-family: 'Outfit', sans-serif !important; }
        body         { background: #07120d; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(22px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp 0.65s cubic-bezier(0.16,1,0.3,1) forwards; opacity: 0; }

        @keyframes glowPulse {
          0%, 100% { box-shadow: 0 0 6px rgba(59,186,116,0.6); }
          50%       { box-shadow: 0 0 18px rgba(59,186,116,1), 0 0 28px rgba(59,186,116,0.35); }
        }
      `}</style>

      {/* ══ NAV ════════════════════════════════════════════════════ */}
      <nav className="sticky top-0 z-40 backdrop-blur-xl bg-[#07120d]/85 border-b border-emerald-900/40 px-12 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-serif text-emerald-400 text-3xl leading-none">❧</span>
          <span className="font-serif text-xl tracking-wide text-[#e8f5ee]">{tenant.name}</span>
        </div>
        <div className="flex items-center gap-10">
          {["About", "Gallery", "Availability"].map(item => (
            <a key={item} href={`#${item.toLowerCase()}`}
              className="font-sans text-[0.68rem] tracking-[0.18em] uppercase text-emerald-600 hover:text-emerald-400 transition-colors no-underline">
              {item}
            </a>
          ))}
          <button className="font-sans font-semibold text-[0.65rem] tracking-widest uppercase px-5 py-2 rounded-[3px] bg-gradient-to-br from-emerald-500 to-emerald-700 text-[#07120d] border-none cursor-pointer shadow-[0_4px_20px_rgba(59,186,116,0.3)] hover:shadow-[0_8px_30px_rgba(59,186,116,0.5)] hover:-translate-y-0.5 transition-all">
            Enquire
          </button>
        </div>
      </nav>

      {/* ══ HERO ═══════════════════════════════════════════════════ */}
      <section className="relative min-h-[94vh] flex flex-col justify-end overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          <img
            key={selectedVenue.id}
            src={selectedVenue.hero}
            alt={selectedVenue.name}
            className="w-full h-full object-cover transition-opacity duration-[900ms]"
            style={{ opacity: heroLoaded ? 1 : 0 }}
            onLoad={() => setHeroLoaded(true)}
          />
          {!heroLoaded && (
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-950 to-[#0f2a1a]" />
          )}
          {/* Gradients */}
          <div className="absolute inset-0"
            style={{ background: "linear-gradient(170deg, rgba(7,18,13,0.06) 0%, rgba(7,18,13,0.5) 50%, #07120d 100%)" }} />
          <div className="absolute inset-0"
            style={{ background: "linear-gradient(110deg, rgba(7,18,13,0.55) 0%, transparent 55%)" }} />
        </div>

        {/* Decorative watermark */}
        <span className="font-serif absolute top-6 right-12 text-[9rem] leading-none italic text-emerald-500/[0.04] pointer-events-none select-none">❧</span>

        {/* Content */}
        <div className="relative z-10" key={animKey}>
          {/* Venue info block */}
          <div className="px-16 pb-10 max-w-3xl">
            {/* Tag */}
            <div className="fade-up flex items-center gap-3 mb-5 font-sans text-[0.6rem] tracking-[0.26em] uppercase text-emerald-400"
              style={{ animationDelay: "0.05s" }}>
              <span className="w-5 h-px bg-emerald-500" />
              Premium Event Venue
            </div>

            {/* Venue name */}
            <h1
              className="font-serif fade-up text-[#e8f5ee] leading-[0.97] tracking-tight mb-5"
              style={{ fontSize: "clamp(2.8rem, 7.5vw, 6rem)", animationDelay: "0.15s" }}
            >
              {selectedVenue.name}
            </h1>

            {/* Meta row */}
            <div className="fade-up flex flex-wrap gap-5 font-sans text-[0.8rem] text-emerald-300/75 mb-8"
              style={{ animationDelay: "0.25s" }}>
              {[
                { icon: ICONS.location, text: selectedVenue.location },
                { icon: ICONS.guests,   text: `Up to ${selectedVenue.capacity.toLocaleString()} guests` },
                { icon: ICONS.price,    text: `Starting ${fmtPrice(selectedVenue.price)}` },
              ].map((item, i) => (
                <span key={i} className="flex items-center gap-1.5">
                  {i > 0 && <span className="w-px h-3.5 bg-emerald-900 mr-1" />}
                  <Icon d={item.icon} className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  {item.text}
                </span>
              ))}
            </div>

            {/* CTA */}
            <div className="fade-up" style={{ animationDelay: "0.32s" }}>
              <button className="font-sans font-semibold text-[0.72rem] tracking-widest uppercase px-9 py-3.5 rounded-[4px] bg-gradient-to-br from-emerald-500 to-emerald-700 text-[#07120d] border-none cursor-pointer shadow-[0_4px_22px_rgba(59,186,116,0.35)] hover:shadow-[0_8px_32px_rgba(59,186,116,0.5)] hover:-translate-y-0.5 transition-all">
                Book Now
              </button>
            </div>
          </div>

          {/* Carousel strip */}
          {venues.length > 1 && (
            <div
              className="fade-up pt-5 pb-7 border-t border-emerald-900/30 backdrop-blur-sm"
              style={{
                animationDelay: "0.42s",
                background: "linear-gradient(to top, rgba(7,18,13,1) 0%, rgba(7,18,13,0.72) 100%)",
              }}
            >
              <VenueCarousel
                venues={venues}
                selectedId={selectedVenue.id}
                onSelect={handleVenueSelect}
              />
            </div>
          )}
        </div>

        {/* Bottom accent line */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 opacity-50"
          style={{ background: "linear-gradient(90deg, transparent, #3bba74 35%, #5dd68f 65%, transparent)" }} />
      </section>

      {/* ══ ABOUT ══════════════════════════════════════════════════ */}
      <section id="about" className="py-28 px-16 max-w-[1280px] mx-auto" key={`a-${animKey}`}>
        {/* Divider */}
        <div className="h-px mb-20" style={{ background: "linear-gradient(to right, transparent, rgba(59,186,116,0.3), transparent)" }} />

        <div className="grid grid-cols-2 gap-20 items-start">
          {/* Left */}
          <div>
            <div className="flex items-center gap-3 font-sans text-[0.62rem] font-semibold tracking-[0.24em] uppercase text-emerald-400 mb-6">
              <span className="w-4 h-px bg-emerald-500" />
              About this Space
            </div>
            <h2 className="font-serif font-normal leading-tight mb-8 text-[#e8f5ee]"
              style={{ fontSize: "clamp(1.9rem, 3.5vw, 3rem)" }}>
              {selectedVenue.name}
            </h2>
            <p className="font-sans text-[0.9rem] text-emerald-600 leading-[1.9] mb-8">
              {selectedVenue.description}
            </p>
            <p className="font-sans text-[0.68rem] text-emerald-900 italic border-l-2 border-emerald-900 pl-4 leading-relaxed">
              [Venue Description Placeholder] — This section will display the selected venue's full description from the tenant public API.
            </p>
          </div>

          {/* Contact card */}
          <div className="relative rounded-3xl overflow-hidden p-8 border border-emerald-900/50"
            style={{ background: "linear-gradient(145deg, #0b1e13, #07120d)" }}>
            {/* Decorative radial */}
            <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full pointer-events-none"
              style={{ background: "radial-gradient(circle, rgba(59,186,116,0.07) 0%, transparent 70%)" }} />

            <h3 className="font-sans text-[0.6rem] tracking-[0.22em] uppercase text-emerald-400 mb-7">
              Contact &amp; Location
            </h3>

            {[
              { icon: ICONS.phone,    label: "Phone",   val: selectedVenue.phone },
              { icon: ICONS.email,    label: "Email",   val: selectedVenue.email },
              { icon: ICONS.location, label: "Address", val: `${selectedVenue.city}, ${selectedVenue.state} — ${selectedVenue.pincode}` },
            ].map((row, i) => (
              <div key={i} className={`flex items-center gap-4 py-4 ${i < 2 ? "border-b border-emerald-900/30" : ""}`}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-emerald-500/10 border border-emerald-500/20">
                  <Icon d={row.icon} className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <p className="font-sans text-[0.56rem] tracking-widest uppercase text-emerald-900 mb-0.5">{row.label}</p>
                  <p className="font-sans text-[0.84rem] text-emerald-200/80">{row.val}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="h-px mt-20" style={{ background: "linear-gradient(to right, transparent, rgba(59,186,116,0.3), transparent)" }} />
      </section>

      {/* ══ GALLERY ════════════════════════════════════════════════ */}
      <section id="gallery" className="pb-28 px-16 max-w-[1280px] mx-auto" key={`g-${animKey}`}>
        <div className="flex items-center gap-6 mb-10">
          <div className="flex items-center gap-3 font-sans text-[0.62rem] font-semibold tracking-[0.24em] uppercase text-emerald-400">
            <span className="w-4 h-px bg-emerald-500" />
            Gallery
          </div>
          <div className="flex-1 h-px bg-emerald-950" />
          <span className="font-sans text-[0.68rem] text-emerald-900 tracking-wider">
            {selectedVenue.images.length} photos
          </span>
        </div>

        <div className="grid gap-2.5" style={{ gridTemplateColumns: "7fr 5fr", gridTemplateRows: "repeat(3, 170px)", height: "530px" }}>
          {/* Featured */}
          <div className="row-span-3 rounded-2xl overflow-hidden relative group">
            <img src={selectedVenue.images[0]} alt="Featured"
              className="w-full h-full object-cover transition-all duration-700 brightness-[0.85] saturate-[1.1] group-hover:scale-[1.04] group-hover:brightness-100" />
            <div className="absolute top-3.5 left-3.5 bg-[#07120d]/80 backdrop-blur-sm border border-emerald-500/30 rounded-full px-3.5 py-1">
              <span className="font-sans text-[0.56rem] tracking-widest uppercase text-emerald-400">Featured</span>
            </div>
          </div>
          {/* Side images */}
          {selectedVenue.images.slice(1, 4).map((img, i) => (
            <div key={i} className="rounded-xl overflow-hidden group">
              <img src={img} alt={`Photo ${i + 2}`}
                className="w-full h-full object-cover transition-all duration-700 brightness-[0.85] saturate-[1.1] group-hover:scale-[1.06] group-hover:brightness-100" />
            </div>
          ))}
        </div>
      </section>

      {/* ══ BOOKING INSIGHTS ══════════════════════════════════════ */}
      <section id="availability" className="py-28 px-16 bg-[#050d08]" key={`s-${animKey}`}>
        <div className="max-w-[1280px] mx-auto">
          <div className="flex items-center gap-6 mb-14">
            <div className="flex items-center gap-3 font-sans text-[0.62rem] font-semibold tracking-[0.24em] uppercase text-emerald-400">
              <span className="w-4 h-px bg-emerald-500" />
              Public Booking Insights
            </div>
            <div className="flex-1 h-px bg-emerald-950" />
            <span className="font-sans text-[0.65rem] text-emerald-900 tracking-wider">Aggregated · Updated weekly</span>
          </div>

          <div className="grid grid-cols-4 gap-4">
            {[
              { ph: "[Total Bookings]",           label: "Total Bookings",      val: stats.total,                       sub: "events hosted", icon: ICONS.check },
              { ph: "[Upcoming Confirmed Events]", label: "Upcoming Confirmed",  val: stats.upcoming,                    sub: "events booked", icon: ICONS.calendar },
              { ph: "[Most Hosted Event Type]",    label: "Most Hosted Event",   val: stats.popularEvent,                sub: "top category",  icon: ICONS.star },
              { ph: "[Next Available Date]",       label: "Next Available Date", val: fmtDate(stats.nextAvailable),      sub: "first open slot", icon: ICONS.clock },
            ].map((c, i) => (
              <div key={i}
                className="relative overflow-hidden rounded-2xl p-7 border border-emerald-900/50 transition-all duration-300 hover:-translate-y-1.5 hover:border-emerald-600/40 hover:shadow-[0_20px_44px_rgba(59,186,116,0.09)] group"
                style={{ background: "linear-gradient(145deg, #0b1e13, #07120d)" }}
              >
                {/* Top accent line */}
                <div className="absolute top-0 left-0 right-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: "linear-gradient(90deg, transparent, #3bba74, transparent)" }} />

                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-6 bg-emerald-500/10 border border-emerald-500/20">
                  <Icon d={c.icon} className="w-5 h-5 text-emerald-400" />
                </div>
                <p className="font-sans text-[0.54rem] tracking-[0.18em] uppercase text-emerald-900 mb-2">{c.ph}</p>
                <p className="font-serif text-[2.1rem] leading-tight text-[#e8f5ee] mb-1">{c.val}</p>
                <p className="font-sans text-[0.68rem] text-emerald-900 mb-4">{c.sub}</p>
                <div className="h-px" style={{ background: "linear-gradient(90deg, rgba(59,186,116,0.12), transparent)" }} />
                <p className="font-sans text-[0.68rem] text-emerald-600 mt-3">{c.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FOOTER ═════════════════════════════════════════════════ */}
      <footer className="bg-[#07120d] border-t border-emerald-950 py-10 text-center">
        <div className="inline-flex items-center gap-2 bg-[#0b1e13] border border-emerald-800/30 rounded-full px-5 py-2 mb-3">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
          <span className="font-sans text-[0.68rem] text-emerald-600">
            <span className="text-emerald-400 font-semibold">[Placeholder Mode Enabled]</span>
            {" · "}This layout uses mock data. It will be connected to the tenant public API.
          </span>
        </div>
        <p className="font-sans text-[0.6rem] text-emerald-950 mt-1">
          © 2026 {tenant.name} · Multi-Tenant Event Platform · Powered by Verdana SaaS
        </p>
      </footer>
    </div>
  );
}
