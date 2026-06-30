import { redirect } from "next/navigation";

export default function AgencyProjectAliasPage({ params }: { params: { id: string } }) {
  redirect(`/convergence-projects/${params.id}`);
}
