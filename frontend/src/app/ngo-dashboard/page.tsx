"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  FolderPlus, Coins, Award, Clock, FileCheck2, Calendar as CalIcon, 
  AlertTriangle, FileText, ArrowUpRight, UploadCloud, Bell, 
  Settings as SettingsIcon, Layers, Users, Image as ImageIcon, CheckCircle2, X,
  Building2, Landmark, Compass, Sparkles, BarChart2, BookOpen, ShieldAlert,
  Send, ShieldCheck, HelpCircle, FileDown, PlusCircle, Trash, Folder, Download,
  Calendar, Eye, TrendingUp
} from "lucide-react";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatsCard } from "@/components/ui/StatsCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { Modal } from "@/components/ui/Modal";
import dynamic from "next/dynamic";
import { apiFetch } from "@/lib/api";

const FundingGrowthChart = dynamic(() => import("@/components/AnalyticsCharts").then(mod => mod.FundingGrowthChart), {
  ssr: false,
  loading: () => <div className="h-[250px] w-full flex items-center justify-center bg-gray-50 border border-gray-200 rounded-xl"><div className="w-6 h-6 rounded-full border-2 border-slate-700 border-t-transparent animate-spin" /></div>
});

const SdgStatsChart = dynamic(() => import("@/components/AnalyticsCharts").then(mod => mod.SdgStatsChart), {
  ssr: false,
  loading: () => <div className="h-[250px] w-full flex items-center justify-center bg-gray-50 border border-gray-200 rounded-xl"><div className="w-6 h-6 rounded-full border-2 border-slate-700 border-t-transparent animate-spin" /></div>
});

type DashboardTab = 
  | "overview" | "profile" | "projects" | "drafts" | "submitted" | "approved"
  | "milestones" | "funding" | "reports" | "impact" | "beneficiaries" | "volunteers"
  | "documents" | "compliance" | "calendar" | "gallery" | "audit" | "settings" | "analytics";

export default function NgoDashboard({ params }: { params?: { tab?: string } }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<DashboardTab>("overview");

  useEffect(() => {
    if (params?.tab) {
      setActiveTab(params.tab as DashboardTab);
    }
  }, [params?.tab]);

  const handleTabChange = (tab: DashboardTab) => {
    setActiveTab(tab);
    router.push(`/ngo-dashboard/${tab}`);
  };

  const [projects, setProjects] = useState([
    { id: "1", title: "Pune Zilla Parishad Smart Digital-Classrooms", budget: 3500000, funded: 0, completion: 0, status: "Submitted", district: "Pune", taluka: "Haveli", focusArea: "Education", description: "Providing smart screens, projectors, and digital curriculums for rural primary schools." },
    { id: "2", title: "Gadchiroli Watershed & Reforestation Initiative", budget: 2500000, funded: 1200000, completion: 40, status: "Funded", district: "Gadchiroli", taluka: "Aheri", focusArea: "Water Supply", description: "Harvesting rainwater using checks and bunds to replenish rural tribal water tables." }
  ]);

  const [newTitle, setNewTitle] = useState("");
  const [newBudget, setNewBudget] = useState("");
  const [newDistrict, setNewDistrict] = useState("Pune");
  const [newTaluka, setNewTaluka] = useState("");
  const [newFocus, setNewFocus] = useState("Education");

  const [beneficiaries, setBeneficiaries] = useState([
    { id: "b-1", name: "Ramesh Pawar", location: "Aheri, Gadchiroli", sector: "Water Supply", verifiedDate: "June 14, 2026" },
    { id: "b-2", name: "Sunita Gavit", location: "Mulshi, Pune", sector: "Education", verifiedDate: "June 10, 2026" }
  ]);
  const [bName, setBName] = useState("");
  const [bLoc, setBLoc] = useState("");
  const [bSec, setBSec] = useState("Water Supply");

  const [volunteers, setVolunteers] = useState([
    { id: "v-1", name: "Anil Deshmukh", role: "Field Coordinator", hours: 45 },
    { id: "v-2", name: "Pooja Patil", role: "Nutritionist", hours: 30 }
  ]);
  const [vName, setVName] = useState("");
  const [vRole, setVRole] = useState("Volunteer");

  const [selectedMilestoneProject, setSelectedMilestoneProject] = useState("2");
  const [evidenceFile, setEvidenceFile] = useState<string | null>(null);
  const [evidenceSubmitted, setEvidenceSubmitted] = useState(false);

  const [galleryImages, setGalleryImages] = useState([
    { title: "Check Dam Construction Aheri", date: "June 12, 2026", size: "1.2 MB" },
    { title: "Smart Screen Delivery Mulshi", date: "June 08, 2026", size: "850 KB" }
  ]);
  const [newImageTitle, setNewImageTitle] = useState("");

  // Documents
  const [documents, setDocuments] = useState([
    { name: "NGO_Registration_Deed_Sahyadri.pdf", type: "Registration", size: "3.2 MB", date: "April 12, 2021" },
    { name: "Darpan_Credential_Verify_2026.pdf", type: "Darpan", size: "1.5 MB", date: "May 20, 2024" },
    { name: "12A_Certificate_FY26.pdf", type: "12A", size: "1.1 MB", date: "June 02, 2022" },
    { name: "80G_Certificate_FY26.pdf", type: "80G", size: "950 KB", date: "June 02, 2022" }
  ]);
  const [docFilter, setDocFilter] = useState("All");

  // Calendar Milestones
  const calendarMilestones = [
    { date: "June 25, 2026", title: "Milestone 3 Field Inspection", project: "Gadchiroli Watershed", type: "Inspection" },
    { date: "July 15, 2026", title: "Milestone 2 Completion Proof Due", project: "Smart Classrooms Mulshi", type: "Submission" },
    { date: "August 01, 2026", title: "12A Exemption Form Filing Renewal", project: "Compliance Desk", type: "Renewal" }
  ];

  useEffect(() => {
    apiFetch<any[]>("/projects")
      .then((rows) => {
        if (rows.length === 0) return;
        setProjects(rows.map((project) => ({
          id: project.id,
          title: project.title,
          budget: Number(project.budgetRequested),
          funded: Number(project.budgetFunded || 0),
          completion: project.status === "COMPLETED" ? 100 : project.status === "FUNDED" ? 50 : 0,
          status: project.status
            .toLowerCase()
            .replace(/_/g, " ")
            .replace(/\b\w/g, (char: string) => char.toUpperCase()),
          district: project.district,
          taluka: project.taluka,
          focusArea: project.focusArea,
          description: project.description
        })));
      })
      .catch(() => {});
  }, []);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = await apiFetch<any>("/projects", {
        method: "POST",
        body: JSON.stringify({
          title: newTitle,
          description: `${newTitle} under ${newFocus} for ${newDistrict}, ${newTaluka || "Mulshi"}.`,
          focusArea: newFocus,
          sdgGoal: newFocus === "Education" ? "SDG 4" : newFocus === "Healthcare" ? "SDG 3" : "SDG 6",
          beneficiaryCount: 100,
          budgetRequested: Number(newBudget),
          district: newDistrict,
          taluka: newTaluka || "Mulshi",
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString()
        })
      });

      const newProj = {
        id: created.id,
        title: created.title,
        budget: Number(created.budgetRequested),
        funded: Number(created.budgetFunded || 0),
        completion: 0,
        status: "Draft",
        district: created.district,
        taluka: created.taluka,
        focusArea: created.focusArea,
        description: created.description
      };
      setProjects([newProj, ...projects]);
      setNewTitle("");
      setNewBudget("");
      setNewTaluka("");
      handleTabChange("projects");
    } catch (error: any) {
      alert(error.message || "Project creation failed");
    }
  };

  const handleAddBeneficiary = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bName || !bLoc) return;
    const newB = {
      id: `b-${beneficiaries.length + 1}`,
      name: bName,
      location: bLoc,
      sector: bSec,
      verifiedDate: "Just now"
    };
    setBeneficiaries([newB, ...beneficiaries]);
    setBName("");
    setBLoc("");
  };

  const handleAddVolunteer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vName) return;
    const newV = {
      id: `v-${volunteers.length + 1}`,
      name: vName,
      role: vRole,
      hours: 0
    };
    setVolunteers([newV, ...volunteers]);
    setVName("");
  };

  const handleAddGalleryImage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newImageTitle) return;
    setGalleryImages([
      { title: newImageTitle, date: "Just now", size: "900 KB" },
      ...galleryImages
    ]);
    setNewImageTitle("");
  };

  const complianceAlerts = [
    { id: "a-1", title: "12A Certification Renewal Pending", expiry: "August 15, 2026", daysLeft: 58, severity: "warning" },
    { id: "a-2", title: "NGO Darpan Filing Outdated", expiry: "Immediate", daysLeft: 0, severity: "danger" }
  ];

  const getStatusBadge = (status: string) => {
    const map: Record<string, string> = {
      "Draft": "govt-badge govt-badge-draft",
      "Submitted": "govt-badge govt-badge-pending",
      "Funded": "govt-badge govt-badge-funded",
      "Approved": "govt-badge govt-badge-verified",
      "Rejected": "govt-badge govt-badge-rejected",
    };
    return map[status] || "govt-badge govt-badge-draft";
  };

  return (
    <div className="px-6 md:px-10 py-8 max-w-7xl mx-auto flex flex-col gap-7 min-h-screen font-sans">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-200 pb-4">
        <div className="flex flex-col gap-1">
          <span className="text-[#f97316] font-extrabold text-[11px] uppercase tracking-widest font-heading">Sahyadri Eco Foundation</span>
          <h1 className="font-heading font-extrabold text-2xl text-gray-900 tracking-tight">NGO Console</h1>
        </div>

        <div className="flex gap-3">
          <button 
            onClick={() => handleTabChange("compliance")}
            className="px-4 py-2 text-xs font-bold bg-white border border-gray-200 hover:border-[#1e3a8a] text-gray-600 rounded-lg shadow-sm transition-colors flex items-center gap-2"
          >
            <Bell size={14} /> Compliance Registry
          </button>
          <button 
            onClick={() => handleTabChange("drafts")}
            className="px-4 py-2 text-xs font-bold bg-[#f97316] hover:bg-[#e06612] text-white rounded-lg shadow-sm transition-colors flex items-center gap-2"
          >
            <FolderPlus size={14} /> Propose Initiative
          </button>
        </div>
      </div>

      {/* 1. Overview Tab */}
      {activeTab === "overview" && (
        <div className="flex flex-col gap-7 animate-fadeIn">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <StatsCard label="Proposals Lodged" value={projects.length} icon={FileCheck2} />
            <StatsCard label="Total Capital Sourced" value="₹12.0 Lakhs" icon={Coins} />
            <StatsCard label="Escrow Payouts Released" value="₹5.0 Lakhs" icon={Award} />
            <StatsCard label="Beneficiaries Registered" value={beneficiaries.length + 2450} icon={Users} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            <div className="lg:col-span-2 flex flex-col gap-5">
              <Card>
                <CardHeader>
                  <h3 className="govt-section-header">
                    <AlertTriangle className="text-amber-500" size={20} />
                    Compliance Expiry Alerts
                  </h3>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  {complianceAlerts.map((alert) => (
                    <div 
                      key={alert.id} 
                      className={`p-4 rounded-lg border flex justify-between items-center ${
                        alert.severity === "danger" 
                          ? "bg-rose-50 border-rose-200" 
                          : "bg-amber-55 bg-amber-50 border-amber-200"
                      }`}
                    >
                      <div className="flex flex-col gap-0.5">
                        <span className="font-bold text-sm text-gray-900">{alert.title}</span>
                        <span className="text-xs text-gray-500 font-sans">Expiry Target: {alert.expiry}</span>
                      </div>
                      <span className={`govt-badge ${
                        alert.severity === "danger" ? "govt-badge-rejected" : "govt-badge-pending"
                      }`}>
                        {alert.daysLeft === 0 ? "Immediate Action" : `${alert.daysLeft} Days Left`}
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Recent Projects Quick View */}
              <Card>
                <CardHeader>
                  <h3 className="govt-section-header">
                    <Compass size={20} />
                    Recent Projects
                  </h3>
                </CardHeader>
                <CardContent className="p-0 overflow-x-auto">
                  <table className="govt-table">
                    <thead>
                      <tr>
                        <th>Initiative Title</th>
                        <th>District</th>
                        <th>Budget</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {projects.slice(0, 3).map((proj) => (
                        <tr key={proj.id}>
                          <td className="font-bold text-gray-900">{proj.title}</td>
                          <td>{proj.district}</td>
                          <td>₹{proj.budget.toLocaleString("en-IN")}</td>
                          <td><span className={getStatusBadge(proj.status)}>{proj.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <h3 className="govt-section-header text-base">
                  <Award className="text-[#f97316]" size={18} />
                  Active Tranche Milestone
                </h3>
              </CardHeader>
              <CardContent className="flex flex-col gap-4 text-xs font-semibold text-gray-600">
                <div className="bg-gray-50 border border-gray-200 p-5 rounded-lg flex flex-col gap-3">
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span className="text-gray-500">Milestone 2 progress:</span>
                    <span className="text-[#f97316] font-bold">40% Complete</span>
                  </div>
                  <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
                    <div className="bg-[#f97316] h-full rounded-full transition-all" style={{ width: "40%" }} />
                  </div>
                  <Button variant="outline" size="sm" onClick={() => handleTabChange("milestones")} className="mt-2 text-xs">
                    Upload Proof of Work
                  </Button>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                    <div className="text-lg font-extrabold text-[#1e3a8a]">36</div>
                    <div className="text-[10px] font-semibold text-gray-500 uppercase">Districts Covered</div>
                  </div>
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-center">
                    <div className="text-lg font-extrabold text-[#f97316]">4</div>
                    <div className="text-[10px] font-semibold text-gray-500 uppercase">SDG Goals Mapped</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* 2. Profile Tab */}
      {activeTab === "profile" && (
        <Card className="animate-fadeIn">
          <CardHeader>
            <h3 className="govt-section-header">Organization Credentials</h3>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg flex flex-col gap-1">
                <span className="text-gray-500 text-[10px] font-bold uppercase">NGO Darpan ID</span>
                <span className="text-gray-900 font-bold">MH/2024/0398492</span>
              </div>
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg flex flex-col gap-1">
                <span className="text-gray-500 text-[10px] font-bold uppercase">CSR-1 Status</span>
                <span className="text-emerald-700 font-bold flex items-center gap-1"><ShieldCheck size={14} /> Verified</span>
              </div>
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg flex flex-col gap-1">
                <span className="text-gray-500 text-[10px] font-bold uppercase">12A & 80G Audited</span>
                <span className="text-emerald-700 font-bold flex items-center gap-1"><ShieldCheck size={14} /> Active</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg flex flex-col gap-1">
                <span className="text-gray-500 text-[10px] font-bold uppercase">Registered Address</span>
                <span className="text-gray-900 text-sm">401, Sahyadri Complex, FC Road, Pune - 411005</span>
              </div>
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg flex flex-col gap-1">
                <span className="text-gray-500 text-[10px] font-bold uppercase">Primary Contact</span>
                <span className="text-gray-900 text-sm">Dr. Anand Kulkarni, Executive Director</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 3. Projects Tab */}
      {activeTab === "projects" && (
        <Card className="animate-fadeIn">
          <CardHeader>
            <h3 className="govt-section-header">Proposals & Initiatives Ledger</h3>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <table className="govt-table">
              <thead>
                <tr>
                  <th>Initiative Title</th>
                  <th>Territory</th>
                  <th>Required Budget</th>
                  <th>Sourced</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((proj) => (
                  <tr key={proj.id}>
                    <td className="font-bold text-gray-900">{proj.title}</td>
                    <td>{proj.district}, {proj.taluka}</td>
                    <td>₹{proj.budget.toLocaleString("en-IN")}</td>
                    <td>₹{proj.funded.toLocaleString("en-IN")}</td>
                    <td><span className={getStatusBadge(proj.status)}>{proj.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {/* 4. Proposal Builder Form */}
      {activeTab === "drafts" && (
        <Card className="max-w-2xl mx-auto w-full animate-fadeIn">
          <CardHeader>
            <h3 className="govt-section-header">Build Project Proposal</h3>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateProject} className="flex flex-col gap-4 text-xs font-semibold text-gray-600">
              <div className="flex flex-col gap-1.5">
                <label className="text-gray-805">Initiative Title:</label>
                <input 
                  type="text" 
                  value={newTitle} 
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="govt-input" 
                  placeholder="e.g. Smart Digital Classrooms for ZP Schools"
                  required 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-gray-805">Target District:</label>
                  <select 
                    value={newDistrict} 
                    onChange={(e) => setNewDistrict(e.target.value)}
                    className="govt-input"
                  >
                    <option>Pune</option>
                    <option>Gadchiroli</option>
                    <option>Thane</option>
                    <option>Nandurbar</option>
                    <option>Nashik</option>
                    <option>Nagpur</option>
                    <option>Ratnagiri</option>
                    <option>Washim</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-gray-805">Taluka Name:</label>
                  <input 
                    type="text" 
                    value={newTaluka} 
                    onChange={(e) => setNewTaluka(e.target.value)}
                    className="govt-input" 
                    placeholder="e.g. Haveli"
                    required 
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-gray-805">Required Budget (INR):</label>
                  <input 
                    type="number" 
                    value={newBudget} 
                    onChange={(e) => setNewBudget(e.target.value)}
                    className="govt-input" 
                    placeholder="e.g. 3500000"
                    required 
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-gray-805">Focus Sector (Schedule VII):</label>
                  <select 
                    value={newFocus} 
                    onChange={(e) => setNewFocus(e.target.value)}
                    className="govt-input"
                  >
                    <option>Education</option>
                    <option>Water Supply</option>
                    <option>Healthcare</option>
                    <option>Environment</option>
                    <option>Rural Development</option>
                    <option>Women Empowerment</option>
                  </select>
                </div>
              </div>
              <Button type="submit" variant="accent" className="mt-3 py-3">Submit Proposal</Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* 5. Awaiting Approvals (submitted) */}
      {activeTab === "submitted" && (
        <div className="flex flex-col gap-6 animate-fadeIn">
          <h3 className="govt-section-header flex items-center gap-2">
            <Clock size={20} className="text-[#f97316]" />
            Awaiting Approvals
          </h3>

          <div className="flex flex-col gap-5">
            {projects.filter(p => p.status === "Submitted" || p.status === "Under Review").map(p => (
              <Card key={p.id} className="border border-gray-200">
                <CardContent className="p-6 flex flex-col gap-4">
                  <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                    <div>
                      <h4 className="font-heading font-extrabold text-base text-gray-900">{p.title}</h4>
                      <span className="text-xs text-gray-400">Territory: {p.district} • {p.taluka}</span>
                    </div>
                    <span className={`govt-badge ${p.status === "Submitted" ? "govt-badge-pending" : "govt-badge-draft"}`}>
                      {p.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                    <div className="text-xs text-gray-600 font-semibold">
                      <div className="text-gray-400">Proposed Budget</div>
                      <div className="text-gray-900 font-extrabold text-sm">₹{p.budget.toLocaleString("en-IN")}</div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] text-gray-400 uppercase font-bold">Review Pipeline</span>
                      <div className="flex items-center gap-1.5 text-xs text-gray-700 font-bold">
                        <span>Submitted</span>
                        <div className="w-10 h-1 bg-[#1e3a8a] rounded-full" />
                        <span className={p.status === "Under Review" ? "text-amber-600" : "text-gray-400"}>Gov Review</span>
                        <div className="w-10 h-1 bg-gray-200 rounded-full" />
                        <span className="text-gray-400">Approved</span>
                      </div>
                    </div>

                    <div className="flex md:justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => alert("Review request document downloaded.")}>
                        Inspect Form
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* 6. Marketplace Catalog (approved) */}
      {activeTab === "approved" && (
        <div className="flex flex-col gap-6 animate-fadeIn">
          <h3 className="govt-section-header flex items-center gap-2">
            <ShieldCheck size={22} className="text-emerald-600" />
            Marketplace Catalog Listing
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projects.filter(p => p.status === "Approved" || p.status === "Funded").map(p => (
              <Card key={p.id} className="border border-gray-200">
                <CardContent className="p-6 flex flex-col gap-4 justify-between h-full">
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center text-xs font-semibold">
                      <span className="govt-badge govt-badge-verified">Live in Marketplace</span>
                      <span className="text-gray-500 font-bold">{p.district}</span>
                    </div>
                    <h4 className="font-heading font-extrabold text-base text-gray-900 leading-snug">{p.title}</h4>
                    <p className="text-xs text-gray-650 font-medium font-sans mt-1 leading-normal">
                      {p.description || "Active rural community enhancement program aligned with Scheduled VII guidelines."}
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-2 bg-gray-50 border border-gray-150 p-3 rounded-lg text-center font-bold text-xs mt-3">
                    <div className="flex flex-col gap-0.5 border-r border-gray-200">
                      <span className="text-[9px] text-gray-400 uppercase">Outlay</span>
                      <span className="text-gray-950 font-extrabold">₹{(p.budget / 100000).toFixed(1)}L</span>
                    </div>
                    <div className="flex flex-col gap-0.5 border-r border-gray-200">
                      <span className="text-[9px] text-gray-400 uppercase">Views</span>
                      <span className="text-gray-950 font-extrabold">124</span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[9px] text-gray-400 uppercase">Inquiries</span>
                      <span className="text-emerald-600 font-extrabold">3 Firms</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* 7. Milestone Escrow */}
      {activeTab === "milestones" && (
        <Card className="max-w-2xl mx-auto w-full animate-fadeIn border border-gray-200">
          <CardHeader>
            <h3 className="govt-section-header">
              <Coins className="text-[#f97316]" /> Milestone Verification Center
            </h3>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            {evidenceSubmitted ? (
              <div className="text-center p-8 bg-emerald-50 border border-emerald-200 rounded-lg flex flex-col items-center gap-3">
                <CheckCircle2 size={36} className="text-emerald-500" />
                <span className="font-bold text-sm text-gray-900">Evidence File Submitted Successfully!</span>
                <span className="text-xs text-gray-500">Government auditor and Corporate trust officers have been notified.</span>
                <Button variant="outline" onClick={() => setEvidenceSubmitted(false)} className="mt-2">Upload another file</Button>
              </div>
            ) : (
              <div className="flex flex-col gap-4 text-xs font-semibold text-gray-600">
                <div className="flex flex-col gap-1.5">
                  <label className="text-gray-805">Select Active Project:</label>
                  <select 
                    value={selectedMilestoneProject} 
                    onChange={(e) => setSelectedMilestoneProject(e.target.value)}
                    className="govt-input"
                  >
                    {projects.filter(p => p.status === "Funded").map(p => (
                      <option key={p.id} value={p.id}>{p.title}</option>
                    ))}
                  </select>
                </div>

                <div className="border-2 border-dashed border-[#1e3a8a]/30 p-8 rounded-lg flex flex-col items-center gap-3 bg-blue-50/30">
                  <UploadCloud size={32} className="text-[#1e3a8a]/50" />
                  <span className="text-gray-500 text-xs">Drag and drop ZIP archive containing site photos and beneficiary logs</span>
                  <input 
                    type="file" 
                    onChange={(e) => setEvidenceFile(e.target.files?.[0]?.name || "dam_progress_logs.zip")}
                    className="hidden" 
                    id="evidence-uploader" 
                  />
                  <label htmlFor="evidence-uploader" className="cursor-pointer bg-white border border-gray-200 hover:border-[#1e3a8a] py-2 px-4 rounded-lg text-gray-700 font-semibold transition-colors">
                    {evidenceFile ? evidenceFile : "Choose File"}
                  </label>
                </div>

                <Button 
                  variant="primary"
                  onClick={() => setEvidenceSubmitted(true)}
                  disabled={!evidenceFile}
                  className="py-3"
                >
                  Submit Milestone Proof
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* 8. Drawdown Ledger */}
      {activeTab === "funding" && (
        <Card className="animate-fadeIn border border-gray-200">
          <CardHeader>
            <h3 className="govt-section-header">Drawdown Payment Ledger</h3>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <table className="govt-table">
              <thead>
                <tr>
                  <th>Transaction ID</th>
                  <th>Initiative</th>
                  <th>Disbursed Amount</th>
                  <th>Date Cleared</th>
                  <th className="text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="font-bold text-[#1e3a8a]">TXN-902840</td>
                  <td className="text-gray-900">Gadchiroli Watershed & Reforestation</td>
                  <td>₹5,00,000</td>
                  <td>June 08, 2026</td>
                  <td className="text-right"><span className="govt-badge govt-badge-verified">Cleared</span></td>
                </tr>
                <tr>
                  <td className="font-bold text-[#1e3a8a]">TXN-859182</td>
                  <td className="text-gray-900">Gadchiroli Watershed & Reforestation</td>
                  <td>₹7,00,000</td>
                  <td>June 15, 2026</td>
                  <td className="text-right"><span className="govt-badge govt-badge-verified">Cleared</span></td>
                </tr>
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {/* 9. SDG Allocations (impact) */}
      {activeTab === "impact" && (
        <div className="flex flex-col gap-6 animate-fadeIn">
          <h3 className="govt-section-header flex items-center gap-2">
            <Sparkles size={22} className="text-[#f97316]" />
            UN Sustainable Development Goals (SDG) Alignment
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { id: 4, name: "Quality Education", count: 1, color: "bg-rose-500", desc: "Digital smart lab classrooms proposed." },
              { id: 6, name: "Clean Water & Sanitation", count: 1, color: "bg-cyan-500", desc: "Reforestation and check dams constructed." },
              { id: 3, name: "Good Health & Well-being", count: 0, color: "bg-emerald-500", desc: "Mobile primary medical units." },
              { id: 13, name: "Climate Action", count: 1, color: "bg-green-700", desc: "Afforestation and buffer ecosystems." }
            ].map((g) => (
              <Card key={g.id} className="border border-gray-200 overflow-hidden flex flex-col justify-between">
                <div className={`h-2.5 ${g.color}`} />
                <CardContent className="p-5 flex flex-col justify-between flex-grow gap-4 text-xs font-semibold">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-gray-400 uppercase font-bold">Goal {g.id}</span>
                    <h4 className="font-heading font-extrabold text-base text-gray-950">{g.name}</h4>
                    <p className="text-gray-600 font-medium font-sans leading-relaxed mt-1">{g.desc}</p>
                  </div>

                  <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
                    <span className="text-gray-500">Active Proposals:</span>
                    <span className="font-extrabold text-[#1e3a8a]">{g.count} Initiative</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* 10. Beneficiary Registry */}
      {activeTab === "beneficiaries" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start animate-fadeIn">
          
          <Card className="lg:col-span-2 border border-gray-200">
            <CardHeader>
              <h3 className="govt-section-header">Beneficiary Registry Database</h3>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <table className="govt-table">
                <thead>
                  <tr>
                    <th>Beneficiary Name</th>
                    <th>Location Scope</th>
                    <th>Benefit Sector</th>
                    <th className="text-right">Audit Date</th>
                  </tr>
                </thead>
                <tbody>
                  {beneficiaries.map((b) => (
                    <tr key={b.id}>
                      <td className="font-bold text-gray-900">{b.name}</td>
                      <td className="text-gray-600 font-semibold">{b.location}</td>
                      <td><span className="govt-badge govt-badge-funded">{b.sector}</span></td>
                      <td className="text-right text-gray-500">{b.verifiedDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          <Card className="border border-gray-200">
            <CardHeader>
              <h3 className="govt-section-header text-base">Register Beneficiary</h3>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddBeneficiary} className="flex flex-col gap-4 text-xs font-semibold text-gray-650">
                <div className="flex flex-col gap-1.5">
                  <label className="text-gray-805">Beneficiary Name:</label>
                  <input 
                    type="text" 
                    value={bName} 
                    onChange={(e) => setBName(e.target.value)}
                    className="govt-input" 
                    placeholder="Full name"
                    required 
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-gray-805">Location (Taluka, District):</label>
                  <input 
                    type="text" 
                    value={bLoc} 
                    onChange={(e) => setBLoc(e.target.value)}
                    className="govt-input" 
                    placeholder="e.g. Aheri, Gadchiroli"
                    required 
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-gray-805">Benefit Sector:</label>
                  <select 
                    value={bSec} 
                    onChange={(e) => setBSec(e.target.value)}
                    className="govt-input"
                  >
                    <option>Water Supply</option>
                    <option>Education</option>
                    <option>Healthcare</option>
                    <option>Rural Development</option>
                  </select>
                </div>
                <Button type="submit" className="py-2.5">Log Beneficiary</Button>
              </form>
            </CardContent>
          </Card>

        </div>
      )}

      {/* 11. Volunteer Roster */}
      {activeTab === "volunteers" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start animate-fadeIn">
          
          <Card className="lg:col-span-2 border border-gray-200">
            <CardHeader>
              <h3 className="govt-section-header">Volunteer Rosters</h3>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <table className="govt-table">
                <thead>
                  <tr>
                    <th>Volunteer Name</th>
                    <th>Designated Role</th>
                    <th className="text-right">Hours Logged</th>
                  </tr>
                </thead>
                <tbody>
                  {volunteers.map((v) => (
                    <tr key={v.id}>
                      <td className="font-bold text-gray-900">{v.name}</td>
                      <td className="text-gray-650 font-semibold">{v.role}</td>
                      <td className="text-right font-extrabold text-[#1e3a8a]">{v.hours} Hours</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          <Card className="border border-gray-200">
            <CardHeader>
              <h3 className="govt-section-header text-base">Enroll Volunteer</h3>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddVolunteer} className="flex flex-col gap-4 text-xs font-semibold text-gray-600">
                <div className="flex flex-col gap-1.5">
                  <label className="text-gray-805">Volunteer Full Name:</label>
                  <input 
                    type="text" 
                    value={vName} 
                    onChange={(e) => setVName(e.target.value)}
                    className="govt-input" 
                    placeholder="Full name"
                    required 
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-gray-805">Designated Role:</label>
                  <select 
                    value={vRole} 
                    onChange={(e) => setVRole(e.target.value)}
                    className="govt-input"
                  >
                    <option>Field Coordinator</option>
                    <option>Nutritionist</option>
                    <option>Teacher / Mentor</option>
                    <option>Healthcare Worker</option>
                  </select>
                </div>
                <Button type="submit" className="py-2.5">Enroll Member</Button>
              </form>
            </CardContent>
          </Card>

        </div>
      )}

      {/* 12. Documents Vault */}
      {activeTab === "documents" && (
        <Card className="animate-fadeIn border border-gray-200">
          <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h3 className="govt-section-header flex items-center gap-2">
              <Folder size={20} className="text-[#1e3a8a]" />
              Documents Vault
            </h3>
            <div className="flex gap-2">
              {["All", "Registration", "Darpan", "12A", "80G"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setDocFilter(tab)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                    docFilter === tab 
                      ? "bg-[#1e3a8a] border-[#1e3a8a] text-white" 
                      : "bg-white border-gray-200 text-gray-600 hover:border-[#1e3a8a]/45"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <table className="govt-table">
              <thead>
                <tr>
                  <th>Deed Name</th>
                  <th>Classification</th>
                  <th>Size</th>
                  <th>Filing Date</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {documents
                  .filter((d) => docFilter === "All" || d.type === docFilter)
                  .map((d, index) => (
                    <tr key={index}>
                      <td className="font-bold text-gray-950 flex items-center gap-2">
                        <FileText size={14} className="text-slate-400" />
                        {d.name}
                      </td>
                      <td>
                        <span className="govt-badge govt-badge-funded">{d.type}</span>
                      </td>
                      <td className="text-gray-500 font-medium text-xs">{d.size}</td>
                      <td className="text-gray-500 font-medium text-xs">{d.date}</td>
                      <td className="text-right">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => alert(`Downloading document ${d.name}`)}
                          className="p-1 px-2 text-xs"
                        >
                          <Download size={12} />
                        </Button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {/* 13. Compliance Check */}
      {activeTab === "compliance" && (
        <Card className="animate-fadeIn max-w-2xl border border-gray-200">
          <CardHeader>
            <h3 className="govt-section-header flex items-center gap-2">
              <ShieldAlert size={20} className="text-[#f97316]" />
              NGO Compliance Registry Checks
            </h3>
          </CardHeader>
          <CardContent className="flex flex-col gap-5 text-xs text-gray-600 font-semibold">
            {[
              { label: "NITI Aayog Darpan Verification Status", detail: "Registered and validated with NGO Darpan API.", status: "VERIFIED" },
              { label: "MCA CSR-1 Verification Certificate", detail: "Authorized to undertake projects under MCA Section 135.", status: "ACTIVE" },
              { label: "12A Tax Exemption Audit Status", detail: "Audit logs confirm compliance. Renewal target: Aug 2026.", status: "COMPLIANT" },
              { label: "80G Certificate Validity Status", detail: "Provides corporate sponsors with 50% taxable exclusions.", status: "VALID" }
            ].map((c, idx) => (
              <div key={idx} className="p-4 bg-gray-50 border border-gray-250 rounded-xl flex justify-between items-center hover:border-[#1e3a8a]/20 transition-all">
                <div className="flex flex-col gap-1.5">
                  <h4 className="font-heading font-extrabold text-sm text-gray-950">{c.label}</h4>
                  <p className="text-gray-500 font-medium font-sans leading-relaxed">{c.detail}</p>
                </div>
                <span className="govt-badge govt-badge-verified">{c.status}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* 14. Milestone Calendar */}
      {activeTab === "calendar" && (
        <Card className="animate-fadeIn border border-gray-200">
          <CardHeader>
            <h3 className="govt-section-header flex items-center gap-2">
              <CalIcon size={20} className="text-[#1e3a8a]" />
              Milestones Schedule Deadlines
            </h3>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <table className="govt-table">
              <thead>
                <tr>
                  <th>Target Date</th>
                  <th>Action Milestone Task</th>
                  <th>Assigned Initiative</th>
                  <th>Nature</th>
                </tr>
              </thead>
              <tbody>
                {calendarMilestones.map((m, index) => (
                  <tr key={index}>
                    <td className="font-bold text-gray-950">{m.date}</td>
                    <td className="text-gray-800 font-semibold">{m.title}</td>
                    <td className="text-gray-600 font-semibold">{m.project}</td>
                    <td>
                      <span className={`govt-badge ${
                        m.type === "Inspection" ? "govt-badge-pending" :
                        m.type === "Submission" ? "govt-badge-funded" : "govt-badge-verified"
                      }`}>
                        {m.type}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {/* 15. Reports */}
      {activeTab === "reports" && (
        <Card className="max-w-md mx-auto w-full animate-fadeIn border border-gray-200">
          <CardHeader>
            <h3 className="govt-section-header">
              <BarChart2 className="text-[#1e3a8a]" /> Annual Reports Desk
            </h3>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 text-xs font-semibold text-gray-600 leading-relaxed">
            <span>Generate boardroom-ready CSR spending summaries for corporate and state submission.</span>
            <div className="flex flex-col gap-3 mt-3">
              <Button variant="primary" onClick={() => alert("PDF Annual Report generated. Download complete.")} className="flex justify-between items-center py-3 px-5">
                <span>Annual Impact Summary (PDF)</span>
                <FileDown size={16} />
              </Button>
              <Button variant="outline" onClick={() => alert("Excel ledger sheets exported. Download complete.")} className="flex justify-between items-center py-3 px-5">
                <span>Beneficiary Financial Ledger (XLSX)</span>
                <FileDown size={16} />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 16. Media Gallery */}
      {activeTab === "gallery" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start animate-fadeIn">
          
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-5">
            {galleryImages.map((img, idx) => (
              <div key={idx} className="bg-white rounded-xl border border-gray-250 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="h-40 w-full bg-gradient-to-tr from-[#1e3a8a]/10 to-[#f97316]/10 flex items-center justify-center relative">
                  <ImageIcon size={28} className="text-gray-400" />
                  <span className="absolute top-3 right-3 bg-white border border-gray-200 text-[10px] font-bold text-gray-500 px-2 py-0.5 rounded-md shadow-sm">{img.size}</span>
                </div>
                <div className="p-4 flex flex-col gap-1 border-t border-gray-200">
                  <span className="text-[9px] text-gray-400 font-bold">{img.date}</span>
                  <h4 className="font-heading font-bold text-sm text-gray-900 mt-0.5 leading-tight">{img.title}</h4>
                </div>
              </div>
            ))}
          </div>

          <Card className="border border-gray-200">
            <CardHeader>
              <h3 className="govt-section-header text-base">Upload Project Image</h3>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddGalleryImage} className="flex flex-col gap-4 text-xs font-semibold text-gray-650">
                <div className="flex flex-col gap-1.5">
                  <label className="text-gray-805">Image Caption:</label>
                  <input 
                    type="text" 
                    value={newImageTitle} 
                    onChange={(e) => setNewImageTitle(e.target.value)}
                    placeholder="e.g. Check dam #3 completed"
                    className="govt-input" 
                    required 
                  />
                </div>
                <div className="border-2 border-dashed border-gray-250 p-6 rounded-lg flex flex-col items-center gap-2 bg-gray-50/50">
                  <ImageIcon size={24} className="text-gray-400" />
                  <span className="text-[10px] text-gray-400">JPG or PNG (max 5MB)</span>
                </div>
                <Button type="submit" className="py-2.5">Upload Image</Button>
              </form>
            </CardContent>
          </Card>

        </div>
      )}

      {/* 17. District Analytics (analytics) */}
      {activeTab === "analytics" && (
        <div className="flex flex-col gap-6 animate-fadeIn font-sans">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <StatsCard label="Active Territory" value="Pune, Gadchiroli" icon={Compass} />
            <StatsCard label="Escrow Outlay Cap" value="₹6.0 Lakhs" icon={Coins} />
            <StatsCard label="Milestones Pending" value="3 milestones" icon={Clock} />
            <StatsCard label="Audited Pass Rate" value="100.0%" icon={ShieldCheck} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border border-gray-250 shadow-sm bg-white">
              <CardHeader className="pb-2">
                <h3 className="govt-section-header text-sm font-extrabold text-[#1e3a8a]">
                  <Sparkles size={16} /> SDG Allocation Metrics
                </h3>
              </CardHeader>
              <CardContent className="h-[250px] flex items-center justify-center p-4">
                <SdgStatsChart />
              </CardContent>
            </Card>

            <Card className="border border-gray-250 shadow-sm bg-white">
              <CardHeader className="pb-2">
                <h3 className="govt-section-header text-sm font-extrabold text-[#1e3a8a]">
                  <TrendingUp size={16} /> Sourced Escrow Funding Growth
                </h3>
              </CardHeader>
              <CardContent className="h-[250px] flex items-center justify-center p-4">
                <FundingGrowthChart />
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* 18. Settings */}
      {activeTab === "settings" && (
        <Card className="animate-fadeIn max-w-2xl border border-gray-200">
          <CardHeader>
            <h3 className="govt-section-header flex items-center gap-2">
              <SettingsIcon size={20} className="text-gray-500" />
              NGO Settings Console
            </h3>
          </CardHeader>
          <CardContent>
            <form onSubmit={(e) => { e.preventDefault(); alert("NGO settings saved successfully."); }} className="flex flex-col gap-4 text-xs font-semibold text-gray-600">
              <div className="flex flex-col gap-1.5">
                <span className="text-gray-805">Primary Website URL:</span>
                <input 
                  type="text"
                  placeholder="https://sahyadrieco.org"
                  className="govt-input"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-gray-805">Alternate Contact Phone:</span>
                <input 
                  type="text"
                  placeholder="+91 20 2548 9581"
                  className="govt-input"
                />
              </div>

              <div className="flex flex-col gap-1.5 border-t border-gray-150 pt-4 mt-2">
                <span className="text-gray-850 font-bold text-sm">System Notification Alerts:</span>
                <div className="flex flex-col gap-2 mt-2">
                  <label className="flex items-center gap-2 font-medium cursor-pointer">
                    <input type="checkbox" defaultChecked className="accent-[#1e3a8a]" />
                    <span>Send email alert on company escrow fund releases.</span>
                  </label>
                  <label className="flex items-center gap-2 font-medium cursor-pointer">
                    <input type="checkbox" defaultChecked className="accent-[#1e3a8a]" />
                    <span>In-app alert for upcoming milestone evidence deadlines.</span>
                  </label>
                </div>
              </div>

              <Button type="submit" variant="primary" className="py-2.5 mt-4">Save Configuration</Button>
            </form>
          </CardContent>
        </Card>
      )}

    </div>
  );
}
