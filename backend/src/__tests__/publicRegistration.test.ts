import { OrganizationKind } from "@prisma/client";
import { resolvePublicRegistrationAccountType } from "../utils/publicRegistration";
import fs from "fs";
import path from "path";

describe("public registration account types", () => {
  it("allows corporate and government account types", () => {
    expect(resolvePublicRegistrationAccountType("CSR_COMPANY")).toEqual({ roleId: 8, kind: OrganizationKind.CSR_COMPANY });
    expect(resolvePublicRegistrationAccountType("GOVERNMENT_DEPARTMENT")).toEqual({ roleId: 7, kind: OrganizationKind.GOVERNMENT_DEPARTMENT });
  });

  it.each(["NGO", "NGO_ADMIN", "IMPLEMENTING_AGENCY", 7, 8, 9, ""])(
    "rejects non-public or numeric account type %p",
    (accountType) => expect(resolvePublicRegistrationAccountType(accountType)).toBeNull()
  );

  it("validates only the two named account types at the public HTTP route", () => {
    const routes = fs.readFileSync(path.join(__dirname, "../routes/authRoutes.ts"), "utf8");
    expect(routes).toContain('accountType: z.enum(["CSR_COMPANY", "GOVERNMENT_DEPARTMENT"])');
    expect(routes).not.toContain("role: z.union([z.number(), z.string()])");
  });
});
