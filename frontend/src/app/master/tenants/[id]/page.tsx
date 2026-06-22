import { TenantDetailsWorkspace } from "@/components/admin/PlatformAdminWorkspaces";

export default function TenantDetailsPage({ params }: { params: { id: string } }) {
  return <TenantDetailsWorkspace tenantId={params.id} />;
}
