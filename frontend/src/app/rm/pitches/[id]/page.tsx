import { redirect } from "next/navigation";

export default function LegacyRMPitchDetailPage({ params }: { params: { id: string } }) {
  redirect(`/rm/government-pitches/${params.id}`);
}
