import PortalModulePage from "./PortalModulePage";

type Props = {
  area: string;
  title: string;
  description: string;
  primaryHref?: string;
  primaryLabel?: string;
};

export default function CSRWorkflowModulePage({
  area,
  title,
  description,
  primaryHref,
  primaryLabel
}: Props) {
  return (
    <PortalModulePage
      eyebrow={area}
      title={title}
      description={description}
      actions={primaryHref && primaryLabel ? [{ label: primaryLabel, href: primaryHref, primary: true }] : []}
      metrics={[
        { label: "Requirement Owner", value: "Govt Dept" },
        { label: "Funding Partner", value: "CSR Company" },
        { label: "Implementer", value: "NGO" }
      ]}
      rows={[
        ["STEP-1", "Department creates CSR requirement", "Government Department", "Active"],
        ["STEP-2", "State CSR Cell approves and publishes", "Admin", "Controlled"],
        ["STEP-3", "Company funds, NGO implements, department confirms handover", "Workflow", "Tracked"]
      ]}
    />
  );
}
