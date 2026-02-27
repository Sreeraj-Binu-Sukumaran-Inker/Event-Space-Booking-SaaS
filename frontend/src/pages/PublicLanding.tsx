import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";

const GOLD = "#d4af37";

const facilities = [
  {
    title: "Grand Ballroom",
    description: "An opulent 5,000 sq ft ballroom with crystal chandeliers and hardwood floors, perfect for galas and weddings.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.3} stroke="currentColor" className="w-8 h-8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
      </svg>
    ),
  },
  {
    title: "Private Dining",
    description: "Intimate dining rooms seating up to 40 guests, curated for corporate dinners and exclusive celebrations.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.3} stroke="currentColor" className="w-8 h-8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.871c1.355 0 2.697.056 4.024.166C17.155 8.51 18 9.473 18 10.608v2.513M15 8.25v-1.5m-3 1.5v-1.5m-3 7.5h.008v.008H9v-.008zm3 0h.008v.008H12v-.008zm3 0h.008v.008H15v-.008zm-6 3h.008v.008H9v-.008zm3 0h.008v.008H12v-.008zm3 0h.008v.008H15v-.008zM3 9.75h18" />
      </svg>
    ),
  },
  {
    title: "Rooftop Terrace",
    description: "A breathtaking open-air terrace overlooking the cityscape, ideal for cocktail receptions and sunset ceremonies.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.3} stroke="currentColor" className="w-8 h-8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
      </svg>
    ),
  },
  {
    title: "Conference Suites",
    description: "State-of-the-art A/V equipped conference rooms for seminars, product launches, and board meetings.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.3} stroke="currentColor" className="w-8 h-8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
      </svg>
    ),
  },
  {
    title: "Bridal Suite",
    description: "A luxurious private suite for the bridal party, featuring vanity stations, lounge seating, and champagne service.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.3} stroke="currentColor" className="w-8 h-8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
      </svg>
    ),
  },
  {
    title: "Valet & Concierge",
    description: "White-glove valet parking and a dedicated concierge team ensuring every guest experience is flawless.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.3} stroke="currentColor" className="w-8 h-8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
      </svg>
    ),
  },
];

const galleryImages = [
  "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&q=80",
  "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&q=80",
  "https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=800&q=80",
  "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&q=80",
  "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&q=80",
  "https://images.unsplash.com/photo-1544531585-9847b68c8c86?w=800&q=80",
];

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, visible };
}

export default function PublicLanding() {
  const { slug } = useParams<{ slug?: string }>();
  const [heroReady, setHeroReady] = useState(false);
  const about = useInView();
  const facilities_ = useInView();
  const gallery_ = useInView();
  const contact_ = useInView();

  useEffect(() => {
    if (slug) console.log("Tenant slug:", slug);
    const t = setTimeout(() => setHeroReady(true), 100);
    return () => clearTimeout(t);
  }, [slug]);

  return (
    <div
      style={
        {
          "--font-heading": "'Playfair Display', serif",
          "--font-body": "'Inter', sans-serif",
          "--gold": GOLD,
        } as React.CSSProperties
      }
      className="min-h-screen bg-stone-50"
    >

      {/* ── NAVBAR ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/60 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <span
            className="text-xl tracking-widest uppercase text-white"
            style={{ fontFamily: "var(--font-heading)", color: GOLD }}
          >
            Grandeur Venue
          </span>
          <a
            href="#contact"
            className="text-sm tracking-wider uppercase px-5 py-2 rounded border text-white transition-all duration-300 hover:scale-105"
            style={{ borderColor: GOLD, color: GOLD, fontFamily: "var(--font-body)" }}
          >
            Book Now
          </a>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-[8000ms] ease-out"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1800&q=85')",
            transform: heroReady ? "scale(1.05)" : "scale(1)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80" />

        <div
          className={`relative z-10 text-center px-6 max-w-4xl mx-auto transition-all duration-1000 ease-out ${
            heroReady ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <p
            className="text-xs tracking-[0.4em] uppercase mb-6"
            style={{ color: GOLD, fontFamily: "var(--font-body)" }}
          >
            Est. 1998 · Premier Event Venue
          </p>
          <h1
            className="text-5xl md:text-7xl lg:text-8xl text-white mb-6 leading-tight"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Where Moments
            <br />
            <em style={{ color: GOLD }}>Become Legends</em>
          </h1>
          <p
            className="text-lg md:text-xl text-white/75 mb-10 max-w-2xl mx-auto leading-relaxed"
            style={{ fontFamily: "var(--font-body)" }}
          >
            An unrivalled setting for weddings, galas, corporate gatherings,
            and celebrations crafted to perfection.
          </p>
          <a
            href="#contact"
            className="inline-block px-10 py-4 text-sm tracking-[0.2em] uppercase font-semibold rounded transition-all duration-300 hover:scale-105 hover:shadow-2xl"
            style={{
              background: GOLD,
              color: "#1a1a1a",
              fontFamily: "var(--font-body)",
              boxShadow: `0 0 0 0 ${GOLD}40`,
            }}
          >
            Book Your Event
          </a>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
          <span className="text-xs tracking-widest uppercase text-white/40" style={{ fontFamily: "var(--font-body)" }}>Scroll</span>
          <div className="w-px h-10 bg-gradient-to-b from-white/40 to-transparent" />
        </div>
      </section>

      {/* ── ABOUT ── */}
      <section id="about" className="py-24 md:py-32 bg-stone-50">
        <div className="max-w-7xl mx-auto px-6">
          <div
            ref={about.ref}
            className={`grid grid-cols-1 md:grid-cols-2 gap-16 items-center transition-all duration-1000 ease-out ${
              about.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
            }`}
          >
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=900&q=80"
                alt="Venue interior"
                className="rounded-2xl shadow-2xl object-cover w-full h-[480px]"
              />
              <div
                className="absolute -bottom-6 -right-6 w-40 h-40 rounded-xl shadow-xl hidden md:block"
                style={{ background: GOLD, opacity: 0.12 }}
              />
              <div
                className="absolute -top-6 -left-6 w-24 h-24 rounded-xl shadow-xl hidden md:block"
                style={{ background: GOLD, opacity: 0.18 }}
              />
            </div>

            <div>
              <p
                className="text-xs tracking-[0.35em] uppercase mb-4"
                style={{ color: GOLD, fontFamily: "var(--font-body)" }}
              >
                Our Story
              </p>
              <h2
                className="text-4xl md:text-5xl text-stone-900 mb-6 leading-tight"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                A Legacy of
                <br />
                <em>Refined Elegance</em>
              </h2>
              <div
                className="w-12 h-0.5 mb-8"
                style={{ background: GOLD }}
              />
              <p
                className="text-stone-600 text-base leading-8 mb-6"
                style={{ fontFamily: "var(--font-body)" }}
              >
                Nestled in the heart of the city, Grandeur Venue has been the backdrop for
                the most cherished moments in our guests' lives for over two decades. Our
                commitment to flawless service and breathtaking aesthetics is unwavering.
              </p>
              <p
                className="text-stone-600 text-base leading-8"
                style={{ fontFamily: "var(--font-body)" }}
              >
                From intimate soirées to grand-scale productions, our dedicated team
                orchestrates every detail so you can be fully present in the moment.
              </p>
              <div className="mt-10 flex gap-10">
                {[["500+", "Events Hosted"], ["25+", "Years Excellence"], ["98%", "Client Satisfaction"]].map(([num, label]) => (
                  <div key={label}>
                    <p className="text-3xl font-bold text-stone-900" style={{ fontFamily: "var(--font-heading)", color: GOLD }}>{num}</p>
                    <p className="text-xs tracking-wider uppercase text-stone-500 mt-1" style={{ fontFamily: "var(--font-body)" }}>{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FACILITIES ── */}
      <section id="facilities" className="py-24 md:py-32 bg-stone-100">
        <div className="max-w-7xl mx-auto px-6">
          <div
            ref={facilities_.ref}
            className={`transition-all duration-1000 ease-out ${
              facilities_.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
            }`}
          >
            <div className="text-center mb-16">
              <p className="text-xs tracking-[0.35em] uppercase mb-4" style={{ color: GOLD, fontFamily: "var(--font-body)" }}>
                What We Offer
              </p>
              <h2 className="text-4xl md:text-5xl text-stone-900" style={{ fontFamily: "var(--font-heading)" }}>
                World-Class <em>Facilities</em>
              </h2>
              <div className="w-12 h-0.5 mx-auto mt-6" style={{ background: GOLD }} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {facilities.map((f) => (
                <div
                  key={f.title}
                  className="group bg-white rounded-2xl p-8 shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-default"
                >
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center mb-6 transition-all duration-300 group-hover:scale-110"
                    style={{ background: `${GOLD}18`, color: GOLD }}
                  >
                    {f.icon}
                  </div>
                  <h3
                    className="text-xl text-stone-900 mb-3"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    {f.title}
                  </h3>
                  <p
                    className="text-stone-500 text-sm leading-7"
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    {f.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── GALLERY ── */}
      <section id="gallery" className="py-24 md:py-32 bg-stone-900">
        <div className="max-w-7xl mx-auto px-6">
          <div
            ref={gallery_.ref}
            className={`transition-all duration-1000 ease-out ${
              gallery_.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
            }`}
          >
            <div className="text-center mb-16">
              <p className="text-xs tracking-[0.35em] uppercase mb-4" style={{ color: GOLD, fontFamily: "var(--font-body)" }}>
                Captured Moments
              </p>
              <h2 className="text-4xl md:text-5xl text-white" style={{ fontFamily: "var(--font-heading)" }}>
                Our <em style={{ color: GOLD }}>Gallery</em>
              </h2>
              <div className="w-12 h-0.5 mx-auto mt-6" style={{ background: GOLD }} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {galleryImages.map((src, i) => (
                <div key={i} className="overflow-hidden rounded-2xl aspect-[4/3] group">
                  <img
                    src={src}
                    alt={`Gallery image ${i + 1}`}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CONTACT ── */}
      <section id="contact" className="py-24 md:py-32 bg-stone-900">
        <div className="max-w-7xl mx-auto px-6">
          <div
            ref={contact_.ref}
            className={`transition-all duration-1000 ease-out ${
              contact_.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
            }`}
          >
            <div className="text-center mb-16">
              <p className="text-xs tracking-[0.35em] uppercase mb-4" style={{ color: GOLD, fontFamily: "var(--font-body)" }}>
                Get In Touch
              </p>
              <h2 className="text-4xl md:text-5xl text-white" style={{ fontFamily: "var(--font-heading)" }}>
                Reserve Your <em style={{ color: GOLD }}>Date</em>
              </h2>
              <div className="w-12 h-0.5 mx-auto mt-6" style={{ background: GOLD }} />
            </div>

            <div className="max-w-3xl mx-auto">
              <div className="bg-stone-800 rounded-2xl p-8 md:p-12 shadow-2xl border border-white/5">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
                  {[
                    {
                      label: "Address",
                      value: "12 Royal Crescent, Mayfair, London W1K 4EF",
                      icon: (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                        </svg>
                      ),
                    },
                    {
                      label: "Phone",
                      value: "+44 20 7946 0958",
                      icon: (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                        </svg>
                      ),
                    },
                    {
                      label: "Email",
                      value: "events@grandeurvenue.com",
                      icon: (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                        </svg>
                      ),
                    },
                  ].map(({ label, value, icon }) => (
                    <div key={label} className="flex flex-col items-center text-center gap-3">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: `${GOLD}20`, color: GOLD }}>
                        {icon}
                      </div>
                      <p className="text-xs tracking-widest uppercase" style={{ color: GOLD, fontFamily: "var(--font-body)" }}>{label}</p>
                      <p className="text-stone-300 text-sm leading-6" style={{ fontFamily: "var(--font-body)" }}>{value}</p>
                    </div>
                  ))}
                </div>

                <div className="rounded-xl overflow-hidden h-56 bg-stone-700 flex items-center justify-center border border-white/10">
                  <div className="text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-12 h-12 mx-auto mb-3" style={{ color: GOLD, opacity: 0.5 }}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
                    </svg>
                    <p className="text-stone-500 text-sm" style={{ fontFamily: "var(--font-body)" }}>Interactive map coming soon</p>
                  </div>
                </div>

                <div className="mt-8 text-center">
                  <a
                    href="mailto:events@grandeurvenue.com"
                    className="inline-block px-12 py-4 text-sm tracking-[0.2em] uppercase font-semibold rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                    style={{ background: GOLD, color: "#1a1a1a", fontFamily: "var(--font-body)" }}
                  >
                    Send an Enquiry
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-black py-10 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-lg tracking-widest uppercase" style={{ fontFamily: "var(--font-heading)", color: GOLD }}>
            Grandeur Venue
          </span>
          <p className="text-stone-600 text-xs tracking-wider" style={{ fontFamily: "var(--font-body)" }}>
            © {new Date().getFullYear()} Grandeur Venue. All rights reserved. Powered by EventSpace SaaS.
          </p>
          <div className="flex gap-6">
            {["Privacy", "Terms", "Contact"].map((link) => (
              <a
                key={link}
                href="#"
                className="text-stone-600 hover:text-stone-400 text-xs tracking-wider uppercase transition-colors duration-200"
                style={{ fontFamily: "var(--font-body)" }}
              >
                {link}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
