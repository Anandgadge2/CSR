import { Worker, Queue, Job } from "bullmq";
import prisma from "../config/db";
import { sendTemplateEmail } from "../services/emailService";
import { sendSMS } from "../services/smsService";
import { emitNotificationToUser } from "../websocket/notificationSocket";
import os from "os";
import IORedis from "ioredis";

const REDIS_URL = process.env.REDIS_URL?.trim();
const REDIS_HOST = process.env.REDIS_HOST || "localhost";
const REDIS_PORT = parseInt(process.env.REDIS_PORT || "6379", 10);

function createRedisConnection(options: Record<string, any>): IORedis {
  return REDIS_URL
    ? new IORedis(REDIS_URL, options)
    : new IORedis({ host: REDIS_HOST, port: REDIS_PORT, ...options });
}

export interface NotificationJobPayload {
  recipientId: string;
  recipientEmail?: string | null;
  recipientPhone?: string | null;
  title: string;
  message: string;
  channels: ("EMAIL" | "SMS" | "IN_APP" | "SOCKET")[];
  trackingId?: string;
  applicantName?: string;
  currentStatus?: string;
  workflowStatus?: string;
  actionButtonUrl?: string;
  correlationId?: string;
  notificationType?: string;
}

let notificationQueueInstance: Queue | null = null;
let notificationWorkerInstance: Worker | null = null;
let bullmqReady = false;

async function processNotificationDirect(payload: NotificationJobPayload): Promise<void> {
  let inAppRecord: any = null;
  if (payload.channels.includes("IN_APP")) {
    inAppRecord = await prisma.notification.create({
      data: {
        recipientId: payload.recipientId,
        title: payload.title,
        message: payload.message
      }
    });
  }

  if (payload.channels.includes("SOCKET") && inAppRecord) {
    emitNotificationToUser(payload.recipientId, inAppRecord);
  }

  if (payload.channels.includes("EMAIL") && payload.recipientEmail) {
    const emailLog = await prisma.notificationLog.create({
      data: {
        recipientId: payload.recipientId,
        recipient: payload.recipientEmail,
        channel: "EMAIL",
        status: "PENDING"
      }
    });

    try {
      const mailResult = await sendTemplateEmail({
        to: payload.recipientEmail,
        templateName: "workflow_notification",
        trackingId: payload.trackingId,
        applicantName: payload.applicantName || "User",
        currentStatus: payload.currentStatus || payload.title,
        workflowStatus: payload.workflowStatus || payload.message,
        actionButtonUrl: payload.actionButtonUrl,
        subject: payload.title
      });

      await prisma.notificationLog.update({
        where: { id: emailLog.id },
        data: {
          status: "SENT",
          providerMessageId: mailResult.messageId,
          sentAt: new Date()
        }
      });
    } catch (err: any) {
      await prisma.notificationLog.update({
        where: { id: emailLog.id },
        data: {
          status: "FAILED",
          retryCount: 0,
          error: err.message || String(err)
        }
      });
    }
  }

  if (payload.channels.includes("SMS") && payload.recipientPhone) {
    const smsLog = await prisma.notificationLog.create({
      data: {
        recipientId: payload.recipientId,
        recipient: payload.recipientPhone,
        channel: "SMS",
        status: "PENDING"
      }
    });

    try {
      const smsResult = await sendSMS({
        to: payload.recipientPhone,
        trackingId: payload.trackingId,
        status: payload.currentStatus || payload.title,
        portalUrl: payload.actionButtonUrl,
        message: payload.message
      });

      await prisma.notificationLog.update({
        where: { id: smsLog.id },
        data: {
          status: "SENT",
          providerMessageId: smsResult.providerMessageId,
          sentAt: new Date()
        }
      });
    } catch (err: any) {
      await prisma.notificationLog.update({
        where: { id: smsLog.id },
        data: {
          status: "FAILED",
          retryCount: 0,
          error: err.message || String(err)
        }
      });
    }
  }
}

async function initBullMQ(): Promise<void> {
  try {
    const connection = createRedisConnection({
      maxRetriesPerRequest: null,
      connectTimeout: 2000,
      enableOfflineQueue: false
    });

    connection.on("error", () => {});
    await connection.ping();

    notificationQueueInstance = new Queue("notifications", {
      connection: createRedisConnection({ maxRetriesPerRequest: null })
    });

    notificationWorkerInstance = new Worker(
      "notifications",
      async (job: Job<NotificationJobPayload>) => {
        await processNotificationDirect(job.data);
      },
      { connection: createRedisConnection({ maxRetriesPerRequest: null }) }
    );

    bullmqReady = true;
  } catch (err) {
    bullmqReady = false;
  }
}

initBullMQ().catch(() => {});

export async function queueNotification(payload: NotificationJobPayload): Promise<void> {
  if (bullmqReady && notificationQueueInstance) {
    try {
      await notificationQueueInstance.add("send-notification", payload, {
        attempts: 3,
        backoff: { type: "exponential", delay: 2000 }
      });
      return;
    } catch (err) {
      console.warn("Failed to push job to BullMQ, executing synchronously:", err);
    }
  }

  await processNotificationDirect(payload);
}
