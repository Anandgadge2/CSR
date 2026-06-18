"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  ShieldCheck, Landmark, Building2, FileText, Activity, Settings as SettingsIcon,
  Check, X, AlertTriangle, Eye, ShieldAlert, ArrowUpRight, Search, 
  Users, Sliders, Edit, Plus, CheckCircle2, Ticket, Coins, Clock, Lock, Key, Server, Trash
} from "lucide-react";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatsCard } from "@/components/ui/StatsCard";
import dynamic from "next/dynamic";

const DistrictBudgetPieChart = dynamic(() => import("@/components/AdminCharts").then(mod => mod.DistrictBudgetPieChart), {
  ssr: false,
  loading: () => <div className="h-[250px] w-full flex items-center justify-center bg-gray-50 border border-gray-200 rounded-xl"><div className="w-6 h-6 rounded-full border-2 border-slate-700 border-t-transparent animate-spin" /></div>
});

const ProjectStatusWebChart = dynamic(() => import("@/components/AdminCharts").then(mod => mod.ProjectStatusWebChart), {
  ssr: false,
  loading: () => <div className="h-[250px] w-full flex items-center justify-center bg-gray-50 border border-gray-200 rounded-xl"><div className="w-6 h-6 rounded-full border-2 border-slate-700 border-t-transparent animate-spin" /></div>
});

const TransactionAuditsLineChart = dynamic(() => import("@/components/AdminCharts").then(mod => mod.TransactionAuditsLineChart), {
  ssr: false,
  loading: () => <div className="h-[250px] w-full flex items-center justify-center bg-gray-50 border border-gray-200 rounded-xl"><div className="w-6 h-6 rounded-full border-2 border-slate-700 border-t-transparent animate-spin" /></div>
});

type AdminTab = 
  | "dashboard" | "users" | "roles" | "permissions" | "ngos" | "companies" 
  | "projects" | "funding" | "queue" | "reports" | "analytics" | "notifications" 
  | "cms" | "knowledge" | "circulars" | "districts" | "config" | "audit" 
  | "security" | "settings";

export default function AdminPanel({ params }: { params?: { tab?: string } }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<AdminTab>("dashboard");

  useEffect(() => {
    if (params?.tab) {
      setActiveTab(params.tab as AdminTab);
    }
  }, [params?.tab]);

  const handleTabChange = (tab: AdminTab) => {
    setActiveTab(tab);
    router.push(`/admin/${tab}`);
  };

  // User list
  const [users, setUsers] = useState([
    { id: "1", name: "Anand Kumar", email: "anand@domain.org", role: "NGO Admin", status: "Active" },
    { id: "2", name: "Priya Sharma", email: "priya@tata.com", role: "Company Auditor", status: "Active" },
    { id: "3", name: "Rajesh Shinde", email: "shinde.r@mahacsr.gov.in", role: "Gov Auditor", status: "Active" }
  ]);
  const [newUName, setNewUName] = useState("");
  const [newUEmail, setNewUEmail] = useState("");
  const [newURole, setNewURole] = useState("NGO Admin");

  // Audit Logs
  const [systemLogs, setSystemLogs] = useState([
    { time: "15:47:50", user: "system-agent", action: "Redis matching engine connected", ip: "127.0.0.1" },
    { time: "15:32:00", user: "shinde.r", action: "Approve NGO: Sahyadri Eco Foundation", ip: "10.0.2.14" },
    { time: "14:15:00", user: "priya@tata", action: "Modify allocation sliders", ip: "192.168.1.58" }
  ]);

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUName || !newUEmail) return;
    const newU = {
      id: String(users.length + 1),
      name: newUName,
      email: newUEmail,
      role: newURole,
      status: "Active"
    };
    setUsers([...users, newU]);
    setNewUName("");
    setNewUEmail("");
  };

  const handleRemoveUser = (id: string) => {
    setUsers(users.filter(u => u.id !== id));
  };

  return (
    <div className="px-6 md:px-10 py-8 max-w-7xl mx-auto flex flex-col gap-7 min-h-screen">
      
      {/* Header */}
      <div className="flex flex-col gap-1">
        <span className="text-[#f97316] font-bold text-xs uppercase tracking-widest flex items-center gap-1.5">
          <ShieldAlert size={14} /> SUPER ADMIN CONTROL CABINET (Super Admin)
        </span>
        <h1 className="font-heading font-extrabold text-2xl text-gray-900 tracking-tight">Super Admin Portal</h1>
      </div>

      {/* 1. System Status Dashboard */}
      {activeTab === "dashboard" && (
        <div className="flex flex-col gap-7 animate-fadeIn">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <StatsCard label="System Accounts" value={users.length + 195} icon={Users} />
            <StatsCard label="Server CPU Load" value="8.4%" icon={Activity} />
            <StatsCard label="Active DB Connections" value="48 Connections" icon={Server} />
            <StatsCard label="Redis Caching State" value="Connected" icon={ShieldCheck} />
          </div>

          <Card>
            <CardHeader>
              <h3 className="govt-section-header">
                <Activity size={20} />
                State Sourcing Aggregates
              </h3>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl flex flex-col gap-1 shadow-sm hover:border-[#1e3a8a]/20 transition-all">
                <span className="text-gray-700 text-[10px] font-extrabold uppercase tracking-wider">Aggregate Funds Sourced</span>
                <span className="text-[#1e3a8a] font-extrabold text-2xl">₹18.40 Crore</span>
              </div>
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl flex flex-col gap-1 shadow-sm hover:border-[#1e3a8a]/20 transition-all">
                <span className="text-gray-700 text-[10px] font-extrabold uppercase tracking-wider">Average Match Score</span>
                <span className="text-[#f97316] font-extrabold text-2xl">86.5% Rating</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 2. User Accounts */}
      {activeTab === "users" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start animate-fadeIn">
          
          <Card className="lg:col-span-2">
            <CardHeader>
              <h3 className="govt-section-header">
                <Users size={20} />
                User Account Directories
              </h3>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <table className="govt-table">
                <thead>
                  <tr>
                    <th>User Name</th>
                    <th>Registered Email</th>
                    <th>Designated Role</th>
                    <th className="text-right">Access Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td className="font-bold text-gray-950">{u.name}</td>
                      <td className="text-gray-700 font-medium">{u.email}</td>
                      <td><span className="govt-badge govt-badge-funded">{u.role}</span></td>
                      <td className="text-right">
                        <Button variant="danger" size="sm" onClick={() => handleRemoveUser(u.id)} className="flex items-center gap-1.5 py-1.5 px-3 text-xs ml-auto">
                          <Trash size={12} /> Revoke
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="govt-section-header text-base">
                <Plus size={18} />
                Provision User Account
              </h3>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddUser} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-semibold text-slate-600 font-sans">Full Name:</span>
                  <input 
                    type="text" 
                    value={newUName} 
                    onChange={(e) => setNewUName(e.target.value)}
                    className="govt-input" 
                    required 
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-semibold text-slate-600 font-sans">Registered Email:</span>
                  <input 
                    type="email" 
                    value={newUEmail} 
                    onChange={(e) => setNewUEmail(e.target.value)}
                    className="govt-input" 
                    required 
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-semibold text-slate-600 font-sans">Select Role:</span>
                  <select 
                    value={newURole} 
                    onChange={(e) => setNewURole(e.target.value)}
                    className="govt-input"
                  >
                    <option>NGO Admin</option>
                    <option>Company Auditor</option>
                    <option>Gov Auditor</option>
                  </select>
                </div>
                <Button type="submit" variant="accent" className="py-2.5 text-sm">Provision Account</Button>
              </form>
            </CardContent>
          </Card>

        </div>
      )}

      {/* 3. Role Definitions */}
      {activeTab === "roles" && (
        <Card className="animate-fadeIn">
          <CardHeader>
            <h3 className="govt-section-header">
              <ShieldCheck size={20} />
              Access Roles Matrix
            </h3>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <table className="govt-table">
              <thead>
                <tr>
                  <th>Role Identifier</th>
                  <th>Description Scope</th>
                  <th className="text-right">System Tier</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { id: "Superadmin", desc: "Full root access to system variables, database configurations, and roles management.", tier: "Tier 1" },
                  { id: "Gov Auditor", desc: "Audit and verify NGO credentials, approve marketplace proposals, and publish GR circulars.", tier: "Tier 2" },
                  { id: "Company Auditor", desc: "Manage corporate sliders, inspect milestone escrow uploads, and release tranches.", tier: "Tier 3" },
                  { id: "NGO Admin", desc: "Register NGO records, submit project proposals, and log served beneficiaries.", tier: "Tier 4" }
                ].map((r, index) => (
                  <tr key={index}>
                    <td className="font-bold text-gray-950 flex items-center gap-2">
                      <Lock size={14} className="text-[#f97316]" /> {r.id}
                    </td>
                    <td className="text-gray-700 text-xs max-w-md leading-relaxed font-medium">{r.desc}</td>
                    <td className="text-right font-bold text-[#1e3a8a]">{r.tier}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {/* 4. Access Permissions Toggles */}
      {activeTab === "permissions" && (
        <Card className="animate-fadeIn">
          <CardHeader>
            <h3 className="govt-section-header">
              <Sliders size={20} />
              Roles Permission Toggles
            </h3>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {[
              { perm: "Verify NGO Credentials", roles: ["Superadmin", "Gov Auditor"] },
              { perm: "Release Escrow Payments", roles: ["Superadmin", "Company Auditor"] },
              { perm: "Publish Government Circulars", roles: ["Superadmin", "Gov Auditor"] },
              { perm: "Modify Database Configurations", roles: ["Superadmin"] }
            ].map((p, index) => (
              <div key={index} className="flex justify-between items-center p-4 bg-gray-50 border border-gray-200 rounded-xl shadow-sm hover:border-[#1e3a8a]/20 transition-all">
                <span className="text-[#1e3a8a] font-bold text-sm">{p.perm}</span>
                <div className="flex gap-2">
                  {p.roles.map((r, ri) => (
                    <span key={ri} className="govt-badge govt-badge-verified">{r}</span>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* 5. System Audit Trail */}
      {activeTab === "audit" && (
        <Card className="animate-fadeIn">
          <CardHeader>
            <h3 className="govt-section-header">
              <FileText size={20} />
              System Logs & Event Audits
            </h3>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <table className="govt-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>User</th>
                  <th>Action Logged</th>
                  <th className="text-right">Client IP</th>
                </tr>
              </thead>
              <tbody>
                {systemLogs.map((log, idx) => (
                  <tr key={idx}>
                    <td className="text-gray-500 font-medium">{log.time}</td>
                    <td className="font-bold text-gray-950">{log.user}</td>
                    <td className="text-gray-700 text-xs font-medium">{log.action}</td>
                    <td className="text-right font-bold text-[#1e3a8a]">{log.ip}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {activeTab === "ngos" && (
        <Card className="animate-fadeIn">
          <CardHeader>
            <h3 className="govt-section-header">
              <Landmark size={20} />
              NGO Registry
            </h3>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <table className="govt-table">
              <thead>
                <tr>
                  <th>NGO Name</th>
                  <th>Darpan ID</th>
                  <th>CSR-1</th>
                  <th>District</th>
                  <th className="text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Sahyadri Eco Foundation", "MH/2021/012345", "CSR00012345", "Pune", "Verified"],
                  ["Vidarbha Adivasi Vikas Sanstha", "MH/2023/048591", "Pending", "Gadchiroli", "Under Review"],
                  ["Konkan Sagarmata Mandal", "MH/2024/095812", "Submitted", "Ratnagiri", "Under Review"]
                ].map(([name, darpan, csr1, district, status]) => (
                  <tr key={name}>
                    <td className="font-bold text-gray-950">{name}</td>
                    <td className="text-gray-700 font-medium">{darpan}</td>
                    <td className="text-gray-700 font-medium">{csr1}</td>
                    <td className="text-gray-700 font-medium">{district}</td>
                    <td className="text-right"><span className="govt-badge govt-badge-verified">{status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {activeTab === "companies" && (
        <Card className="animate-fadeIn">
          <CardHeader>
            <h3 className="govt-section-header">
              <Building2 size={20} />
              Corporate Sourcing Registry
            </h3>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <table className="govt-table">
              <thead>
                <tr>
                  <th>Company</th>
                  <th>CIN</th>
                  <th>CSR Budget</th>
                  <th>Focus Areas</th>
                  <th className="text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Sahyadri Technology Ventures Ltd", "L72200MH2018PLC309876", "INR 75,00,000", "Water, Education", "Verified"],
                  ["Apex Steel Industries Ltd", "U27100MH2016PLC998812", "INR 85,00,000", "Rural Development", "Pending"],
                  ["Mahindra CSR Trust", "U85300MH2012NPL223310", "INR 2,50,00,000", "Environment", "Verified"]
                ].map(([name, cin, budget, focus, status]) => (
                  <tr key={name}>
                    <td className="font-bold text-gray-950">{name}</td>
                    <td className="text-gray-700 font-medium">{cin}</td>
                    <td className="text-gray-700 font-medium">{budget}</td>
                    <td className="text-gray-700 font-medium">{focus}</td>
                    <td className="text-right"><span className="govt-badge govt-badge-funded">{status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {activeTab === "projects" && (
        <Card className="animate-fadeIn">
          <CardHeader>
            <h3 className="govt-section-header">
              <Ticket size={20} />
              Project Registry
            </h3>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <table className="govt-table">
              <thead>
                <tr>
                  <th>Project</th>
                  <th>NGO</th>
                  <th>District</th>
                  <th>Budget</th>
                  <th className="text-right">Workflow Status</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Gadchiroli Watershed & Afforestation", "Sahyadri Eco Foundation", "Gadchiroli", "INR 25,00,000", "Approved"],
                  ["Pune Rural Digital Smart-Classrooms", "Sahyadri Eco Foundation", "Pune", "INR 35,00,000", "Submitted"],
                  ["Nandurbar Tribal Nutrition Campaign", "Satpura Welfare Society", "Nandurbar", "INR 22,00,000", "Under Review"]
                ].map(([title, ngo, district, budget, status]) => (
                  <tr key={title}>
                    <td className="font-bold text-gray-950">{title}</td>
                    <td className="text-gray-700 font-medium">{ngo}</td>
                    <td className="text-gray-700 font-medium">{district}</td>
                    <td className="text-gray-700 font-medium">{budget}</td>
                    <td className="text-right"><span className="govt-badge govt-badge-pending">{status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {activeTab === "funding" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <h3 className="govt-section-header">
                  <Coins size={20} />
                  Escrow and Tranche Auditing
                </h3>
              </CardHeader>
              <CardContent className="p-0 overflow-x-auto">
                <table className="govt-table">
                  <thead>
                    <tr>
                      <th>Transaction</th>
                      <th>Project</th>
                      <th>Amount</th>
                      <th>Release Basis</th>
                      <th className="text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ["TXN-902840", "Gadchiroli Watershed", "INR 5,00,000", "Milestone 1 evidence", "Cleared"],
                      ["TXN-859182", "Smart Classroom Mulshi", "INR 12,00,000", "Advance release", "Cleared"],
                      ["TXN-PENDING-17", "Check Dam Phase 2", "INR 4,00,000", "Field inspection", "Pending"]
                    ].map(([id, project, amount, basis, status]) => (
                      <tr key={id}>
                        <td className="font-bold text-[#1e3a8a]">{id}</td>
                        <td>{project}</td>
                        <td>{amount}</td>
                        <td>{basis}</td>
                        <td className="text-right"><span className="govt-badge govt-badge-verified">{status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>
          <Card className="border border-slate-200 shadow-sm bg-white">
            <CardHeader>
              <h3 className="govt-section-header text-base font-extrabold text-[#1e3a8a]">Funding Controls</h3>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 text-xs text-gray-700 font-medium">
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg shadow-sm hover:border-[#1e3a8a]/20 transition-all">Require milestone proof before tranche release.</div>
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg shadow-sm hover:border-[#1e3a8a]/20 transition-all">Record company officer approval for all disbursements.</div>
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg shadow-sm hover:border-[#1e3a8a]/20 transition-all">Flag mismatched budget and invoice records.</div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "queue" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 animate-fadeIn">
          {[
            ["NGO Verifications", "2 pending", "Darpan, CSR-1, PAN, 12A/80G checks"],
            ["Corporate Accounts", "1 pending", "CIN, GST, CSR budget and policy validation"],
            ["Project Listings", "2 pending", "Proposal review before marketplace listing"]
          ].map(([title, value, detail]) => (
            <Card key={title} className="border border-slate-200 shadow-sm bg-white hover:border-[#1e3a8a]/30 transition-all">
              <CardContent className="p-5 flex flex-col gap-2">
                <span className="text-[10px] font-extrabold uppercase text-[#1e3a8a] tracking-wider">{title}</span>
                <span className="text-2xl font-extrabold text-[#f97316]">{value}</span>
                <p className="text-xs text-gray-700 font-medium">{detail}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === "reports" && (
        <Card className="animate-fadeIn max-w-4xl">
          <CardHeader>
            <h3 className="govt-section-header">
              <FileText size={20} />
              Reports Desk
            </h3>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              "State CSR Utilization Statement",
              "District Coverage Report",
              "NGO Verification Backlog",
              "Corporate Budget Declaration",
              "Escrow Tranche Register",
              "Annual Impact Report"
            ].map((report) => (
              <Button key={report} variant="outline" className="justify-between py-3">
                <span>{report}</span>
                <ArrowUpRight size={14} />
              </Button>
            ))}
          </CardContent>
        </Card>
      )}

      {activeTab === "analytics" && (
        <div className="flex flex-col gap-6 animate-fadeIn">
          {/* Top Row Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <StatsCard label="Verified NGOs" value="145" icon={Landmark} />
            <StatsCard label="CSR Companies" value="52" icon={Building2} />
            <StatsCard label="Approved Projects" value="420" icon={Ticket} />
            <StatsCard label="Audit Pass Rate" value="98.4%" icon={ShieldCheck} />
          </div>

          {/* Middle Row: Visual Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Chart 1: District Allocation */}
            <Card className="border border-slate-200 shadow-sm bg-white">
              <CardHeader className="pb-2">
                <h3 className="govt-section-header text-sm font-extrabold text-[#1e3a8a]">
                  <Coins size={16} /> District Budget Sourcing
                </h3>
              </CardHeader>
              <CardContent className="h-[250px] flex items-center justify-center p-4">
                <DistrictBudgetPieChart />
              </CardContent>
            </Card>

            {/* Chart 2: Project Distribution */}
            <Card className="border border-slate-200 shadow-sm bg-white">
              <CardHeader className="pb-2">
                <h3 className="govt-section-header text-sm font-extrabold text-[#1e3a8a]">
                  <Ticket size={16} /> Projects by Workflow Stage
                </h3>
              </CardHeader>
              <CardContent className="h-[250px] flex items-center justify-center p-4">
                <ProjectStatusWebChart />
              </CardContent>
            </Card>

            {/* Chart 3: Audits Timeline */}
            <Card className="border border-slate-200 shadow-sm bg-white">
              <CardHeader className="pb-2">
                <h3 className="govt-section-header text-sm font-extrabold text-[#1e3a8a]">
                  <Activity size={16} /> Monthly Escrow Audits
                </h3>
              </CardHeader>
              <CardContent className="h-[250px] flex items-center justify-center p-4">
                <TransactionAuditsLineChart />
              </CardContent>
            </Card>

          </div>

          {/* Bottom Row: Detailed Contextual Analysis */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <Card className="border border-slate-200 shadow-sm bg-white">
              <CardHeader>
                <h4 className="font-bold text-[#1e3a8a] text-sm uppercase tracking-wider">Geographical Concentration</h4>
              </CardHeader>
              <CardContent className="text-xs text-gray-700 font-medium leading-relaxed flex flex-col gap-2">
                <p><strong>Pune & Mumbai Zone:</strong> Account for over 52% of active CSR capital sourcing in the state.</p>
                <p><strong>Aspirational Districts:</strong> Gadchiroli and Nandurbar see prioritized matching rules (priority bonus mapping) to drive development in rural Talukas.</p>
              </CardContent>
            </Card>

            <Card className="border border-slate-200 shadow-sm bg-white">
              <CardHeader>
                <h4 className="font-bold text-[#f97316] text-sm uppercase tracking-wider">Auditing Efficiency</h4>
              </CardHeader>
              <CardContent className="text-xs text-gray-700 font-medium leading-relaxed flex flex-col gap-2">
                <p><strong>Milestone Tranche Controls:</strong> Automated matching algorithms flag discrepancies between invoice declarations and physical evidence uploads.</p>
                <p><strong>Audit Pass Rate:</strong> Currently stands at 98.4%, showing compliant usage of corporate funds inside escrow nodes.</p>
              </CardContent>
            </Card>

            <Card className="border border-slate-200 shadow-sm bg-white">
              <CardHeader>
                <h4 className="font-bold text-emerald-600 text-sm uppercase tracking-wider">Active Backlog Priority</h4>
              </CardHeader>
              <CardContent className="text-xs text-gray-700 font-medium leading-relaxed flex flex-col gap-2">
                <p><strong>NGO Credential Checks:</strong> High volume of new NGO registrations require NITI Aayog Darpan and MCA CSR-1 manual verify backlogs.</p>
                <p><strong>Project Proposal Reviews:</strong> 5 new proposals pending review before they are listed on the public marketplace directory.</p>
              </CardContent>
            </Card>

          </div>
        </div>
      )}

      {activeTab === "circulars" && (
        <Card className="animate-fadeIn">
          <CardHeader>
            <h3 className="govt-section-header">
              <FileText size={20} />
              Circular Registry
            </h3>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {[
              ["GR-2026/06", "Tribal taluka CSR prioritization guidelines", "Published"],
              ["CSR-AUDIT-102", "Updated 12A/80G filing requirements", "Published"],
              ["ESCROW-TRANCHE-14", "Milestone evidence and tranche control procedure", "Draft"]
            ].map(([code, title, status]) => (
              <div key={code} className="p-4 bg-gray-50 border border-gray-200 rounded-xl flex justify-between items-center shadow-sm hover:border-[#1e3a8a]/20 transition-all">
                <div>
                  <span className="block text-[10px] font-extrabold text-[#1e3a8a] tracking-wider">{code}</span>
                  <span className="block text-sm font-bold text-gray-800 mt-1">{title}</span>
                </div>
                <span className={`govt-badge ${status === "Published" ? "govt-badge-verified" : "govt-badge-pending"}`}>{status}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {activeTab === "knowledge" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
          {[
            ["CSR Act Reference", "Companies Act Section 135, Schedule VII, board reporting and spending rules."],
            ["NGO Compliance Guide", "Darpan, CSR-1, 12A, 80G, PAN and audited ledger requirements."],
            ["Project Review SOP", "Administrative checklist for approving project proposals."],
            ["Escrow Evidence Manual", "Standards for tranche proof, geo-tagged media and completion documents."]
          ].map(([title, detail]) => (
            <Card key={title} className="border border-slate-200 shadow-sm bg-white hover:border-[#1e3a8a]/30 transition-all">
              <CardContent className="p-5 flex flex-col gap-2">
                <span className="font-bold text-[#1e3a8a] text-sm">{title}</span>
                <p className="text-xs text-gray-700 leading-relaxed font-medium">{detail}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === "cms" && (
        <Card className="animate-fadeIn">
          <CardHeader>
            <h3 className="govt-section-header">
              <Edit size={20} />
              CMS Editor
            </h3>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {["Homepage Statistics", "Leadership Messages", "Success Stories", "FAQ Registry", "Public Notices", "Footer Links"].map((section) => (
              <div key={section} className="p-4 bg-gray-50 border border-gray-200 rounded-lg flex justify-between items-center shadow-sm hover:border-[#1e3a8a]/20 transition-all">
                <span className="font-bold text-sm text-[#1e3a8a]">{section}</span>
                <Button variant="outline" size="sm">Edit</Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {activeTab === "districts" && (
        <Card className="animate-fadeIn">
          <CardHeader>
            <h3 className="govt-section-header">
              <Landmark size={20} />
              District Data Configuration
            </h3>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <table className="govt-table">
              <thead>
                <tr>
                  <th>District</th>
                  <th>Region</th>
                  <th>Priority Index</th>
                  <th>CSR Projects</th>
                  <th className="text-right">Planning Status</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Pune", "Western Maharashtra", "High", "29", "Active"],
                  ["Gadchiroli", "Vidarbha", "Aspirational", "14", "Priority"],
                  ["Nandurbar", "North Maharashtra", "Aspirational", "9", "Priority"],
                  ["Mumbai City", "Konkan", "High", "22", "Active"]
                ].map(([district, region, priority, projects, status]) => (
                  <tr key={district}>
                    <td className="font-bold text-gray-950">{district}</td>
                    <td className="text-gray-700 font-medium">{region}</td>
                    <td className="text-gray-700 font-medium">{priority}</td>
                    <td className="text-gray-700 font-medium">{projects}</td>
                    <td className="text-right"><span className="govt-badge govt-badge-funded">{status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {activeTab === "config" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
          {[
            ["API Gateway", "Operational", "Backend Express API is reachable through configured base URL."],
            ["PostgreSQL", "Connected", "Prisma database access is enabled for live records."],
            ["Redis Matching Cache", "Optional", "Matching engine falls back to dynamic computation if Redis is offline."],
            ["Cloudinary Uploads", "Configured", "Document and evidence uploads require valid Cloudinary credentials."]
          ].map(([name, status, detail]) => (
            <Card key={name} className="border border-slate-200 shadow-sm bg-white hover:border-[#1e3a8a]/30 transition-all">
              <CardContent className="p-5 flex flex-col gap-2">
                <span className="text-[10px] font-extrabold uppercase text-[#1e3a8a] tracking-wider">{name}</span>
                <span className={`text-xl font-extrabold ${status === "Operational" || status === "Connected" || status === "Configured" ? "text-emerald-600" : "text-[#f97316]"}`}>{status}</span>
                <p className="text-xs text-gray-700 font-medium">{detail}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === "security" && (
        <Card className="animate-fadeIn">
          <CardHeader>
            <h3 className="govt-section-header">
              <Key size={20} />
              Security Console
            </h3>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {[
              ["JWT Secret Policy", "Production must use long random secrets and no source-controlled defaults."],
              ["Role Access Control", "SUPER_ADMIN controls admin and government pages; organization users remain scoped."],
              ["Credential Rotation", "Cloudinary, SMTP, Redis, database and JWT secrets should be rotated before live launch."],
              ["Audit Logging", "Login, verification, upload, report and workflow actions are logged."]
            ].map(([title, detail]) => (
              <div key={title} className="p-4 bg-gray-50 border border-gray-200 rounded-xl shadow-sm hover:border-[#1e3a8a]/20 transition-all">
                <span className="font-bold text-[#1e3a8a] text-sm">{title}</span>
                <p className="text-xs text-gray-700 mt-1 font-medium">{detail}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {activeTab === "settings" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
          {[
            ["Verification SLA", "7 working days", "Maximum review duration for organization and project approvals."],
            ["Session Policy", "15 minute access token", "Refresh token is stored in an HttpOnly cookie."],
            ["Evidence Retention", "8 years", "Project evidence and reports retained for regulatory review."],
            ["Public Directory Mode", "Verified only", "Anonymous users can view verified public records only."]
          ].map(([label, value, detail]) => (
            <Card key={label} className="border border-slate-200 shadow-sm bg-white hover:border-[#1e3a8a]/30 transition-all">
              <CardContent className="p-5 flex flex-col gap-2">
                <span className="text-[10px] font-extrabold uppercase text-[#1e3a8a] tracking-wider">{label}</span>
                <span className="text-xl font-extrabold text-[#f97316]">{value}</span>
                <p className="text-xs text-gray-700 font-medium">{detail}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === "notifications" && (
        <Card className="animate-fadeIn">
          <CardHeader>
            <h3 className="govt-section-header">
              <AlertTriangle size={20} />
              Notification Controls
            </h3>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {["Project status changed", "Organization verification decision", "Milestone funding released", "Document expiry warning"].map((event) => (
              <div key={event} className="p-4 bg-gray-50 border border-gray-200 rounded-xl flex justify-between items-center shadow-sm hover:border-[#1e3a8a]/20 transition-all">
                <span className="font-bold text-sm text-[#1e3a8a]">{event}</span>
                <span className="govt-badge govt-badge-verified">Enabled</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

    </div>
  );
}
