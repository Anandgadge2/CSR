import StaticPdfSectionPage from "@/components/StaticPdfSectionPage";

export default function StoriesPage() {
  return (
    <StaticPdfSectionPage
      title="Success Stories & Case Studies"
      eyebrow="Evidence-led public confidence"
      description="Completed projects with photos, investment, beneficiaries, corporate name. Builds confidence through proof."
      metrics={[
        { label: "Evidence", value: "Photos + UC", note: "Completion record" },
        { label: "Display", value: "Public", note: "Corporate recognition" },
        { label: "Filters", value: "District", note: "Sector and year ready" },
      ]}
      items={[
        "Each case study should show corporate partner, district, sector, amount, implementing agency, beneficiaries and completion evidence.",
        "Stories are published only after District Nodal Officer verification and UC acceptance.",
        "Recognition content should remain factual and should not replace statutory CSR reporting.",
        "Photo galleries should include captions, location, date and officer verification status.",
      ]}
      records={[
        {
          title: "Digital Classrooms for Zilla Parishad Schools",
          detail: "Smart classroom equipment, installation photos, school acceptance certificate and teacher orientation records published after field verification.",
          meta: "Pune | Education | Corporate partner: demo record | Beneficiary group: government school students",
          tag: "Case study",
        },
        {
          title: "Primary Health Centre Diagnostic Equipment",
          detail: "Equipment procurement, delivery, installation and acceptance were tracked milestone-wise with UC upload and Nodal Officer verification.",
          meta: "Nandurbar | Health | Corporate partner: demo record | Beneficiary group: rural PHC patients",
          tag: "Case study",
        },
        {
          title: "Water Conservation Works in Tribal Block",
          detail: "Site clearance, construction, finishing and handover were captured using the standard NOT STARTED / IN PROGRESS / COMPLETED progress model.",
          meta: "Gadchiroli | Water conservation | Corporate partner: demo record | Beneficiary group: farming households",
          tag: "Case study",
        },
      ]}
    />
  );
}
