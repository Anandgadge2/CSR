import CSRWorkflowModulePage from "@/components/CSRWorkflowModulePage";

export default function DepartmentInterestsPage() {
  return (
    <CSRWorkflowModulePage
      area="Government Department"
      title="Company Interest Received"
      description="Review CSR companies that showed interest in department-created requirements, proposed funding amount, funding mode, comments, and next workflow status."
      primaryHref="/department/requirements"
      primaryLabel="Open My Requirements"
    />
  );
}
