"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  FileCheck2,
  Headphones,
  Landmark,
  Users,
  Sparkles,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import HeroSection from "@/components/HeroSection";
import { GisMap } from "@/components/LazyComponents";
import HomeStatsStrip from "@/components/HomeStatsStrip";
import SaaSLayout from "@/components/SaaSLayout";

const workflow = [
  {
    title: "State-Level Entry & Dialogue",
    detail: "Corporates approach the State CSR Coordinating Unit. An initial dialogue captures sector preference, budget, and geography.",
    icon: Headphones,
    glow: "bg-blue-500/10 text-blue-600 border-blue-200/60",
  },
  {
    title: "Domain-Specific Delegation",
    detail: "The State Unit nominates the relevant district Head of Department as the single point of contact, retaining oversight.",
    icon: Users,
    glow: "bg-purple-500/10 text-purple-600 border-purple-200/60",
  },
  {
    title: "Ground Finalisation & MoU",
    detail: "The District Nodal Officer and corporate align needs to a project blueprint and execute the standard MoU.",
    icon: FileCheck2,
    glow: "bg-amber-500/10 text-amber-600 border-amber-200/60",
  },
  {
    title: "Onboarding & Tracking",
    detail: "The project is onboarded to the portal, tracking physical/financial progress, UCs, and administrative bottlenecks.",
    icon: CheckCircle2,
    glow: "bg-emerald-500/10 text-emerald-600 border-emerald-200/60",
  },
];

const recommendations = [
  "Align CSR investments with district development priorities to prevent duplication and fragmented, one-time interventions.",
  "Single-point accountability through one domain nodal officer per project, with Collector and ZP CEO kept informed.",
  "Two-way Pitch & Exchange: corporates pitch initiatives needing facilitation; departments pitch needs seeking CSR support.",
  "Time-bound escalation (5-3-2 rule) ensures accelerated decision-making and reliable project facilitation.",
];

const notices = [
  ["CSR convergence framework guidelines issued by the State CSR Coordinating Unit", "Policy Notice", "Official", "15 May 2025"],
  ["Standard MoU template and 13-point feasibility checklist for convergence projects", "Reference", "Workflow", "10 May 2025"],
  ["Guidelines for government pitches to ensure convergence, avoid duplication, and ensure sustainability", "Guidelines", "Workflow", "08 May 2025"],
];

const pillars = [
  {
    title: "Single-Point Coordination",
    detail: "One domain nodal officer per project assumes total accountability, with the State Unit ensuring compliance and rapid resolution.",
    icon: Users,
  },
  {
    title: "Convergence with Government",
    detail: "CSR aligned with district development plans and schemes, preventing duplication and enabling greater, sustainable impact.",
    icon: ClipboardCheck,
  },
  {
    title: "Transparent Monitoring",
    detail: "Real-time physical and financial progress, geo-tagged evidence, utilization certificates, and a full audit trail.",
    icon: BarChart3,
  },
];

const resources = [
  { title: "Framework & Policy Information", description: "The State's CSR convergence framework explained simply; benefits to corporates. Marathi & English.", href: "/framework-policy" },
  { title: "Document Library", description: "CSR Rules 2014 & MCA amendments; Schedule VII; State GRs; progress formats; checklists.", href: "/document-library" },
  { title: "Workflow Explainer", description: "Simple visual guide showing exactly how the partnership works, step by step, with timelines.", href: "/workflow" },
  { title: "Success Stories & Case Studies", description: "Completed projects with photos, investment, beneficiaries, corporate name. Builds confidence through proof.", href: "/success-stories" },
  { title: "CSR Summits & Events", description: "Past summit reports and videos; upcoming events; registration links.", href: "/csr-events" },
  { title: "Directory", description: "Contact details of the State CSR Cell, the CSR Relationship Managers, and all District Nodal Officers.", href: "/directory" },
  { title: "Completed Projects Gallery", description: "Permanent, searchable public record of all portal projects — by district, sector, corporate, year.", href: "/completed-projects" },
  { title: "Public Development Needs (Live)", description: "Government pitches approved and made public — open for any corporate to fund.", href: "/public-development-needs" },
  { title: "FAQs, News & Recognition", description: "Common questions; portal updates; CSR awards and recognition of corporate partners.", href: "/faq-news-recognition" },
];

/* ── Motion Variants ── */
const sectionSlideFromRight = {
  hidden: { opacity: 0, x: 80 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  },
};

const textRevealSequence = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: 0.2 },
  },
};

const staggerSlideCards = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.25 },
  },
};

const cardSlideFromRight = {
  hidden: { opacity: 0, x: 60, scale: 0.96 },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 120, damping: 16 },
  },
};

function Parallax3DSection({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [40, -40]);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <motion.div
      ref={ref}
      style={isMobile ? {} : { y }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function LandingPageClient() {
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const dot = cursorRef.current;
    if (!dot) return;
    const handleMouseMove = (e: MouseEvent) => {
      dot.style.transform = `translate(${e.clientX - 6}px, ${e.clientY - 6}px)`;
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <SaaSLayout>
      <div className="relative min-h-screen overflow-x-hidden bg-[#fafcff] text-slate-900 font-sans antialiased selection:bg-blue-900 selection:text-white">
        
        {/* Subtle Ambient Glow Backgrounds */}
        <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
          <div className="absolute -top-40 left-1/2 h-[600px] w-[1000px] -translate-x-1/2 rounded-full bg-gradient-to-tr from-blue-400/10 via-amber-300/10 to-indigo-500/10 blur-3xl opacity-70" />
          <div className="absolute top-[35%] -right-40 h-[500px] w-[500px] rounded-full bg-blue-300/10 blur-3xl" />
          <div className="absolute top-[65%] -left-40 h-[600px] w-[600px] rounded-full bg-amber-200/15 blur-3xl" />
        </div>

        {/* ── HERO SECTION ── */}
        <HeroSection />

        {/* ── KEY PERFORMANCE METRICS STRIP ── */}
        <HomeStatsStrip />

        {/* ── 3D PARALLAX CONTENT WRAPPER ── */}
        <Parallax3DSection className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-24 py-16">

          {/* ── PILLARS SECTION ── */}
          <motion.section
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={sectionSlideFromRight}
            className="space-y-10"
          >
            <motion.div variants={textRevealSequence} className="text-center space-y-3 max-w-3xl mx-auto">
              <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-900 border border-blue-200">
                <Sparkles size={14} className="text-amber-500" /> Core Pillars
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Designed for Governance, Built for Speed
              </h2>
              <p className="text-sm text-slate-600">
                Aligning state priorities with corporate philanthropy through transparent workflows and dedicated SLA mechanisms.
              </p>
            </motion.div>

            <motion.div variants={staggerSlideCards} className="grid gap-6 md:grid-cols-3">
              {pillars.map((pillar, idx) => {
                const Icon = pillar.icon;
                return (
                  <motion.div
                    key={idx}
                    variants={cardSlideFromRight}
                    className="group relative rounded-2xl border border-slate-200/80 bg-white/80 p-6 shadow-sm backdrop-blur-md transition-all hover:border-blue-500/40 hover:shadow-xl hover:-translate-y-1"
                  >
                    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-900 text-white shadow-md shadow-blue-900/20 group-hover:scale-110 transition-transform">
                      <Icon size={22} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">{pillar.title}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">{pillar.detail}</p>
                  </motion.div>
                );
              })}
            </motion.div>
          </motion.section>

          {/* ── WORKFLOW STEPS ── */}
          <motion.section
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={sectionSlideFromRight}
            className="space-y-10"
          >
            <motion.div variants={textRevealSequence} className="text-center space-y-3 max-w-3xl mx-auto">
              <span className="inline-flex items-center gap-2 rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-900 border border-purple-200">
                <CheckCircle2 size={14} className="text-purple-600" /> Operational Workflow
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                4-Stage Partnership Journey
              </h2>
              <p className="text-sm text-slate-600">
                From initial state dialogue to ground-level MoU execution and live dashboard monitoring.
              </p>
            </motion.div>

            <motion.div variants={staggerSlideCards} className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {workflow.map((step, idx) => {
                const Icon = step.icon;
                return (
                  <motion.div
                    key={idx}
                    variants={cardSlideFromRight}
                    className="relative rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm transition-all hover:shadow-lg hover:border-slate-300"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-mono text-xs font-bold text-slate-400">0{idx + 1}</span>
                      <div className={`p-2.5 rounded-xl border ${step.glow}`}>
                        <Icon size={18} />
                      </div>
                    </div>
                    <h3 className="text-sm font-extrabold text-slate-900 mb-2">{step.title}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">{step.detail}</p>
                  </motion.div>
                );
              })}
            </motion.div>
          </motion.section>

          {/* ── GIS MAP PREVIEW ── */}
          <section className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-900 border border-emerald-200 mb-2">
                  <Landmark size={14} className="text-emerald-600" /> State Footprint
                </span>
                <h2 className="text-2xl font-extrabold text-slate-900">District Intelligence & GIS Mapping</h2>
              </div>
              <Link
                href="/districts"
                className="inline-flex items-center gap-2 text-xs font-extrabold text-blue-900 hover:text-blue-950 no-underline group"
              >
                Explore Full GIS View <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-2 shadow-lg overflow-hidden">
              <GisMap />
            </div>
          </section>

          {/* ── RESOURCES & DOCUMENTS ── */}
          <section className="space-y-8">
            <div className="text-center space-y-2 max-w-2xl mx-auto">
              <h2 className="text-2xl font-extrabold text-slate-900">Public Document & Policy Library</h2>
              <p className="text-xs text-slate-600">Standard operating procedures, governance guidelines, FAQs, and portal directories.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {resources.map((res, idx) => (
                <Link
                  key={idx}
                  href={res.href}
                  className="group block p-5 rounded-2xl border border-slate-200/90 bg-white hover:bg-slate-50/80 transition-all hover:border-blue-300 shadow-2xs hover:shadow-md no-underline"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xs font-extrabold text-slate-900 group-hover:text-blue-900 transition-colors">
                      {res.title}
                    </h3>
                    <ExternalLink size={14} className="text-slate-400 group-hover:text-blue-900 transition-colors" />
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">{res.description}</p>
                </Link>
              ))}
            </div>
          </section>

        </Parallax3DSection>
      </div>
    </SaaSLayout>
  );
}
