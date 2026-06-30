"use client";

import { Building2, Landmark, CheckCircle2 } from "lucide-react";

export default function HeroSection() {
  return (
    <section 
      className="relative overflow-hidden bg-slate-100 border-b border-[#d8e2ef]"
      style={{
        backgroundImage: "url('/setu_hero.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        minHeight: "520px",
        display: "flex",
        alignItems: "center"
      }}
    >
      {/* Radial overlay to make center text readable while preserving left/right image saturation */}
      <div 
        className="absolute inset-0"
        style={{
          background: "radial-gradient(circle at center, rgba(255,255,255,0.82) 0%, rgba(255,255,255,0.5) 50%, rgba(255,255,255,0) 100%)"
        }}
      />

      <div className="relative mx-auto max-w-[1380px] w-full px-4 py-16 sm:px-6 md:px-8 flex flex-col items-center text-center">
        
        {/* Subtle Accent Top Ribbon */}
        <div className="w-24 h-1.5 bg-gradient-to-r from-[#FF9933] via-[#12325a] to-[#138808] rounded-full mb-6" />

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#12325a] tracking-tight leading-tight max-w-3xl">
          One Platform. Many Partners. Greater Impact.
        </h1>
        
        <p className="mt-4 text-sm sm:text-base md:text-lg text-slate-700 font-semibold max-w-2xl leading-relaxed">
          MahaCSR Setu is the official convergence platform connecting Government, Corporates and Implementing Agencies to drive sustainable and inclusive development across Maharashtra.
        </p>

        {/* Stats Row */}
        <div className="mt-12 flex flex-wrap justify-center gap-8 md:gap-12 w-full max-w-4xl">
          {/* Corporates KPI */}
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-white text-blue-600 border border-blue-200/80 shadow-sm shrink-0">
              <Building2 size={20} />
            </div>
            <div className="text-left">
              <div className="text-xl font-black text-[#12325a] leading-none">2,145+</div>
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-1">Registered Corporates</div>
            </div>
          </div>

          {/* Agencies KPI */}
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-white text-emerald-600 border border-emerald-200/80 shadow-sm shrink-0">
              <Landmark size={20} />
            </div>
            <div className="text-left">
              <div className="text-xl font-black text-[#12325a] leading-none">1,734+</div>
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-1">Implementing Agencies</div>
            </div>
          </div>

          {/* Projects KPI */}
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-white text-[#d97706] border border-amber-200/80 shadow-sm shrink-0">
              <CheckCircle2 size={20} />
            </div>
            <div className="text-left">
              <div className="text-xl font-black text-[#12325a] leading-none">4,812+</div>
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-1">Projects Onboarded</div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
