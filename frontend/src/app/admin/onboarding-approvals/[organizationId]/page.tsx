import { AdminOrganizationDetailsWorkspace } from "@/components/admin/PlatformAdminWorkspaces";

export default function AdminOnboardingApprovalDetailsPage({ params }: { params: { organizationId: string } }) {
  return <AdminOrganizationDetailsWorkspace organizationId={params.organizationId} />;
}
