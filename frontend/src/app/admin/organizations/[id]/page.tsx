import { AdminOrganizationDetailsWorkspace } from "@/components/admin/PlatformAdminWorkspaces";

export default function AdminOrganizationDetailsPage({ params }: { params: { id: string } }) {
  return <AdminOrganizationDetailsWorkspace organizationId={params.id} />;
}
