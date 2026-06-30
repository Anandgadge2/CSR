import { redirect } from "next/navigation";

export default function AgencyProjectMilestonesAliasPage({ params }: { params: { id: string } }) {
  redirect(`/projects/${params.id}/tracking`);
}
