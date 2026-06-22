import CSRWorkflowModulePage from "@/components/CSRWorkflowModulePage";

export default function NgoMilestonesPage() {
  return (
    <CSRWorkflowModulePage
      area="NGO Implementation"
      title="Project Milestones"
      description="Submit project progress, evidence, utilization certificates, delay reasons, and milestone completion details."
      primaryHref="/ngo/assigned-projects"
      primaryLabel="Open Assigned Projects"
    />
  );
}
