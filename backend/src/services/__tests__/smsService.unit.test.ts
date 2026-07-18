/**
 * SMS service unit tests — MSG91 provider with the HTTP client mocked.
 *
 * Covers: DLT payload shape, success parsing, retry-then-succeed on transient
 * failures, no-retry on 4xx, exhausted retries, stub default, and the
 * fail-fast guard when MSG91 is selected without configuration.
 */

import { Msg91SmsProvider, normalizeMobile, sendSMS, __resetSmsProvider } from "../smsService";

// Silence structured logs during tests.
jest.spyOn(console, "log").mockImplementation(() => {});
jest.spyOn(console, "warn").mockImplementation(() => {});
jest.spyOn(console, "error").mockImplementation(() => {});

function makeClient(request: jest.Mock) {
  return { request } as any;
}

const baseConfig = {
  authKey: "test-auth-key",
  senderId: "MAHCSR",
  dltTemplateId: "dlt-123",
  maxRetries: 3,
  retryBaseDelayMs: 1 // keep backoff tiny in tests
};

describe("normalizeMobile", () => {
  it("prefixes country code for a 10-digit number", () => {
    expect(normalizeMobile("9876543210")).toBe("919876543210");
  });
  it("keeps an already-prefixed 12-digit number", () => {
    expect(normalizeMobile("919876543210")).toBe("919876543210");
  });
  it("strips a leading 0 and prefixes", () => {
    expect(normalizeMobile("09876543210")).toBe("919876543210");
  });
  it("strips +, spaces and dashes", () => {
    expect(normalizeMobile("+91 98765-43210")).toBe("919876543210");
  });
});

describe("Msg91SmsProvider", () => {
  it("throws when selected without required config", () => {
    expect(() => new Msg91SmsProvider({ authKey: "", senderId: "", dltTemplateId: "" })).toThrow(
      /MSG91_AUTH_KEY.*MSG91_SENDER_ID.*MSG91_DLT_TEMPLATE_ID/
    );
  });

  it("sends a correctly-shaped DLT flow payload and parses success", async () => {
    const request = jest.fn().mockResolvedValue({
      status: 200,
      data: { type: "success", message: "req-abc-123" }
    });
    const provider = new Msg91SmsProvider(baseConfig, makeClient(request));

    const result = await provider.send("9876543210", "Hello MahaCSR");

    expect(request).toHaveBeenCalledTimes(1);
    const call = request.mock.calls[0][0];
    expect(call.method).toBe("POST");
    expect(call.url).toBe("/flow/");
    expect(call.data.template_id).toBe("dlt-123");
    expect(call.data.sender).toBe("MAHCSR");
    expect(call.data.recipients[0].mobiles).toBe("919876543210");
    expect(call.data.recipients[0].message).toBe("Hello MahaCSR");
    expect(result.providerMessageId).toBe("req-abc-123");
    expect(result.responseCode).toBe("200_SUCCESS");
  });

  it("retries on a 5xx then succeeds", async () => {
    const request = jest
      .fn()
      .mockRejectedValueOnce(Object.assign(new Error("server error"), { isAxiosError: true, response: { status: 503 } }))
      .mockResolvedValueOnce({ status: 200, data: { type: "success", message: "req-2" } });
    const provider = new Msg91SmsProvider(baseConfig, makeClient(request));

    const result = await provider.send("9876543210", "retry me");

    expect(request).toHaveBeenCalledTimes(2);
    expect(result.providerMessageId).toBe("req-2");
  });

  it("does not retry on a 400 (non-retriable)", async () => {
    const request = jest
      .fn()
      .mockRejectedValue(Object.assign(new Error("bad request"), { isAxiosError: true, response: { status: 400 } }));
    const provider = new Msg91SmsProvider(baseConfig, makeClient(request));

    await expect(provider.send("9876543210", "nope")).rejects.toThrow(/MSG91 SMS send failed/);
    expect(request).toHaveBeenCalledTimes(1);
  });

  it("throws after exhausting retries on repeated 5xx", async () => {
    const request = jest
      .fn()
      .mockRejectedValue(Object.assign(new Error("down"), { isAxiosError: true, response: { status: 500 } }));
    const provider = new Msg91SmsProvider(baseConfig, makeClient(request));

    await expect(provider.send("9876543210", "x")).rejects.toThrow(/after 3 attempt/);
    expect(request).toHaveBeenCalledTimes(3);
  });

  it("treats a non-success response type as a failure", async () => {
    const request = jest
      .fn()
      .mockResolvedValue({ status: 200, data: { type: "error", message: "invalid template" } });
    const provider = new Msg91SmsProvider({ ...baseConfig, maxRetries: 1 }, makeClient(request));

    await expect(provider.send("9876543210", "x")).rejects.toThrow(/MSG91 SMS send failed/);
  });
});

describe("sendSMS provider selection", () => {
  const OLD_ENV = process.env;
  beforeEach(() => {
    process.env = { ...OLD_ENV };
    __resetSmsProvider();
  });
  afterAll(() => {
    process.env = OLD_ENV;
  });

  it("uses the stub provider by default and returns a mock id", async () => {
    delete process.env.SMS_PROVIDER;
    const result = await sendSMS({ to: "9876543210", status: "SUBMITTED", trackingId: "CSR-MH-2026-000001" });
    expect(result.providerMessageId).toMatch(/^SMS-MOCK-/);
    expect(result.responseCode).toBe("200_SUCCESS");
  });

  it("builds the default tracking message when none is supplied", async () => {
    process.env.SMS_PROVIDER = "stub";
    const result = await sendSMS({ to: "9876543210", status: "APPROVED", trackingId: "PRJ-MH-2026-000009" });
    expect(result.responseCode).toBe("200_SUCCESS");
  });
});
