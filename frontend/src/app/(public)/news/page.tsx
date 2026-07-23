import StaticPdfSectionPage from "@/components/StaticPdfSectionPage";

export default function NewsPage() {
  return (
    <StaticPdfSectionPage
      title="News"
      eyebrow="Portal updates"
      description="Public updates on CSR convergence, district development priorities, events, recognitions and portal releases."
      items={[
        "Portal update notices",
        "District development priority announcements",
        "CSR summit and event updates",
        "Recognition and completed project highlights",
      ]}
      records={[
        { title: "Public Development Needs (Live) register expanded", detail: "Approved government pitches can now be browsed by district, requirement, estimated cost and interest count.", meta: "Portal update | 2026", tag: "Update" },
        { title: "Relationship Manager workflow published", detail: "The public workflow page now explains corporate enquiry, government pitch verification, SLA escalation and project tracking.", meta: "Workflow explainer | 2026", tag: "Workflow" },
        { title: "Completed Projects Gallery prepared for public evidence records", detail: "Completed projects can be displayed with district, sector, corporate, year, photo evidence and UC verification status.", meta: "Public gallery | 2026", tag: "Gallery" },
      ]}
    />
  );
}
