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
import { Building2, CheckCircle, Loader2, Camera, ArrowLeft, ChevronDown, X, FileText, Trash2, Paperclip } from "lucide-react";
import Link from "next/link";
import { locationData } from "@/lib/locationData";

const SERVICE_CLASSES = [
  { value: "", label: "Select Service Class" },
  { value: "CLASS_1", label: "Class-1" },
  { value: "CLASS_2", label: "Class-2" },
  { value: "BELOW_CLASS_2", label: "below Class-2" },
];

const getCertificationOptions = (serviceClass: string) => {
  if (serviceClass === "CLASS_1" || serviceClass === "CLASS_2") {
    return [{ value: "SELF", label: "Self certification" }];
  }
  if (serviceClass === "BELOW_CLASS_2") {
    return [{ value: "HOD", label: "HOD certification" }];
  }
  return [{ value: "", label: "Select Service Class first" }];
};

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

interface PitchForm {
  officialName: string;
  designation: string;
  department: string;
  officeName: string;
  serviceClass: string;
  mobile: string;
  email: string;
  divisions: string[];
  districts: string[];
  cities: string[];
  talukas: string[];
  exactLocation: string;
  csrRequirement: string;
  estimatedCost: string;
  govtFundDeclaration: boolean;
  certificationType: string;
  hodDocument?: File | null;
  supportingDocuments: File[];
  geoTaggedPhotos: File[];
}

interface FormErrors {
  [key: string]: string;
}

/**
 * Government-department dashboard: create a development pitch.
 * Authenticated + verified GOVERNMENT_DEPARTMENT onboarding is enforced by the
 * backend route (requireApprovedOrganization). Identity is prepopulated from the
 * logged-in session — no OTP step (that only existed for anonymous public forms,
 * which have been retired).
 */
export default function CreatePitchDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [referenceId, setReferenceId] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});

  const [form, setForm] = useState<PitchForm>({
    officialName: "",
    designation: "",
    department: "",
    officeName: "",
    serviceClass: "",
    mobile: "",
    email: "",
    divisions: [],
    districts: [],
    cities: [],
    talukas: [],
    exactLocation: "",
    csrRequirement: "",
    estimatedCost: "",
    govtFundDeclaration: false,
    certificationType: "",
    hodDocument: null,
    supportingDocuments: [],
    geoTaggedPhotos: [],
  });

  // Prepopulate from the authenticated user's session / organization profile.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem("user");
    if (!raw) return;
    try {
      const u = JSON.parse(raw);
      setForm((prev) => ({
        ...prev,
        officialName: u.officialName || u.name || prev.officialName,
        department: u.organization?.name || u.department || prev.department,
        officeName: u.organization?.name || prev.officeName,
        email: u.email || prev.email,
        mobile: u.mobile || prev.mobile,
      }));
    } catch {
      /* ignore malformed session */
    }
  }, []);

  const maharashtraState = locationData.find(s => s.name === "Maharashtra");
  const districtsList = maharashtraState ? maharashtraState.districts : [];

  const handleDivisionsChange = (nextDivisions: string[]) => {
    const validDistricts = nextDivisions.flatMap(div => DIVISION_TO_DISTRICTS[div] || []);
    const nextDistricts = form.districts.filter(d => validDistricts.includes(d));

    const validCities = districtsList.filter(d => nextDistricts.includes(d.name)).flatMap(d => d.cities || []);
    const nextCities = form.cities.filter(c => validCities.includes(c));

    const validTalukas = districtsList.filter(d => nextDistricts.includes(d.name)).flatMap(d => d.talukas || []);
    const nextTalukas = form.talukas.filter(t => validTalukas.includes(t));

    setForm(prev => ({
      ...prev,
      divisions: nextDivisions,
      districts: nextDistricts,
      cities: nextCities,
      talukas: nextTalukas
    }));

    if (errors.divisions && nextDivisions.length > 0) {
      setErrors(prev => ({ ...prev, divisions: "" }));
    }
    if (errors.districts && nextDistricts.length > 0) {
      setErrors(prev => ({ ...prev, districts: "" }));
    }
  };

  const handleDistrictsChange = (nextDistricts: string[]) => {
    const validCities = districtsList.filter(d => nextDistricts.includes(d.name)).flatMap(d => d.cities || []);
    const nextCities = form.cities.filter(c => validCities.includes(c));

    const validTalukas = districtsList.filter(d => nextDistricts.includes(d.name)).flatMap(d => d.talukas || []);
    const nextTalukas = form.talukas.filter(t => validTalukas.includes(t));

    setForm(prev => ({
      ...prev,
      districts: nextDistricts,
      cities: nextCities,
      talukas: nextTalukas
    }));

    if (errors.districts && nextDistricts.length > 0) {
      setErrors(prev => ({ ...prev, districts: "" }));
    }
  };

  const set = (field: keyof PitchForm, value: string | boolean | File[] | File | null) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validateForm = (): boolean => {
    const e: FormErrors = {};
    if (!form.officialName.trim()) e.officialName = "Official name is required";
    if (!form.designation.trim()) e.designation = "Designation is required";
    if (!form.department.trim()) e.department = "Department is required";
    if (!form.officeName.trim()) e.officeName = "Office name is required";
    if (!form.serviceClass) e.serviceClass = "Service class is required";
    if (!form.mobile.trim() || !/^[6-9]\d{9}$/.test(form.mobile)) e.mobile = "Valid 10-digit mobile is required";
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Valid email is required";
    if (form.divisions.length === 0) e.divisions = "At least one division must be selected";
    if (form.districts.length === 0) e.districts = "At least one district must be selected";
    if (!form.exactLocation.trim()) e.exactLocation = "Exact location is required";
    if (!form.csrRequirement.trim()) e.csrRequirement = "CSR requirement is required";
    const words = form.csrRequirement.trim().split(/\s+/).filter(Boolean).length;
    if (words > 200) e.csrRequirement = "Requirement must not exceed 200 words";
    if (!form.estimatedCost.trim() || Number.isNaN(parseFloat(form.estimatedCost))) e.estimatedCost = "Valid estimated cost is required";
    if (!form.govtFundDeclaration) e.govtFundDeclaration = "You must declare government fund status";
    if ((form.serviceClass === "CLASS_1" || form.serviceClass === "CLASS_2") && form.certificationType !== "SELF") {
      e.certificationType = "Class-1 and Class-2 officials must use self certification";
    }
    if (form.serviceClass === "BELOW_CLASS_2" && form.certificationType !== "HOD") {
      e.certificationType = "below Class-2 officials must use HOD certification";
    }
    if (form.certificationType === "HOD" && !form.hodDocument) {
      e.hodDocument = "HOD certification document is required";
    }
    if (form.geoTaggedPhotos.length < 2) e.geoTaggedPhotos = "At least 2 geo-tagged photos are required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handlePhotoUpload = (ev: React.ChangeEvent<HTMLInputElement>) => {
    if (ev.target.files) {
      const list = Array.from(ev.target.files);
      set("geoTaggedPhotos", [...form.geoTaggedPhotos, ...list]);
    }
  };

  const removePhoto = (index: number) => {
    set("geoTaggedPhotos", form.geoTaggedPhotos.filter((_, i) => i !== index));
  };

  const handleHodDocumentUpload = (ev: React.ChangeEvent<HTMLInputElement>) => {
    if (ev.target.files && ev.target.files[0]) set("hodDocument", ev.target.files[0]);
  };

  const handleSupportingDocumentsUpload = (ev: React.ChangeEvent<HTMLInputElement>) => {
    if (ev.target.files) {
      const files = Array.from(ev.target.files);
      setForm((prev) => ({
        ...prev,
        supportingDocuments: [...prev.supportingDocuments, ...files],
      }));
    }
  };

  const removeSupportingDocument = (index: number) => {
    setForm((prev) => ({
      ...prev,
      supportingDocuments: prev.supportingDocuments.filter((_, i) => i !== index),
    }));
  };

  // Placeholder uploader (dev): mirrors the retired public form.
  const uploadFile = async (file: File): Promise<string> =>
    `https://dev.mahacsr.local/uploads/${encodeURIComponent(file.name)}`;

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    try {
      const photoUrls: string[] = [];
      for (const photo of form.geoTaggedPhotos) photoUrls.push(await uploadFile(photo));
      let hodCertificationDocument = "";
      if (form.hodDocument) hodCertificationDocument = await uploadFile(form.hodDocument);

      const supportingDocumentUrls: string[] = [];
      for (const doc of form.supportingDocuments) {
        supportingDocumentUrls.push(await uploadFile(doc));
      }

      const response = await apiFetch<any>("/government-pitches", {
        method: "POST",
        body: JSON.stringify({
          officialName: form.officialName,
          designation: form.designation,
          department: form.department,
          officeName: form.officeName,
          serviceClass: form.serviceClass,
          mobile: form.mobile,
          email: form.email,
          divisions: form.divisions,
          districts: form.districts,
          cities: form.cities,
          talukas: form.talukas,
          district: form.districts[0] || "",
          taluka: form.talukas.join(", ") || "",
          exactLocation: form.exactLocation,
          csrRequirement: form.csrRequirement,
          estimatedCost: parseFloat(form.estimatedCost),
          govtFundDeclaration: form.govtFundDeclaration,
          certificationType: form.certificationType,
          hodCertificationDocument,
          supportingDocuments: supportingDocumentUrls,
          photos: photoUrls.map((fileUrl, index) => ({
            fileUrl,
            latitude: 18.5204 + index / 1000,
            longitude: 73.8567 + index / 1000,
            capturedAt: new Date().toISOString(),
          })),
        }),
      });
      setReferenceId(
        response.pitchReferenceId ??
          response.pitch?.pitchReferenceId ??
          response.data?.pitch?.pitchReferenceId ??
          ""
      );
      setSubmitted(true);
    } catch (err: any) {
      setErrors({ submit: err?.message || "Failed to submit pitch. Please try again." });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setLoading(false);
    }
  };

  const wordCount = form.csrRequirement.trim().split(/\s+/).filter(Boolean).length;
  const certOptions = getCertificationOptions(form.serviceClass);

  if (submitted) {
    return (
      <GovPortalLayout userRole="GOVERNMENT_OFFICER">
        <div style={{ maxWidth: 800, margin: "0 auto", padding: 20 }}>
          <GovPageHeader title="Pitch Submitted Successfully" breadcrumb="Home / Pitches / Create" />
          <GovCard className="mt-4">
            <GovCardBody className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-[#14274e] mb-2">Your development pitch has been submitted</h2>
              <p className="text-slate-600 mb-6">
                A CSR Relationship Manager will be auto-assigned and will verify your pitch within the SLA window.
              </p>
              {referenceId && (
                <div className="bg-slate-50 border border-slate-200 rounded p-4 mb-6" style={{ maxWidth: 400, margin: "0 auto 24px" }}>
                  <p className="text-sm text-slate-500 mb-1">Your Pitch Reference ID</p>
                  <p className="text-lg font-bold text-[#14274e]">{referenceId}</p>
                </div>
              )}
              <div className="flex gap-3 justify-center">
                <GovButton variant="secondary" onClick={() => router.push("/department/pitches")}>View My Pitches</GovButton>
                <GovButton variant="primary" onClick={() => window.location.reload()}>Submit Another</GovButton>
              </div>
            </GovCardBody>
          </GovCard>
        </div>
      </GovPortalLayout>
    );
  }

  return (
    <GovPortalLayout userRole="GOVERNMENT_OFFICER">
      <div style={{ maxWidth: 900, margin: "0 auto", padding: 20 }}>
        <Link href="/department/pitches" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800 mb-3">
          <ArrowLeft size={16} /> Back to My Pitches
        </Link>
        <GovPageHeader
          title="Create Development Pitch"
          description="Submit a development need for CSR convergence. A Relationship Manager is auto-assigned on submission."
          breadcrumb="Home / Pitches / Create"
        />

        {errors.submit && <GovAlert variant="danger" className="mt-4">{errors.submit}</GovAlert>}

        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-5">
          <GovCard>
            <GovCardHeader><GovCardTitle>Official Details</GovCardTitle></GovCardHeader>
            <GovCardBody>
              <div className="gov-grid-2">
                <GovInput label="Official Name" required value={form.officialName} error={errors.officialName} onChange={(e) => set("officialName", e.target.value)} />
                <GovInput label="Designation" required value={form.designation} error={errors.designation} onChange={(e) => set("designation", e.target.value)} />
                <GovInput label="Department" required value={form.department} error={errors.department} onChange={(e) => set("department", e.target.value)} />
                <GovInput label="Office Name" required value={form.officeName} error={errors.officeName} onChange={(e) => set("officeName", e.target.value)} />
                <GovSelect label="Service Class" required value={form.serviceClass} error={errors.serviceClass}
                  onChange={(e) => { set("serviceClass", e.target.value); set("certificationType", ""); }} options={SERVICE_CLASSES} />
                <GovSelect label="Certification Type" required value={form.certificationType} error={errors.certificationType}
                  onChange={(e) => set("certificationType", e.target.value)} options={certOptions} />
                <GovInput label="Mobile" required value={form.mobile} error={errors.mobile} onChange={(e) => set("mobile", e.target.value)} />
                <GovInput label="Email" required value={form.email} error={errors.email} onChange={(e) => set("email", e.target.value)} />
              </div>
            </GovCardBody>
          </GovCard>

          {/* Location Selection */}
          <GovCard className="relative z-30 overflow-visible">
            <GovCardHeader>
              <GovCardTitle>Location</GovCardTitle>
            </GovCardHeader>
            <GovCardBody className="overflow-visible">
              {errors.divisions && (
                <GovAlert variant="danger" className="mb-3">
                  {errors.divisions}
                </GovAlert>
              )}
              {errors.districts && (
                <GovAlert variant="danger" className="mb-3">
                  {errors.districts}
                </GovAlert>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                {/* Division Filter */}
                <MultiSelectField
                  label="Preferred Division(s)"
                  required
                  values={form.divisions}
                  options={Object.keys(DIVISION_TO_DISTRICTS)}
                  onChange={handleDivisionsChange}
                  placeholder="Select division(s)..."
                />

                {/* District Filter */}
                <MultiSelectField
                  label="Preferred District(s)"
                  required
                  values={form.districts}
                  options={form.divisions.flatMap(div => DIVISION_TO_DISTRICTS[div] || [])}
                  onChange={handleDistrictsChange}
                  placeholder={form.divisions.length === 0 ? "Select division first..." : "Select district(s)..."}
                />

                {/* City Filter */}
                <MultiSelectField
                  label="Preferred City/Cities (Optional)"
                  values={form.cities}
                  options={
                    districtsList
                      .filter(d => form.districts.includes(d.name))
                      .flatMap(d => d.cities || [])
                  }
                  onChange={(values) => setForm(prev => ({ ...prev, cities: values }))}
                  placeholder={form.districts.length === 0 ? "Select district first..." : "Select city/cities..."}
                />

                {/* Taluka Filter */}
                <MultiSelectField
                  label="Preferred Taluka(s) (Optional)"
                  values={form.talukas}
                  options={
                    districtsList
                      .filter(d => form.districts.includes(d.name))
                      .flatMap(d => d.talukas || [])
                  }
                  onChange={(values) => setForm(prev => ({ ...prev, talukas: values }))}
                  placeholder={form.districts.length === 0 ? "Select district first..." : "Select taluka(s)..."}
                />
              </div>

              <div className="mt-4">
                <GovTextarea
                  label="Exact Location Details"
                  required
                  value={form.exactLocation}
                  error={errors.exactLocation}
                  onChange={(e) => set("exactLocation", e.target.value)}
                  placeholder="Village, landmark, survey number, building details..."
                  rows={2}
                />
              </div>
            </GovCardBody>
          </GovCard>

          <GovCard>
            <GovCardHeader><GovCardTitle>Requirement & Budget</GovCardTitle></GovCardHeader>
            <GovCardBody>
              <div className="flex flex-col gap-4">
                <div>
                  <GovTextarea label="CSR Requirement (max 200 words)" required value={form.csrRequirement} error={errors.csrRequirement}
                    onChange={(e) => set("csrRequirement", e.target.value)} rows={5} />
                  <p className={`text-xs mt-1 ${wordCount > 200 ? "text-rose-600" : "text-slate-400"}`}>{wordCount}/200 words</p>
                </div>
                <GovInput label="Estimated Cost (₹)" required type="number" value={form.estimatedCost} error={errors.estimatedCost} onChange={(e) => set("estimatedCost", e.target.value)} />
                <label className="flex items-start gap-2 text-sm text-slate-700">
                  <input type="checkbox" className="mt-1" checked={form.govtFundDeclaration} onChange={(e) => set("govtFundDeclaration", e.target.checked)} />
                  <span>I declare that no government fund is currently available/sanctioned for this specific requirement.</span>
                </label>
                {errors.govtFundDeclaration && <p className="text-xs text-rose-600">{errors.govtFundDeclaration}</p>}
              </div>
            </GovCardBody>
          </GovCard>

          {/* Supporting Documents Section */}
          <GovCard>
            <GovCardHeader>
              <GovCardTitle>Specifications & Supporting Documents (Optional)</GovCardTitle>
            </GovCardHeader>
            <GovCardBody>
              <div className="flex flex-col gap-3">
                <label className="gov-label flex items-center gap-2">
                  <Paperclip size={16} /> Attach Supporting Documents / Technical Specifications
                </label>
                <p className="text-xs text-slate-500">
                  Upload project proposals, cost estimates, site layout blueprints, DPR, or approval letters (PDF, DOCX, XLSX, images).
                </p>
                <input
                  type="file"
                  accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,image/*"
                  multiple
                  onChange={handleSupportingDocumentsUpload}
                  className="block mt-1 text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-[#14274e] file:text-white hover:file:bg-[#14274e]/90 cursor-pointer"
                />
                {form.supportingDocuments.length > 0 && (
                  <ul className="mt-3 flex flex-col gap-2">
                    {form.supportingDocuments.map((doc, i) => (
                      <li key={i} className="flex items-center justify-between text-sm bg-slate-50 border border-slate-200 rounded px-3 py-2">
                        <div className="flex items-center gap-2 truncate">
                          <FileText size={16} className="text-[#14274e] shrink-0" />
                          <span className="truncate font-medium text-slate-800">{doc.name}</span>
                          <span className="text-xs text-slate-400">({(doc.size / 1024).toFixed(1)} KB)</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeSupportingDocument(i)}
                          className="text-rose-600 hover:text-rose-800 text-xs font-semibold flex items-center gap-1 shrink-0 ml-2"
                        >
                          <Trash2 size={14} /> Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </GovCardBody>
          </GovCard>

          <GovCard>
            <GovCardHeader><GovCardTitle>Geo-tagged Photos & Certification</GovCardTitle></GovCardHeader>
            <GovCardBody>
              <div className="flex flex-col gap-4">
                <div>
                  <label className="gov-label flex items-center gap-2"><Camera size={16} /> Site Photos (min 2)</label>
                  <input type="file" accept="image/*" multiple onChange={handlePhotoUpload} className="block mt-1 text-sm" />
                  {errors.geoTaggedPhotos && <p className="text-xs text-rose-600 mt-1">{errors.geoTaggedPhotos}</p>}
                  {form.geoTaggedPhotos.length > 0 && (
                    <ul className="mt-2 flex flex-col gap-1">
                      {form.geoTaggedPhotos.map((p, i) => (
                        <li key={i} className="flex items-center justify-between text-sm bg-slate-50 border border-slate-200 rounded px-3 py-1.5">
                          <span className="truncate">{p.name}</span>
                          <button type="button" onClick={() => removePhoto(i)} className="text-rose-600 text-xs font-semibold">Remove</button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                {form.certificationType === "HOD" && (
                  <div>
                    <label className="gov-label">HOD Certification Document</label>
                    <input type="file" accept="application/pdf,image/*" onChange={handleHodDocumentUpload} className="block mt-1 text-sm" />
                    {errors.hodDocument && <p className="text-xs text-rose-600 mt-1">{errors.hodDocument}</p>}
                    {form.hodDocument && <p className="text-xs text-slate-500 mt-1">{form.hodDocument.name}</p>}
                  </div>
                )}
              </div>
            </GovCardBody>
          </GovCard>

          <div className="flex justify-end gap-3">
            <GovButton type="button" variant="secondary" onClick={() => router.push("/department/pitches")}>Cancel</GovButton>
            <GovButton type="submit" variant="primary" disabled={loading}>
              {loading ? <span className="inline-flex items-center gap-2"><Loader2 size={16} className="animate-spin" /> Submitting…</span> : "Submit Pitch"}
            </GovButton>
          </div>
        </form>
      </div>
    </GovPortalLayout>
  );
}
