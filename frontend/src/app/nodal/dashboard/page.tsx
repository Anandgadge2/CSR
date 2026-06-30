"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  ClipboardList,
  Clock,
  AlertCircle,
  CheckCircle2,
  Loader2,
  FileText,
  MapPin,
  Building2,
} from "lucide-react";
import GovPortalLayout from "@/components/layout/GovPortalLayout";
import { GovCard, GovCardHeader, GovCardTitle, GovCardBody } from "@/components/gov/GovCard";
import GovStatusBadge from "@/components/gov/GovStatusBadge";
import GovButton from "@/components/gov/GovButton";
import GovAlert from "@/components/gov/GovAlert";
import { PageSkeleton, TableSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { apiFetch } from "@/lib/api";

// Types
interface NodalDashboardStats {
  assignedProjects: number;
  pendingVerifications: number;
  activeGrievances: number;
  completedProjects: number;
}

interface Project {
  id: string;
  title: string;
  ngoName: string;
  district: string;
  startDate: string;
  endDate: string;
  totalMilestones: number;
  completedMilestones: number;
  status: string;
}

interface Grievance {
  id: string;
  projectId: string;
  projectTitle: string;
  raisedBy: string;
  category: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  status: string;
  raisedDate: string;
}

interface DashboardData {
  stats: NodalDashboardStats;
  activeProjects: Project[];
  pendingGrievances: Grievance[];
}

// Fetch dashboard data
const fetchNodalDashboard = async (): Promise<DashboardData> => {
  const response = await apiFetch<any>("/nodal/dashboard");
  const payload = response?.data ?? response;
  const summary = payload?.summary ?? {};
  const recentProjects = payload?.recentProjects ?? [];

  return {
    stats: {
      assignedProjects: summary.assignedProjects ?? 0,
      pendingVerifications: (summary.pendingMilestones ?? 0) + (summary.pendingUCs ?? 0),
      activeGrievances: summary.pendingGrievances ?? 0,
      completedProjects: summary.completedProjects ?? 0,
    },
    activeProjects: recentProjects.map((project: any) => ({
      id: project.id,
      title: project.title,
      ngoName: project.implementingAgencyUser?.email ?? project.corporateName ?? "Implementing Agency",
      district: project.district,
      startDate: project.createdAt,
      endDate: project.updatedAt ?? project.createdAt,
      totalMilestones: project._count?.milestones ?? 0,
      completedMilestones: Math.round(((project.physicalProgressPercent ?? 0) / 100) * (project._count?.milestones ?? 0)),
      status: project.status,
    })),
    pendingGrievances: [],
  };
};

// Stats Card Component
function StatCard({
  label,
  value,
  icon: Icon,
  trend,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  trend?: { value: string; positive: boolean };
}) {
  return (
    <GovCard>
      <GovCardBody>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm text-slate-500 font-medium mb-1">{label}</p>
            <h3 className="text-3xl font-bold text-slate-900">{value}</h3>
            {trend && (
              <p
                className={`text-xs font-medium mt-1 ${
                  trend.positive ? "text-emerald-600" : "text-rose-600"
                }`}
              >
                {trend.positive ? "+" : "-"}
                {trend.value} from last month
              </p>
            )}
          </div>
          <div className="p-3 bg-blue-50 rounded-lg">
            <Icon className="w-6 h-6 text-blue-700" />
          </div>
        </div>
      </GovCardBody>
    </GovCard>
  );
}

export default function NodalDashboardPage() {
  const [userDistrict, setUserDistrict] = useState<string>("Pune");

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery<DashboardData>({
    queryKey: ["nodal-dashboard"],
    queryFn: fetchNodalDashboard,
    retry: 1,
  });

  // Get user district from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const user = localStorage.getItem("user");
      if (user) {
        try {
          const userData = JSON.parse(user);
          if (userData.district) {
            setUserDistrict(userData.district);
          }
        } catch (e) {
          console.error("Error parsing user data", e);
        }
      }
    }
  }, []);

  if (isLoading) {
    return (
      <GovPortalLayout userRole="NODAL_OFFICER">
        <div className="gov-page-header">
          <div className="gov-breadcrumb">
            Home / Nodal Officer / Dashboard
          </div>
          <h1 className="gov-page-title">District Nodal Officer Dashboard</h1>
          <p className="gov-page-description">
            Welcome back. Here&apos;s an overview of projects and activities in your district.
          </p>
        </div>
        <PageSkeleton />
      </GovPortalLayout>
    );
  }

  if (error) {
    return (
      <GovPortalLayout userRole="NODAL_OFFICER">
        <div className="gov-page-header">
          <div className="gov-breadcrumb">
            Home / Nodal Officer / Dashboard
          </div>
          <h1 className="gov-page-title">District Nodal Officer Dashboard</h1>
          <p className="gov-page-description">
            Welcome back. Here&apos;s an overview of projects and activities in your district.
          </p>
        </div>
        <GovAlert variant="danger">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            <span>
              Failed to load dashboard data.{" "}
              <button
                onClick={() => refetch()}
                className="underline font-medium"
              >
                Retry
              </button>
            </span>
          </div>
        </GovAlert>
      </GovPortalLayout>
    );
  }

  const stats = data?.stats ?? {
    assignedProjects: 0,
    pendingVerifications: 0,
    activeGrievances: 0,
    completedProjects: 0,
  };

  const activeProjects = data?.activeProjects ?? [];
  const pendingGrievances = data?.pendingGrievances ?? [];

  return (
    <GovPortalLayout userRole="NODAL_OFFICER">
      {/* Page Header */}
      <div className="gov-page-header">
        <div className="gov-breadcrumb">
          Home / Nodal Officer / Dashboard
        </div>
        <h1 className="gov-page-title">District Nodal Officer Dashboard</h1>
        <p className="gov-page-description">
          Welcome back. Here&apos;s an overview of CSR projects and activities in {userDistrict} district.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Assigned Projects"
          value={stats.assignedProjects}
          icon={ClipboardList}
          trend={{ value: "3", positive: true }}
        />
        <StatCard
          label="Pending Verifications"
          value={stats.pendingVerifications}
          icon={Clock}
        />
        <StatCard
          label="Active Grievances"
          value={stats.activeGrievances}
          icon={AlertCircle}
          trend={{ value: "2", positive: false }}
        />
        <StatCard
          label="Completed Projects"
          value={stats.completedProjects}
          icon={CheckCircle2}
          trend={{ value: "5", positive: true }}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Projects */}
        <GovCard className="lg:col-span-2">
          <GovCardHeader>
            <div className="flex items-center justify-between">
              <GovCardTitle>Active Projects</GovCardTitle>
              <Link href="/nodal/projects">
                <GovButton variant="secondary" className="text-sm">
                  View All
                </GovButton>
              </Link>
            </div>
          </GovCardHeader>
          <GovCardBody>
            {activeProjects.length === 0 ? (
              <EmptyState
                title="No Active Projects"
                description="There are no active projects in your district at the moment."
                icon={FileText}
              />
            ) : (
              <div className="gov-table-container">
                <table className="gov-table">
                  <thead>
                    <tr>
                      <th>Project</th>
                      <th>NGO</th>
                      <th>District</th>
                      <th>Timeline</th>
                      <th>Milestones</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeProjects.map((project) => (
                      <tr key={project.id}>
                        <td>
                          <div className="font-medium text-slate-900">
                            {project.title}
                          </div>
                        </td>
                        <td>
                          <div className="flex items-center gap-1">
                            <Building2 className="w-4 h-4 text-slate-400" />
                            <span className="text-sm">{project.ngoName}</span>
                          </div>
                        </td>
                        <td>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4 text-slate-400" />
                            <span className="text-sm">{project.district}</span>
                          </div>
                        </td>
                        <td>
                          <div className="text-sm">
                            <div>{new Date(project.startDate).toLocaleDateString("en-IN")}</div>
                            <div className="text-slate-500">
                              to {new Date(project.endDate).toLocaleDateString("en-IN")}
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="text-sm">
                            <span className="font-medium text-emerald-600">
                              {project.completedMilestones}
                            </span>
                            <span className="text-slate-500">
                              {" "}/ {project.totalMilestones}
                            </span>
                          </div>
                          <div className="w-24 h-1.5 bg-slate-200 rounded-full mt-1">
                            <div
                              className="h-full bg-emerald-500 rounded-full"
                              style={{
                                width: `${(project.completedMilestones / project.totalMilestones) * 100}%`,
                              }}
                            />
                          </div>
                        </td>
                        <td>
                          <GovStatusBadge
                            variant={
                              project.status === "ACTIVE"
                                ? "success"
                                : project.status === "PENDING"
                                ? "warning"
                                : "info"
                            }
                          >
                            {project.status}
                          </GovStatusBadge>
                        </td>
                        <td>
                          <Link href={`/nodal/projects/${project.id}`}>
                            <GovButton variant="secondary" className="text-sm py-1 px-3">
                              View
                            </GovButton>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </GovCardBody>
        </GovCard>

        {/* Pending Grievances */}
        <GovCard className="lg:col-span-2">
          <GovCardHeader>
            <div className="flex items-center justify-between">
              <GovCardTitle>Pending Grievances</GovCardTitle>
              <Link href="/nodal/grievances">
                <GovButton variant="secondary" className="text-sm">
                  View All
                </GovButton>
              </Link>
            </div>
          </GovCardHeader>
          <GovCardBody>
            {pendingGrievances.length === 0 ? (
              <EmptyState
                title="No Pending Grievances"
                description="All grievances have been resolved. Great job!"
                icon={CheckCircle2}
              />
            ) : (
              <div className="gov-table-container">
                <table className="gov-table">
                  <thead>
                    <tr>
                      <th>Grievance ID</th>
                      <th>Project</th>
                      <th>Raised By</th>
                      <th>Category</th>
                      <th>Priority</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingGrievances.map((grievance) => (
                      <tr key={grievance.id}>
                        <td>
                          <span className="font-mono text-sm">#{grievance.id}</span>
                        </td>
                        <td>
                          <div className="text-sm font-medium text-slate-900">
                            {grievance.projectTitle}
                          </div>
                          <div className="text-xs text-slate-500">
                            PID: {grievance.projectId}
                          </div>
                        </td>
                        <td className="text-sm">{grievance.raisedBy}</td>
                        <td className="text-sm">{grievance.category}</td>
                        <td>
                          <GovStatusBadge
                            variant={
                              grievance.priority === "URGENT"
                                ? "danger"
                                : grievance.priority === "HIGH"
                                ? "warning"
                                : grievance.priority === "MEDIUM"
                                ? "info"
                                : "muted"
                            }
                          >
                            {grievance.priority}
                          </GovStatusBadge>
                        </td>
                        <td className="text-sm">
                          {new Date(grievance.raisedDate).toLocaleDateString("en-IN")}
                        </td>
                        <td>
                          <Link href={`/nodal/grievances/${grievance.id}`}>
                            <GovButton variant="secondary" className="text-sm py-1 px-3">
                              Resolve
                            </GovButton>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </GovCardBody>
        </GovCard>
      </div>
    </GovPortalLayout>
  );
}
