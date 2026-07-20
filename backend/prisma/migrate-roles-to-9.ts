import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { ROLE_SLUG } from "../src/types/role";

/**
 * One-time data migration: converge an EXISTING database onto the 9 canonical
 * roles. Safe to run repeatedly (idempotent).
 *
 * The seed (prisma/seed.ts) already produces 9 roles on a fresh install; this
 * script fixes databases that were seeded under the old 11-role model:
 *
 *   portal-admin   → super-admin          (single elevated identity)
 *   csr-admin      → super-admin
 *   admin          → super-admin
 *   district-admin → district-nodal-officer
 *   beneficiary-agency → government-officer  (perms are a superset)
 *   ngo-member     → ngo-admin
 *   company-member → company-admin
 *   state-csr-cell → (dropped; users reassigned to government-officer)
 *
 * Users are reassigned off every dropped role row on BOTH axes
 * (User.roleId + UserOrganizationRole.roleId) BEFORE the dead rows are deleted.
 * UserOrganizationRole.roleId is onDelete: Cascade, so remapping first is what
 * prevents silent loss of assignments.
 */

const prisma = new PrismaClient();

/** dropped slug → surviving canonical slug it collapses into */
const COLLAPSE: Record<string, string> = {
  "portal-admin": ROLE_SLUG.SUPER_ADMIN,
  "csr-admin": ROLE_SLUG.SUPER_ADMIN,
  admin: ROLE_SLUG.SUPER_ADMIN,
  "district-admin": ROLE_SLUG.DISTRICT_NODAL_OFFICER,
  "beneficiary-agency": ROLE_SLUG.GOVERNMENT_OFFICER,
  "ngo-member": ROLE_SLUG.NGO_ADMIN,
  "company-member": ROLE_SLUG.COMPANY_ADMIN,
  "state-csr-cell": ROLE_SLUG.GOVERNMENT_OFFICER,
};

async function main() {
  console.log("Converging existing roles onto the canonical 9…");

  await prisma.$transaction(async (tx) => {
    // Index every role row by slug (a slug may appear >once if seeded per-org).
    const allRoles = await tx.organizationRole.findMany({
      select: { id: true, slug: true, name: true },
    });
    const rowsBySlug = new Map<string, { id: string; name: string }[]>();
    for (const r of allRoles) {
      if (!r.slug) continue;
      const list = rowsBySlug.get(r.slug) ?? [];
      list.push({ id: r.id, name: r.name });
      rowsBySlug.set(r.slug, list);
    }

    for (const [deadSlug, targetSlug] of Object.entries(COLLAPSE)) {
      const deadRows = rowsBySlug.get(deadSlug) ?? [];
      if (deadRows.length === 0) continue; // already migrated / never existed

      const targetRows = rowsBySlug.get(targetSlug) ?? [];
      if (targetRows.length === 0) {
        throw new Error(
          `Target role "${targetSlug}" not found — run the seed first so the ` +
            `canonical roles exist, then re-run this migration.`,
        );
      }
      // Prefer a global (organizationId: null) target row; fall back to first.
      const targetId = targetRows[0].id;
      const deadIds = deadRows.map((r) => r.id);

      // 1. Repoint User.roleId (SetNull relation — must be updated explicitly).
      const usersMoved = await tx.user.updateMany({
        where: { roleId: { in: deadIds } },
        data: { roleId: targetId },
      });

      // 2. Repoint UserOrganizationRole assignments. Guard against colliding
      //    with an existing (userId, roleId, organizationId) unique row: delete
      //    a dead assignment when the user already holds the target, else move.
      const deadAssignments = await tx.userOrganizationRole.findMany({
        where: { roleId: { in: deadIds } },
        select: { id: true, userId: true, organizationId: true },
      });
      let assignmentsMoved = 0;
      let assignmentsDeduped = 0;
      for (const a of deadAssignments) {
        const clash = await tx.userOrganizationRole.findFirst({
          where: {
            userId: a.userId,
            roleId: targetId,
            organizationId: a.organizationId,
          },
          select: { id: true },
        });
        if (clash) {
          await tx.userOrganizationRole.delete({ where: { id: a.id } });
          assignmentsDeduped++;
        } else {
          await tx.userOrganizationRole.update({
            where: { id: a.id },
            data: { roleId: targetId },
          });
          assignmentsMoved++;
        }
      }

      // 3. Delete the now-unreferenced dead role rows (cascades role-permissions).
      const del = await tx.organizationRole.deleteMany({
        where: { id: { in: deadIds } },
      });

      console.log(
        `  ${deadSlug} → ${targetSlug}: ` +
          `${usersMoved.count} user(s), ${assignmentsMoved} assignment(s) moved, ` +
          `${assignmentsDeduped} deduped, ${del.count} role row(s) removed.`,
      );
    }
  });

  // Report the resulting assignable-role surface.
  const remaining = await prisma.organizationRole.findMany({
    select: { slug: true, name: true },
    orderBy: { numericId: "asc" },
  });
  console.log(`\nRemaining role rows (${remaining.length}):`);
  for (const r of remaining) console.log(`  • ${r.name} [${r.slug}]`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log("\n✓ Role consolidation complete.");
  })
  .catch(async (e) => {
    console.error("✗ Role consolidation failed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
