import prisma from "../config/db";
import { Role } from "../types/role";
import { emitNotificationToUser } from "../websocket/notificationSocket";
import { dispatchToContact } from "./notificationOrchestrator";

/**
 * Create an in-app notification for a single user and push it live over the
 * notification socket (if connected).
 */
export async function notify(
  userId: string,
  title: string,
  message: string
): Promise<void> {
  const notification = await prisma.notification.create({
    data: { userId, title, message }
  });
  emitNotificationToUser(userId, notification);
}

/**
 * Notify multiple users with the same title/message. Persists in one batch,
 * then pushes each user's own record live over the notification socket.
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
  // createMany does not return rows; fetch the just-created ones to emit.
  const created = await prisma.notification.findMany({
    where: { userId: { in: userIds }, title, message },
    orderBy: { createdAt: "desc" },
    take: userIds.length
  });
  for (const n of created) {
    emitNotificationToUser(n.userId, n);
  }
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
    where: {
      assignedDistrict: district,
      organizationRoles: {
        some: {
          role: {
            name: {
              in: ["DISTRICT_ADMIN", "District Admin"]
            }
          }
        }
      }
    },
    select: { id: true }
  });
  // Also notify super admins
  const superAdmins = await prisma.user.findMany({
    where: { role: Role.SUPER_ADMIN },
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

type ChannelNotificationInput = {
  trackingId?: string;
  targetEmail?: string | null;
  targetMobile?: string | null;
  title: string;
  message: string;
  /** When set, an in-app Notification is created + pushed over the socket. */
  userId?: string;
  currentStatus?: string;
  actionButtonUrl?: string;
  correlationId?: string;
};

/**
 * Multi-channel status notification.
 *
 * Guarantees every status-change event reaches the recipient through all
 * available channels rather than a console.log-only path:
 *  - IN_APP + SOCKET: created when a userId is known (via `notify`).
 *  - EMAIL + SMS: fanned out through the notification queue/worker via the
 *    orchestrator's contact dispatch, which persists a NotificationLog row.
 *
 * Public applicants (tracked by tracking ID, no User row) still receive EMAIL
 * and SMS. Delivery failures are swallowed so a status transition is never
 * blocked by a downstream email/SMS outage (the failure is logged in
 * NotificationLog by the worker).
 */
async function dispatchChannelNotification(
  notificationType: string,
  input: ChannelNotificationInput
): Promise<void> {
  // 1. In-app (only possible with a real user).
  if (input.userId) {
    try {
      await notify(input.userId, input.title, input.message);
    } catch (err) {
      console.error(`[notify:${notificationType}] in-app notification failed`, err);
    }
  }

  // 2. Email + SMS fan-out (works for both users and anonymous contacts).
  if (input.targetEmail || input.targetMobile) {
    try {
      await dispatchToContact({
        referenceId: input.trackingId || input.userId || `${notificationType}-${Date.now()}`,
        email: input.targetEmail,
        phone: input.targetMobile,
        title: input.title,
        message: input.message,
        trackingId: input.trackingId,
        currentStatus: input.currentStatus,
        actionButtonUrl: input.actionButtonUrl,
        correlationId: input.correlationId,
        notificationType
      });
    } catch (err) {
      console.error(`[notify:${notificationType}] email/SMS dispatch failed`, err);
    }
  }
}

export async function sendTrackingIdNotification(input: ChannelNotificationInput): Promise<void> {
  await dispatchChannelNotification("TRACKING_NOTIFICATION", input);
}

export async function sendSlaEscalationNotification(input: ChannelNotificationInput): Promise<void> {
  await dispatchChannelNotification("SLA_ESCALATION", input);
}

export async function sendGrievanceAcknowledgement(input: ChannelNotificationInput): Promise<void> {
  await dispatchChannelNotification("GRIEVANCE_ACK", input);
}

export async function sendJsDecisionNotification(input: ChannelNotificationInput): Promise<void> {
  await dispatchChannelNotification("JS_DECISION", input);
}

export async function sendNodalOfficerAppointmentNotification(input: ChannelNotificationInput): Promise<void> {
  await dispatchChannelNotification("NODAL_APPOINTMENT", input);
}

export async function sendMouStatusNotification(input: ChannelNotificationInput): Promise<void> {
  await dispatchChannelNotification("MOU_STATUS", input);
}

export async function sendUcVerificationNotification(input: ChannelNotificationInput): Promise<void> {
  await dispatchChannelNotification("UC_VERIFICATION", input);
}
