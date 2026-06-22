import { TenantFeaturesWorkspace } from "@/components/admin/PlatformAdminWorkspaces";

export default function TenantFeaturesPage({ params }: { params: { id: string } }) {
  return <TenantFeaturesWorkspace tenantId={params.id} />;
}
