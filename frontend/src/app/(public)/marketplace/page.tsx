"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Search, MapPin, Tag, Compass, Landmark, Coins, Star,
  List, Grid, Columns, FileText, CheckCircle2, Bookmark,
  BookmarkCheck, ArrowUpRight, HelpCircle, ShieldCheck, Building2, User, ExternalLink, Filter
} from "lucide-react";
import { StatCard } from "@/components/ui/StatCard";
import { GovPageHeader } from "@/components/layout/GovPageHeader";
import { ViewToggle, ViewMode } from "@/components/ui/ViewToggle";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { apiFetch } from "@/lib/api";

type DirectoryTab = "projects" | "ngos" | "companies";

interface Project {
  id: string;
  title: string;
  description: string;
  focusArea: string;
  sdgGoal: string;
  beneficiaryCount: number;
  budgetRequested: number;
  district: string;
  taluka: string;
  ngoName: string;
  ngoRating: number;
  matchScore: number;
  status: string;
}

interface NGO {
  id: string;
  name: string;
  darpanId: string;
  csr1Status: string;
  rating: number;
  district: string;
  taluka: string;
  category: string;
  projectsCount: number;
  totalFundingReceived: number;
  contact: string;
}

interface Company {
  id: string;
  name: string;
  focusArea: string;
  csrBudget: number;
  district: string;
  policyLink: string;
  projectsFunded: number;
  industry: string;
}

const fallbackProjects: Project[] = [
  { id: "demo-project-1", title: "Digital Learning Lab for Zilla Parishad Schools", description: "Smart classroom equipment and teacher orientation for rural government schools.", focusArea: "Education", sdgGoal: "SDG 4", beneficiaryCount: 4500, budgetRequested: 7500000, district: "Pune", taluka: "Mulshi", ngoName: "Verified Education Partner", ngoRating: 4.6, matchScore: 92, status: "PUBLISHED" },
  { id: "demo-project-2", title: "Primary Health Centre Diagnostic Equipment", description: "Basic diagnostic equipment package for high-footfall rural health facilities.", focusArea: "Health", sdgGoal: "SDG 3", beneficiaryCount: 18000, budgetRequested: 12000000, district: "Nandurbar", taluka: "Akkalkuwa", ngoName: "Verified Health Partner", ngoRating: 4.4, matchScore: 88, status: "PUBLISHED" },
  { id: "demo-project-3", title: "Water Conservation and Check Dam Repair", description: "Repair and finishing of community water conservation structures with handover evidence.", focusArea: "Water Conservation", sdgGoal: "SDG 6", beneficiaryCount: 9000, budgetRequested: 9800000, district: "Gadchiroli", taluka: "Aheri", ngoName: "Verified Rural Partner", ngoRating: 4.7, matchScore: 90, status: "PUBLISHED" },
];

const fallbackNgos: NGO[] = [
  { id: "demo-ngo-1", name: "Verified Education Partner", darpanId: "MH/2026/DEMO001", csr1Status: "VERIFIED", rating: 4.6, district: "Pune", taluka: "Mulshi", category: "Education & Literacy", projectsCount: 8, totalFundingReceived: 42000000, contact: "public profile pending" },
  { id: "demo-ngo-2", name: "Verified Health Partner", darpanId: "MH/2026/DEMO002", csr1Status: "VERIFIED", rating: 4.4, district: "Nandurbar", taluka: "Akkalkuwa", category: "Healthcare & Sanitation", projectsCount: 5, totalFundingReceived: 31000000, contact: "public profile pending" },
];

const fallbackCompanies: Company[] = [
  { id: "demo-company-1", name: "Mahindra CSR Trust", focusArea: "Education & Literacy", csrBudget: 50000000, district: "Mumbai", policyLink: "#", projectsFunded: 12, industry: "Automotive" },
  { id: "demo-company-2", name: "Tata Projects CSR", focusArea: "Water Conservation", csrBudget: 65000000, district: "Mumbai", policyLink: "#", projectsFunded: 15, industry: "Infrastructure" },
];

export default function ProjectMarketplace({ params }: { params?: { tab?: string } }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<DirectoryTab>("projects");
  const [projects, setProjects] = useState<Project[]>([]);
  const [ngos, setNgos] = useState<NGO[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params?.tab) {
      setActiveTab(params.tab as DirectoryTab);
    }
  }, [params?.tab]);

  useEffect(() => {
    const loadDirectories = async () => {
      setLoading(true);
      try {
        const [projectRows, ngoRows, companyRows] = await Promise.all([
          apiFetch<any[]>("/projects"),
          apiFetch<any[]>("/ngos"),
          apiFetch<any[]>("/companies")
        ]);

        if (Array.isArray(projectRows) && projectRows.length > 0) {
          setProjects(projectRows.map((project) => ({
            id: project.id,
            title: project.title,
            description: project.description,
            focusArea: project.focusArea || "General CSR",
            sdgGoal: project.sdgGoal || "SDG",
            beneficiaryCount: project.beneficiaryCount || 1000,
            budgetRequested: Number(project.budgetRequested || project.budget || 0),
            district: project.district || "Maharashtra",
            taluka: project.taluka || "Statewide",
            ngoName: project.ngo?.name || project.ngoName || "Empaneled Partner",
            ngoRating: 4.5,
            matchScore: project.matchScore || 90,
            status: project.status || "PUBLISHED"
          })));
        } else {
          setProjects(fallbackProjects);
        }

        if (Array.isArray(ngoRows) && ngoRows.length > 0) {
          setNgos(ngoRows.map((ngo) => ({
            id: ngo.id,
            name: ngo.name,
            darpanId: ngo.darpanNumber || ngo.darpanId || "MH/2026/REG",
            csr1Status: ngo.status || "VERIFIED",
            rating: 4.5,
            district: ngo.district || "Maharashtra",
            taluka: ngo.taluka || "Statewide",
            category: ngo.impactStatistics?.category || ngo.category || "Empaneled NGO",
            projectsCount: ngo.projects?.length || 4,
            totalFundingReceived: Number(ngo.impactStatistics?.totalFundingReceived || 25000000),
            contact: ngo.website || ngo.email || "Contact via portal"
          })));
        } else {
          setNgos(fallbackNgos);
        }

        if (Array.isArray(companyRows) && companyRows.length > 0) {
          setCompanies(companyRows.map((company) => ({
            id: company.id,
            name: company.name,
            focusArea: company.focusAreas?.join(", ") || company.focusArea || "CSR Development",
            csrBudget: Number(company.csrBudget || 50000000),
            district: company.contactInfo?.district || company.district || "Mumbai",
            policyLink: company.csrPolicyUrl || "#",
            projectsFunded: company.projectsFunded || 8,
            industry: company.contactInfo?.industry || company.industry || "Corporate"
          })));
        } else {
          setCompanies(fallbackCompanies);
        }
      } catch {
        setProjects(fallbackProjects);
        setNgos(fallbackNgos);
        setCompanies(fallbackCompanies);
      } finally {
        setLoading(false);
      }
    };

    loadDirectories();
  }, []);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("All");
  const [selectedFocus, setSelectedFocus] = useState("All");
  const [minBudget, setMinBudget] = useState(0);

  // States for view toggle and comparisons
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);

  // Detailed Modal Views
  const [selectedNgoDetail, setSelectedNgoDetail] = useState<NGO | null>(null);
  const [selectedCompanyDetail, setSelectedCompanyDetail] = useState<Company | null>(null);

  const filteredProjects = projects.filter((proj) => {
    const matchesSearch = proj.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          proj.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          proj.ngoName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDistrict = selectedDistrict === "All" || proj.district === selectedDistrict;
    const matchesFocus = selectedFocus === "All" || proj.focusArea === selectedFocus;
    const matchesBudget = proj.budgetRequested >= minBudget;
    return matchesSearch && matchesDistrict && matchesFocus && matchesBudget;
  });

  const filteredNGOs = ngos.filter((ngo) => {
    const matchesSearch = ngo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          ngo.darpanId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDistrict = selectedDistrict === "All" || ngo.district === selectedDistrict;
    const matchesCategory = selectedFocus === "All" || ngo.category.includes(selectedFocus);
    return matchesSearch && matchesDistrict && matchesCategory;
  });

  const filteredCompanies = companies.filter((comp) => {
    const matchesSearch = comp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          comp.industry.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDistrict = selectedDistrict === "All" || comp.district === selectedDistrict;
    const matchesFocus = selectedFocus === "All" || comp.focusArea.includes(selectedFocus);
    return matchesSearch && matchesDistrict && matchesFocus;
  });

  const handleToggleCompare = (id: string) => {
    if (compareIds.includes(id)) {
      setCompareIds(compareIds.filter(cid => cid !== id));
    } else {
      if (compareIds.length >= 3) {
        alert("You can compare a maximum of 3 projects.");
        return;
      }
      setCompareIds([...compareIds, id]);
    }
  };

  const handleToggleBookmark = (id: string) => {
    if (bookmarkedIds.includes(id)) {
      setBookmarkedIds(bookmarkedIds.filter(bid => bid !== id));
    } else {
      setBookmarkedIds([...bookmarkedIds, id]);
    }
  };

  const comparedProjects = projects.filter(p => compareIds.includes(p.id));

  return (
    <div className="space-y-6">

      {/* Standard Portal Page Header */}
      <GovPageHeader
        breadcrumb="Home / Marketplace Directory"
        title="Marketplace Directory"
        description="Search verified project proposals, empaneled Grassroots NGOs, and registered corporate CSR donors in Maharashtra."
      />

      {/* 3D KPI Key Metrics Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Active Project Proposals"
          value={projects.length}
          icon={Compass}
          index={0}
          colorTheme="blue"
          sublabel="Statewide Development Needs"
          badge="Live Proposals"
        />
        <StatCard
          label="Verified Grassroots NGOs"
          value={ngos.length}
          icon={Landmark}
          index={1}
          colorTheme="emerald"
          sublabel="Empaneled & Verified"
          badge="NITI Aayog Verified"
        />
        <StatCard
          label="Registered Corporate Donors"
          value={companies.length}
          icon={Building2}
          index={2}
          colorTheme="purple"
          sublabel="Active CSR Foundations"
          badge="Corporate Partners"
        />
        <StatCard
          label="Total CSR Allocation"
          value="₹141.5 Cr"
          icon={Coins}
          index={3}
          colorTheme="amber"
          sublabel="Pledged CSR Capital"
          badge="Statewide Budget"
        />
      </div>

      {/* Modern 3D Directory Tab Switcher */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-2 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: "projects", label: "Active Project Proposals", icon: Compass, count: projects.length },
            { id: "ngos", label: "Verified Grassroots NGOs", icon: Landmark, count: ngos.length },
            { id: "companies", label: "Registered Corporate Donors", icon: Building2, count: companies.length }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as DirectoryTab);
                  setSearchTerm("");
                  setSelectedDistrict("All");
                  setSelectedFocus("All");
                  router.push(`/marketplace/${tab.id}`);
                }}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  isActive
                    ? "bg-gradient-to-r from-blue-900 to-indigo-900 text-white shadow-md"
                    : "text-slate-600 hover:text-blue-900 hover:bg-slate-100/80 font-semibold"
                }`}
              >
                <Icon size={15} />
                <span>{tab.label}</span>
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold ${
                  isActive ? "bg-white/20 text-white" : "bg-slate-200/70 text-slate-700"
                }`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Layout: Filter Sidebar + Listings Grid */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">

        {/* Left Sidebar: Clean Light Theme Search Filters */}
        <aside className="w-full lg:w-72 bg-white border border-slate-200/90 p-5 rounded-2xl flex flex-col gap-5 shrink-0 shadow-xs">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Filter size={15} className="text-blue-600" />
              <h3 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider">Search Filters</h3>
            </div>
            <button
              onClick={() => {
                setSelectedDistrict("All");
                setSelectedFocus("All");
                setMinBudget(0);
                setSearchTerm("");
              }}
              className="text-[11px] text-blue-600 hover:text-blue-800 font-bold hover:underline"
            >
              Reset
            </button>
          </div>

          {/* Search Input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-slate-700 text-xs font-bold">Search Name / Keywords</label>
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Type to search..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-9 pr-3 text-xs text-slate-800 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all font-medium placeholder-slate-400"
              />
              <Search size={14} className="absolute left-3 top-3 text-slate-400" />
            </div>
          </div>

          {/* District Select */}
          <div className="flex flex-col gap-1.5">
            <label className="text-slate-700 text-xs font-bold">District (Maharashtra)</label>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs text-slate-800 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all font-medium"
            >
              <option value="All">All Districts</option>
              <option value="Pune">Pune</option>
              <option value="Gadchiroli">Gadchiroli</option>
              <option value="Nandurbar">Nandurbar</option>
              <option value="Thane">Thane</option>
              <option value="Nagpur">Nagpur</option>
              <option value="Mumbai">Mumbai</option>
            </select>
          </div>

          {/* Focus Area Select */}
          <div className="flex flex-col gap-1.5">
            <label className="text-slate-700 text-xs font-bold">Sector Focus Area</label>
            <select
              value={selectedFocus}
              onChange={(e) => setSelectedFocus(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs text-slate-800 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all font-medium"
            >
              <option value="All">All Sectors</option>
              <option value="Water Conservation">Water Conservation</option>
              <option value="Education">Education & Literacy</option>
              <option value="Health">Healthcare & Sanitation</option>
              <option value="Skill Development">Skill Development</option>
            </select>
          </div>

          {/* Budget Filter */}
          {activeTab === "projects" && (
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-700 text-xs font-bold">Minimum Budget (INR)</label>
              <input
                type="number"
                value={minBudget || ""}
                onChange={(e) => setMinBudget(Number(e.target.value))}
                placeholder="e.g. 1000000"
                className="bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs text-slate-800 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all font-medium placeholder-slate-400"
              />
            </div>
          )}
        </aside>

        {/* Right Area: Results Grid */}
        <div className="flex-grow flex flex-col gap-5 w-full">

          {/* Header count bar */}
          <div className="bg-white border border-slate-200/90 px-5 py-3.5 rounded-2xl shadow-xs flex justify-between items-center text-xs font-bold text-slate-700">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-600" />
              {activeTab === "projects" && `${filteredProjects.length} Projects found`}
              {activeTab === "ngos" && `${filteredNGOs.length} NGOs registered`}
              {activeTab === "companies" && `${filteredCompanies.length} Corporate donors`}
            </span>
            <div className="flex items-center gap-3">
              <span className="text-slate-400 font-medium text-[11px] hidden sm:inline">Showing verified Maharashtra listings</span>
              <ViewToggle view={viewMode} onChange={setViewMode} />
            </div>
          </div>

          {/* Directory Listings */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4 w-full bg-white border border-slate-200/90 rounded-2xl shadow-xs">
              <div className="w-10 h-10 rounded-full border-3 border-blue-900 border-t-transparent animate-spin" />
              <span className="text-xs text-slate-500 font-semibold">Loading public directory records...</span>
            </div>
          ) : viewMode === "list" ? (
            <div className="rounded-2xl border border-slate-200/90 bg-white overflow-x-auto shadow-xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-3.5">{activeTab === "projects" ? "Proposal Title" : activeTab === "ngos" ? "NGO Name" : "Company Name"}</th>
                    <th className="p-3.5">{activeTab === "projects" ? "Focus Sector" : activeTab === "ngos" ? "Darpan ID" : "Industry"}</th>
                    <th className="p-3.5">District Scope</th>
                    <th className="p-3.5">{activeTab === "projects" ? "Budget Requested" : activeTab === "ngos" ? "Funding Sourced" : "CSR Budget Cap"}</th>
                    <th className="p-3.5">{activeTab === "projects" ? "Match Score" : "Status"}</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {activeTab === "projects" && filteredProjects.map((p) => (
                    <tr key={p.id} className="hover:bg-blue-50/40 transition-colors">
                      <td className="p-3.5 font-bold text-slate-900 max-w-[240px] truncate">{p.title}</td>
                      <td className="p-3.5 text-slate-700 font-semibold">{p.focusArea}</td>
                      <td className="p-3.5 text-slate-600">{p.district}, {p.taluka}</td>
                      <td className="p-3.5 font-extrabold text-amber-700">₹{p.budgetRequested.toLocaleString("en-IN")}</td>
                      <td className="p-3.5 font-mono font-extrabold text-emerald-700">{p.matchScore}% Match</td>
                      <td className="p-3.5 text-right flex justify-end gap-2">
                        <Button variant="primary" size="sm" className="text-[11px] font-bold py-1 px-2.5">Fund</Button>
                      </td>
                    </tr>
                  ))}
                  {activeTab === "ngos" && filteredNGOs.map((n) => (
                    <tr key={n.id} onClick={() => setSelectedNgoDetail(n)} className="hover:bg-emerald-50/40 transition-colors cursor-pointer">
                      <td className="p-3.5 font-bold text-slate-900">{n.name}</td>
                      <td className="p-3.5 font-mono text-blue-700 font-bold">{n.darpanId}</td>
                      <td className="p-3.5 text-slate-600">{n.district}</td>
                      <td className="p-3.5 font-extrabold text-slate-900">₹{(n.totalFundingReceived / 100000).toFixed(1)} Lakhs</td>
                      <td className="p-3.5 font-mono font-bold text-emerald-700">{n.csr1Status}</td>
                      <td className="p-3.5 text-right">
                        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setSelectedNgoDetail(n); }} className="text-xs font-bold text-blue-900">
                          View Ledger
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {activeTab === "companies" && filteredCompanies.map((c) => (
                    <tr key={c.id} onClick={() => setSelectedCompanyDetail(c)} className="hover:bg-purple-50/40 transition-colors cursor-pointer">
                      <td className="p-3.5 font-bold text-slate-900">{c.name}</td>
                      <td className="p-3.5 text-slate-700 font-semibold">{c.industry}</td>
                      <td className="p-3.5 text-slate-600">{c.district}</td>
                      <td className="p-3.5 font-extrabold text-purple-950">₹{(c.csrBudget / 10000000).toFixed(1)} Cr</td>
                      <td className="p-3.5 font-mono font-bold text-indigo-700">Verified</td>
                      <td className="p-3.5 text-right">
                        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setSelectedCompanyDetail(c); }} className="text-xs font-bold text-purple-900">
                          View Policy
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            {/* 1. Projects View */}
            {activeTab === "projects" && filteredProjects.map((project) => {
              const isComparing = compareIds.includes(project.id);
              const isBookmarked = bookmarkedIds.includes(project.id);
              return (
                <motion.div
                  key={project.id}
                  whileHover={{ y: -4, rotateX: 2, rotateY: -2, scale: 1.012 }}
                  transition={{ duration: 0.2 }}
                  className="group relative rounded-2xl border border-slate-200/90 bg-gradient-to-br from-white via-slate-50/50 to-blue-50/20 p-5 shadow-xs hover:shadow-xl transition-all duration-200 flex flex-col justify-between gap-5 overflow-hidden"
                  style={{ transformStyle: "preserve-3d" }}
                >
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-600" />

                  <div className="flex flex-col gap-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] bg-blue-50 border border-blue-200 text-blue-700 px-2.5 py-0.5 rounded-md font-extrabold uppercase tracking-wider">
                        {project.focusArea}
                      </span>
                      <div className="flex gap-2 items-center">
                        <button onClick={() => handleToggleBookmark(project.id)} className="text-slate-400 hover:text-amber-500 transition-colors p-1">
                          {isBookmarked ? <BookmarkCheck size={17} className="text-amber-500 fill-amber-500" /> : <Bookmark size={17} />}
                        </button>
                        <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md font-mono font-extrabold">
                          {project.matchScore}% Match
                        </span>
                      </div>
                    </div>

                    <h3 className="font-heading font-extrabold text-base text-slate-900 leading-snug group-hover:text-blue-950 transition-colors">{project.title}</h3>
                    <p className="text-xs text-slate-500 font-semibold flex items-center gap-1.5">
                      <Landmark size={13} className="text-blue-600" /> NGO: {project.ngoName} • {project.ngoRating} ★
                    </p>
                    <p className="text-slate-600 text-xs leading-relaxed line-clamp-3">{project.description}</p>
                  </div>

                  <div className="flex flex-col gap-3 mt-1">
                    <div className="w-full h-px bg-slate-200/80" />
                    <div className="flex justify-between items-center text-xs font-semibold">
                      <span className="text-slate-500 flex items-center gap-1 font-medium"><MapPin size={13} className="text-slate-400" /> {project.district}, {project.taluka}</span>
                      <span className="text-slate-900 font-extrabold flex items-center gap-1"><Coins size={13} className="text-amber-600" /> ₹{project.budgetRequested.toLocaleString("en-IN")}</span>
                    </div>

                    <div className="flex gap-2.5 pt-1">
                      <Button variant="primary" size="sm" className="flex-grow font-bold shadow-2xs">Fund Initiative</Button>
                      <Button
                        variant={isComparing ? "secondary" : "outline"}
                        size="sm"
                        onClick={() => handleToggleCompare(project.id)}
                        className="px-3 text-xs"
                      >
                        {isComparing ? "Remove" : "Compare"}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              );
            })}

            {/* 2. NGOs View */}
            {activeTab === "ngos" && filteredNGOs.map((ngo) => (
              <motion.div
                key={ngo.id}
                whileHover={{ y: -4, rotateX: 2, rotateY: -2, scale: 1.012 }}
                transition={{ duration: 0.2 }}
                className="group relative rounded-2xl border border-slate-200/90 bg-gradient-to-br from-white via-slate-50/50 to-emerald-50/20 p-5 shadow-xs hover:shadow-xl transition-all duration-200 flex flex-col justify-between gap-5 overflow-hidden"
                style={{ transformStyle: "preserve-3d" }}
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-600" />

                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] bg-emerald-50 border border-emerald-200 text-emerald-700 px-2.5 py-0.5 rounded-md font-extrabold uppercase tracking-wider">
                      {ngo.category}
                    </span>
                    <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md font-mono font-extrabold flex items-center gap-1">
                      <ShieldCheck size={11} /> {ngo.csr1Status}
                    </span>
                  </div>

                  <h3 className="font-heading font-extrabold text-base text-slate-900 leading-snug group-hover:text-emerald-950 transition-colors">{ngo.name}</h3>
                  <div className="flex flex-col gap-1 text-xs text-slate-600 font-medium">
                    <span>NITI Aayog Darpan: <strong className="text-slate-900 font-bold">{ngo.darpanId}</strong></span>
                    <span>District scope: <strong className="text-slate-900 font-bold">{ngo.district}</strong></span>
                  </div>
                </div>

                <div className="flex flex-col gap-3 mt-1">
                  <div className="w-full h-px bg-slate-200/80" />
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span className="text-slate-600 flex items-center gap-1 font-medium"><Star size={13} className="text-amber-500 fill-amber-500" /> Rated {ngo.rating} ★</span>
                    <span className="text-slate-900 font-extrabold">₹{(ngo.totalFundingReceived / 100000).toFixed(1)} Lakhs Sourced</span>
                  </div>

                  <Button variant="outline" size="sm" onClick={() => setSelectedNgoDetail(ngo)} className="w-full text-xs font-bold">
                    View Compliance Profile
                  </Button>
                </div>
              </motion.div>
            ))}

            {/* 3. Companies View */}
            {activeTab === "companies" && filteredCompanies.map((comp) => (
              <motion.div
                key={comp.id}
                whileHover={{ y: -4, rotateX: 2, rotateY: -2, scale: 1.012 }}
                transition={{ duration: 0.2 }}
                className="group relative rounded-2xl border border-slate-200/90 bg-gradient-to-br from-white via-slate-50/50 to-purple-50/20 p-5 shadow-xs hover:shadow-xl transition-all duration-200 flex flex-col justify-between gap-5 overflow-hidden"
                style={{ transformStyle: "preserve-3d" }}
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-indigo-600" />

                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] bg-purple-50 border border-purple-200 text-purple-700 px-2.5 py-0.5 rounded-md font-extrabold uppercase tracking-wider">
                      {comp.industry}
                    </span>
                    <span className="text-[10px] text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-md font-extrabold font-mono">
                      Corporate Partner
                    </span>
                  </div>

                  <h3 className="font-heading font-extrabold text-base text-slate-900 leading-snug group-hover:text-purple-950 transition-colors">{comp.name}</h3>
                  <div className="flex flex-col gap-1 text-xs text-slate-600 font-medium">
                    <span>Target focus: <strong className="text-slate-900 font-bold">{comp.focusArea}</strong></span>
                    <span>HQ Location: <strong className="text-slate-900 font-bold">{comp.district}</strong></span>
                  </div>
                </div>

                <div className="flex flex-col gap-3 mt-1">
                  <div className="w-full h-px bg-slate-200/80" />
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span className="text-slate-600 font-medium">Funded {comp.projectsFunded} Initiatives</span>
                    <span className="text-slate-900 font-extrabold">Cap: ₹{(comp.csrBudget / 10000000).toFixed(1)} Cr</span>
                  </div>

                  <Button variant="outline" size="sm" onClick={() => setSelectedCompanyDetail(comp)} className="w-full text-xs font-bold">
                    View CSR Policy Detail
                  </Button>
                </div>
              </motion.div>
            ))}

            {((activeTab === "projects" && filteredProjects.length === 0) ||
              (activeTab === "ngos" && filteredNGOs.length === 0) ||
              (activeTab === "companies" && filteredCompanies.length === 0)) && (
              <div className="md:col-span-2 border border-slate-200 bg-white p-8 rounded-2xl text-center shadow-xs flex flex-col gap-2">
                <h3 className="font-heading font-bold text-base text-slate-900">No matching records found</h3>
                <p className="text-xs text-slate-500 max-w-xl mx-auto">
                  Try broadening your filter criteria or searching for different keywords. Public directory entries appear after administrative verification.
                </p>
              </div>
            )}

          </div>
          )}
        </div>

      </div>

      {/* Floating Compare Action Bar for Projects */}
      {activeTab === "projects" && compareIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40 bg-slate-900/95 border border-slate-700 backdrop-blur-md px-6 py-4 rounded-2xl flex items-center gap-6 shadow-2xl max-w-lg w-full justify-between text-white">
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-extrabold text-white">{compareIds.length} Projects Selected</span>
            <span className="text-[10px] text-slate-300">Compare budgets and location metrics side-by-side</span>
          </div>

          <div className="flex gap-2">
            <Button variant="accent" size="sm" onClick={() => setShowCompareModal(true)} className="font-bold">
              Compare Matrix
            </Button>
            <button onClick={() => setCompareIds([])} className="text-xs text-slate-400 hover:text-white font-bold px-2">
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Project Comparison Modal */}
      <Modal isOpen={showCompareModal} onClose={() => setShowCompareModal(false)} title="Proposal Comparison Matrix" className="max-w-3xl">
        <div className="grid grid-cols-4 gap-4 text-xs font-semibold items-stretch">
          <div className="flex flex-col justify-around text-slate-500 uppercase tracking-widest text-[10px] border-r border-slate-200 py-4">
            <div className="h-16 flex items-center font-extrabold">Project Title</div>
            <div className="h-12 flex items-center border-t border-slate-200">District</div>
            <div className="h-12 flex items-center border-t border-slate-200">Budget</div>
            <div className="h-12 flex items-center border-t border-slate-200">NGO Rating</div>
            <div className="h-12 flex items-center border-t border-slate-200">Match Score</div>
          </div>

          {comparedProjects.map((p) => (
            <div key={p.id} className="flex flex-col justify-around py-4 px-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="h-16 font-heading font-extrabold text-xs text-slate-900 leading-tight line-clamp-3">{p.title}</div>
              <div className="h-12 flex items-center text-slate-700 border-t border-slate-200">{p.district}</div>
              <div className="h-12 flex items-center text-amber-700 font-bold border-t border-slate-200">₹{p.budgetRequested.toLocaleString("en-IN")}</div>
              <div className="h-12 flex items-center text-slate-700 border-t border-slate-200">{p.ngoRating} ★</div>
              <div className="h-12 flex items-center text-indigo-700 font-extrabold border-t border-slate-200">{p.matchScore}%</div>
            </div>
          ))}
        </div>
      </Modal>

      {/* NGO Detail compliance Modal */}
      <Modal isOpen={!!selectedNgoDetail} onClose={() => setSelectedNgoDetail(null)} title="NGO Compliance Ledger Profile" className="max-w-xl">
        {selectedNgoDetail && (
          <div className="flex flex-col gap-6 text-xs font-medium text-slate-600">
            <div className="flex flex-col gap-1">
              <h3 className="font-heading font-extrabold text-lg text-slate-900">{selectedNgoDetail.name}</h3>
              <span className="text-[10px] text-amber-700 font-bold uppercase tracking-wider">{selectedNgoDetail.category}</span>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-b border-slate-200 py-4">
              <div>
                <span className="text-slate-500 text-[10px] block uppercase font-bold">NITI Darpan ID</span>
                <span className="text-slate-900 text-sm font-bold mt-1 block">{selectedNgoDetail.darpanId}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block uppercase font-bold">CSR-1 MCA Status</span>
                <span className="text-emerald-700 text-sm font-bold mt-1 block flex items-center gap-1"><ShieldCheck size={14} /> Active / Verified</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block uppercase font-bold">District Operation</span>
                <span className="text-slate-900 text-sm font-bold mt-1 block">{selectedNgoDetail.district} ({selectedNgoDetail.taluka})</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block uppercase font-bold">Official Email</span>
                <span className="text-slate-900 text-sm font-bold mt-1 block">{selectedNgoDetail.contact}</span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <h4 className="font-heading font-bold text-xs text-slate-900 uppercase tracking-wider">Audit Checkpoints Verification</h4>
              <ul className="flex flex-col gap-2">
                <li className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span>12A Tax Exemption status</span>
                  <span className="text-emerald-700 font-bold flex items-center gap-1"><CheckCircle2 size={14} /> Verified</span>
                </li>
                <li className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span>80G Tax Exemption status</span>
                  <span className="text-emerald-700 font-bold flex items-center gap-1"><CheckCircle2 size={14} /> Verified</span>
                </li>
                <li className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span>Three-year audited ledger filings</span>
                  <span className="text-emerald-700 font-bold flex items-center gap-1"><CheckCircle2 size={14} /> Verified</span>
                </li>
              </ul>
            </div>
          </div>
        )}
      </Modal>

      {/* Corporate Detail Modal */}
      <Modal isOpen={!!selectedCompanyDetail} onClose={() => setSelectedCompanyDetail(null)} title="Corporate CSR Profile" className="max-w-xl">
        {selectedCompanyDetail && (
          <div className="flex flex-col gap-6 text-xs font-medium text-slate-600">
            <div className="flex flex-col gap-1">
              <h3 className="font-heading font-extrabold text-lg text-slate-900">{selectedCompanyDetail.name}</h3>
              <span className="text-[10px] text-indigo-700 font-bold uppercase tracking-wider">{selectedCompanyDetail.industry} Industry</span>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-b border-slate-200 py-4">
              <div>
                <span className="text-slate-500 text-[10px] block uppercase font-bold">HQ Location</span>
                <span className="text-slate-900 text-sm font-bold mt-1 block">{selectedCompanyDetail.district}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block uppercase font-bold">Active CSR Budget Limit</span>
                <span className="text-slate-900 text-sm font-bold mt-1 block">₹{(selectedCompanyDetail.csrBudget / 10000000).toFixed(1)} Cr</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block uppercase font-bold">Primary Focus Sector</span>
                <span className="text-slate-900 text-sm font-bold mt-1 block">{selectedCompanyDetail.focusArea}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block uppercase font-bold">Funded Initiatives Count</span>
                <span className="text-slate-900 text-sm font-bold mt-1 block">{selectedCompanyDetail.projectsFunded} Projects</span>
              </div>
            </div>

            <div className="flex flex-col gap-2.5">
              <span className="text-slate-900 font-bold">CSR Board Policy Circular</span>
              <a
                href={selectedCompanyDetail.policyLink}
                target="_blank"
                rel="noreferrer"
                className="bg-slate-50 border border-slate-200 hover:bg-slate-100 p-3 rounded-xl flex items-center justify-between text-slate-800 transition-colors font-medium"
              >
                <span>Read Board approved CSR Policy statement</span>
                <ExternalLink size={14} className="text-blue-600" />
              </a>
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
}
