"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Building2, CheckCircle2, Landmark, MapPin, Wallet } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";

interface PortalStats {
  totalProjects: number;
  completedProjects: number;
  activePitches: number;
  totalCsrCommitted: number | string;
  districtsCovered: number;
}

const fmtNum = (n: number | undefined | null) => (n === undefined || n === null || isNaN(Number(n)) ? 0 : Number(n));

const fmtCrore = (v: number | string | undefined | null) => {
  if (v === undefined || v === null) return "0 Cr";
  const num = typeof v === "string" ? parseFloat(v) : v;
  if (!isFinite(num)) return "0 Cr";
  if (num >= 10000000) return `${(num / 10000000).toFixed(2)} Cr`;
  if (num >= 100000) return `${(num / 100000).toFixed(2)} L`;
  return num.toLocaleString("en-IN");
};

const cardContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const cardSlideFromRight = {
  hidden: { opacity: 0, x: 60, scale: 0.95 },
  show: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 120, damping: 16 },
  },
};

export default function HomeStatsStrip() {
  const [stats, setStats] = useState<PortalStats | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const response = await apiFetch<any>("/public/portal-stats");
        const data = response.data ?? response;
        if (active) setStats(data);
      } catch {
        if (active) setStats(null);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const cards = [
    {
      icon: Building2,
      formattedVal: stats?.totalProjects !== undefined ? String(fmtNum(stats.totalProjects)) : "0",
      label: "Projects Onboarded",
      iconBg: "bg-blue-50 text-blue-600 border-blue-200/80 shadow-blue-500/10",
      glow: "bg-blue-400/20",
    },
    {
      icon: CheckCircle2,
      formattedVal: stats?.completedProjects !== undefined ? String(fmtNum(stats.completedProjects)) : "0",
      label: "Completed Projects",
      iconBg: "bg-amber-50 text-amber-600 border-amber-200/80 shadow-amber-500/10",
      glow: "bg-amber-400/20",
    },
    {
      icon: Landmark,
      formattedVal: stats?.activePitches !== undefined ? String(fmtNum(stats.activePitches)) : "0",
      label: "Active Development Needs",
      iconBg: "bg-purple-50 text-purple-600 border-purple-200/80 shadow-purple-500/10",
      glow: "bg-purple-400/20",
    },
    {
      icon: Wallet,
      formattedVal: stats?.totalCsrCommitted !== undefined ? fmtCrore(stats.totalCsrCommitted) : "0 Cr",
      label: "CSR Committed (Rs.)",
      iconBg: "bg-emerald-50 text-emerald-600 border-emerald-200/80 shadow-emerald-500/10",
      glow: "bg-emerald-400/20",
    },
    {
      icon: MapPin,
      formattedVal: stats?.districtsCovered !== undefined ? String(fmtNum(stats.districtsCovered)) : "0",
      label: "Districts Covered",
      iconBg: "bg-indigo-50 text-indigo-600 border-indigo-200/80 shadow-indigo-500/10",
      glow: "bg-indigo-400/20",
    },
  ];

  return (
    <div className="relative z-20 mx-auto max-w-[1380px] px-4 sm:px-6 md:px-8 py-6 sm:py-10">
      <motion.div
        variants={cardContainer}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-30px" }}
        className="grid gap-5 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5"
      >
        {cards.map((c) => (
          <motion.div
            variants={cardSlideFromRight}
            key={c.label}
            className="liquid-glass-card-light p-5 sm:p-6 relative group rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
          >
            {/* Ambient subtle glow blob */}
            <div className={`absolute -right-6 -bottom-6 w-20 h-20 rounded-full blur-xl transition-all duration-300 group-hover:scale-150 ${c.glow}`} />

            <div className="relative z-10 flex flex-col items-start gap-4">
              <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl border ${c.iconBg} shadow-sm backdrop-blur-md transition-transform duration-300 group-hover:scale-110`}>
                <c.icon size={20} />
              </div>

              <div className="min-w-0 w-full">
                <div className="text-2xl sm:text-3xl font-black text-slate-900 leading-none mb-2 tracking-tight">
                  <AnimatedCounter value={c.formattedVal} duration={1.8} />
                </div>
                <div className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider leading-snug">
                  {c.label}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
