import { InputHTMLAttributes, forwardRef, useState, ChangeEvent, FocusEvent } from "react";
import { FieldFormat, sanitizeField, validateField, inputModeFor, FIELD_MAX_LENGTH } from "@/lib/validation";

interface GovInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  required?: boolean;
  error?: string;
  help?: string;
  /** Field format: sanitizes keystrokes (blocks invalid chars, uppercases codes)
      and validates on blur with an inline error. */
  format?: FieldFormat;
}

const GovInput = forwardRef<HTMLInputElement, GovInputProps>(
  ({ label, required, error, help, format, className = "", onChange, onBlur, ...props }, ref) => {
    const [localError, setLocalError] = useState("");

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
      if (format) {
        const clean = sanitizeField(format, event.target.value);
        if (clean !== event.target.value) {
          event.target.value = clean;
        }
        if (localError && !validateField(format, clean)) {
          setLocalError("");
        }
      }
      onChange?.(event);
    };

    const handleBlur = (event: FocusEvent<HTMLInputElement>) => {
      if (format) {
        const value = event.target.value;
        if (!value && required && label) {
          setLocalError(`${label} is required`);
        } else {
          setLocalError(validateField(format, value));
        }
      }
      onBlur?.(event);
    };

    const shownError = error || localError;

    return (
      <div className="gov-field">
        {label && (
          <label className="gov-label">
            {label} {required && <span className="gov-required">*</span>}
          </label>
        )}
        <input
          ref={ref}
          className={`gov-input ${shownError ? "error" : ""} ${className}`}
          inputMode={format ? inputModeFor(format) : props.inputMode}
          maxLength={format ? FIELD_MAX_LENGTH[format] ?? props.maxLength : props.maxLength}
          onChange={handleChange}
          onBlur={handleBlur}
          {...props}
        />
        {shownError && <div className="gov-error-text">{shownError}</div>}
        {help && !shownError && <div className="gov-help">{help}</div>}
      </div>
    );
  }
);

GovInput.displayName = "GovInput";

export default GovInput;

// Made with Bob
