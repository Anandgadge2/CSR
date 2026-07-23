"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldAlert,
  FileCheck,
  Landmark,
  Building2,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Eye,
  EyeOff,
  CheckCircle2,
  Sparkles,
  KeyRound
} from "lucide-react";
import { API_BASE_URL } from "@/lib/api";
import { locationData, allStatesList } from "@/lib/locationData";
import { FieldFormat, sanitizeField, validateField } from "@/lib/validation";

const FIELD_FORMATS: Record<string, FieldFormat> = {
  email: "email",
  pan: "pan",
  gst: "gst"
};

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [role, setRole] = useState<"GOV_ENTITY" | "CORPORATE">("CORPORATE");
  const [otp, setOtp] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    pan: "",
    address: "",
    state: "Maharashtra",
    district: "Pune",
    city: "Pune City",
    taluka: "Haveli",
    registrationNumber: "",
    darpanNumber: "",
    csr1Number: "",
    cin: "",
    gst: "",
    csrBudget: ""
  });

  const [customState, setCustomState] = useState("");
  const [customDistrict, setCustomDistrict] = useState("");
  const [customCity, setCustomCity] = useState("");
  const [customTaluka, setCustomTaluka] = useState("");

  const selectedStateInfo = locationData.find((s) => s.name === formData.state);
  const availableDistricts = selectedStateInfo ? selectedStateInfo.districts : [];
  const selectedDistrictInfo = selectedStateInfo ? selectedStateInfo.districts.find((d) => d.name === formData.district) : null;
  const availableCities = selectedDistrictInfo ? selectedDistrictInfo.cities : [];
  const availableTalukas = selectedDistrictInfo ? selectedDistrictInfo.talukas : [];

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const stepParam = params.get("step");
      const emailParam = params.get("email");
      if (stepParam) {
        setStep(parseInt(stepParam, 10));
      }
      if (emailParam) {
        setFormData((prev) => ({ ...prev, email: emailParam }));
      }
    }
  }, []);

  const handleStateChange = (stateName: string) => {
    setFormData((prev) => {
      const stateInfo = locationData.find((s) => s.name === stateName);
      const defaultDistrict = stateInfo && stateInfo.districts.length > 0 ? stateInfo.districts[0].name : "Other";
      const districtInfo = stateInfo && stateInfo.districts.length > 0 ? stateInfo.districts[0] : null;
      const defaultCity = districtInfo && districtInfo.cities.length > 0 ? districtInfo.cities[0] : "Other";
      const defaultTaluka = districtInfo && districtInfo.talukas.length > 0 ? districtInfo.talukas[0] : "Other";

      return {
        ...prev,
        state: stateName,
        district: defaultDistrict,
        city: defaultCity,
        taluka: defaultTaluka
      };
    });

    setFieldErrors((prev) => {
      const copy = { ...prev };
      delete copy.state;
      delete copy.district;
      delete copy.city;
      delete copy.taluka;
      return copy;
    });
  };

  const handleDistrictChange = (districtName: string) => {
    setFormData((prev) => {
      const stateInfo = locationData.find((s) => s.name === prev.state);
      const districtInfo = stateInfo ? stateInfo.districts.find((d) => d.name === districtName) : null;
      const defaultCity = districtInfo && districtInfo.cities.length > 0 ? districtInfo.cities[0] : "Other";
      const defaultTaluka = districtInfo && districtInfo.talukas.length > 0 ? districtInfo.talukas[0] : "Other";

      return {
        ...prev,
        district: districtName,
        city: defaultCity,
        taluka: defaultTaluka
      };
    });

    setFieldErrors((prev) => {
      const copy = { ...prev };
      delete copy.district;
      delete copy.city;
      delete copy.taluka;
      return copy;
    });
  };

  const formatFor = (name: string): FieldFormat | undefined => {
    if (name === "cin") return role === "CORPORATE" ? "cin" : undefined;
    return FIELD_FORMATS[name];
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const fmt = formatFor(name);
    const clean = fmt ? sanitizeField(fmt, value) : value;
    setFormData((prev) => ({ ...prev, [name]: clean }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
  };

  const handleBlurValidate = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const fmt = formatFor(name);
    if (!fmt || !value) return;
    const message = validateField(fmt, value);
    if (message) setFieldErrors((prev) => ({ ...prev, [name]: message }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");
    setFieldErrors({});

    try {
      const isGovEntity = role === "GOV_ENTITY";
      const isCorporate = role === "CORPORATE";
      const stateVal = formData.state === "Other" ? customState : formData.state;
      const districtVal = formData.district === "Other" ? customDistrict : formData.district;
      const cityVal = formData.city === "Other" ? customCity : formData.city;
      const talukaVal = formData.taluka === "Other" ? customTaluka : formData.taluka;

      const payload = {
        email: formData.email,
        password: formData.password,
        role: isGovEntity ? 12 : 8,
        profile: {
          name: formData.name,
          pan: formData.pan.toUpperCase(),
          address: formData.address,
          state: stateVal,
          district: districtVal,
          city: cityVal,
          taluka: talukaVal,
          ...(isGovEntity
            ? {
                registrationNumber: formData.registrationNumber,
                contactInfo: { entityType: "GOVERNMENT_ENTITY" }
              }
            : {
                cin: formData.cin
              })
        }
      };

      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (!response.ok) {
        const details = data.details || data.error?.details;
        if (details && Array.isArray(details)) {
          const errors: Record<string, string> = {};
          details.forEach((err: any) => {
            const cleanKey = err.field?.replace(/^body\.profile\./, "").replace(/^body\./, "") || "field";
            errors[cleanKey] = err.message;
          });
          setFieldErrors(errors);
        }
        const msg = typeof data.error === "string" 
          ? data.error 
          : data.error?.message || data.message || "Failed to register";
        throw new Error(msg);
      }

      setSuccessMsg("Registration initiated. A 6-digit verification code has been sent to your email.");
      setStep(3);
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred during registration");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          otpCode: otp
        })
      });

      const data = await response.json();
      if (!response.ok) {
        const msg = typeof data.error === "string"
          ? data.error
          : data.error?.message || data.message || "Failed to verify OTP code";
        throw new Error(msg);
      }

      setSuccessMsg("Email verified successfully! Redirecting to workspace login...");
      setTimeout(() => {
        router.push(`/login?next=${encodeURIComponent("/dashboard")}`);
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a1628] via-[#0d1c3a] to-[#14274e] px-4 py-12 text-slate-900 relative overflow-hidden">
      {/* Decorative background glows */}
      <div className="absolute top-0 right-0 w-[30rem] h-[30rem] bg-[#f7941d]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[30rem] h-[30rem] bg-[#3b82f6]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-3xl bg-white/95 backdrop-blur-2xl p-8 rounded-3xl border border-white/20 shadow-2xl shadow-black/40 relative z-10 flex flex-col gap-6">
        
        {/* Header Branding */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#f7941d] to-[#d97706] p-0.5 shadow-md flex items-center justify-center">
              <div className="w-full h-full bg-[#0d1c3a] rounded-[10px] flex items-center justify-center">
                <Sparkles size={18} className="text-[#f7941d]" />
              </div>
            </div>
            <div>
              <h1 className="font-heading font-extrabold text-xl text-[#0d1c3a] tracking-tight">
                MahaCSR Portal Onboarding
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                Official Entity & Department Registration Gateway
              </p>
            </div>
          </div>
          <Link href="/login" className="text-xs font-semibold text-[#14274e] hover:text-[#f7941d] transition-colors">
            Back to Sign In
          </Link>
        </div>

        {/* Animated Step Tracker */}
        <div className="grid grid-cols-3 gap-2 text-center text-xs font-semibold">
          <div className={`py-2 px-3 rounded-xl border transition-all flex items-center justify-center gap-2 ${
            step === 1
              ? "bg-[#0d1c3a] text-white border-[#0d1c3a] shadow-sm"
              : step > 1
              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
              : "bg-slate-50 text-slate-400 border-slate-200"
          }`}>
            <span className="w-5 h-5 rounded-full bg-white/20 text-current text-[11px] font-bold flex items-center justify-center">1</span>
            <span className="hidden sm:inline">Entity Category</span>
          </div>

          <div className={`py-2 px-3 rounded-xl border transition-all flex items-center justify-center gap-2 ${
            step === 2
              ? "bg-[#0d1c3a] text-white border-[#0d1c3a] shadow-sm"
              : step > 2
              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
              : "bg-slate-50 text-slate-400 border-slate-200"
          }`}>
            <span className="w-5 h-5 rounded-full bg-white/20 text-current text-[11px] font-bold flex items-center justify-center">2</span>
            <span className="hidden sm:inline">Details & Location</span>
          </div>

          <div className={`py-2 px-3 rounded-xl border transition-all flex items-center justify-center gap-2 ${
            step === 3
              ? "bg-[#0d1c3a] text-white border-[#0d1c3a] shadow-sm"
              : "bg-slate-50 text-slate-400 border-slate-200"
          }`}>
            <span className="w-5 h-5 rounded-full bg-white/20 text-current text-[11px] font-bold flex items-center justify-center">3</span>
            <span className="hidden sm:inline">OTP Verification</span>
          </div>
        </div>

        {/* Alerts */}
        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 p-3.5 rounded-xl text-red-700 text-xs flex items-center gap-2.5 font-medium"
          >
            <AlertCircle size={18} className="text-red-500 shrink-0" />
            <span>{errorMsg}</span>
          </motion.div>
        )}

        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-xl text-emerald-800 text-xs flex items-center gap-2.5 font-medium"
          >
            <FileCheck size={18} className="text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {/* STEP 1: CATEGORY SELECTION */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col gap-6"
            >
              <div className="text-center">
                <h2 className="font-heading font-bold text-xl text-[#0d1c3a]">
                  Select Registration Profile
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Choose your organization type to customize your onboarding workspace
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                  onClick={() => setRole("CORPORATE")}
                  className={`p-5 rounded-2xl border-2 cursor-pointer flex flex-col gap-3 transition-all relative ${
                    role === "CORPORATE"
                      ? "border-[#f7941d] bg-amber-500/5 shadow-md shadow-amber-500/10"
                      : "border-slate-200 bg-slate-50/50 hover:border-slate-300"
                  }`}
                >
                  {role === "CORPORATE" && (
                    <CheckCircle2 size={20} className="absolute top-4 right-4 text-[#f7941d]" />
                  )}
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    role === "CORPORATE" ? "bg-[#0d1c3a] text-[#f7941d]" : "bg-slate-200 text-slate-600"
                  }`}>
                    <Building2 size={24} />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-base text-[#0d1c3a]">
                      Corporate Partner
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed mt-1">
                      Register with MCA21 CIN to submit CSR enquiries, commit funds, sign MoUs, and review project progress.
                    </p>
                  </div>
                </div>

                <div
                  onClick={() => setRole("GOV_ENTITY")}
                  className={`p-5 rounded-2xl border-2 cursor-pointer flex flex-col gap-3 transition-all relative ${
                    role === "GOV_ENTITY"
                      ? "border-[#f7941d] bg-amber-500/5 shadow-md shadow-amber-500/10"
                      : "border-slate-200 bg-slate-50/50 hover:border-slate-300"
                  }`}
                >
                  {role === "GOV_ENTITY" && (
                    <CheckCircle2 size={20} className="absolute top-4 right-4 text-[#f7941d]" />
                  )}
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    role === "GOV_ENTITY" ? "bg-[#0d1c3a] text-[#f7941d]" : "bg-slate-200 text-slate-600"
                  }`}>
                    <Landmark size={24} />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-base text-[#0d1c3a]">
                      Government Department / Local Body
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed mt-1">
                      Register state departments or district local bodies to post CSR requirements and receive corporate proposals.
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setStep(2)}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#0d1c3a] to-[#14274e] text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 group mt-2"
              >
                <span>Continue to Registration Details</span>
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          )}

          {/* STEP 2: FORM DETAILS */}
          {step === 2 && (
            <motion.form
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onSubmit={handleRegister}
              className="flex flex-col gap-4"
            >
              <div className="text-center mb-1">
                <h2 className="font-heading font-bold text-xl text-[#0d1c3a]">
                  Organization & Contact Information
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Provide official registration credentials for automated verification
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-700">
                    {role === "GOV_ENTITY" ? "Department / Local Body Name *" : "Organization Name *"}
                  </label>
                  <input
                    required
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Pune Municipal Corporation"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#f7941d]/50 focus:border-[#14274e]"
                  />
                  {fieldErrors.name && <span className="text-red-500 text-[11px]">{fieldErrors.name}</span>}
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-700">
                    {role === "GOV_ENTITY" ? "Official Department Email *" : "Corporate Email *"}
                  </label>
                  <input
                    required
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={handleBlurValidate}
                    placeholder="e.g. nodal.pune@mahacsr.gov.in"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#f7941d]/50 focus:border-[#14274e]"
                  />
                  {fieldErrors.email && <span className="text-red-500 text-[11px]">{fieldErrors.email}</span>}
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-700">Password *</label>
                  <div className="relative">
                    <input
                      required
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      minLength={6}
                      placeholder="Min 6 characters"
                      className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#f7941d]/50 focus:border-[#14274e]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {fieldErrors.password && <span className="text-red-500 text-[11px]">{fieldErrors.password}</span>}
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-700">PAN Card Number *</label>
                  <input
                    required
                    name="pan"
                    value={formData.pan}
                    onChange={handleChange}
                    onBlur={handleBlurValidate}
                    maxLength={10}
                    minLength={10}
                    placeholder="ABCDE1234F"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium uppercase text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#f7941d]/50 focus:border-[#14274e]"
                  />
                  {fieldErrors.pan && <span className="text-red-500 text-[11px]">{fieldErrors.pan}</span>}
                </div>

                <div className="flex flex-col gap-1 md:col-span-2">
                  <label className="text-xs font-semibold text-slate-700">Registered Address *</label>
                  <input
                    required
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    minLength={5}
                    placeholder="Official registered office address"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#f7941d]/50 focus:border-[#14274e]"
                  />
                  {fieldErrors.address && <span className="text-red-500 text-[11px]">{fieldErrors.address}</span>}
                </div>

                {role === "GOV_ENTITY" ? (
                  <>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-slate-700">Department Code *</label>
                      <input
                        required
                        name="registrationNumber"
                        value={formData.registrationNumber}
                        onChange={handleChange}
                        placeholder="e.g. ZP-PUNE-CSR"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#f7941d]/50 focus:border-[#14274e]"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-slate-700">Nodal Designation *</label>
                      <input
                        required
                        name="cin"
                        value={formData.cin}
                        onChange={handleChange}
                        placeholder="e.g. District Nodal Officer"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#f7941d]/50 focus:border-[#14274e]"
                      />
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col gap-1 md:col-span-2">
                    <label className="text-xs font-semibold text-slate-700">MCA21 CIN Number *</label>
                    <input
                      required
                      name="cin"
                      value={formData.cin}
                      onChange={handleChange}
                      onBlur={handleBlurValidate}
                      maxLength={21}
                      placeholder="L72200MH2018PLC309876"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium uppercase text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#f7941d]/50 focus:border-[#14274e]"
                    />
                    {fieldErrors.cin && <span className="text-red-500 text-[11px]">{fieldErrors.cin}</span>}
                  </div>
                )}

                {/* Cascading State/District/City/Taluka */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-700">State *</label>
                  <select
                    name="state"
                    value={formData.state}
                    onChange={(e) => handleStateChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#f7941d]/50 focus:border-[#14274e]"
                  >
                    {allStatesList.map((st) => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-700">District *</label>
                  <select
                    name="district"
                    value={formData.district}
                    onChange={(e) => handleDistrictChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#f7941d]/50 focus:border-[#14274e]"
                  >
                    {availableDistricts.map((d) => (
                      <option key={d.name} value={d.name}>{d.name}</option>
                    ))}
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-3 mt-4">
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => setStep(1)}
                  className="w-1/3 py-3 px-4 rounded-xl border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-colors flex items-center justify-center gap-1.5"
                >
                  <ArrowLeft size={16} />
                  <span>Back</span>
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-2/3 py-3 px-4 rounded-xl bg-gradient-to-r from-[#0d1c3a] to-[#14274e] text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? "Registering..." : "Submit & Send OTP"}
                </button>
              </div>
            </motion.form>
          )}

          {/* STEP 3: OTP VERIFICATION */}
          {step === 3 && (
            <motion.form
              key="step3"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onSubmit={handleVerifyOtp}
              className="flex flex-col gap-6 items-center text-center py-4"
            >
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-[#f7941d] flex items-center justify-center shadow-inner">
                <KeyRound size={28} />
              </div>

              <div>
                <h2 className="font-heading font-bold text-2xl text-[#0d1c3a]">
                  Verify Email Address
                </h2>
                <p className="text-xs text-slate-500 mt-1 max-w-sm">
                  We sent a 6-digit verification code to{" "}
                  <strong className="text-[#0d1c3a] font-semibold">{formData.email}</strong>
                </p>
              </div>

              <div className="w-full max-w-xs">
                <input
                  required
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="123456"
                  disabled={loading}
                  className="w-full text-center bg-slate-50 border-2 border-slate-200 focus:border-[#f7941d] rounded-2xl py-3.5 text-2xl font-bold tracking-[0.4em] text-[#0d1c3a] focus:outline-none focus:bg-white transition-all shadow-inner disabled:opacity-50"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full max-w-xs py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#0d1c3a] to-[#14274e] text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? "Verifying OTP..." : "Complete Verification"}
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
