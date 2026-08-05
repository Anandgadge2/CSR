import fs from "fs";
import path from "path";

describe("NGO invitation workflow guards", () => {
  const controller = fs.readFileSync(path.join(__dirname, "../controllers/implementingAgencyController.ts"), "utf8");
  const invitationService = fs.readFileSync(path.join(__dirname, "../services/invitationService.ts"), "utf8");

  it("creates invited NGOs as incomplete and without an assigned project", () => {
    expect(controller).toContain('status: "PROFILE_INCOMPLETE"');
    expect(controller).toContain('status: "INVITE_SENT"');
    expect(controller).not.toMatch(/status: "INVITE_SENT"[\s\S]{0,400}assignedProjectId/);
  });

  it("requires an active NGO before project assignment", () => {
    expect(controller).toContain('kind: "NGO", status: "ACTIVE"');
    expect(controller).toContain("Project assignment is locked until Super Admin approves");
  });

  it("keeps an activated invitation in onboarding-required state", () => {
    expect(invitationService).toContain('status: "ONBOARDING_REQUIRED"');
    expect(invitationService).not.toContain('data: { userId: createdUser.id, status: "ACTIVE" }');
  });
});
