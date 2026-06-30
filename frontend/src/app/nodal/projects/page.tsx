"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import GovPortalLayout from "@/components/layout/GovPortalLayout";
import GovPageHeader from "@/components/layout/GovPageHeader";
import { GovCard, GovCardBody } from "@/components/gov/GovCard";
import GovButton from "@/components/gov/GovButton";
import GovStatusBadge from "@/components/gov/GovStatusBadge";
import { apiFetch } from "@/lib/api";

const fetchProjects = async () => {
  const response = await apiFetch<any>("/nodal/projects");
  return response?.data?.projects ?? response?.projects ?? [];
};

export default function NodalProjectsPage() {
  const { data: projects = [], isLoading, error } = useQuery({
    queryKey: ["nodal", "projects"],
    queryFn: fetchProjects,
  });

  return (
    <GovPortalLayout userRole="DISTRICT_NODAL_OFFICER">
      <GovPageHeader
        title="Assigned Projects"
        description="Projects assigned to the District Nodal Officer for MoU, milestone, UC and grievance monitoring"
        breadcrumb="Home / Nodal Officer / Projects"
      />

      <GovCard>
        <GovCardBody>
          {isLoading ? (
            <div className="p-8 text-center text-slate-500">Loading projects...</div>
          ) : error ? (
            <div className="p-8 text-center text-red-700">Unable to load assigned projects.</div>
          ) : projects.length === 0 ? (
            <div className="p-8 text-center text-slate-500">No assigned projects found.</div>
          ) : (
            <div className="gov-table-container">
              <table className="gov-table">
                <thead>
                  <tr>
                    <th>Project</th>
                    <th>District</th>
                    <th>Corporate</th>
                    <th>Progress</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map((project: any) => (
                    <tr key={project.id}>
                      <td>
                        <div className="font-semibold">{project.title}</div>
                        <div className="text-xs text-slate-500">{project.projectId}</div>
                      </td>
                      <td>{project.district}</td>
                      <td>{project.corporateName ?? "Corporate Partner"}</td>
                      <td>{project.physicalProgressPercent ?? 0}% physical / {project.financialProgressPercent ?? 0}% financial</td>
                      <td><GovStatusBadge variant="info">{project.status}</GovStatusBadge></td>
                      <td>
                        <Link href={`/nodal/projects/${project.id}`}>
                          <GovButton variant="secondary">Open</GovButton>
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
    </GovPortalLayout>
  );
}
