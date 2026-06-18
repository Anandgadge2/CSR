"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  FolderPlus, Coins, Award, Clock, FileCheck2, Calendar as CalIcon, 
  AlertTriangle, FileText, ArrowUpRight, UploadCloud, Bell, 
  Settings as SettingsIcon, Layers, Users, Image as ImageIcon, CheckCircle2, X,
  Building2, Landmark, Compass, Sparkles, BarChart2, BookOpen, ShieldAlert,
  Send, ShieldCheck, HelpCircle, FileDown, PlusCircle, Trash
} from "lucide-react";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatsCard } from "@/components/ui/StatsCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { Modal } from "@/components/ui/Modal";

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
    { id: "1", title: "Pune Zilla Parishad Smart Digital-Classrooms", budget: 3500000, funded: 0, completion: 0, status: "Submitted", district: "Pune", taluka: "Haveli" },
    { id: "2", title: "Gadchiroli Watershed & Reforestation Initiative", budget: 2500000, funded: 1200000, completion: 40, status: "Funded", district: "Gadchiroli", taluka: "Aheri" }
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

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    const newProj = {
      id: String(projects.length + 1),
      title: newTitle,
      budget: Number(newBudget),
      funded: 0,
      completion: 0,
      status: "Draft",
      district: newDistrict,
      taluka: newTaluka || "Mulshi"
    };
    setProjects([newProj, ...projects]);
    setNewTitle("");
    setNewBudget("");
    setNewTaluka("");
    handleTabChange("projects");
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
    <div className="px-6 md:px-10 py-8 max-w-7xl mx-auto flex flex-col gap-7 min-h-screen">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-[#f97316] font-bold text-[11px] uppercase tracking-widest">Sahyadri Eco Foundation</span>
          <h1 className="font-heading font-extrabold text-2xl text-slate-900 tracking-tight">NGO Console</h1>
        </div>

        <div className="flex gap-3">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => handleTabChange("compliance")}
            className="flex items-center gap-2"
          >
            <Bell size={14} /> Compliance Registry
          </Button>
          <Button 
            variant="accent" 
            size="sm" 
            onClick={() => handleTabChange("drafts")}
            className="flex items-center gap-2"
          >
            <FolderPlus size={14} /> Propose Initiative
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-200 pb-px overflow-x-auto bg-white rounded-t-lg px-2 pt-1">
        {[
          { id: "overview", label: "Overview", icon: Layers },
          { id: "profile", label: "Org Profile", icon: Landmark },
          { id: "projects", label: "Projects Ledger", icon: FileCheck2 },
          { id: "drafts", label: "Proposal Builder", icon: FolderPlus },
          { id: "milestones", label: "Milestone Escrow", icon: Coins },
          { id: "funding", label: "Drawdown Ledger", icon: Award },
          { id: "beneficiaries", label: "Beneficiary Log", icon: Users },
          { id: "volunteers", label: "Volunteer Roster", icon: Users },
          { id: "reports", label: "Annual Reports", icon: BarChart2 },
          { id: "gallery", label: "Media Gallery", icon: ImageIcon }
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id as DashboardTab)}
              className={`flex items-center gap-2 px-4 py-2.5 text-[11px] font-semibold border-b-2 transition-all shrink-0 ${
                isActive 
                  ? "border-[#1e3a8a] text-[#1e3a8a] bg-blue-50/50" 
                  : "border-transparent text-slate-500 hover:text-[#1e3a8a] hover:bg-slate-50"
              }`}
            >
              <tab.icon size={13} />
              {tab.label}
            </button>
          );
        })}
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
                          : "bg-amber-50 border-amber-200"
                      }`}
                    >
                      <div className="flex flex-col gap-0.5">
                        <span className="font-bold text-sm text-slate-900">{alert.title}</span>
                        <span className="text-xs text-slate-500">Expiry Target: {alert.expiry}</span>
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
                          <td className="font-bold text-slate-800">{proj.title}</td>
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
              <CardContent className="flex flex-col gap-4">
                <div className="bg-slate-50 border border-slate-200 p-5 rounded-lg flex flex-col gap-3">
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span className="text-slate-500">Milestone 2 progress:</span>
                    <span className="text-[#f97316] font-bold">40% Complete</span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
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
                    <div className="text-[10px] font-semibold text-slate-500 uppercase">Districts Covered</div>
                  </div>
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-center">
                    <div className="text-lg font-extrabold text-[#f97316]">4</div>
                    <div className="text-[10px] font-semibold text-slate-500 uppercase">SDG Goals Mapped</div>
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
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg flex flex-col gap-1">
                <span className="text-slate-500 text-[10px] font-bold uppercase">NGO Darpan ID</span>
                <span className="text-slate-900 font-bold">MH/2024/0398492</span>
              </div>
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg flex flex-col gap-1">
                <span className="text-slate-500 text-[10px] font-bold uppercase">CSR-1 Status</span>
                <span className="text-emerald-700 font-bold flex items-center gap-1"><ShieldCheck size={14} /> Verified</span>
              </div>
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg flex flex-col gap-1">
                <span className="text-slate-500 text-[10px] font-bold uppercase">12A & 80G Audited</span>
                <span className="text-emerald-700 font-bold flex items-center gap-1"><ShieldCheck size={14} /> Active</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="p-4 bg-white border border-slate-200 rounded-lg flex flex-col gap-1">
                <span className="text-slate-500 text-[10px] font-bold uppercase">Registered Address</span>
                <span className="text-slate-700 text-sm">401, Sahyadri Complex, FC Road, Pune - 411005</span>
              </div>
              <div className="p-4 bg-white border border-slate-200 rounded-lg flex flex-col gap-1">
                <span className="text-slate-500 text-[10px] font-bold uppercase">Primary Contact</span>
                <span className="text-slate-700 text-sm">Dr. Anand Kulkarni, Executive Director</span>
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
                    <td className="font-bold text-slate-800">{proj.title}</td>
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
            <form onSubmit={handleCreateProject} className="flex flex-col gap-4 text-xs font-medium text-slate-600">
              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-slate-700">Initiative Title:</label>
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
                  <label className="font-semibold text-slate-700">Target District:</label>
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
                  <label className="font-semibold text-slate-700">Taluka Name:</label>
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
                  <label className="font-semibold text-slate-700">Required Budget (INR):</label>
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
                  <label className="font-semibold text-slate-700">Focus Sector (Schedule VII):</label>
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

      {/* 5. Milestone Escrow */}
      {activeTab === "milestones" && (
        <Card className="max-w-2xl mx-auto w-full animate-fadeIn">
          <CardHeader>
            <h3 className="govt-section-header">
              <Coins className="text-[#f97316]" /> Milestone Verification Center
            </h3>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            {evidenceSubmitted ? (
              <div className="text-center p-8 bg-emerald-50 border border-emerald-200 rounded-lg flex flex-col items-center gap-3">
                <CheckCircle2 size={36} className="text-emerald-500" />
                <span className="font-bold text-sm text-slate-800">Evidence File Submitted Successfully!</span>
                <span className="text-xs text-slate-500">Government auditor and Corporate trust officers have been notified.</span>
                <Button variant="outline" onClick={() => setEvidenceSubmitted(false)} className="mt-2">Upload another file</Button>
              </div>
            ) : (
              <div className="flex flex-col gap-4 text-xs font-semibold text-slate-600">
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-slate-700">Select Active Project:</label>
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
                  <span className="text-slate-500 text-xs">Drag and drop ZIP archive containing site photos and beneficiary logs</span>
                  <input 
                    type="file" 
                    onChange={(e) => setEvidenceFile(e.target.files?.[0]?.name || "dam_progress_logs.zip")}
                    className="hidden" 
                    id="evidence-uploader" 
                  />
                  <label htmlFor="evidence-uploader" className="cursor-pointer bg-white hover:bg-slate-50 border border-slate-300 py-2 px-4 rounded-lg text-slate-600 font-semibold transition-colors">
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

      {/* 6. Drawdown Ledger */}
      {activeTab === "funding" && (
        <Card className="animate-fadeIn">
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
                  <td>Gadchiroli Watershed & Reforestation</td>
                  <td>₹5,00,000</td>
                  <td>June 08, 2026</td>
                  <td className="text-right"><span className="govt-badge govt-badge-verified">Cleared</span></td>
                </tr>
                <tr>
                  <td className="font-bold text-[#1e3a8a]">TXN-859182</td>
                  <td>Gadchiroli Watershed & Reforestation</td>
                  <td>₹7,00,000</td>
                  <td>June 15, 2026</td>
                  <td className="text-right"><span className="govt-badge govt-badge-verified">Cleared</span></td>
                </tr>
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {/* 7. Beneficiary Registry */}
      {activeTab === "beneficiaries" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start animate-fadeIn">
          
          <Card className="lg:col-span-2">
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
                      <td className="font-bold text-slate-800">{b.name}</td>
                      <td>{b.location}</td>
                      <td><span className="govt-badge govt-badge-funded">{b.sector}</span></td>
                      <td className="text-right">{b.verifiedDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="govt-section-header text-base">Register Beneficiary</h3>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddBeneficiary} className="flex flex-col gap-4 text-xs font-semibold text-slate-600">
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-700">Beneficiary Name:</label>
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
                  <label className="text-slate-700">Location (Taluka, District):</label>
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
                  <label className="text-slate-700">Benefit Sector:</label>
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

      {/* 8. Volunteer Roster */}
      {activeTab === "volunteers" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start animate-fadeIn">
          
          <Card className="lg:col-span-2">
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
                      <td className="font-bold text-slate-800">{v.name}</td>
                      <td>{v.role}</td>
                      <td className="text-right font-bold">{v.hours} Hours</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="govt-section-header text-base">Enroll Volunteer</h3>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddVolunteer} className="flex flex-col gap-4 text-xs font-semibold text-slate-600">
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-700">Volunteer Full Name:</label>
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
                  <label className="text-slate-700">Designated Role:</label>
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

      {/* 9. Annual Reports */}
      {activeTab === "reports" && (
        <Card className="max-w-md mx-auto w-full animate-fadeIn">
          <CardHeader>
            <h3 className="govt-section-header">
              <BarChart2 className="text-[#1e3a8a]" /> Annual Reports Desk
            </h3>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 text-xs font-semibold text-slate-500">
            <span>Generate boardroom-ready CSR spending summaries for corporate and state submission.</span>
            <div className="flex flex-col gap-3 mt-2">
              <Button variant="primary" onClick={() => alert("PDF Annual Report generated. Download complete.")} className="flex justify-between items-center py-3 px-5">
                <span>Annual Impact Summary (PDF)</span>
                <FileDown size={16} />
              </Button>
              <Button variant="secondary" onClick={() => alert("Excel ledger sheets exported. Download complete.")} className="flex justify-between items-center py-3 px-5">
                <span>Beneficiary Financial Ledger (XLSX)</span>
                <FileDown size={16} />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 10. Media Gallery */}
      {activeTab === "gallery" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start animate-fadeIn">
          
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-5">
            {galleryImages.map((img, idx) => (
              <div key={idx} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="h-40 w-full bg-gradient-to-tr from-[#1e3a8a]/10 to-[#f97316]/10 flex items-center justify-center relative">
                  <ImageIcon size={28} className="text-slate-300" />
                  <span className="absolute top-3 right-3 bg-white border border-slate-200 text-[10px] font-bold text-slate-500 px-2 py-0.5 rounded-md shadow-sm">{img.size}</span>
                </div>
                <div className="p-4 flex flex-col gap-1 border-t border-slate-100">
                  <span className="text-[9px] text-slate-400 font-bold">{img.date}</span>
                  <h4 className="font-heading font-bold text-sm text-slate-800 mt-0.5 leading-tight">{img.title}</h4>
                </div>
              </div>
            ))}
          </div>

          <Card>
            <CardHeader>
              <h3 className="govt-section-header text-base">Upload Project Image</h3>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddGalleryImage} className="flex flex-col gap-4 text-xs font-semibold text-slate-600">
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-700">Image Caption:</label>
                  <input 
                    type="text" 
                    value={newImageTitle} 
                    onChange={(e) => setNewImageTitle(e.target.value)}
                    placeholder="e.g. Check dam #3 completed"
                    className="govt-input" 
                    required 
                  />
                </div>
                <div className="border-2 border-dashed border-slate-300 p-6 rounded-lg flex flex-col items-center gap-2 bg-slate-50">
                  <ImageIcon size={24} className="text-slate-400" />
                  <span className="text-[10px] text-slate-500">JPG or PNG (max 5MB)</span>
                </div>
                <Button type="submit" className="py-2.5">Upload Image</Button>
              </form>
            </CardContent>
          </Card>

        </div>
      )}

    </div>
  );
}
