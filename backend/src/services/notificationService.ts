import prisma from "../config/db";

/**
 * Create an in-app notification for a single user.
 */
export async function notify(
  userId: string,
  title: string,
  message: string
): Promise<void> {
  await prisma.notification.create({
    data: { userId, title, message }
  });
}

/**
 * Notify multiple users with the same title/message.
 */
export async function notifyMultiple(
  userIds: string[],
  title: string,
  message: string
): Promise<void> {
  if (userIds.length === 0) return;
  await prisma.notification.createMany({
    data: userIds.map((userId) => ({ userId, title, message }))
  });
}

/**
 * Notify all users with a specific role.
 */
export async function notifyByRole(
  role: string,
  title: string,
  message: string
): Promise<void> {
  const users = await prisma.user.findMany({
    where: { role: role as any },
    select: { id: true }
  });
  await notifyMultiple(users.map((u) => u.id), title, message);
}

/**
 * Notify all users linked to a specific NGO.
 */
export async function notifyNGOUsers(
  ngoId: string,
  title: string,
  message: string
): Promise<void> {
  const users = await prisma.user.findMany({
    where: { ngoId },
    select: { id: true }
  });
  await notifyMultiple(users.map((u) => u.id), title, message);
}

/**
 * Notify all users linked to a specific company.
 */
export async function notifyCompanyUsers(
  companyId: string,
  title: string,
  message: string
): Promise<void> {
  const users = await prisma.user.findMany({
    where: { companyId },
    select: { id: true }
  });
  await notifyMultiple(users.map((u) => u.id), title, message);
}

/**
 * Notify district admins for a specific district.
 */
export async function notifyDistrictAdmins(
  district: string,
  title: string,
  message: string
): Promise<void> {
  const users = await prisma.user.findMany({
    where: { role: "DISTRICT_ADMIN", assignedDistrict: district },
    select: { id: true }
  });
  // Also notify super admins
  const superAdmins = await prisma.user.findMany({
    where: { role: "SUPER_ADMIN" },
    select: { id: true }
  });
  const allIds = [...users.map((u) => u.id), ...superAdmins.map((u) => u.id)];
  await notifyMultiple([...new Set(allIds)], title, message);
}

/**
 * Create an audit log entry.
 */
export async function auditLog(
  userId: string | undefined,
  action: string,
  details: Record<string, any>,
  ipAddress?: string
): Promise<void> {
  await prisma.auditLog.create({
    data: { userId, action, details, ipAddress }
  });
}
