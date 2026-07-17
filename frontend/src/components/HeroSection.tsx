"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Building2, Landmark, CheckCircle2, ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { API_BASE_URL } from "@/lib/api";

/* ─── Default slides (overridden by API fetch) ─── */
const DEFAULT_SLIDES = [
  {
    id: "1",
    image: "/hero_slide_1.png",
    title: "One Platform. Many Partners.",
    highlight: "Greater Impact.",
    subtitle:
      "MahaCSR Setu is the official convergence platform connecting Government, Corporates and Implementing Agencies to drive sustainable development across Maharashtra.",
  },
  {
    id: "2",
    image: "/hero_slide_2.png",
    title: "Transforming Maharashtra",
    highlight: "Through Convergence.",
    subtitle:
      "CSR investments aligned with district development priorities, driving sustainable infrastructure, education and healthcare across every taluka.",
  },
  {
    id: "3",
    image: "/hero_slide_3.png",
    title: "State-Led. District-Executed.",
    highlight: "Corporate Powered.",
    subtitle:
      "A single State CSR Coordinating Unit routes every corporate to one accountable District Nodal Officer for transparent, time-bound project delivery.",
  },
];

/* ─── Mouse Trail Canvas ─── */
function MouseTrailCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<{ x: number; y: number; vx: number; vy: number; life: number; size: number; hue: number }[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const animFrameRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
      // Spawn particles
      for (let i = 0; i < 3; i++) {
        particlesRef.current.push({
          x: mouseRef.current.x,
          y: mouseRef.current.y,
          vx: (Math.random() - 0.5) * 2,
          vy: (Math.random() - 0.5) * 2,
          life: 1,
          size: Math.random() * 3 + 1,
          hue: 200 + Math.random() * 40,
        });
      }
    };

    canvas.addEventListener("mousemove", handleMouseMove);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particlesRef.current = particlesRef.current.filter((p) => p.life > 0.01);

      for (const p of particlesRef.current) {
        p.x += p.vx;
        p.y += p.vy;
        p.life *= 0.96;
        p.size *= 0.98;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 80%, 70%, ${p.life * 0.6})`;
        ctx.fill();

        // Glow effect
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 80%, 70%, ${p.life * 0.15})`;
        ctx.fill();
      }

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-20 pointer-events-auto"
      style={{ mixBlendMode: "screen" }}
    />
  );
}

/* ─── 3D Slide Transitions ─── */
const slideVariants = {
  enter: (direction: number) => ({
    rotateY: direction > 0 ? 25 : -25,
    x: direction > 0 ? "100%" : "-100%",
    opacity: 0,
    scale: 0.85,
    z: -200,
  }),
  center: {
    rotateY: 0,
    x: 0,
    opacity: 1,
    scale: 1,
    z: 0,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
  },
  exit: (direction: number) => ({
    rotateY: direction > 0 ? -25 : 25,
    x: direction > 0 ? "-100%" : "100%",
    opacity: 0,
    scale: 0.85,
    z: -200,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  }),
};

const textReveal = {
  hidden: { opacity: 0, y: 40, filter: "blur(8px)" },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.7, delay: 0.2 + i * 0.15, ease: [0.16, 1, 0.3, 1] },
  }),
};

const statsContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { delayChildren: 0.6, staggerChildren: 0.1 },
  },
};

const statItem = {
  hidden: { opacity: 0, scale: 0.8, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring", stiffness: 80, damping: 12 },
  },
};

/* ─── Main Hero Section ─── */
export default function HeroSection() {
  const [slides, setSlides] = useState(DEFAULT_SLIDES);
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const heroRef = useRef<HTMLElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch slides from API
  useEffect(() => {
    fetch(`${API_BASE_URL}/platform/hero-slides`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setSlides(data);
      })
      .catch(() => {
        /* Use defaults */
      });
  }, []);

  // Auto-rotate carousel
  const startTimer = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setDirection(1);
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 6000);
  }, [slides.length]);

  useEffect(() => {
    startTimer();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [startTimer]);

  const goTo = (index: number) => {
    setDirection(index > current ? 1 : -1);
    setCurrent(index);
    startTimer();
  };

  const prev = () => {
    setDirection(-1);
    setCurrent((c) => (c - 1 + slides.length) % slides.length);
    startTimer();
  };

  const next = () => {
    setDirection(1);
    setCurrent((c) => (c + 1) % slides.length);
    startTimer();
  };

  // Mouse parallax
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    setMousePos({ x, y });
  };

  const slide = slides[current];

  return (
    <section
      ref={heroRef}
      onMouseMove={handleMouseMove}
      className="relative overflow-hidden bg-slate-950"
      style={{ perspective: "1200px" }}
    >
      {/* Mouse trail canvas */}
      <MouseTrailCanvas />

      {/* Animated background image with 3D parallax */}
      <AnimatePresence initial={false} custom={direction} mode="popLayout">
        <motion.div
          key={slide.id}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          className="absolute inset-0"
          style={{
            transformStyle: "preserve-3d",
            backfaceVisibility: "hidden",
          }}
        >
          <motion.div
            className="absolute inset-0 bg-cover bg-center scale-105"
            style={{
              backgroundImage: `url('${slide.image}')`,
            }}
          />
        </motion.div>
      </AnimatePresence>

      {/* Gradient overlays */}
      <div className="absolute inset-0 z-10 bg-gradient-to-r from-slate-950/85 via-slate-900/60 to-slate-950/75" />
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-slate-950/90 via-transparent to-slate-950/40" />

      {/* Floating orbs */}
      <div
        className="absolute z-10 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl hidden sm:block"
        style={{
          top: "10%",
          left: "5%",
          transform: `translate(${mousePos.x * 25}px, ${mousePos.y * 15}px)`,
          transition: "transform 0.4s ease-out",
        }}
      />
      <div
        className="absolute z-10 w-64 h-64 rounded-full bg-amber-500/8 blur-3xl hidden sm:block"
        style={{
          bottom: "15%",
          right: "10%",
          transform: `translate(${mousePos.x * -20}px, ${mousePos.y * -12}px)`,
          transition: "transform 0.4s ease-out",
        }}
      />

      {/* Content */}
      <div className="relative z-30 mx-auto max-w-[1370px] w-full px-4 pt-8 pb-10 sm:pt-12 sm:pb-16 sm:px-6 md:px-8 flex flex-col justify-center items-center min-h-[520px] sm:min-h-[580px] md:min-h-[660px]">
        
        {/* Centered Title & Subtitle */}
        <div className="flex flex-col items-center text-center pointer-events-none max-w-4xl px-2 sm:px-0">
          {/* Accent bar */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="w-14 sm:w-20 h-1 bg-gradient-to-r from-amber-400 to-blue-500 mb-4 sm:mb-6 rounded-full"
          />

          {/* Title with 3D text reveal */}
          <AnimatePresence mode="wait">
            <motion.div key={slide.id} className="flex flex-col items-center">
              <motion.h1
                custom={0}
                variants={textReveal}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, y: -20, transition: { duration: 0.3 } }}
                className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight tracking-tight"
                style={{
                  transform: `perspective(600px) rotateX(${mousePos.y * -2}deg) rotateY(${mousePos.x * 2}deg)`,
                  transition: "transform 0.3s ease-out",
                  textShadow: "0 4px 30px rgba(0,0,0,0.4)",
                }}
              >
                {slide.title}
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-blue-400">
                  {slide.highlight}
                </span>
              </motion.h1>

              <motion.p
                custom={1}
                variants={textReveal}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, transition: { duration: 0.2 } }}
                className="mt-3 sm:mt-5 text-xs sm:text-sm md:text-base text-white/60 font-normal leading-relaxed max-w-2xl px-2 sm:px-0"
              >
                {slide.subtitle}
              </motion.p>
            </motion.div>
          </AnimatePresence>

          {/* Carousel navigation dots */}
          <div className="mt-5 sm:mt-7 flex items-center gap-2.5 sm:gap-3 pointer-events-auto">
            {slides.map((s, i) => (
              <button
                key={s.id}
                onClick={() => goTo(i)}
                className={`relative h-2 rounded-full transition-all duration-500 ${
                  i === current ? "w-10 bg-gradient-to-r from-amber-400 to-blue-500" : "w-2 bg-white/30 hover:bg-white/50"
                }`}
                aria-label={`Go to slide ${i + 1}`}
              >
                {i === current && (
                  <motion.div
                    layoutId="activeDot"
                    className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-400 to-blue-500 shadow-lg shadow-amber-500/20"
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Bottom Center: Two Action Cards */}
        <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-stretch gap-3 sm:gap-4 pointer-events-auto w-full max-w-2xl px-1 sm:px-0">
          {/* Card 1: Partner with Maharashtra */}
          <Link href="/partner-with-maharashtra" className="flex-1 hover:no-underline group">
            <div className="h-full bg-white/8 backdrop-blur-xl border border-white/15 rounded-xl sm:rounded-2xl p-3 sm:p-4 flex items-center gap-3 transition-all hover:bg-white/15 hover:border-blue-400/30 hover:shadow-lg hover:shadow-blue-500/5">
              <div className="h-9 w-9 sm:h-10 sm:w-10 shrink-0 rounded-lg sm:rounded-xl bg-blue-500/20 border border-blue-400/25 flex items-center justify-center text-blue-300 group-hover:bg-blue-500/30 transition-colors">
                <Building2 size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[9px] font-bold uppercase tracking-widest text-blue-300/80">Corporate Partners</span>
                <h4 className="text-xs sm:text-sm font-bold text-white leading-tight">Partner with Maharashtra</h4>
              </div>
              <ArrowRight size={16} className="text-white/40 group-hover:text-blue-300 group-hover:translate-x-1 transition-all shrink-0" />
            </div>
          </Link>

          {/* Card 2: Pitch a Development Need */}
          <Link href="/pitch-development-need" className="flex-1 hover:no-underline group">
            <div className="h-full bg-white/8 backdrop-blur-xl border border-white/15 rounded-xl sm:rounded-2xl p-3 sm:p-4 flex items-center gap-3 transition-all hover:bg-white/15 hover:border-amber-400/30 hover:shadow-lg hover:shadow-amber-500/5">
              <div className="h-9 w-9 sm:h-10 sm:w-10 shrink-0 rounded-lg sm:rounded-xl bg-amber-500/20 border border-amber-400/25 flex items-center justify-center text-amber-300 group-hover:bg-amber-500/30 transition-colors">
                <Landmark size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[9px] font-bold uppercase tracking-widest text-amber-300/80">Government Depts</span>
                <h4 className="text-xs sm:text-sm font-bold text-white leading-tight">Pitch a Development Need</h4>
              </div>
              <ArrowRight size={16} className="text-white/40 group-hover:text-amber-300 group-hover:translate-x-1 transition-all shrink-0" />
            </div>
          </Link>
        </div>
      </div>

      {/* Stats Strip — Below the Carousel */}
      <div className="relative z-30 mx-auto max-w-[1380px] w-full px-4 sm:px-6 md:px-8 -mt-5 sm:-mt-7 mb-6 sm:mb-10 ">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={statsContainer}
          className=" rounded-2xl border border-slate-200/60 shadow-lg shadow-slate-200/40 overflow-hidden"
        >
          <div className="grid grid-cols-3 divide-x divide-slate-100">
            <motion.div variants={statItem} className="flex items-center justify-center gap-2.5 sm:gap-4 py-4 sm:py-5 px-3 sm:px-6">
              <div className="hidden sm:grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-blue-600 shrink-0">
                <Building2 size={18} />
              </div>
              <div className="text-center sm:text-left ">
                <div className="text-lg sm:text-2xl md:text-3xl font-extrabold text-white leading-none tracking-tight">2,145<span className="text-blue-500">+</span></div>
                <div className="text-[7px] sm:text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5 sm:mt-1">Corporates</div>
              </div>
            </motion.div>

            <motion.div variants={statItem} className="flex items-center justify-center gap-2.5 sm:gap-4 py-4 sm:py-5 px-3 sm:px-6">
              <div className="hidden sm:grid h-10 w-10 place-items-center rounded-xl bg-amber-50 text-amber-600 shrink-0">
                <Landmark size={18} />
              </div>
              <div className="text-center sm:text-left">
                <div className="text-lg sm:text-2xl md:text-3xl font-extrabold text-white leading-none tracking-tight">1,734<span className="text-amber-500">+</span></div>
                <div className="text-[7px] sm:text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5 sm:mt-1">Agencies</div>
              </div>
            </motion.div>

            <motion.div variants={statItem} className="flex items-center justify-center gap-2.5 sm:gap-4 py-4 sm:py-5 px-3 sm:px-6">
              <div className="hidden sm:grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-600 shrink-0">
                <CheckCircle2 size={18} />
              </div>
              <div className="text-center sm:text-left">
                <div className="text-lg sm:text-2xl md:text-3xl font-extrabold text-white leading-none tracking-tight">4,812<span className="text-emerald-500">+</span></div>
                <div className="text-[7px] sm:text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5 sm:mt-1">Projects</div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Left/Right arrows */}
      <button
        onClick={prev}
        className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-30 grid h-8 w-8 sm:h-10 sm:w-10 place-items-center rounded-full bg-white/5 backdrop-blur-xl border border-white/10 text-white/60 hover:bg-white/15 hover:text-white transition-all hover:scale-110"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
      </button>
      <button
        onClick={next}
        className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-30 grid h-8 w-8 sm:h-10 sm:w-10 place-items-center rounded-full bg-white/5 backdrop-blur-xl border border-white/10 text-white/60 hover:bg-white/15 hover:text-white transition-all hover:scale-110"
        aria-label="Next slide"
      >
        <ChevronRight className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
      </button>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 z-30 h-[3px] bg-white/5">
        <motion.div
          key={current}
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 6, ease: "linear" }}
          className="h-full bg-gradient-to-r from-amber-400 to-blue-500"
        />
      </div>
    </section>
  );
}
