import React, { useRef, useEffect, useState } from "react";

const slides = [
    { src: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1600&auto=format&fit=crop", alt: "Sleek electronics setup" },
    { src: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=1600&auto=format&fit=crop", alt: "Minimal jewelry closeup" },
    { src: "https://images.unsplash.com/photo-1517832207067-4db24a2ae47c?q=80&w=1600&auto=format&fit=crop", alt: "Lifestyle product scene" },
    { src: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=1600&auto=format&fit=crop", alt: "Modern workspace" },
];

export default function Hero() {
    const trackRef = useRef(null);
    const [active, setActive] = useState(0);
    const pauseRef = useRef(false);
    const AUTO_INTERVAL = 4000; // ms

    const indexFromScroll = (el) => Math.round(el.scrollLeft / el.clientWidth);

    const goTo = (i) => {
        const el = trackRef.current;
        if (!el) return;
        el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" });
    };

    const prev = () => {
        const el = trackRef.current;
        if (!el) return;
        const idx = indexFromScroll(el);
        const prevIdx = (idx - 1 + slides.length) % slides.length;
        goTo(prevIdx);
    };

    const next = () => {
        const el = trackRef.current;
        if (!el) return;
        const idx = indexFromScroll(el);
        const nextIdx = (idx + 1) % slides.length; // wraps to 0 after last
        goTo(nextIdx);
    };

    // update active dot on scroll
    useEffect(() => {
        const el = trackRef.current;
        if (!el) return;

        const onScroll = () => setActive(indexFromScroll(el));
        el.addEventListener("scroll", onScroll, { passive: true });
        return () => el.removeEventListener("scroll", onScroll);
    }, []);

    // autoplay with wrap-around + pause on hover
    useEffect(() => {
        const el = trackRef.current;
        if (!el) return;

        const id = setInterval(() => {
            if (pauseRef.current) return;
            const idx = indexFromScroll(el);
            const nextIdx = (idx + 1) % slides.length; // wrap
            goTo(nextIdx);
        }, AUTO_INTERVAL);

        return () => clearInterval(id);
    }, []);

    return (
        <section className="w-full bg-gradient-to-b from-white to-slate-50/50">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
                <div className="relative">
                    <div
                        ref={trackRef}
                        onMouseEnter={() => (pauseRef.current = true)}
                        onMouseLeave={() => (pauseRef.current = false)}
                        className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth rounded-xl shadow-lg ring-1 ring-gray-200/60"
                        style={{ scrollbarWidth: "none" }} // Firefox
                    >
                        {slides.map((s, i) => (
                            <div key={i} className="snap-center shrink-0 w-full" style={{ scrollSnapAlign: "center" }}>
                                <div className="relative h-[25vh] sm:h-[35vh] md:h-[40vh] lg:h-[50vh]">
                                    <img
                                        src={s.src}
                                        alt={s.alt}
                                        className="h-full w-full object-cover"
                                        loading={i === 0 ? "eager" : "lazy"}
                                    />
                                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-transparent" />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Controls */}
                    <button
                        type="button"
                        onClick={prev}
                        aria-label="Previous slide"
                        className="absolute left-4 top-1/2 -translate-y-1/2 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/95 backdrop-blur-sm ring-1 ring-gray-200/80 shadow-md hover:bg-white hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 text-gray-700 hover:text-gray-900"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <button
                        type="button"
                        onClick={next}
                        aria-label="Next slide"
                        className="absolute right-4 top-1/2 -translate-y-1/2 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/95 backdrop-blur-sm ring-1 ring-gray-200/80 shadow-md hover:bg-white hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 text-gray-700 hover:text-gray-900"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>

                {/* Dots */}
                <div className="mt-4 flex items-center justify-center gap-2 pb-2">
                    {slides.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => goTo(i)}
                            className={[
                                "h-1.5 w-8 rounded-full transition-colors duration-200",
                                i === active ? "bg-gray-800" : "bg-gray-300/80 hover:bg-gray-400/80",
                            ].join(" ")}
                            aria-label={`Go to slide ${i + 1}`}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}
