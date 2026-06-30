"use client";

import { useState } from "react";
import GovButton from "@/components/gov/GovButton";
import GovInput from "@/components/gov/GovInput";
import GovStatusBadge from "@/components/gov/GovStatusBadge";
import { apiFetch } from "@/lib/api";

type Purpose = "CORPORATE_ENQUIRY" | "GOVERNMENT_PITCH" | "CORPORATE_INTEREST";
type Channel = "EMAIL" | "MOBILE";

interface OtpVerificationProps {
  purpose: Purpose;
  channel: Channel;
  target: string;
  disabled?: boolean;
  onVerified: (token: string) => void;
}

export default function OtpVerification({ purpose, channel, target, disabled, onVerified }: OtpVerificationProps) {
  const [sent, setSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const send = async () => {
    setLoading(true);
    setError("");
    try {
      await apiFetch("/otp/send", {
        method: "POST",
        body: JSON.stringify({ purpose, channel, target }),
      });
      setSent(true);
    } catch (err: any) {
      setError(err.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const verify = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await apiFetch<any>("/otp/verify", {
        method: "POST",
        body: JSON.stringify({ purpose, channel, target, otp }),
      });
      onVerified(response.verificationToken);
      setVerified(true);
    } catch (err: any) {
      setError(err.message || "Failed to verify OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginTop: 8, border: "1px solid var(--gov-border)", background: "var(--gov-surface-muted)", padding: 10 }}>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", gap: 8 }}>
        {verified ? (
          <GovStatusBadge variant="success">Verified</GovStatusBadge>
        ) : (
          <GovButton type="button" variant="secondary" onClick={send} disabled={disabled || loading || !target} style={{ minHeight: 36, padding: "6px 12px" }}>
            {sent ? "Resend OTP" : "Send OTP"}
          </GovButton>
        )}
        {sent && !verified && (
          <>
            <div style={{ width: 132 }}>
              <GovInput
                label=""
                value={otp}
                onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="6-digit OTP"
                inputMode="numeric"
                style={{ minHeight: 36 }}
              />
            </div>
            <GovButton type="button" onClick={verify} disabled={loading || otp.length !== 6} style={{ minHeight: 36, padding: "6px 12px" }}>
              Verify
            </GovButton>
          </>
        )}
      </div>
      {error && <p style={{ margin: "8px 0 0", fontSize: 12, fontWeight: 700, color: "var(--gov-danger)" }}>{error}</p>}
      {sent && !verified && <p style={{ margin: "8px 0 0", fontSize: 12, color: "var(--gov-text-muted)" }}>OTP expires in 10 minutes.</p>}
    </div>
  );
}
