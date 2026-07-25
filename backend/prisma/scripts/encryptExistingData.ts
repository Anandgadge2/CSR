import { PrismaClient } from "@prisma/client";
import { encryptField, computeBlindHash } from "../../src/utils/fieldCrypto";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting data migration & encryption backfill...");

  // 1. Backfill Organizations
  const orgs = await prisma.organization.findMany();
  console.log(`Found ${orgs.length} organizations to process.`);

  for (const org of orgs) {
    const dataToUpdate: Record<string, string | null> = {};

    if (org.cin && !org.cin.startsWith("v1:")) {
      dataToUpdate.cin = encryptField(org.cin);
      dataToUpdate.cinHash = computeBlindHash(org.cin);
    }
    if (org.pan && !org.pan.startsWith("v1:")) {
      dataToUpdate.pan = encryptField(org.pan);
      dataToUpdate.panHash = computeBlindHash(org.pan);
    }
    if (org.gstin && !org.gstin.startsWith("v1:")) {
      dataToUpdate.gstin = encryptField(org.gstin);
      dataToUpdate.gstinHash = computeBlindHash(org.gstin);
    }
    if (org.registrationNumber && !org.registrationNumber.startsWith("v1:")) {
      dataToUpdate.registrationNumber = encryptField(org.registrationNumber);
      dataToUpdate.registrationNumberHash = computeBlindHash(org.registrationNumber);
    }

    if (Object.keys(dataToUpdate).length > 0) {
      await prisma.organization.update({
        where: { id: org.id },
        data: dataToUpdate,
      });
    }
  }

  // 2. Backfill NGO Profiles
  const ngos = await prisma.nGOProfile.findMany();
  console.log(`Found ${ngos.length} NGO profiles to process.`);

  for (const ngo of ngos) {
    const dataToUpdate: Record<string, string | null> = {};

    if (ngo.darpanNumber && !ngo.darpanNumber.startsWith("v1:")) {
      dataToUpdate.darpanNumber = encryptField(ngo.darpanNumber);
      dataToUpdate.darpanNumberHash = computeBlindHash(ngo.darpanNumber);
    }
    if (ngo.csr1Number && !ngo.csr1Number.startsWith("v1:")) {
      dataToUpdate.csr1Number = encryptField(ngo.csr1Number);
      dataToUpdate.csr1NumberHash = computeBlindHash(ngo.csr1Number);
    }

    if (Object.keys(dataToUpdate).length > 0) {
      await prisma.nGOProfile.update({
        where: { id: ngo.id },
        data: dataToUpdate,
      });
    }
  }

  // 3. Backfill Bank Accounts
  const bankAccounts = await prisma.bankAccount.findMany();
  console.log(`Found ${bankAccounts.length} bank accounts to process.`);

  for (const acc of bankAccounts) {
    const dataToUpdate: Record<string, string | null> = {};

    if (acc.accountNumber && !acc.accountNumber.startsWith("v1:")) {
      dataToUpdate.accountNumber = encryptField(acc.accountNumber)!;
      dataToUpdate.accountNumberHash = computeBlindHash(acc.accountNumber);
    }

    if (acc.ifscCode && !acc.ifscCode.startsWith("v1:")) {
      dataToUpdate.ifscCode = encryptField(acc.ifscCode)!;
    }

    if (Object.keys(dataToUpdate).length > 0) {
      await prisma.bankAccount.update({
        where: { id: acc.id },
        data: dataToUpdate,
      });
    }
  }

  console.log("Encryption backfill completed successfully.");
}

main()
  .catch((e) => {
    console.error("Migration error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
