"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Coins, Star, Award, Layers, Sparkles, FolderKanban, Check, 
  ShieldAlert, Landmark, FileText, TrendingUp, Compass, 
  Sliders, FileCheck2, ShieldCheck, Download, Calendar, Mail, 
  Bell, Settings as SettingsIcon, Users, Play, PlusCircle, Trash, FileDown, CheckCircle2
} from "lucide-react";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatsCard } from "@/components/ui/StatsCard";
import { EmptyState } from "@/components/ui/EmptyState";
import dynamic from "next/dynamic";

const BudgetPieChart = dynamic(() => import("@/components/BudgetPieChart"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-6 h-6 rounded-full border-2 border-[#1e3a8a] border-t-transparent animate-spin" />
    </div>
  )
});

type CompanyTab = 
  | "overview" | "budget" | "marketplace" | "recommendations" | "funded" 
  | "reviews" | "milestones" | "ngos" | "meetings" | "documents" 
  | "compliance" | "reports" | "analytics" | "coverage" | "sdg" 
  | "notifications" | "audit" | "settings";

export default function CompanyDashboard({ params }: { params?: { tab?: string } }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<CompanyTab>("overview");

  useEffect(() => {
    if (params?.tab) {
      setActiveTab(params.tab as CompanyTab);
    }
  }, [params?.tab]);

  const handleTabChange = (tab: CompanyTab) => {
    setActiveTab(tab);
    router.push(`/company-dashboard/${tab}`);
  };

  const [totalBudget, setTotalBudget] = useState(10000000);
  
  const [allocations, setAllocations] = useState({
    education: 40,
    healthcare: 30,
    water: 20,
    environment: 10
  });

  const handleSliderChange = (sector: keyof typeof allocations, val: number) => {
    setAllocations(prev => ({ ...prev, [sector]: val }));
  };

  const getSourcedAmount = (pct: number) => (totalBudget * pct) / 100;

  const [matches, setMatches] = useState([
    { id: "p-2", title: "Pune Zilla Parishad Smart Digital-Classrooms", ngo: "Sahyadri Eco Foundation", score: 95, budget: 3500000, focus: "Education & Literacy", district: "Pune" },
    { id: "p-1", title: "Gadchiroli Watershed & Reforestation Initiative", ngo: "Sahyadri Eco Foundation", score: 85, budget: 2500000, focus: "Water Conservation", district: "Gadchiroli" }
  ]);

  const [milestones, setMilestones] = useState([
    { id: "m-1", project: "Gadchiroli Watershed Initiative", name: "Milestone 2: Completion of Check Dam #2", amount: 400000, status: "Pending Approval", evidence: "evidence_dam2.zip", ngo: "Sahyadri Eco Foundation" }
  ]);

  const [auditLogs, setAuditLogs] = useState([
    { date: "June 18, 2026", project: "Gadchiroli Watershed Initiative", amount: 500000, type: "Tranche 1 Payout", status: "Cleared", receipt: "receipt_tr1_gad.pdf" },
    { date: "June 05, 2026", project: "Smart Classroom Mulshi", amount: 1200000, type: "Advance Release", status: "Cleared", receipt: "receipt_adv_mulshi.pdf" }
  ]);

  const [meetings, setMeetings] = useState([
    { id: "1", ngo: "Sahyadri Eco Foundation", date: "June 25, 2026", time: "11:00 AM", topic: "Milestone 3 Inspection Review" }
  ]);
  const [mNgo, setMNgo] = useState("Sahyadri Eco Foundation");
  const [mDate, setMDate] = useState("");
  const [mTime, setMTime] = useState("10:00 AM");
  const [mTopic, setMTopic] = useState("");

  const handleAddMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mDate || !mTopic) return;
    const newMeet = {
      id: String(meetings.length + 1),
      ngo: mNgo,
      date: mDate,
      time: mTime,
      topic: mTopic
    };
    setMeetings([newMeet, ...meetings]);
    setMTopic("");
    setMDate("");
  };

  const [releasingId, setReleasingId] = useState<string | null>(null);

  const handleReleaseMilestone = (id: string, amount: number, project: string, ngo: string) => {
    setReleasingId(id);
    setTimeout(() => {
      setMilestones(milestones.filter(m => m.id !== id));
      const newLog = {
        date: "Just now",
        project: project,
        amount: amount,
        type: "Milestone Tranche Release",
        status: "Cleared",
        receipt: `receipt_tr2_${id}.pdf`
      };
      setAuditLogs([newLog, ...auditLogs]);
      setReleasingId(null);
    }, 1500);
  };

  const pieData = [
    { name: "Education", value: getSourcedAmount(allocations.education) },
    { name: "Healthcare", value: getSourcedAmount(allocations.healthcare) },
    { name: "Water Conservation", value: getSourcedAmount(allocations.water) },
    { name: "Environment", value: getSourcedAmount(allocations.environment) }
  ];

  const COLORS = ["#1e3a8a", "#f97316", "#16a34a", "#64748b"];
  const totalAllocatedPercentage = allocations.education + allocations.healthcare + allocations.water + allocations.environment;

  return (
    <div className="px-6 md:px-10 py-8 max-w-7xl mx-auto flex flex-col gap-7 min-h-screen">
      
      {/* Header */}
      <div className="flex flex-col gap-1">
        <span className="text-[#f97316] font-bold text-[11px] uppercase tracking-widest">Sahyadri Technology Ventures Ltd</span>
        <h1 className="font-heading font-extrabold text-2xl text-slate-900 tracking-tight">Company Console</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-200 pb-px overflow-x-auto bg-white rounded-t-lg px-2 pt-1">
        {[
          { id: "overview", label: "Overview Workspace", icon: Layers },
          { id: "budget", label: "Budget Allocations", icon: Sliders },
          { id: "recommendations", label: "AI Matches", icon: Sparkles },
          { id: "milestones", label: "Milestones Release", icon: Award },
          { id: "meetings", label: "Meetings Coordinator", icon: Calendar },
          { id: "audit", label: "Spend Auditing", icon: FileText }
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id as CompanyTab)}
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

      {/* 1. Overview */}
      {activeTab === "overview" && (
        <div className="flex flex-col gap-7 animate-fadeIn">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <StatsCard label="CSR Budget Limit" value={`₹${totalBudget.toLocaleString("en-IN")}`} icon={Coins} />
            <StatsCard label="Funds Allocated" value={`₹${(totalBudget * totalAllocatedPercentage / 100).toLocaleString("en-IN")}`} icon={Award} />
            <StatsCard label="Audited Payments" value="₹17.0 Lakhs" icon={FileCheck2} />
            <StatsCard label="Focus SDGs Supported" value="4 Focus SDGs" icon={Compass} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            <div className="lg:col-span-2 flex flex-col gap-5">
              <Card>
                <CardHeader>
                  <h3 className="govt-section-header">Focus Sector Budget Spread</h3>
                </CardHeader>
                <CardContent className="flex flex-col md:flex-row gap-8 items-center justify-around h-[300px]">
                  <div className="w-[200px] h-[200px] shrink-0">
                    <BudgetPieChart data={pieData} colors={COLORS} />
                  </div>
                  <div className="flex flex-col gap-4 text-xs font-semibold">
                    {pieData.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <span className="w-3.5 h-3.5 rounded-sm" style={{ backgroundColor: COLORS[idx] }} />
                        <div className="flex flex-col">
                          <span className="text-slate-500">{item.name}</span>
                          <span className="text-slate-800 font-bold">₹{item.value.toLocaleString("en-IN")}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <h3 className="govt-section-header text-base">
                  <Sparkles size={18} className="text-[#f97316]" />
                  Best Matching Proposal
                </h3>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                {matches.slice(0, 1).map((m) => (
                  <div key={m.id} className="bg-blue-50 border border-blue-200 p-5 rounded-lg flex flex-col gap-3">
                    <div className="flex justify-between items-center text-xs font-semibold text-[#f97316]">
                      <span className="govt-badge govt-badge-pending">{m.score}% Match</span>
                      <span className="text-slate-500">{m.district}</span>
                    </div>
                    <h4 className="font-heading font-bold text-sm text-slate-900 leading-tight">{m.title}</h4>
                    <span className="text-xs text-slate-500 font-medium">NGO: {m.ngo}</span>
                    <Button variant="primary" size="sm" onClick={() => handleTabChange("recommendations")} className="w-full mt-1">
                      Evaluate Match
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* 2. Budget Sliders */}
      {activeTab === "budget" && (
        <Card className="animate-fadeIn">
          <CardHeader>
            <h3 className="govt-section-header">Set Sector Investment Allocations</h3>
          </CardHeader>
          <CardContent className="flex flex-col gap-8 max-w-2xl">
            <div className="flex flex-col gap-2 bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs font-medium text-slate-500">
              <span className="text-slate-800 font-bold">Total Budget Cap:</span>
              <input 
                type="number"
                value={totalBudget}
                onChange={(e) => setTotalBudget(Number(e.target.value))}
                className="govt-input font-bold text-base max-w-sm" 
              />
              <span className="text-[10px] text-slate-400 mt-1 uppercase">Adjust total budget limits to re-scale investments</span>
            </div>

            <div className="flex flex-col gap-6">
              {[
                { key: "education", label: "Education & Smart Labs", color: "#1e3a8a" },
                { key: "healthcare", label: "Healthcare & Primary Care Mobile Clinics", color: "#f97316" },
                { key: "water", label: "Water Harvesting Dams", color: "#16a34a" },
                { key: "environment", label: "Urban Afforestation", color: "#64748b" }
              ].map((sec) => (
                <div key={sec.key} className="flex flex-col gap-2">
                  <div className="flex justify-between text-xs font-bold text-slate-700">
                    <span className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: sec.color }} />
                      {sec.label}
                    </span>
                    <span>{allocations[sec.key as keyof typeof allocations]}% (₹{getSourcedAmount(allocations[sec.key as keyof typeof allocations]).toLocaleString("en-IN")})</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={allocations[sec.key as keyof typeof allocations]} 
                    onChange={(e) => handleSliderChange(sec.key as any, Number(e.target.value))}
                    className="w-full accent-[#1e3a8a] rounded-lg cursor-pointer"
                  />
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center text-xs font-bold border-t border-slate-200 pt-4 text-slate-500">
              <span>Combined Allocation: {totalAllocatedPercentage}%</span>
              <span className={totalAllocatedPercentage > 100 ? "text-rose-600 animate-pulse" : "text-emerald-600"}>
                {totalAllocatedPercentage > 100 ? "Limit Exceeded (Over 100%)" : "Within Cap Limit"}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 3. AI Matches */}
      {activeTab === "recommendations" && (
        <div className="flex flex-col gap-6 animate-fadeIn">
          <h3 className="govt-section-header">
            <Sparkles size={20} className="text-[#f97316]" />
            AI Proposal Recommendations
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {matches.map((item) => (
              <Card key={item.id} className="flex flex-col justify-between gap-5">
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span className="govt-badge govt-badge-pending">{item.score}% Match</span>
                    <span className="text-slate-500 font-medium">NGO: {item.ngo}</span>
                  </div>
                  <h4 className="font-heading font-bold text-lg text-slate-900 leading-tight">{item.title}</h4>
                  <p className="text-slate-500 text-xs">Target Focus Area: {item.focus} | Location: {item.district}</p>
                </div>
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-slate-700">Budget: ₹{item.budget.toLocaleString("en-IN")}</span>
                  <Button variant="accent" size="sm" onClick={() => alert("Proposal accepted for funding escrow.")}>Accept for Escrow</Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* 4. Milestone Approvals */}
      {activeTab === "milestones" && (
        <Card className="animate-fadeIn">
          <CardHeader>
            <h3 className="govt-section-header">Milestones Tranches Escrow Queue</h3>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            {milestones.length > 0 ? (
              <table className="govt-table">
                <thead>
                  <tr>
                    <th>Project Focus</th>
                    <th>Milestone Description</th>
                    <th>Recipient NGO</th>
                    <th>Amount</th>
                    <th className="text-right">Audit Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {milestones.map((m) => (
                    <tr key={m.id}>
                      <td className="font-bold text-slate-800">{m.project}</td>
                      <td className="text-slate-500">{m.name}</td>
                      <td>{m.ngo}</td>
                      <td>₹{m.amount.toLocaleString("en-IN")}</td>
                      <td className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" className="text-xs" onClick={() => alert("Evidence ZIP downloaded.")}>View Evidence</Button>
                          <Button 
                            variant="accent" 
                            size="sm"
                            disabled={releasingId === m.id}
                            onClick={() => handleReleaseMilestone(m.id, m.amount, m.project, m.ngo)}
                          >
                            {releasingId === m.id ? "Releasing..." : "Release Tranche"}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <EmptyState 
                title="Approvals queue clear" 
                description="No active milestone release requests are pending audits." 
                icon={CheckCircle2}
              />
            )}
          </CardContent>
        </Card>
      )}

      {/* 5. Meetings */}
      {activeTab === "meetings" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start animate-fadeIn">
          
          <Card className="lg:col-span-2">
            <CardHeader>
              <h3 className="govt-section-header">Scheduled Meetings</h3>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <table className="govt-table">
                <thead>
                  <tr>
                    <th>Grassroots NGO</th>
                    <th>Scheduled Date & Time</th>
                    <th>Meeting Focus Topic</th>
                  </tr>
                </thead>
                <tbody>
                  {meetings.map((meet) => (
                    <tr key={meet.id}>
                      <td className="font-bold text-slate-800">{meet.ngo}</td>
                      <td>{meet.date} at {meet.time}</td>
                      <td>{meet.topic}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="govt-section-header text-base">Schedule Meeting</h3>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddMeeting} className="flex flex-col gap-4 text-xs font-semibold text-slate-600">
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-700">Target NGO Partner:</label>
                  <select 
                    value={mNgo} 
                    onChange={(e) => setMNgo(e.target.value)}
                    className="govt-input"
                  >
                    <option>Sahyadri Eco Foundation</option>
                    <option>Udan Welfare Society</option>
                    <option>Vidarbha Seva Samiti</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-slate-700">Meeting Date:</label>
                    <input 
                      type="date" 
                      value={mDate} 
                      onChange={(e) => setMDate(e.target.value)}
                      className="govt-input" 
                      required 
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-slate-700">Meeting Time:</label>
                    <input 
                      type="text" 
                      value={mTime} 
                      onChange={(e) => setMTime(e.target.value)}
                      placeholder="e.g. 11:30 AM"
                      className="govt-input" 
                      required 
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-700">Agenda / Topic:</label>
                  <input 
                    type="text" 
                    value={mTopic} 
                    onChange={(e) => setMTopic(e.target.value)}
                    placeholder="e.g. Discuss dam site audits"
                    className="govt-input" 
                    required 
                  />
                </div>
                <Button type="submit" className="py-2.5">Schedule Meet</Button>
              </form>
            </CardContent>
          </Card>

        </div>
      )}

      {/* 6. Audit */}
      {activeTab === "audit" && (
        <Card className="animate-fadeIn">
          <CardHeader className="flex justify-between items-center sm:flex-row flex-col gap-4">
            <h3 className="govt-section-header">Compliance Audit Ledger</h3>
            <Button variant="outline" size="sm" className="flex items-center gap-1.5" onClick={() => alert("Board PDF Summary Downloaded.")}>
              <Download size={14} /> Download Board Summary (PDF)
            </Button>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <table className="govt-table">
              <thead>
                <tr>
                  <th>Date Sourced</th>
                  <th>Initiative Details</th>
                  <th>Payment Nature</th>
                  <th>Transacted Amount</th>
                  <th className="text-right">Audit Status</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.map((log, index) => (
                  <tr key={index}>
                    <td className="text-slate-500">{log.date}</td>
                    <td className="font-bold text-slate-800">{log.project}</td>
                    <td>{log.type}</td>
                    <td>₹{log.amount.toLocaleString("en-IN")}</td>
                    <td className="text-right"><span className="govt-badge govt-badge-verified">{log.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

    </div>
  );
}
