import GovPortalLayout from "@/components/layout/GovPortalLayout";
import { GovCard, GovCardBody } from "@/components/gov/GovCard";

interface StaticPdfSectionPageProps {
  title: string;
  description: string;
  items: string[];
}

export default function StaticPdfSectionPage({ title, description, items }: StaticPdfSectionPageProps) {
  return (
    <GovPortalLayout showSidebar={false}>
      <div className="gov-public-main">
        <div className="gov-page-header">
          <div className="gov-breadcrumb">Home / {title}</div>
          <h1 className="gov-page-title">{title}</h1>
          <p className="gov-page-description">{description}</p>
        </div>
        <GovCard>
          <GovCardBody>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {items.map((item) => (
                <div key={item} className="rounded border border-slate-200 bg-white p-4 text-sm font-medium text-slate-700">
                  {item}
                </div>
              ))}
            </div>
          </GovCardBody>
        </GovCard>
      </div>
    </GovPortalLayout>
  );
}
