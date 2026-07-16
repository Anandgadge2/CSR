"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  MessageSquare,
  FolderOpen,
  CheckCircle2,
  AlertCircle,
  Plus,
  Loader2,
  Building2,
  MapPin,
  Calendar,
  ChevronRight,
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
interface PartnerDashboardStats {
  myEnquiries: number;
  activeProjects: number;
  completedProjects: number;
  pendingGrievances: number;
}

interface Enquiry {
  id: string;
  title: string;
  requirementTitle: string;
  department: string;
  district: string;
  submittedDate: string;
  status: "PENDING" | "UNDER_REVIEW" | "ACCEPTED" | "REJECTED" | "WITHDRAWN";
  estimatedAmount: number;
}

interface ActiveProject {
  id: string;
  title: string;
  ngoName: string;
  district: string;
  startDate: string;
  endDate: string;
  totalBudget: number;
  spentAmount: number;
  progress: number;
  status: string;
}

interface DashboardData {
  stats: PartnerDashboardStats;
  enquiries: Enquiry[];
  activeProjects: ActiveProject[];
}

// Fetch dashboard data
const fetchPartnerDashboard = async (): Promise<DashboardData> => {
  try {
    return await apiFetch<DashboardData>("/partner/dashboard");
  } catch {
    return {
      stats: {
        myEnquiries: 0,
        activeProjects: 0,
        completedProjects: 0,
        pendingGrievances: 0,
      },
      enquiries: [],
      activeProjects: [],
    };
  }
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

export default function PartnerDashboardPage() {
  const router = useRouter();
  const [companyName, setCompanyName] = useState<string>("Your Company");
  const [onboarding, setOnboarding] = useState<{ onboardingStatus?: string; status?: string } | null>(null);

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery<DashboardData>({
    queryKey: ["partner-dashboard"],
    queryFn: fetchPartnerDashboard,
    retry: 1,
  });

  // Get company name from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const user = localStorage.getItem("user");
      if (user) {
        try {
          const userData = JSON.parse(user);
          if (userData.companyName) {
            setCompanyName(userData.companyName);
          } else if (userData.name) {
            setCompanyName(userData.name);
          }
        } catch (e) {
          console.error("Error parsing user data", e);
        }
      }
    }
  }, []);

  // Onboarding status — drives the "complete your onboarding" banner.
  useEffect(() => {
    apiFetch<{ onboardingStatus?: string; status?: string }>("/onboarding/status")
      .then(setOnboarding)
      .catch(() => setOnboarding(null));
  }, []);

  const handleNewEnquiry = () => {
    router.push("/partner/enquiries/new");
  };

  if (isLoading) {
    return (
      <GovPortalLayout userRole="CORPORATE_PARTNER">
        <div className="gov-page-header">
          <div className="gov-breadcrumb">
            Home / Partner / Dashboard
          </div>
          <h1 className="gov-page-title">Corporate Partner Dashboard</h1>
          <p className="gov-page-description">
            Welcome back. Manage your CSR enquiries and track active projects.
          </p>
        </div>
        <PageSkeleton />
      </GovPortalLayout>
    );
  }

  if (error) {
    return (
      <GovPortalLayout userRole="CORPORATE_PARTNER">
        <div className="gov-page-header">
          <div className="gov-breadcrumb">
            Home / Partner / Dashboard
          </div>
          <h1 className="gov-page-title">Corporate Partner Dashboard</h1>
          <p className="gov-page-description">
            Welcome back. Manage your CSR enquiries and track active projects.
          </p>
        </div>
        <GovAlert variant="danger">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            <span>
              Failed to load dashboard data.
              <button
                onClick={() => refetch()}
                className="underline font-medium ml-1"
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
    myEnquiries: 0,
    activeProjects: 0,
    completedProjects: 0,
    pendingGrievances: 0,
  };

  const enquiries = data?.enquiries ?? [];
  const activeProjects = data?.activeProjects ?? [];

  return (
    <GovPortalLayout userRole="CORPORATE_PARTNER">
      {/* Page Header */}
      <div className="gov-page-header">
        <div className="gov-breadcrumb">
          Home / Partner / Dashboard
        </div>
        <h1 className="gov-page-title">Corporate Partner Dashboard</h1>
        <p className="gov-page-description">
          Welcome back, {companyName}. Manage your CSR enquiries and track active projects.
        </p>
      </div>

      {/* Onboarding status banner */}
      {onboarding && !["APPROVED"].includes(onboarding.onboardingStatus || "") && (
        <div className="mb-6">
          {["SUBMITTED_FOR_REVIEW", "UNDER_VERIFICATION"].includes(onboarding.onboardingStatus || "") ? (
            <div className="flex items-start justify-between gap-4 rounded-lg border border-amber-300 bg-amber-50 px-5 py-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
                <div>
                  <p className="font-bold text-amber-900">Onboarding under review</p>
                  <p className="text-sm text-amber-800">
                    Your documents have been submitted. An administrator is verifying them. You will be notified once approved.
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Link href="/organization/onboarding/details">
                  <GovButton variant="secondary" className="whitespace-nowrap text-sm">Submitted Details</GovButton>
                </Link>
                <Link href="/organization/onboarding/status">
                  <GovButton variant="secondary" className="whitespace-nowrap text-sm">View Status</GovButton>
                </Link>
              </div>
            </div>
          ) : ["REJECTED", "CLARIFICATION_REQUIRED"].includes(onboarding.onboardingStatus || "") ? (
            <div className="flex items-start justify-between gap-4 rounded-lg border border-rose-300 bg-rose-50 px-5 py-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
                <div>
                  <p className="font-bold text-rose-900">Onboarding needs attention</p>
                  <p className="text-sm text-rose-800">
                    Your submission was returned. Please review the remarks and resubmit your details.
                  </p>
                </div>
              </div>
              <Link href="/organization/onboarding">
                <GovButton className="whitespace-nowrap text-sm">Update &amp; Resubmit</GovButton>
              </Link>
            </div>
          ) : (
            <div className="flex items-start justify-between gap-4 rounded-lg border border-blue-300 bg-blue-50 px-5 py-4">
              <div className="flex items-start gap-3">
                <Building2 className="mt-0.5 h-5 w-5 shrink-0 text-blue-700" />
                <div>
                  <p className="font-bold text-blue-900">Complete your organization onboarding</p>
                  <p className="text-sm text-blue-800">
                    Finish your company profile and upload verification documents so an administrator can approve your account.
                  </p>
                </div>
              </div>
              <Link href="/organization/onboarding">
                <GovButton className="whitespace-nowrap text-sm">Start Onboarding</GovButton>
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Quick Action */}
      <div className="mb-6">
        <GovButton onClick={handleNewEnquiry}>
          <Plus className="w-4 h-4" />
          Submit New Enquiry
        </GovButton>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="My Enquiries"
          value={stats.myEnquiries}
          icon={MessageSquare}
          trend={{ value: "2", positive: true }}
        />
        <StatCard
          label="Active Projects"
          value={stats.activeProjects}
          icon={FolderOpen}
        />
        <StatCard
          label="Completed Projects"
          value={stats.completedProjects}
          icon={CheckCircle2}
          trend={{ value: "1", positive: true }}
        />
        <StatCard
          label="Pending Grievances"
          value={stats.pendingGrievances}
          icon={AlertCircle}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Enquiries */}
        <GovCard>
          <GovCardHeader>
            <div className="flex items-center justify-between">
              <GovCardTitle>My Enquiries</GovCardTitle>
              <Link href="/partner/enquiries">
                <GovButton variant="secondary" className="text-sm">
                  View All
                </GovButton>
              </Link>
            </div>
          </GovCardHeader>
          <GovCardBody>
            {enquiries.length === 0 ? (
              <EmptyState
                title="No Enquiries Yet"
                description="You haven't submitted any CSR enquiries yet. Click Submit New Enquiry to get started."
                icon={MessageSquare}
                actionText="Submit New Enquiry"
                onAction={handleNewEnquiry}
              />
            ) : (
              <div className="gov-table-container">
                <table className="gov-table">
                  <thead>
                    <tr>
                      <th>Enquiry</th>
                      <th>Department</th>
                      <th>Submitted</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {enquiries.map((enquiry) => (
                      <tr key={enquiry.id}>
                        <td>
                          <div className="font-medium text-slate-900">
                            {enquiry.title}
                          </div>
                          <div className="text-xs text-slate-500">
                            {enquiry.requirementTitle}
                          </div>
                        </td>
                        <td>
                          <div className="flex items-center gap-1">
                            <Building2 className="w-4 h-4 text-slate-400" />
                            <span className="text-sm">{enquiry.department}</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-slate-500">
                            <MapPin className="w-3 h-3" />
                            {enquiry.district}
                          </div>
                        </td>
                        <td className="text-sm">
                          {new Date(enquiry.submittedDate).toLocaleDateString("en-IN")}
                        </td>
                        <td className="text-sm font-medium">
                          ₹{enquiry.estimatedAmount.toLocaleString("en-IN")}
                        </td>
                        <td>
                          <GovStatusBadge
                            variant={
                              enquiry.status === "ACCEPTED"
                                ? "success"
                                : enquiry.status === "REJECTED"
                                ? "danger"
                                : enquiry.status === "UNDER_REVIEW"
                                ? "info"
                                : "warning"
                            }
                          >
                            {enquiry.status.replace("_", " ")}
                          </GovStatusBadge>
                        </td>
                        <td>
                          <Link href={`/partner/enquiries/${enquiry.id}`}>
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

        {/* Active Projects */}
        <GovCard>
          <GovCardHeader>
            <div className="flex items-center justify-between">
              <GovCardTitle>Active Projects</GovCardTitle>
              <Link href="/partner/projects">
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
                description="You don't have any active projects. Accepted enquiries will appear here as projects."
                icon={FolderOpen}
              />
            ) : (
              <div className="space-y-4">
                {activeProjects.map((project) => (
                  <Link
                    key={project.id}
                    href={`/partner/projects/${project.id}`}
                    className="block border border-slate-200 rounded-lg p-4 hover:border-blue-300 hover:bg-blue-50/50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-slate-900 mb-1">
                          {project.title}
                        </h4>
                        <div className="flex items-center gap-4 text-sm text-slate-500">
                          <span className="flex items-center gap-1">
                            <Building2 className="w-4 h-4" />
                            {project.ngoName}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {project.district}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(project.startDate).toLocaleDateString("en-IN")} -
                            {new Date(project.endDate).toLocaleDateString("en-IN")}
                          </span>
                        </div>
                        {/* Budget Progress */}
                        <div className="mt-3">
                          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                            <span>Budget Utilization</span>
                            <span>
                              ₹{project.spentAmount.toLocaleString("en-IN")} / ₹
                              {project.totalBudget.toLocaleString("en-IN")}
                            </span>
                          </div>
                          <div className="w-full h-2 bg-slate-200 rounded-full">
                            <div
                              className="h-full bg-blue-500 rounded-full"
                              style={{
                                width: Math.min(
                                  (project.spentAmount / project.totalBudget) * 100,
                                  100
                                ) + "%",
                              }}
                            />
                          </div>
                        </div>
                        {/* Overall Progress */}
                        <div className="mt-2">
                          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                            <span>Project Progress</span>
                            <span>{project.progress}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-200 rounded-full">
                            <div
                              className="h-full bg-emerald-500 rounded-full"
                              style={{ width: project.progress + "%" }}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="ml-4 flex flex-col items-end gap-2">
                        <GovStatusBadge
                          variant={
                            project.status === "ACTIVE"
                              ? "success"
                              : project.status === "ON_HOLD"
                              ? "warning"
                              : "info"
                          }
                        >
                          {project.status}
                        </GovStatusBadge>
                        <ChevronRight className="w-5 h-5 text-slate-400" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </GovCardBody>
        </GovCard>
      </div>
    </GovPortalLayout>
  );
}
