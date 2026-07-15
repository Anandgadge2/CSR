// Shared field sanitizers + validators for the portal.
// Sanitizers run on every keystroke (block/transform bad characters);
// validators run on blur/submit and return an error message or "".

export type FieldFormat =
  | "phone"      // 10-digit Indian mobile
  | "pan"        // AAAAA9999A
  | "gst"        // 15-char GSTIN
  | "cin"        // 21-char MCA CIN
  | "ifsc"       // AAAA0XXXXXX
  | "aadhaar"    // 12 digits
  | "pincode"    // 6 digits
  | "email"
  | "name"       // letters, spaces, dots only
  | "number"     // digits only (amounts, counts)
  | "otp";       // 6 digits

/** Transform raw input per field type — strips disallowed chars, uppercases codes. */
export function sanitizeField(format: FieldFormat, value: string): string {
  switch (format) {
    case "phone":
      return value.replace(/\D/g, "").slice(0, 10);
    case "aadhaar":
      return value.replace(/\D/g, "").slice(0, 12);
    case "pincode":
      return value.replace(/\D/g, "").slice(0, 6);
    case "otp":
      return value.replace(/\D/g, "").slice(0, 6);
    case "number":
      return value.replace(/\D/g, "");
    case "pan":
      return value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 10);
    case "gst":
      return value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 15);
    case "cin":
      return value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 21);
    case "ifsc":
      return value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 11);
    case "email":
      return value.replace(/\s/g, "");
    case "name":
      return value.replace(/[^a-zA-Z\s.]/g, "");
    default:
      return value;
  }
}

const PATTERNS: Record<FieldFormat, { regex: RegExp; message: string }> = {
  phone:   { regex: /^[6-9]\d{9}$/,                          message: "Enter a valid 10-digit mobile number starting with 6-9" },
  pan:     { regex: /^[A-Z]{5}[0-9]{4}[A-Z]$/,               message: "Enter a valid PAN (e.g. ABCDE1234F)" },
  gst:     { regex: /^\d{2}[A-Z]{5}\d{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/, message: "Enter a valid 15-character GSTIN (e.g. 27ABCDE1234F1Z5)" },
  cin:     { regex: /^[LU]\d{5}[A-Z]{2}\d{4}[A-Z]{3}\d{6}$/, message: "Enter a valid 21-character CIN (e.g. L12345MH2010PLC123456)" },
  ifsc:    { regex: /^[A-Z]{4}0[A-Z0-9]{6}$/,                message: "Enter a valid IFSC code (e.g. SBIN0001234)" },
  aadhaar: { regex: /^\d{12}$/,                              message: "Aadhaar must be exactly 12 digits" },
  pincode: { regex: /^[1-9]\d{5}$/,                          message: "Enter a valid 6-digit PIN code" },
  email:   { regex: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,         message: "Enter a valid email address" },
  name:    { regex: /^[a-zA-Z\s.]{2,}$/,                     message: "Only letters, spaces and dots are allowed" },
  number:  { regex: /^\d+$/,                                 message: "Only digits are allowed" },
  otp:     { regex: /^\d{6}$/,                               message: "OTP must be 6 digits" },
};

/** Validate a sanitized value. Empty value returns "" — pair with `required` checks separately. */
export function validateField(format: FieldFormat, value: string): string {
  if (!value) return "";
  const rule = PATTERNS[format];
  return rule.regex.test(value) ? "" : rule.message;
}

/** Required check with a consistent message. */
export function requiredField(label: string, value: string): string {
  return value.trim() ? "" : `${label} is required`;
}

/** inputMode hint per format so mobile keyboards match the field. */
export function inputModeFor(format: FieldFormat): "numeric" | "email" | "text" {
  if (["phone", "aadhaar", "pincode", "number", "otp"].includes(format)) return "numeric";
  if (format === "email") return "email";
  return "text";
}

export const FIELD_MAX_LENGTH: Partial<Record<FieldFormat, number>> = {
  phone: 10, pan: 10, gst: 15, cin: 21, ifsc: 11, aadhaar: 12, pincode: 6, otp: 6,
};
