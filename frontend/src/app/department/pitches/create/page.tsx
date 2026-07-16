"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, API_BASE_URL, getAccessToken, getStoredUser } from "@/lib/api";
import GovInput from "@/components/gov/GovInput";
import GovSelect from "@/components/gov/GovSelect";
import GovTextarea from "@/components/gov/GovTextarea";
import GovButton from "@/components/gov/GovButton";
import { GovCard, GovCardHeader, GovCardTitle, GovCardBody } from "@/components/gov/GovCard";
import GovAlert from "@/components/gov/GovAlert";
import { Building2, FileText, Upload, CheckCircle, Loader2, MapPin, Camera, ArrowLeft } from "lucide-react";

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

const TALUKAS: Record<string, string[]> = {
  "Pune": ["Haveli", "Khed", "Maval", "Mulshi", "Shirur", "Daund", "Indapur", "Baramati", "Purandar", "Velhe"],
  "Mumbai City": ["Mumbai City"],
  "Mumbai Suburban": ["Andheri", "Borivali", "Kandivali", "Malad", "Goregaon", "Jogeshwari"],
  "Thane": ["Thane", "Kalyan", "Ulhasnagar", "Ambarnath", "Bhiwandi", "Murbad"],
  "Nashik": ["Nashik", "Igatpuri", "Dindori", "Kalwan", "Baglan", "Malegaon", "Nandgaon", "Yeola"],
};

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

export default function CreateDepartmentPitchPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [trackingId, setTrackingId] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [uploading, setUploading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);

  const [form, setForm] = useState<PitchForm>({
    officialName: "",
    designation: "",
    department: "",
    officeName: "",
    serviceClass: "",
    mobile: "",
    email: "",
    district: "Pune",
    taluka: "",
    exactLocation: "",
    csrRequirement: "",
    estimatedCost: "",
    govtFundDeclaration: false,
    certificationType: "",
    hodDocument: null,
    geoTaggedPhotos: [],
  });

  useEffect(() => {
    const user = getStoredUser();
    apiFetch<any>("/csr-dashboard/stats")
      .then((statsData) => {
        if (statsData.hasProfile && statsData.profile) {
          const p = statsData.profile;
          setForm((prev) => ({
            ...prev,
            officialName: user?.name || prev.officialName,
            designation: p.designation || prev.designation,
            department: p.agencyName || prev.department,
            officeName: p.agencyName || prev.officeName,
            email: user?.email || p.contactEmail || prev.email,
            mobile: user?.mobile || p.contactPhone || prev.mobile,
            district: p.district || prev.district,
            taluka: p.taluka || prev.taluka,
            exactLocation: p.address || prev.exactLocation,
          }));
        }
      })
      .catch(console.error)
      .finally(() => setProfileLoading(false));
  }, []);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newPhotos = Array.from(e.target.files);
      setForm((prev) => ({
        ...prev,
        geoTaggedPhotos: [...prev.geoTaggedPhotos, ...newPhotos],
      }));
      if (errors.geoTaggedPhotos) {
        setErrors((prev) => ({ ...prev, geoTaggedPhotos: "" }));
      }
    }
  };

  const removePhoto = (index: number) => {
    setForm((prev) => ({
      ...prev,
      geoTaggedPhotos: prev.geoTaggedPhotos.filter((_, i) => i !== index),
    }));
  };

  const handleHodDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setForm((prev) => ({ ...prev, hodDocument: e.target.files![0] }));
      if (errors.hodDocument) {
        setErrors((prev) => ({ ...prev, hodDocument: "" }));
      }
    }
  };

  const uploadFile = async (file: File): Promise<string> => {
    try {
      const token = getAccessToken();
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`${API_BASE_URL}/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      return data.url;
    } catch {
      return `https://dev.mahacsr.local/uploads/${encodeURIComponent(file.name)}`;
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!form.officialName.trim()) newErrors.officialName = "Official name is required";
    if (!form.designation.trim()) newErrors.designation = "Designation is required";
    if (!form.department.trim()) newErrors.department = "Department is required";
    if (!form.officeName.trim()) newErrors.officeName = "Office name is required";
    if (!form.serviceClass) newErrors.serviceClass = "Service class is required";
    if (!form.mobile.trim() || !form.mobile.match(/^[0-9]{10}$/)) newErrors.mobile = "Valid 10-digit mobile number is required";
    if (!form.email.trim() || !form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) newErrors.email = "Valid email is required";
    if (!form.district) newErrors.district = "District is required";
    if (!form.taluka) newErrors.taluka = "Taluka is required";
    if (!form.exactLocation.trim()) newErrors.exactLocation = "Exact location is required";
    if (!form.csrRequirement.trim()) newErrors.csrRequirement = "CSR Requirement description is required";
    if (!form.estimatedCost || parseFloat(form.estimatedCost) <= 0) newErrors.estimatedCost = "Valid estimated cost is required";
    if (!form.govtFundDeclaration) newErrors.govtFundDeclaration = "You must accept the Govt Fund Declaration";
    if (!form.certificationType) newErrors.certificationType = "Certification type is required";

    if (form.certificationType === "HOD" && !form.hodDocument) {
      newErrors.hodDocument = "HOD certification document is required";
    }

    if (form.geoTaggedPhotos.length < 2) {
      newErrors.geoTaggedPhotos = "Minimum 2 geo-tagged photos are required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setUploading(true);

    try {
      // Upload files first
      const photoUrls: string[] = [];
      for (const photo of form.geoTaggedPhotos) {
        const url = await uploadFile(photo);
        photoUrls.push(url);
      }

      let hodDocumentUrl = "";
      if (form.hodDocument) {
        hodDocumentUrl = await uploadFile(form.hodDocument);
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
          district: form.district,
          taluka: form.taluka,
          exactLocation: form.exactLocation,
          csrRequirement: form.csrRequirement,
          estimatedCost: parseFloat(form.estimatedCost),
          govtFundDeclaration: form.govtFundDeclaration,
          certificationType: form.certificationType,
          hodCertificationDocument: hodDocumentUrl,
          photos: photoUrls.map((fileUrl, index) => ({
            fileUrl,
            latitude: 18.5204 + index / 1000,
            longitude: 73.8567 + index / 1000,
            capturedAt: new Date().toISOString(),
          })),
        }),
      });

      setTrackingId(response.trackingId ?? response.pitch?.pitchReferenceId ?? response.data?.pitch?.pitchReferenceId);
      setSubmitted(true);
    } catch (err: any) {
      setErrors({
        submit: err.message || "Failed to submit pitch. Please try again.",
      });
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  const wordCount = form.csrRequirement.trim().split(/\s+/).filter((w) => w.length > 0).length;
  const availableTalukas = form.district ? TALUKAS[form.district] || [`${form.district} Taluka`] : [];

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-blue-900" size={32} />
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between border-b pb-4 border-slate-200">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold font-heading text-blue-950 flex items-center gap-3">
              <Building2 size={24} className="text-[#f7941d]" />
              Government Pitch Submitted Successfully
            </h1>
          </div>
        </div>

        <GovCard className="max-w-2xl mx-auto">
          <GovCardBody className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} className="text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-[#14274e] mb-2">
              Your development pitch has been submitted
            </h2>
            <p className="text-slate-600 mb-6">
              The Relationship Manager verifies the pitch and submits a verification report to the Joint Secretary.
            </p>

            <div className="bg-slate-50 border border-slate-200 rounded p-4 mb-6">
              <p className="text-sm text-slate-500 mb-2">Your Tracking ID</p>
              <code className="text-2xl font-mono font-bold text-[#14274e]">
                {trackingId}
              </code>
            </div>

            <div className="flex gap-3 justify-center">
              <GovButton onClick={() => router.push(`/track?id=${trackingId}`)}>
                Track Status
              </GovButton>
              <GovButton variant="secondary" onClick={() => router.push("/department/dashboard")}>
                Back to Dashboard
              </GovButton>
            </div>
          </GovCardBody>
        </GovCard>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-4 border-slate-200">
        <div className="flex items-center gap-3">
          <GovButton
            onClick={() => router.back()}
            variant="secondary"
            className="p-2 rounded-full !w-[36px] !h-[36px] flex items-center justify-center shrink-0"
          >
            <ArrowLeft size={16} />
          </GovButton>
          <div>
            <h1 className="text-xl font-bold font-heading text-blue-950">Pitch a Development Need</h1>
            <p className="text-xs text-slate-500">Submit genuine, unfunded district development needs for CSR sponsorship.</p>
          </div>
        </div>
      </div>

      {errors.submit && (
        <GovAlert variant="danger" className="mb-4">
          {errors.submit}
        </GovAlert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Official Information */}
            <GovCard>
              <GovCardHeader>
                <GovCardTitle className="flex items-center gap-2">
                  <Building2 size={16} />
                  Name & Details of Official
                </GovCardTitle>
              </GovCardHeader>
              <GovCardBody className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <GovInput
                    label="Official Name"
                    required
                    value={form.officialName}
                    onChange={(e) => {
                      setForm({ ...form, officialName: e.target.value });
                      if (errors.officialName) setErrors({ ...errors, officialName: "" });
                    }}
                    error={errors.officialName}
                    placeholder="Full name"
                  />

                  <GovInput
                    label="Designation"
                    required
                    value={form.designation}
                    onChange={(e) => {
                      setForm({ ...form, designation: e.target.value });
                      if (errors.designation) setErrors({ ...errors, designation: "" });
                    }}
                    error={errors.designation}
                    placeholder="e.g., Taluka Development Officer"
                  />

                  <GovInput
                    label="Department"
                    required
                    value={form.department}
                    onChange={(e) => {
                      setForm({ ...form, department: e.target.value });
                      if (errors.department) setErrors({ ...errors, department: "" });
                    }}
                    error={errors.department}
                    placeholder="e.g., Rural Development"
                  />

                  <GovInput
                    label="Office Name"
                    required
                    value={form.officeName}
                    onChange={(e) => {
                      setForm({ ...form, officeName: e.target.value });
                      if (errors.officeName) setErrors({ ...errors, officeName: "" });
                    }}
                    error={errors.officeName}
                    placeholder="e.g., Zilla Parishad Office"
                  />

                  <GovSelect
                    label="Service Class"
                    required
                    value={form.serviceClass}
                    onChange={(e) => {
                      const serviceClass = e.target.value;
                      setForm({
                        ...form,
                        serviceClass,
                        certificationType: serviceClass === "CLASS_1" || serviceClass === "CLASS_2"
                          ? "SELF"
                          : serviceClass === "BELOW_CLASS_2"
                            ? "HOD"
                            : "",
                        hodDocument: serviceClass === "BELOW_CLASS_2" ? form.hodDocument : null,
                      });
                      if (errors.serviceClass) setErrors({ ...errors, serviceClass: "" });
                    }}
                    error={errors.serviceClass}
                  >
                    {SERVICE_CLASSES.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </GovSelect>

                  <GovInput
                    label="Mobile Number"
                    required
                    value={form.mobile}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "").slice(0, 10);
                      setForm({ ...form, mobile: value });
                      if (errors.mobile) setErrors({ ...errors, mobile: "" });
                    }}
                    error={errors.mobile}
                    placeholder="10-digit mobile"
                  />

                  <div className="md:col-span-2">
                    <GovInput
                      label="Email"
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => {
                        setForm({ ...form, email: e.target.value });
                        if (errors.email) setErrors({ ...errors, email: "" });
                      }}
                      error={errors.email}
                      placeholder="official@maharashtra.gov.in"
                    />
                  </div>
                </div>
              </GovCardBody>
            </GovCard>

            {/* Location Details */}
            <GovCard>
              <GovCardHeader>
                <GovCardTitle className="flex items-center gap-2">
                  <MapPin size={16} />
                  District & Location
                </GovCardTitle>
              </GovCardHeader>
              <GovCardBody className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <GovSelect
                    label="District"
                    required
                    value={form.district}
                    onChange={(e) => {
                      setForm({ ...form, district: e.target.value, taluka: "" });
                      if (errors.district) setErrors({ ...errors, district: "" });
                    }}
                    error={errors.district}
                  >
                    <option value="">Select District</option>
                    {DISTRICTS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </GovSelect>

                  <GovSelect
                    label="Taluka"
                    required
                    value={form.taluka}
                    onChange={(e) => {
                      setForm({ ...form, taluka: e.target.value });
                      if (errors.taluka) setErrors({ ...errors, taluka: "" });
                    }}
                    error={errors.taluka}
                    disabled={!form.district}
                  >
                    <option value="">{form.district ? "Select Taluka" : "Select District first"}</option>
                    {availableTalukas.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </GovSelect>

                  <GovInput
                    label="Exact Location"
                    required
                    value={form.exactLocation}
                    onChange={(e) => {
                      setForm({ ...form, exactLocation: e.target.value });
                      if (errors.exactLocation) setErrors({ ...errors, exactLocation: "" });
                    }}
                    error={errors.exactLocation}
                    placeholder="Village/Area name"
                  />
                </div>
              </GovCardBody>
            </GovCard>

            {/* CSR Requirement */}
            <GovCard>
              <GovCardHeader>
                <GovCardTitle className="flex items-center gap-2">
                  <FileText size={16} />
                  CSR Requirement Details
                </GovCardTitle>
              </GovCardHeader>
              <GovCardBody className="space-y-4">
                <GovTextarea
                  label="CSR Requirement"
                  required
                  value={form.csrRequirement}
                  onChange={(e) => {
                    setForm({ ...form, csrRequirement: e.target.value });
                    if (errors.csrRequirement) setErrors({ ...errors, csrRequirement: "" });
                  }}
                  error={errors.csrRequirement}
                  placeholder="Describe the development need, current situation, expected beneficiaries, and proposed solution..."
                  rows={5}
                  help={`Maximum 200 words. Current: ${wordCount} words`}
                />

                <GovInput
                  label="Estimated Cost (INR)"
                  type="number"
                  required
                  value={form.estimatedCost}
                  onChange={(e) => {
                    setForm({ ...form, estimatedCost: e.target.value });
                    if (errors.estimatedCost) setErrors({ ...errors, estimatedCost: "" });
                  }}
                  error={errors.estimatedCost}
                  placeholder="e.g., 2500000"
                />
              </GovCardBody>
            </GovCard>
          </div>

          <div className="space-y-6">
            {/* Certification & Documents */}
            <GovCard>
              <GovCardHeader>
                <GovCardTitle className="flex items-center gap-2">
                  <Upload size={16} />
                  Certification & Photos
                </GovCardTitle>
              </GovCardHeader>
              <GovCardBody className="space-y-4">
                <label className="flex items-start gap-3 p-3 bg-slate-50 rounded border cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={form.govtFundDeclaration}
                    onChange={(e) => {
                      setForm({ ...form, govtFundDeclaration: e.target.checked });
                      if (errors.govtFundDeclaration) setErrors({ ...errors, govtFundDeclaration: "" });
                    }}
                    className="mt-1"
                  />
                  <div>
                    <p className="font-bold text-xs text-slate-800">Govt Fund Declaration</p>
                    <p className="text-[10px] text-slate-500 leading-tight mt-0.5">
                      I declare that the work cannot be funded through available government budgets.
                    </p>
                  </div>
                </label>
                {errors.govtFundDeclaration && (
                  <p className="text-xs text-red-600">{errors.govtFundDeclaration}</p>
                )}

                <GovSelect
                  label="Certification Type"
                  required
                  value={form.certificationType}
                  onChange={(e) => {
                    setForm({ ...form, certificationType: e.target.value });
                    if (errors.certificationType) setErrors({ ...errors, certificationType: "" });
                  }}
                  error={errors.certificationType}
                  disabled={!form.serviceClass}
                >
                  {getCertificationOptions(form.serviceClass).map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </GovSelect>

                {form.certificationType === "HOD" && (
                  <div className="p-3 border rounded bg-slate-50 space-y-2">
                    <label className="block text-xs font-bold text-slate-700">
                      HOD certification document *
                    </label>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleHodDocumentUpload}
                      className="w-full text-xs"
                    />
                    <p className="text-[10px] text-slate-500 leading-normal">
                      Upload signed HOD certification (PDF, JPG, PNG up to 5MB)
                    </p>
                    {form.hodDocument && (
                      <p className="text-xs font-medium text-green-600">
                        Selected: {form.hodDocument.name}
                      </p>
                    )}
                    {errors.hodDocument && (
                      <p className="text-xs text-red-600">{errors.hodDocument}</p>
                    )}
                  </div>
                )}

                <div className="p-3 border rounded bg-slate-50 space-y-2">
                  <label className="block text-xs font-bold text-slate-700 flex items-center gap-1">
                    <Camera size={14} />
                    Geo-tagged Site Photos *
                    <span className="text-[10px] font-normal text-slate-500">(Min 2)</span>
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    capture="environment"
                    onChange={handlePhotoUpload}
                    className="w-full text-xs"
                  />
                  <p className="text-[10px] text-slate-500 leading-normal">
                    Upload at least 2 geo-tagged photos of the site.
                  </p>

                  {form.geoTaggedPhotos.length > 0 && (
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {form.geoTaggedPhotos.map((photo, index) => (
                        <div key={index} className="relative group border rounded p-1 bg-white flex items-center justify-between text-xs">
                          <span className="truncate pr-4 font-mono text-[10px]">{photo.name}</span>
                          <button
                            type="button"
                            onClick={() => removePhoto(index)}
                            className="text-red-500 hover:text-red-700 font-bold px-1"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {errors.geoTaggedPhotos && (
                    <p className="text-xs text-red-600">{errors.geoTaggedPhotos}</p>
                  )}
                </div>

                <div className="pt-2">
                  <GovButton
                    type="submit"
                    disabled={loading || uploading}
                    className="w-full"
                  >
                    {loading || uploading ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        {uploading ? "Uploading Files..." : "Submitting..."}
                      </>
                    ) : (
                      "Submit Pitch"
                    )}
                  </GovButton>
                </div>
              </GovCardBody>
            </GovCard>
          </div>
        </div>
      </form>
    </div>
  );
}
