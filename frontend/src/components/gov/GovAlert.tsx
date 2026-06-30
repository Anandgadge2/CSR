import { ReactNode, CSSProperties } from "react";

interface GovAlertProps {
  children: ReactNode;
  variant?: "info" | "warning" | "danger" | "success";
  className?: string;
  style?: CSSProperties;
}

export default function GovAlert({
  children,
  variant = "info",
  className = "",
  style,
}: GovAlertProps) {
  return <div className={`gov-alert ${variant} ${className}`} style={style}>{children}</div>;
}

// Made with Bob
