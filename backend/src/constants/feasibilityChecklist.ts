export const FEASIBILITY_CHECKLIST_TEMPLATE = [
  { itemNumber: 1, dimension: "Mandate & Legal", checkText: "Activity falls within Schedule VII of the Companies Act.", isCritical: true },
  { itemNumber: 2, dimension: "Mandate & Legal", checkText: "Not a prohibited CSR activity: not employee-only, not political, not normal course of business.", isCritical: true },
  { itemNumber: 3, dimension: "Need & Alignment", checkText: "Addresses a genuine, verified development need.", isCritical: true },
  { itemNumber: 4, dimension: "Need & Alignment", checkText: "Does NOT duplicate an existing government scheme or ongoing project in same location.", isCritical: true },
  { itemNumber: 5, dimension: "Site & Govt Support", checkText: "For construction/renovation: site/land is available, clear, and in government ownership/control.", isCritical: true },
  { itemNumber: 6, dimension: "Site & Govt Support", checkText: "Required permissions/clearances are obtainable within a reasonable time.", isCritical: true },
  { itemNumber: 7, dimension: "Site & Govt Support", checkText: "Required government support/personnel/access is confirmed.", isCritical: true },
  { itemNumber: 8, dimension: "Financial", checkText: "Indicative budget is adequate for the proposed scope.", isCritical: false },
  { itemNumber: 9, dimension: "Financial", checkText: "Cost estimate is realistic and benchmarked against similar works.", isCritical: false },
  { itemNumber: 10, dimension: "Implementation", checkText: "Implementing capacity exists: corporate/foundation/NGO is capable.", isCritical: false },
  { itemNumber: 11, dimension: "Implementation", checkText: "Timeline is realistic for the scope.", isCritical: false },
  { itemNumber: 12, dimension: "Sustainability", checkText: "Post-completion ownership of the asset is clear.", isCritical: true },
  { itemNumber: 13, dimension: "Sustainability", checkText: "Maintenance / recurring-cost responsibility is identified.", isCritical: true },
];

export function getFailedCriticalItems(items: { itemNumber: number; answer: string }[]) {
  return FEASIBILITY_CHECKLIST_TEMPLATE
    .filter((item) => item.isCritical)
    .filter((item) => {
      const answer = items.find((candidate) => candidate.itemNumber === item.itemNumber)?.answer;
      if (item.itemNumber === 5 && answer === "NA") return false;
      return answer !== "YES";
    })
    .map((item) => item.itemNumber);
}
