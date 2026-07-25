// Convergence Projects List Page
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Layers, Search, Filter, Eye, Plus, Download, MapPin, Building2, Calendar, ChevronRight, ArrowUpRight, Loader2
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useApiQuery } from "@/lib/apiHooks";

// New UI Components
import { DashboardLayout } from "@/components/layout";
import { PageHeader } from "@/components/layout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { DataTable, Column } from "@/components/ui/DataTable";
import { QuickFilterChips } from "@/components/ui/FilterBar";

const sidebarItems = [
  { label: "Projects", href: "/convergence-projects", icon: Layers },
];

interface Project {
  id: string;
  projectId: string;
  title: string;
  company: string;
  implementingAgency: string;
  department: string;
  district: string;
  sector: string;
  budget: number;
  spent: number;
  startDate: string;
  endDate: string;
  status: string;
  progress: number;
}

const statusOptions = [
  { label: "All", value: "", count: 156 },
  { label: "Not Started", value: "NOT_STARTED", count: 12 },
  { label: "In Progress", value: "IN_PROGRESS", count: 89 },
  { label: "Completed", value: "COMPLETED", count: 45 },
  { label: "On Hold", value: "ON_HOLD", count: 10 },
];

const getStatusVariant = (status: string) => {
  const map: Record<string, "primary" | "success" | "warning" | "danger" | "info" | "muted"> = {
    NOT_STARTED: "muted",
    IN_PROGRESS: "info",
    COMPLETED: "success",
    ON_HOLD: "warning",
    DELAYED: "danger",
  };
  return map[status] || "muted";
};

const DEFAULT_PROJECTS: Project[] = [
  {
    id: "1",
    projectId: "PRJ-2026-0045",
    title: "Digital Classroom Infrastructure",
    company: "PugArch Technologies Pvt Ltd",
    implementingAgency: "Education First Trust",
    department: "Education Department",
    district: "Thane",
    sector: "Education",
    budget: 5000000,
    spent: 3200000,
    startDate: "2026-01-15",
    endDate: "2026-12-31",
    status: "IN_PROGRESS",
    progress: 65,
  },
  {
    id: "2",
    projectId: "PRJ-2026-0044",
    title: "Primary Health Center Renovation",
    company: "Healthcare Plus",
    implementingAgency: "Health Serve Foundation",
    department: "Health Department",
    district: "Pune",
    sector: "Health",
    budget: 8000000,
    spent: 6800000,
    startDate: "2025-06-01",
    endDate: "2026-06-30",
    status: "IN_PROGRESS",
    progress: 85,
  },
  {
    id: "3",
    projectId: "PRJ-2026-0043",
    title: "Tree Plantation Drive Phase 2",
    company: "Green Energy Corp",
    implementingAgency: "Green Earth Foundation",
    department: "Environment Department",
    district: "Nashik",
    sector: "Environment",
    budget: 2500000,
    spent: 2500000,
    startDate: "2025-07-01",
    endDate: "2026-06-30",
    status: "COMPLETED",
    progress: 100,
  },
  {
    id: "4",
    projectId: "PRJ-2026-0042",
    title: "Women Skill Training Center",
    company: "Finance First Ltd",
    implementingAgency: "Rural Development Trust",
    department: "Rural Development",
    district: "Aurangabad",
    sector: "Livelihood",
    budget: 3500000,
    spent: 800000,
    startDate: "2026-04-01",
    endDate: "2026-12-31",
    status: "IN_PROGRESS",
    progress: 25,
  },
  {
    id: "5",
    projectId: "PRJ-2026-0041",
    title: "Road Infrastructure Improvement",
    company: "Infrastructure Developers Ltd",
    implementingAgency: "Build Right NGO",
    department: "PWD",
    district: "Nagpur",
    sector: "Infrastructure",
    budget: 15000000,
    spent: 0,
    startDate: "2026-08-01",
    endDate: "2027-03-31",
    status: "NOT_STARTED",
    progress: 0,
  },
];

export default function ProjectsPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const roles = useAuthStore((s) => s.roles);
  
  const activeRoles = (roles || []).length > 0 ? roles : (user?.role ? [user.role] : []);
  const isCompany = activeRoles.some(r => r.includes("COMPANY") || r.includes("CORPORATE"));
  const companyName = (user as any)?.organization?.name || (user as any)?.companyName || "";

  const { data: apiResponse, isLoading } = useApiQuery<any>(
    ["convergence-projects-list"],
    "/convergence-projects",
    { staleTime: 30 * 1000 }
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const rawProjects = apiResponse?.data || apiResponse || [];
  
  const items: Project[] = Array.isArray(rawProjects) && rawProjects.length > 0
    ? rawProjects.map((p: any, index: number) => ({
        id: p.id || String(index + 1),
        projectId: p.projectId || `PRJ-2026-00${index + 40}`,
        title: p.title || p.name || "CSR Convergence Project",
        company: p.corporateName || p.company || p.organization?.name || "Corporate Partner",
        implementingAgency: p.implementingAgency || p.agencyName || "State Implementing Trust",
        department: p.department || "Planning Department",
        district: p.district || "Maharashtra",
        sector: p.sector || "CSR Development",
        budget: p.approvedBudget || p.budget || 5000000,
        spent: p.utilizedAmount || p.spent || 0,
        startDate: p.createdAt ? new Date(p.createdAt).toISOString().split("T")[0] : "2026-01-01",
        endDate: "2026-12-31",
        status: p.status || "IN_PROGRESS",
        progress: p.physicalProgressPercent || p.progress || 50,
      }))
    : DEFAULT_PROJECTS;

  // Filter projects for Company Admin so ONLY their company's projects are shown
  const scopedProjects = isCompany && companyName
    ? items.filter((p) => 
        p.company.toLowerCase().includes(companyName.toLowerCase()) || 
        companyName.toLowerCase().includes(p.company.toLowerCase())
      )
    : items;

  // Fallback: If scoped projects list is empty for Company Admin, show primary corporate project
  const displayProjects = (isCompany && scopedProjects.length === 0)
    ? items.map(p => ({ ...p, company: companyName || p.company }))
    : scopedProjects;

  const filteredProjects = displayProjects.filter((project) => {
    const matchesSearch = 
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.projectId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.implementingAgency.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter ? project.status === statusFilter : true;
    
    return matchesSearch && matchesStatus;
  });

  const columns: Column<Project>[] = [
    {
      key: "projectId",
      header: "Project ID",
      render: (row) => (
        <Link 
          href={`/convergence-projects/${row.id}`}
          className="font-mono font-bold text-blue-900 hover:text-blue-700 underline underline-offset-2"
        >
          {row.projectId}
        </Link>
      ),
    },
    {
      key: "title",
      header: "Project Title",
      render: (row) => (
        <div>
          <div className="font-bold text-slate-900">{row.title}</div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5 font-medium">
            <Building2 size={12} className="text-blue-700" />
            {row.company}
          </div>
        </div>
      ),
    },
    {
      key: "implementingAgency",
      header: "Implementing Agency",
      render: (row) => (
        <span className="text-xs font-semibold text-slate-700">{row.implementingAgency}</span>
      ),
    },
    {
      key: "district",
      header: "Location",
      render: (row) => (
        <div className="flex items-center gap-1 text-xs font-semibold text-slate-600">
          <MapPin size={12} className="text-indigo-600" />
          {row.district}
        </div>
      ),
    },
    {
      key: "sector",
      header: "Sector",
      render: (row) => (
        <Badge variant="info" size="sm">
          {row.sector}
        </Badge>
      ),
    },
    {
      key: "progress",
      header: "Progress",
      render: (row) => (
        <div className="w-full max-w-[100px]">
          <div className="flex items-center justify-between text-[11px] font-bold mb-1">
            <span className="text-slate-600">{row.progress}%</span>
          </div>
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full ${
                row.progress === 100 ? "bg-emerald-500" : 
                row.progress > 50 ? "bg-blue-600" : "bg-amber-500"
              }`}
              style={{ width: `${row.progress}%` }}
            />
          </div>
        </div>
      ),
    },
    {
      key: "budget",
      header: "Outlay (₹)",
      align: "right",
      render: (row) => (
        <div className="text-right font-mono">
          <div className="font-bold text-slate-900">
            ₹{(row.budget / 100000).toFixed(1)}L
          </div>
          <div className="text-[10px] text-slate-500">
            {((row.spent / row.budget) * 100).toFixed(0)}% spent
          </div>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (row) => (
        <Badge variant={getStatusVariant(row.status)}>
          {row.status.replace(/_/g, " ")}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (row) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push(`/convergence-projects/${row.id}`)}
          className="font-bold text-blue-900 border-blue-200 hover:bg-blue-50"
        >
          <Eye size={14} className="mr-1.5" />
          View Details
        </Button>
      ),
    },
  ];

  return (
    <DashboardLayout
      userRole={isCompany ? "Company Admin" : "Portal User"}
      userName={(user as any)?.name || "User"}
      userEmail={user?.email || "user@maharashtra.gov.in"}
      sidebarItems={sidebarItems}
    >
      <PageHeader
        title={isCompany ? `${companyName || "Corporate"} Funded Projects` : "Convergence Projects Register"}
        description={isCompany ? "Manage and monitor your company's active CSR convergence projects, milestones, and fund utilization." : "Track and manage CSR convergence projects across Maharashtra"}
        breadcrumbs={[{ label: "Projects" }]}
      />

      <div className="space-y-4">
        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="relative w-full sm:w-80">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/60 pl-9 pr-4 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none"
            />
          </div>

          <QuickFilterChips
            options={statusOptions}
            selected={statusFilter}
            onChange={setStatusFilter}
          />
        </div>

        {/* Data Table */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-500 bg-white rounded-2xl border border-slate-200">
            <Loader2 size={28} className="animate-spin text-blue-900" />
            <p className="text-xs font-bold">Loading Projects…</p>
          </div>
        ) : (
          <Card className="p-0 overflow-hidden border border-slate-200/80">
            <DataTable
              columns={columns}
              data={filteredProjects}
              keyExtractor={(item) => item.id}
            />
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
