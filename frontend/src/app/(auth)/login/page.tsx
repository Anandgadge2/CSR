"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Mail,
  Lock,
  LogIn,
  AlertCircle,
  Eye,
  EyeOff,
  Building2,
  ShieldCheck,
  Award,
  Sparkles,
  ArrowRight
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { resolveDashboardPath } from "@/lib/roleRouting";
import { API_BASE_URL, clearApiCache } from "@/lib/api";
import { Loader } from "@/components/ui/Loader";

// Quick login presets for rapid role testing during development & demo reviews
const DEMO_LOGINS = [
  { label: "Super Admin", email: "admin@mahacsr.gov.in", role: "PORTAL_ADMIN" },
  { label: "Relationship Mgr", email: "rm@mahacsr.gov.in", role: "RM" },
  { label: "Joint Secretary", email: "js@mahacsr.gov.in", role: "JS" },
  { label: "Nodal Officer", email: "nodal@mahacsr.gov.in", role: "NODAL" },
  { label: "CSR Company", email: "company.admin@mahacsr.gov.in", role: "COMPANY" }
];

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE_URL}/public/requirements?limit=1`).catch(() => {});
    [
      "/admin/dashboard",
      "/secretary/dashboard",
      "/js/dashboard",
      "/nodal/dashboard",
      "/rm/dashboard",
      "/company/dashboard",
      "/ngo/dashboard",
      "/department/dashboard",
      "/partner/dashboard"
    ].forEach((path) => router.prefetch(path));
  }, [router]);

  const handleQuickLogin = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword("111111");
    setError("");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!email || !password) {
      setError("Please fill out all required fields.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      if (!response.ok) {
        if (response.status === 403 && data.error && typeof data.error === "string" && data.error.toLowerCase().includes("verify")) {
          setError("Account not verified. Redirecting to OTP verification...");
          setTimeout(() => {
            router.push(`/register?step=3&email=${encodeURIComponent(email)}`);
          }, 1500);
          return;
        }
        const errMsg = typeof data.error === "string" ? data.error : data.error?.message || data.message || "Invalid email or password";
        throw new Error(errMsg);
      }

      const user = data.data?.user || data.user;
      const accessToken = data.data?.accessToken || data.accessToken;

      if (!user) {
        throw new Error("Invalid response payload from authentication gateway");
      }

      const permissionData = data.data ?? data;
      const hasFoldedPermissions = Array.isArray(permissionData?.permissions);

      useAuthStore.getState().login(
        user,
        hasFoldedPermissions
          ? {
              permissions: permissionData.permissions ?? [],
              roles: permissionData.roles ?? [],
              roleDetails: permissionData.roleDetails ?? [],
              isAdmin: permissionData.isAdmin ?? false
            }
          : undefined
      );

      clearApiCache();
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("user", JSON.stringify(user));

      const nextPath = searchParams.get("next") || searchParams.get("redirect");
      if (nextPath?.startsWith("/")) {
        router.push(nextPath);
        setLoginSuccess(true);
        return;
      }

      const onboardingStatus = user.organization?.onboardingStatus;
      const dest = resolveDashboardPath(
        {
          roleNumericId: user.roleNumericId,
          roleSlug: user.roleSlug,
          role: user.role
        },
        "/"
      );

      const orgPersonaDests = ["/company/dashboard", "/department/dashboard", "/ngo/dashboard"];
      if (onboardingStatus && onboardingStatus !== "APPROVED" && orgPersonaDests.includes(dest)) {
        router.push("/organization/onboarding/status");
      } else {
        router.push(dest);
      }
      setLoginSuccess(true);
    } catch (err: any) {
      const msg = typeof err === "string" ? err : err?.message || "An error occurred during authentication";
      setError(typeof msg === "string" ? msg : JSON.stringify(msg));
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a1628] via-[#0d1c3a] to-[#14274e] px-4 py-12 relative overflow-hidden text-slate-100">
      {loading && loginSuccess && <Loader label="Initializing workspace & permissions..." fullscreen />}

      {/* Decorative ambient background glows */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#f7941d]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-[30rem] h-[30rem] bg-[#3b82f6]/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center z-10">
        
        {/* Left Side: Brand Showcase & State Crest */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="lg:col-span-6 flex flex-col gap-6 text-white pr-0 lg:pr-6"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-xs font-semibold text-[#f7941d] backdrop-blur-md w-fit">
            <Sparkles size={14} className="animate-pulse" />
            <span>Official Government of Maharashtra Portal</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#f7941d] to-[#d97706] p-0.5 shadow-lg shadow-amber-500/20 flex items-center justify-center shrink-0">
              <div className="w-full h-full bg-[#0d1c3a] rounded-[14px] flex items-center justify-center">
                <svg viewBox="0 0 100 100" className="w-10 h-10" fill="none" stroke="currentColor">
                  <polygon points="50,5 82,18 95,50 82,82 50,95 18,82 5,50 18,18" stroke="#f7941d" strokeWidth="4.5" fill="#f7941d" fillOpacity="0.15" />
                  <path d="M28,32 L72,32 M32,44 L68,44 M28,56 L72,56 M36,68 L64,68" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
                  <path d="M42,80 L58,80" stroke="#f7941d" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-heading font-extrabold tracking-tight text-white">
                MahaCSR Portal
              </h1>
              <p className="text-xs text-amber-200/80 font-medium tracking-wide uppercase mt-0.5">
                State-Led CSR Convergence & Impact Framework
              </p>
            </div>
          </div>

          <p className="text-sm text-slate-300 leading-relaxed font-normal">
            Unified digital gateway connecting Corporate CSR capital with verified State Government development priorities and District execution workflows across Maharashtra.
          </p>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md flex items-center gap-3">
              <ShieldCheck className="text-[#f7941d] shrink-0" size={22} />
              <div>
                <p className="text-xs font-bold text-white">API Setu Verified</p>
                <p className="text-[11px] text-slate-400">GSTN & Aadhaar eKYC</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md flex items-center gap-3">
              <Award className="text-emerald-400 shrink-0" size={22} />
              <div>
                <p className="text-xs font-bold text-white">5-3-2 SLA Engine</p>
                <p className="text-[11px] text-slate-400">Strict Timelines</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right Side: Login Glass Container */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
          className="lg:col-span-6 bg-white/95 backdrop-blur-2xl p-8 rounded-3xl border border-white/20 shadow-2xl shadow-black/40 text-slate-900"
        >
          <div className="mb-6">
            <h2 className="text-2xl font-heading font-bold text-[#0d1c3a] tracking-tight">
              Sign In to Your Workspace
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Enter your credentials to access your persona dashboard
            </p>
          </div>

          {/* Quick Demo Login Selectors */}
          <div className="mb-6">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
              Quick Login Roles (Demo):
            </label>
            <div className="flex flex-wrap gap-1.5">
              {DEMO_LOGINS.map((demo) => (
                <button
                  key={demo.email}
                  type="button"
                  onClick={() => handleQuickLogin(demo.email)}
                  className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-all ${
                    email === demo.email
                      ? "bg-[#14274e] text-white border-[#14274e] shadow-sm scale-105"
                      : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                  }`}
                >
                  {demo.label}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-5 bg-red-50 border border-red-200 p-3.5 rounded-xl text-red-700 text-xs flex items-center gap-3"
            >
              <AlertCircle size={18} className="text-red-500 shrink-0" />
              <span className="font-medium">{error}</span>
            </motion.div>
          )}

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Corporate / Official Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. admin@mahacsr.gov.in"
                  disabled={loading}
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#f7941d]/50 focus:border-[#14274e] focus:bg-white transition-all disabled:opacity-50"
                />
                <Mail size={18} className="absolute left-3.5 top-3 text-slate-400" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Password
                </label>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  disabled={loading}
                  required
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#f7941d]/50 focus:border-[#14274e] focus:bg-white transition-all disabled:opacity-50"
                />
                <Lock size={18} className="absolute left-3.5 top-3 text-slate-400" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-3 w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#0d1c3a] via-[#14274e] to-[#1b3469] hover:from-[#14274e] hover:to-[#0d1c3a] text-white font-semibold text-sm shadow-md shadow-slate-900/20 hover:shadow-lg transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
            >
              {loading ? (
                <span>Signing in...</span>
              ) : (
                <>
                  <span>Sign In to Workspace</span>
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="text-center text-xs text-slate-500 mt-6 pt-5 border-t border-slate-100 font-medium">
            New corporate or government entity?{" "}
            <Link href="/register" className="text-[#14274e] hover:text-[#f7941d] font-bold transition-colors">
              Register Organization
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
