import { SelectHTMLAttributes, forwardRef, ReactNode } from "react";

interface GovSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  required?: boolean;
  error?: string;
  help?: string;
  options?: { value: string | number; label: string }[];
  children?: ReactNode;
}

const GovSelect = forwardRef<HTMLSelectElement, GovSelectProps>(
  ({ label, required, error, help, className = "", children, options, ...props }, ref) => {
    return (
      <div className="gov-field">
        {label && (
          <label className="gov-label">
            {label} {required && <span className="gov-required">*</span>}
          </label>
        )}
        <select
          ref={ref}
          className={`gov-select ${error ? "error" : ""} ${className}`}
          {...props}
        >
          {children}
          {options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <div className="gov-error-text">{error}</div>}
        {help && !error && <div className="gov-help">{help}</div>}
      </div>
    );
  }
);

GovSelect.displayName = "GovSelect";

export default GovSelect;

// Made with Bob
