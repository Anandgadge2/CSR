import { redirect } from "next/navigation";

export default function AgencyProjectUCAliasPage({ params }: { params: { id: string } }) {
  redirect(`/projects/${params.id}/tracking`);
}
