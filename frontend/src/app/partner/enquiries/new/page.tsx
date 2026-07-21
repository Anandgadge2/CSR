"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import GovInput from "@/components/gov/GovInput";
import GovSelect from "@/components/gov/GovSelect";
import GovTextarea from "@/components/gov/GovTextarea";
import GovButton from "@/components/gov/GovButton";
import { GovCard, GovCardHeader, GovCardTitle, GovCardBody } from "@/components/gov/GovCard";
import GovAlert from "@/components/gov/GovAlert";
import GovPortalLayout from "@/components/layout/GovPortalLayout";
import GovPageHeader from "@/components/layout/GovPageHeader";
import { Building2, Handshake, CheckCircle, Loader2, Copy, ArrowLeft, ChevronDown, X } from "lucide-react";
import Link from "next/link";
import { locationData } from "@/lib/locationData";

const SECTORS = [
  { value: "", label: "Select Sector" },
  { value: "EDUCATION", label: "Education" },
  { value: "HEALTH", label: "Health & Sanitation" },
  { value: "WATER", label: "Water & Irrigation" },
  { value: "RURAL_DEVELOPMENT", label: "Rural Development" },
  { value: "ENVIRONMENT", label: "Environment & Climate Change" },
  { value: "WOMEN_EMPOWERMENT", label: "Women Empowerment" },
  { value: "SKILL_DEVELOPMENT", label: "Skill Development" },
  { value: "AGRICULTURE", label: "Agriculture" },
  { value: "SPORTS", label: "Sports" },
  { value: "OTHER", label: "Other" },
];

const DIVISION_TO_DISTRICTS: Record<string, string[]> = {
  Amravati: ["Akola", "Amravati", "Buldhana", "Washim", "Yavatmal"],
  Aurangabad: ["Aurangabad", "Beed", "Hingoli", "Jalna", "Latur", "Nanded", "Osmanabad", "Parbhani"],
  Konkan: ["Mumbai City", "Mumbai Suburban", "Palghar", "Raigad", "Ratnagiri", "Sindhudurg", "Thane"],
  Nagpur: ["Bhandara", "Chandrapur", "Gadchiroli", "Gondia", "Nagpur", "Wardha"],
  Nashik: ["Ahmednagar", "Dhule", "Jalgaon", "Nandurbar", "Nashik"],
  Pune: ["Kolhapur", "Pune", "Sangli", "Satara", "Solapur"],
};

function MultiSelectField({
  label,
  values,
  options,
  onChange,
  required = false,
  placeholder = "Select options"
}: {
  label: string;
  values: string[];
  options: string[];
  onChange: (values: string[]) => void;
  required?: boolean;
  placeholder?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  
  const selectedSet = new Set(values || []);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter(opt =>
    opt.toLowerCase().includes(search.toLowerCase())
  );

  const toggleOption = (option: string) => {
    const next = new Set(selectedSet);
    if (next.has(option)) {
      next.delete(option);
    } else {
      next.add(option);
    }
    onChange(Array.from(next));
  };

  const removeOption = (option: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = new Set(selectedSet);
    next.delete(option);
    onChange(Array.from(next));
  };

  return (
    <div className={`flex flex-col gap-1.5 text-sm font-bold text-slate-700 relative ${isOpen ? "z-50" : "z-10"}`} ref={dropdownRef}>
      <span>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </span>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="min-h-[42px] border border-slate-200 bg-white px-3 py-1.5 flex items-center justify-between gap-2 cursor-pointer focus-within:border-[#14274e] outline-none rounded"
      >
        <div className="flex flex-wrap gap-1">
          {values && values.length > 0 ? (
            values.map(val => (
              <span key={val} className="inline-flex items-center gap-1 bg-[#14274e]/10 text-[#14274e] text-xs font-semibold px-2 py-0.5 rounded">
                {val}
                <button 
                  type="button" 
                  onClick={(e) => removeOption(val, e)}
                  className="hover:text-red-500 focus:outline-none ml-1 font-bold"
                >
                  <X size={12} />
                </button>
              </span>
            ))
          ) : (
            <span className="text-slate-400 font-medium">{placeholder}</span>
          )}
        </div>
        <ChevronDown size={16} className="text-slate-400 shrink-0" />
      </div>

      {isOpen && (
        <div className="absolute top-[100%] left-0 right-0 z-[100] mt-1 border border-slate-200 bg-white shadow-2xl max-h-60 flex flex-col rounded overflow-hidden">
          <div className="p-2 border-b border-slate-100 bg-slate-50">
            <input
              type="text"
              placeholder="Search options..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              className="w-full border border-slate-200 rounded px-2.5 py-1.5 text-xs font-medium outline-none focus:border-[#14274e] bg-white"
            />
          </div>
          <div className="overflow-y-auto flex-grow divide-y divide-slate-100 max-h-48" data-lenis-prevent>
            {filteredOptions.length === 0 ? (
              <div className="p-3 text-xs text-slate-400 font-medium text-center">No options found</div>
            ) : (
              filteredOptions.map(option => {
                const isChecked = selectedSet.has(option);
                return (
                  <div
                    key={option}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleOption(option);
                    }}
                    className={`flex items-center gap-2.5 px-3 py-2 text-xs font-semibold cursor-pointer hover:bg-slate-50 transition-colors ${isChecked ? "bg-[#14274e]/5" : ""}`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {}} // handled by container click
                      className="shrink-0"
                    />
                    <span className="text-slate-800 font-medium">{option}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

interface CSRPartnerForm {
  companyName: string;
  sector: string;
  preferredDivisions: string[];
  preferredDistricts: string[];
  preferredCities: string[];
  preferredTalukas: string[];
  indicativeBudget: string;
  contactPersonName: string;
  mobile: string;
  email: string;
  mca21CIN: string;
  proposedCSRWork: string;
}

interface FormErrors {
  [key: string]: string;
}

export default function NewPartnerEnquiryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [trackingId, setTrackingId] = useState("");
  const [copied, setCopied] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const [form, setForm] = useState<CSRPartnerForm>({
    companyName: "",
    sector: "",
    preferredDivisions: [],
    preferredDistricts: [],
    preferredCities: [],
    preferredTalukas: [],
    indicativeBudget: "",
    contactPersonName: "",
    mobile: "",
    email: "",
    mca21CIN: "",
    proposedCSRWork: "",
  });

  // Prepopulate from authenticated user session
  useEffect(() => {
    if (typeof window !== "undefined") {
      const user = localStorage.getItem("user");
      if (user) {
        try {
          const userData = JSON.parse(user);
          const name = userData.organization?.name || userData.companyName || userData.name || "";
          const cin = userData.organization?.cin || userData.company?.cin || userData.cin || "";
          const email = userData.email || "";
          
          setForm((prev) => ({
            ...prev,
            companyName: name,
            mca21CIN: cin,
            email: email,
            contactPersonName: userData.contactPersonName || userData.name || prev.contactPersonName,
            mobile: userData.mobile || prev.mobile,
          }));
        } catch (e) {
          console.error("Error loading user profile", e);
        }
      }
    }
  }, []);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!form.companyName.trim()) {
      newErrors.companyName = "Company name is required";
    }

    if (!form.sector) {
      newErrors.sector = "Sector is required";
    }

    if (form.preferredDivisions.length === 0) {
      newErrors.preferredDivisions = "At least one division must be selected";
    }

    if (form.preferredDistricts.length === 0) {
      newErrors.preferredDistricts = "At least one district must be selected";
    }

    if (!form.contactPersonName.trim()) {
      newErrors.contactPersonName = "Contact person name is required";
    }

    if (!form.mobile.trim()) {
      newErrors.mobile = "Mobile number is required";
    } else if (!/^[6-9]\d{9}$/.test(form.mobile)) {
      newErrors.mobile = "Enter valid 10-digit Indian mobile number";
    }

    if (!form.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Enter valid email address";
    }

    if (!form.mca21CIN.trim()) {
      newErrors.mca21CIN = "MCA21 CIN is required";
    } else if (!/^([LUu]{1})([0-9]{5})([A-Za-z]{2})([0-9]{4})([A-Za-z]{3})([0-9]{6})$/.test(form.mca21CIN)) {
      newErrors.mca21CIN = "Enter valid 21-character CIN (e.g., U12345MH2024PTC123456)";
    }

    if (!form.proposedCSRWork.trim()) {
      newErrors.proposedCSRWork = "Proposed CSR work description is required";
    } else {
      const wordCount = form.proposedCSRWork.trim().split(/\s+/).length;
      if (wordCount > 200) {
        newErrors.proposedCSRWork = `Description exceeds 200 words (current: ${wordCount})`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const maharashtraState = locationData.find(s => s.name === "Maharashtra");
  const districtsList = maharashtraState ? maharashtraState.districts : [];

  const handleDivisionsChange = (nextDivisions: string[]) => {
    // Determine which districts are still valid
    const validDistricts = nextDivisions.flatMap(div => DIVISION_TO_DISTRICTS[div] || []);
    const nextDistricts = form.preferredDistricts.filter(d => validDistricts.includes(d));
    
    // Filter cities and talukas based on the next districts
    const validCities = districtsList.filter(d => nextDistricts.includes(d.name)).flatMap(d => d.cities || []);
    const nextCities = form.preferredCities.filter(c => validCities.includes(c));

    const validTalukas = districtsList.filter(d => nextDistricts.includes(d.name)).flatMap(d => d.talukas || []);
    const nextTalukas = form.preferredTalukas.filter(t => validTalukas.includes(t));

    setForm(prev => ({
      ...prev,
      preferredDivisions: nextDivisions,
      preferredDistricts: nextDistricts,
      preferredCities: nextCities,
      preferredTalukas: nextTalukas
    }));

    if (errors.preferredDivisions && nextDivisions.length > 0) {
      setErrors(prev => ({ ...prev, preferredDivisions: "" }));
    }
    if (errors.preferredDistricts && nextDistricts.length > 0) {
      setErrors(prev => ({ ...prev, preferredDistricts: "" }));
    }
  };

  const handleDistrictsChange = (nextDistricts: string[]) => {
    const validCities = districtsList.filter(d => nextDistricts.includes(d.name)).flatMap(d => d.cities || []);
    const nextCities = form.preferredCities.filter(c => validCities.includes(c));

    const validTalukas = districtsList.filter(d => nextDistricts.includes(d.name)).flatMap(d => d.talukas || []);
    const nextTalukas = form.preferredTalukas.filter(t => validTalukas.includes(t));

    setForm(prev => ({
      ...prev,
      preferredDistricts: nextDistricts,
      preferredCities: nextCities,
      preferredTalukas: nextTalukas
    }));

    if (errors.preferredDistricts && nextDistricts.length > 0) {
      setErrors(prev => ({ ...prev, preferredDistricts: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setLoading(true);
    try {
      const response = await apiFetch<any>("/corporate-enquiries", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          mca21Cin: form.mca21CIN,
          proposedCsrWork: form.proposedCSRWork,
          indicativeBudget: form.indicativeBudget ? parseFloat(form.indicativeBudget) : null,
          mobileVerificationToken: "authenticated",
          emailVerificationToken: "authenticated",
        }),
      });

      setTrackingId(response.trackingId ?? response.enquiry?.trackingId ?? response.data?.trackingId ?? response.data?.enquiry?.trackingId);
      setSubmitted(true);
    } catch (err: any) {
      setErrors({
        submit: err.message || "Failed to submit enquiry. Please try again.",
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setLoading(false);
    }
  };

  const copyTrackingId = () => {
    navigator.clipboard.writeText(trackingId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const wordCount = form.proposedCSRWork.trim().split(/\s+/).filter(w => w.length > 0).length;

  if (submitted) {
    return (
      <GovPortalLayout userRole="CORPORATE_USER">
        <div style={{ maxWidth: 800, margin: "0 auto", padding: 20 }}>
          <GovPageHeader
            title="Enquiry Submitted Successfully"
            description="Thank you for your interest in partnering with Maharashtra for CSR initiatives."
            breadcrumb="Home / Partner / Submit Enquiry"
          />

          <GovCard className="mt-4">
            <GovCardBody className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-[#14274e] mb-2">
                Your enquiry has been received
              </h2>
              <p className="text-slate-600 mb-6">
                A dedicated CSR Relationship Manager will respond, understand the need, and guide you within 5 days.
              </p>

              <div className="bg-slate-50 border border-slate-200 rounded p-4 mb-6" style={{ maxWidth: 400, margin: "0 auto 24px" }}>
                <p className="text-sm text-slate-500 mb-2">Your Tracking ID</p>
                <div className="flex items-center justify-center gap-2">
                  <code className="text-2xl font-mono font-bold text-[#14274e]">
                    {trackingId}
                  </code>
                  <button
                    onClick={copyTrackingId}
                    className="p-2 hover:bg-slate-200 rounded transition-colors"
                    title="Copy tracking ID"
                  >
                    <Copy size={18} className={copied ? "text-green-600" : "text-slate-500"} />
                  </button>
                </div>
                {copied && (
                  <p className="text-xs text-green-600 mt-1">Copied to clipboard!</p>
                )}
              </div>

              <div className="flex gap-3 justify-center">
                <GovButton onClick={() => router.push(`/track?id=${trackingId}`)}>
                  Track Application
                </GovButton>
                <GovButton variant="secondary" onClick={() => router.push("/partner/dashboard")}>
                  Back to Dashboard
                </GovButton>
              </div>
            </GovCardBody>
          </GovCard>
        </div>
      </GovPortalLayout>
    );
  }

  return (
    <GovPortalLayout userRole="CORPORATE_USER">
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: 20 }}>
        {/* Back Link */}
        <Link href="/partner/dashboard" style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 20, color: "var(--gov-primary)", fontWeight: 600, textDecoration: "none" }}>
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>

        <GovPageHeader
          title="Submit Corporate CSR Enquiry"
          description="Submit your CSR enquiry to collaborate with the Government of Maharashtra on social development initiatives."
          breadcrumb="Home / Partner / Submit Enquiry"
        />

        {errors.submit && (
          <GovAlert variant="danger" className="mb-4">
            {errors.submit}
          </GovAlert>
        )}

        <form onSubmit={handleSubmit} className="mt-4">
          <div className="grid grid-cols-1 gap-6">
            
            {/* Organization Info */}
            <GovCard>
              <GovCardHeader>
                <GovCardTitle>
                  <div className="flex items-center gap-2">
                    <Building2 className="text-[#14274e]" size={20} />
                    <span>Organization Information</span>
                  </div>
                </GovCardTitle>
              </GovCardHeader>
              <GovCardBody>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <GovInput
                    label="Company Name"
                    required
                    value={form.companyName}
                    onChange={(e) => {
                      setForm({ ...form, companyName: e.target.value });
                      if (errors.companyName) setErrors({ ...errors, companyName: "" });
                    }}
                    error={errors.companyName}
                    placeholder="Enter company name"
                  />

                  <GovInput
                    label="MCA21 CIN (Corporate Identification Number)"
                    required
                    format="cin"
                    value={form.mca21CIN}
                    onChange={(e) => {
                      setForm({ ...form, mca21CIN: e.target.value.toUpperCase() });
                      if (errors.mca21CIN) setErrors({ ...errors, mca21CIN: "" });
                    }}
                    error={errors.mca21CIN}
                    placeholder="U12345MH2024PTC123456"
                  />

                  <GovSelect
                    label="Primary Sector of Interest"
                    required
                    value={form.sector}
                    onChange={(e) => {
                      setForm({ ...form, sector: e.target.value });
                      if (errors.sector) setErrors({ ...errors, sector: "" });
                    }}
                    error={errors.sector}
                  >
                    {SECTORS.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </GovSelect>

                  <GovInput
                    label="Indicative CSR Budget (₹ - Optional)"
                    type="number"
                    value={form.indicativeBudget}
                    onChange={(e) => setForm({ ...form, indicativeBudget: e.target.value })}
                    placeholder="e.g. 5000000"
                  />
                </div>
              </GovCardBody>
            </GovCard>

            {/* Geography Selection */}
            <GovCard className="relative z-30 overflow-visible">
              <GovCardHeader>
                <GovCardTitle>Geography Preferred</GovCardTitle>
              </GovCardHeader>
              <GovCardBody className="overflow-visible">
                {errors.preferredDivisions && (
                  <GovAlert variant="danger" className="mb-3">
                    {errors.preferredDivisions}
                  </GovAlert>
                )}
                {errors.preferredDistricts && (
                  <GovAlert variant="danger" className="mb-3">
                    {errors.preferredDistricts}
                  </GovAlert>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Division Filter */}
                  <MultiSelectField
                    label="Preferred Division(s)"
                    required
                    values={form.preferredDivisions}
                    options={Object.keys(DIVISION_TO_DISTRICTS)}
                    onChange={handleDivisionsChange}
                    placeholder="Select division(s)..."
                  />

                  {/* District Filter */}
                  <MultiSelectField
                    label="Preferred District(s)"
                    required
                    values={form.preferredDistricts}
                    options={form.preferredDivisions.flatMap(div => DIVISION_TO_DISTRICTS[div] || [])}
                    onChange={handleDistrictsChange}
                    placeholder={form.preferredDivisions.length === 0 ? "Select division first..." : "Select district(s)..."}
                  />

                  {/* City Filter */}
                  <MultiSelectField
                    label="Preferred City/Cities (Optional)"
                    values={form.preferredCities}
                    options={
                      districtsList
                        .filter(d => form.preferredDistricts.includes(d.name))
                        .flatMap(d => d.cities || [])
                    }
                    onChange={(values) => setForm(prev => ({ ...prev, preferredCities: values }))}
                    placeholder={form.preferredDistricts.length === 0 ? "Select district first..." : "Select city/cities..."}
                  />

                  {/* Taluka Filter */}
                  <MultiSelectField
                    label="Preferred Taluka(s) (Optional)"
                    values={form.preferredTalukas}
                    options={
                      districtsList
                        .filter(d => form.preferredDistricts.includes(d.name))
                        .flatMap(d => d.talukas || [])
                    }
                    onChange={(values) => setForm(prev => ({ ...prev, preferredTalukas: values }))}
                    placeholder={form.preferredDistricts.length === 0 ? "Select district first..." : "Select taluka(s)..."}
                  />
                </div>
                
                <p className="text-xs text-slate-500 mt-4">
                  Only Division and District are compulsory. Select multiple options as needed to narrow down your geography focus.
                </p>
              </GovCardBody>
            </GovCard>

            {/* Contact Information */}
            <GovCard>
              <GovCardHeader>
                <GovCardTitle>Contact Information</GovCardTitle>
              </GovCardHeader>
              <GovCardBody>
                <div className="gov-grid-3">
                  <GovInput
                    label="Contact Person Name"
                    required
                    format="name"
                    value={form.contactPersonName}
                    onChange={(e) => {
                      setForm({ ...form, contactPersonName: e.target.value });
                      if (errors.contactPersonName) setErrors({ ...errors, contactPersonName: "" });
                    }}
                    error={errors.contactPersonName}
                    placeholder="Full name"
                  />

                  <GovInput
                    label="Mobile Number"
                    required
                    format="phone"
                    value={form.mobile}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "").slice(0, 10);
                      setForm({ ...form, mobile: value });
                      if (errors.mobile) setErrors({ ...errors, mobile: "" });
                    }}
                    error={errors.mobile}
                    placeholder="10-digit mobile number"
                  />

                  <GovInput
                    label="Email"
                    type="email"
                    required
                    format="email"
                    value={form.email}
                    onChange={(e) => {
                      setForm({ ...form, email: e.target.value });
                      if (errors.email) setErrors({ ...errors, email: "" });
                    }}
                    error={errors.email}
                    placeholder="email@company.com"
                  />
                </div>
              </GovCardBody>
            </GovCard>

            {/* Proposed CSR Work */}
            <GovCard>
              <GovCardHeader>
                <GovCardTitle>Proposed CSR Work</GovCardTitle>
              </GovCardHeader>
              <GovCardBody>
                <GovTextarea
                  label="Proposed CSR Work"
                  required
                  value={form.proposedCSRWork}
                  onChange={(e) => {
                    setForm({ ...form, proposedCSRWork: e.target.value });
                    if (errors.proposedCSRWork) setErrors({ ...errors, proposedCSRWork: "" });
                  }}
                  error={errors.proposedCSRWork}
                  placeholder="Describe your proposed CSR initiative, target beneficiaries, expected outcomes, and timeline..."
                  rows={6}
                  help={`Maximum 200 words. Current: ${wordCount} words`}
                />
              </GovCardBody>
            </GovCard>

            {/* Submit Button */}
            <div className="flex flex-col items-center mt-2">
              <GovButton type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin mr-2" />
                    Submitting...
                  </>
                ) : (
                  "Submit Corporate Enquiry"
                )}
              </GovButton>
              <p className="text-xs text-slate-500 mt-3">
                By submitting, you agree to the terms and conditions of Maharashtra CSR Portal.
              </p>
            </div>

          </div>
        </form>
      </div>
    </GovPortalLayout>
  );
}
