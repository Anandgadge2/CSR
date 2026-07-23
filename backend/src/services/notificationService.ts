import prisma from "../config/db";
import { ROLE_ID } from "../types/role";
import { emitNotificationToUser } from "../websocket/notificationSocket";

export async function notify(
  userId: string,
  title: string,
  message: string
): Promise<void> {
  const notification = await prisma.notification.create({
    data: { recipientId: userId, userId, title, message }
  });
  emitNotificationToUser(userId, notification);
}

export async function notifyMultiple(
  userIds: string[],
  title: string,
  message: string
): Promise<void> {
  if (userIds.length === 0) return;
  await prisma.notification.createMany({
    data: userIds.map((userId) => ({ recipientId: userId, userId, title, message }))
  });

  const created = await prisma.notification.findMany({
    where: { recipientId: { in: userIds }, title, message },
    orderBy: { createdAt: "desc" },
    take: userIds.length
  });
  for (const n of created) {
    if (n.recipientId || n.userId) {
      emitNotificationToUser(n.recipientId || n.userId!, n);
    }
  }
}

export async function notifyByRole(
  role: string | number,
  title: string,
  message: string
): Promise<void> {
  const roleId = typeof role === "number" ? role : parseInt(role, 10);
  const users = await prisma.user.findMany({
    where: { roleId: isNaN(roleId) ? undefined : roleId },
    select: { id: true }
  });
  await notifyMultiple(users.map((u) => u.id), title, message);
}

export async function notifyNGOUsers(
  organizationId: string,
  title: string,
  message: string
): Promise<void> {
  const users = await prisma.user.findMany({
    where: { organizationId },
    select: { id: true }
  });
  await notifyMultiple(users.map((u) => u.id), title, message);
}

export async function notifyCompanyUsers(
  organizationId: string,
  title: string,
  message: string
): Promise<void> {
  const users = await prisma.user.findMany({
    where: { organizationId },
    select: { id: true }
  });
  await notifyMultiple(users.map((u) => u.id), title, message);
}

export async function notifyDistrictAdmins(
  district: string,
  title: string,
  message: string
): Promise<void> {
  const users = await prisma.user.findMany({
    where: {
      roleId: ROLE_ID.DISTRICT_NODAL_OFFICER,
      districtMappings: {
        some: { district, isActive: true }
      }
    },
    select: { id: true }
  });
  const superAdmins = await prisma.user.findMany({
    where: { roleId: ROLE_ID.SUPER_ADMIN },
    select: { id: true }
  });
  const allIds = [...users.map((u) => u.id), ...superAdmins.map((u) => u.id)];
  await notifyMultiple([...new Set(allIds)], title, message);
}

export async function auditLog(
  userId: string | undefined,
  action: string,
  details: Record<string, any>,
  ipAddress?: string
): Promise<void> {
  await prisma.auditLog.create({
    data: { actorUserId: userId || null, userId: userId || null, action, details, ipAddress }
  });
}
