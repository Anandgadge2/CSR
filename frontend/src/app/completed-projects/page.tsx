import StaticPdfSectionPage from "@/components/StaticPdfSectionPage";

export default function CompletedProjectsPage() {
  return (
    <StaticPdfSectionPage
      title="Completed Projects Gallery"
      eyebrow="Public completion record"
      description="Permanent, searchable public record of all portal projects - by district, sector, corporate, year."
      metrics={[
        { label: "Filters", value: "4", note: "District, sector, corporate, year" },
        { label: "Evidence", value: "UC + photos", note: "Completion proof" },
        { label: "Recognition", value: "Public", note: "CSR partner visibility" },
      ]}
      items={["Search by district", "Search by sector", "Search by corporate", "Search by year"]}
      records={[
        { title: "Digital Learning Lab - Zilla Parishad Schools", detail: "Smart classroom kits, teacher orientation, geo-tagged installation evidence and school acceptance certificate.", meta: "Pune | Education | Corporate partner: Mahindra CSR Trust | FY 2025-26", tag: "Completed" },
        { title: "Primary Health Centre Equipment Support", detail: "Diagnostic equipment supplied, installed and accepted by the institution with UC uploaded by implementing agency.", meta: "Nandurbar | Health | Corporate partner: HDFC Bank CSR | FY 2025-26", tag: "Completed" },
        { title: "Water Conservation Check Dam Package", detail: "Site readiness, construction milestones, handover and ownership recorded through the standard tracking interface.", meta: "Gadchiroli | Water | Corporate partner: Tata Projects | FY 2025-26", tag: "Completed" },
      ]}
    />
  );
}
