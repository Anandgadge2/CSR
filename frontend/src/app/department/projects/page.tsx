import CSRWorkflowModulePage from "@/components/CSRWorkflowModulePage";

export default function DepartmentProjectsPage() {
  return (
    <CSRWorkflowModulePage
      area="Government Department"
      title="Active Department CSR Projects"
      description="Track approved CSR projects converted from government department requirements, including selected company, implementing NGO, milestones, funds, and progress."
      primaryHref="/department/requirements"
      primaryLabel="Review Requirements"
    />
  );
}
