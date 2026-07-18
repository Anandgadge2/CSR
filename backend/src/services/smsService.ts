import axios, { AxiosInstance } from "axios";
import { createScopedLogger } from "../utils/logger";

const log = createScopedLogger({ module: "sms" });

export interface SmsPayload {
  to: string;
  trackingId?: string;
  status: string;
  portalUrl?: string;
  message?: string;
}

export interface SmsResult {
  providerMessageId: string;
  responseCode: string;
}

/**
 * Pluggable SMS provider abstraction. Select via env SMS_PROVIDER
 * ("stub" default). Real gateways (MSG91/CDAC/MahaOnline/...) implement
 * SmsProvider and register below — no caller changes needed.
 */
export interface SmsProvider {
  name: string;
  send(to: string, message: string): Promise<SmsResult>;
}

/** Sleep helper for retry backoff. */
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Normalize an Indian mobile number to the digits MSG91 expects
 * (country code + 10-digit number, no +/spaces). Falls back to stripping
 * non-digits when the shape is unexpected.
 */
export function normalizeMobile(raw: string, defaultCountry = "91"): string {
  const digits = (raw || "").replace(/\D/g, "");
  if (digits.length === 10) return `${defaultCountry}${digits}`;
  if (digits.length === 12 && digits.startsWith(defaultCountry)) return digits;
  if (digits.length === 11 && digits.startsWith("0")) return `${defaultCountry}${digits.slice(1)}`;
  return digits;
}

class StubSmsProvider implements SmsProvider {
  name = "stub";

  async send(to: string, message: string): Promise<SmsResult> {
    log.info("stub dispatch", { to: maskMobile(to), length: message.length });
    const mockMessageId = `SMS-MOCK-${Math.floor(100000 + Math.random() * 900000)}`;
    return { providerMessageId: mockMessageId, responseCode: "200_SUCCESS" };
  }
}

/** Mask all but the last 4 digits for safe logging. */
function maskMobile(mobile: string): string {
  const digits = (mobile || "").replace(/\D/g, "");
  if (digits.length <= 4) return "****";
  return `${"*".repeat(digits.length - 4)}${digits.slice(-4)}`;
}

interface Msg91Config {
  authKey: string;
  senderId: string;
  dltTemplateId: string;
  baseUrl: string;
  maxRetries: number;
  retryBaseDelayMs: number;
  defaultCountry: string;
  messageVar: string;
}

/**
 * MSG91 SMS provider (Flow API v5).
 *
 * Uses MSG91's DLT-registered flow templates. The fully-formed message body is
 * passed as a single template variable (name configurable via
 * MSG91_MESSAGE_VAR, default "message") so the same abstraction works for any
 * DLT template with a matching variable. Retries transient failures with
 * exponential backoff and logs structured, PII-safe events.
 */
export class Msg91SmsProvider implements SmsProvider {
  name = "msg91";
  private config: Msg91Config;
  private client: AxiosInstance;

  constructor(config?: Partial<Msg91Config>, client?: AxiosInstance) {
    const resolved: Msg91Config = {
      authKey: config?.authKey ?? process.env.MSG91_AUTH_KEY ?? "",
      senderId: config?.senderId ?? process.env.MSG91_SENDER_ID ?? "",
      dltTemplateId: config?.dltTemplateId ?? process.env.MSG91_DLT_TEMPLATE_ID ?? "",
      baseUrl: (config?.baseUrl ?? process.env.MSG91_BASE_URL ?? "https://control.msg91.com/api/v5").replace(/\/$/, ""),
      maxRetries: config?.maxRetries ?? (Number(process.env.MSG91_MAX_RETRIES) || 3),
      retryBaseDelayMs: config?.retryBaseDelayMs ?? (Number(process.env.MSG91_RETRY_BASE_DELAY_MS) || 500),
      defaultCountry: config?.defaultCountry ?? process.env.MSG91_DEFAULT_COUNTRY ?? "91",
      messageVar: config?.messageVar ?? process.env.MSG91_MESSAGE_VAR ?? "message"
    };

    const missing: string[] = [];
    if (!resolved.authKey) missing.push("MSG91_AUTH_KEY");
    if (!resolved.senderId) missing.push("MSG91_SENDER_ID");
    if (!resolved.dltTemplateId) missing.push("MSG91_DLT_TEMPLATE_ID");
    if (missing.length > 0) {
      throw new Error(`MSG91 SMS provider selected but not configured. Missing: ${missing.join(", ")}`);
    }

    this.config = resolved;
    this.client =
      client ||
      axios.create({
        baseURL: this.config.baseUrl,
        timeout: Number(process.env.MSG91_REQUEST_TIMEOUT) || 10000,
        headers: { "Content-Type": "application/json", authkey: this.config.authKey }
      });
  }

  async send(to: string, message: string): Promise<SmsResult> {
    const mobile = normalizeMobile(to, this.config.defaultCountry);
    const masked = maskMobile(mobile);

    const body = {
      template_id: this.config.dltTemplateId,
      sender: this.config.senderId,
      short_url: "0",
      recipients: [
        {
          mobiles: mobile,
          [this.config.messageVar]: message
        }
      ]
    };

    let lastError: unknown;
    for (let attempt = 1; attempt <= this.config.maxRetries; attempt++) {
      try {
        const res = await this.client.request({
          method: "POST",
          url: "/flow/",
          data: body
        });

        const data = res.data ?? {};
        // MSG91 returns { type: "success", message: "<request_id>" } on success.
        const type = String(data.type ?? "").toLowerCase();
        if (type && type !== "success") {
          throw new Error(`MSG91 responded type=${data.type} message=${data.message}`);
        }

        const providerMessageId =
          (typeof data.message === "string" && data.message) || data.request_id || `MSG91-${Date.now()}`;

        log.info("msg91 dispatch ok", {
          to: masked,
          attempt,
          providerMessageId,
          httpStatus: res.status
        });
        return { providerMessageId, responseCode: `${res.status}_SUCCESS` };
      } catch (err) {
        lastError = err;
        const status = axios.isAxiosError(err) ? err.response?.status : undefined;
        // 4xx (except 429) are not retriable — bad request/auth/template.
        const retriable = !status || status === 429 || status >= 500;
        log.warn("msg91 dispatch failed", {
          to: masked,
          attempt,
          maxRetries: this.config.maxRetries,
          httpStatus: status,
          retriable,
          error: err instanceof Error ? err.message : String(err)
        });

        if (!retriable || attempt === this.config.maxRetries) break;
        // Exponential backoff: base * 2^(attempt-1).
        await sleep(this.config.retryBaseDelayMs * Math.pow(2, attempt - 1));
      }
    }

    log.error("msg91 dispatch exhausted", { to: masked, attempts: this.config.maxRetries });
    throw new Error(
      `MSG91 SMS send failed after ${this.config.maxRetries} attempt(s): ${
        lastError instanceof Error ? lastError.message : String(lastError)
      }`
    );
  }
}

// Providers are lazily instantiated so an unconfigured MSG91 provider never
// throws at import time — only when it is actually selected.
const stubProvider = new StubSmsProvider();
let msg91Provider: Msg91SmsProvider | null = null;

function getProvider(): SmsProvider {
  const key = (process.env.SMS_PROVIDER || "stub").toLowerCase();
  if (key === "msg91") {
    if (!msg91Provider) msg91Provider = new Msg91SmsProvider();
    return msg91Provider;
  }
  return stubProvider;
}

/** Reset the memoized provider (used by tests when env changes). */
export function __resetSmsProvider(): void {
  msg91Provider = null;
}

export async function sendSMS(payload: SmsPayload): Promise<SmsResult> {
  const portalUrl = payload.portalUrl || "https://mahacsr.maharashtra.gov.in";

  // Format standard SMS template
  const defaultMessage = payload.trackingId
    ? `MahaCSR Update: Your request ${payload.trackingId} status has changed to: ${payload.status}. Track progress on ${portalUrl}`
    : `MahaCSR Notification: Status update - ${payload.status}. Portal URL: ${portalUrl}`;

  const messageText = payload.message || defaultMessage;

  return getProvider().send(payload.to, messageText);
}
