import StaticPdfSectionPage from "@/components/StaticPdfSectionPage";

export default function FaqNewsRecognitionPage() {
  return (
    <StaticPdfSectionPage
      title="FAQs, News & Recognition"
      eyebrow="Public trust desk"
      description="Common questions; portal updates; CSR awards and recognition of corporate partners."
      items={[
        "How do corporates start a CSR enquiry?",
        "How is a government pitch made public?",
        "What happens if the Relationship Manager misses the 5-day response time?",
        "How are completed corporate partners recognised?",
      ]}
      records={[
        { title: "FAQ: What is a Unique Tracking ID?", detail: "It is generated instantly after corporate enquiry or I am Interested submission and is sent through SMS and Email for live status tracking.", tag: "FAQ" },
        { title: "Portal Update: Public Development Needs (Live)", detail: "JS-approved government pitches are visible to corporates after Relationship Manager verification and Joint Secretary approval.", tag: "Update" },
        { title: "Recognition: Completed Projects Gallery", detail: "Corporate partners are recognised through success stories, public completion gallery records, and applicable CSR awards.", tag: "Recognition" },
      ]}
    />
  );
}
