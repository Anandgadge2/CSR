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
import { Building2, CheckCircle, Loader2, Camera, ArrowLeft } from "lucide-react";
import Link from "next/link";

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

const DISTRICTS = [
  "Ahmednagar", "Akola", "Amravati", "Aurangabad", "Beed", "Bhandara", "Buldhana",
  "Chandrapur", "Dhule", "Gadchiroli", "Gondia", "Hingoli", "Jalgaon", "Jalna",
  "Kolhapur", "Latur", "Mumbai City", "Mumbai Suburban", "Nagpur", "Nanded",
  "Nandurbar", "Nashik", "Osmanabad", "Palghar", "Parbhani", "Pune", "Raigad",
  "Ratnagiri", "Sangli", "Satara", "Sindhudurg", "Solapur", "Thane", "Wardha",
  "Washim", "Yavatmal"
];

interface PitchForm {
  officialName: string;
  designation: string;
  department: string;
  officeName: string;
  serviceClass: string;
  mobile: string;
  email: string;
  district: string;
  taluka: string;
  exactLocation: string;
  csrRequirement: string;
  estimatedCost: string;
  govtFundDeclaration: boolean;
  certificationType: string;
  hodDocument?: File | null;
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
    district: "",
    taluka: "",
    exactLocation: "",
    csrRequirement: "",
    estimatedCost: "",
    govtFundDeclaration: false,
    certificationType: "",
    hodDocument: null,
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
        district: u.organization?.district || u.assignedDistrict || prev.district,
      }));
    } catch {
      /* ignore malformed session */
    }
  }, []);

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
    if (!form.district) e.district = "District is required";
    if (!form.taluka.trim()) e.taluka = "Taluka is required";
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

  // Placeholder uploader (dev): mirrors the retired public form. Swap for the
  // real Cloudinary/upload endpoint when wiring production storage.
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
          district: form.district,
          taluka: form.taluka,
          exactLocation: form.exactLocation,
          csrRequirement: form.csrRequirement,
          estimatedCost: parseFloat(form.estimatedCost),
          govtFundDeclaration: form.govtFundDeclaration,
          certificationType: form.certificationType,
          hodCertificationDocument,
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

          <GovCard>
            <GovCardHeader><GovCardTitle>Location</GovCardTitle></GovCardHeader>
            <GovCardBody>
              <div className="gov-grid-2">
                <GovSelect label="District" required value={form.district} error={errors.district}
                  onChange={(e) => set("district", e.target.value)}
                  options={[{ value: "", label: "Select District" }, ...DISTRICTS.map((d) => ({ value: d, label: d }))]} />
                <GovInput label="Taluka" required value={form.taluka} error={errors.taluka} onChange={(e) => set("taluka", e.target.value)} />
                <div className="md:col-span-2">
                  <GovTextarea label="Exact Location" required value={form.exactLocation} error={errors.exactLocation} onChange={(e) => set("exactLocation", e.target.value)} rows={2} />
                </div>
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
