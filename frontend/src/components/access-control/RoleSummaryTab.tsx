// Role Summary Tab — Metadata, risk summary, and lifecycle actions
"use client";

import { Shield, Calendar, User, AlertTriangle, Copy, Pencil, Power, Archive, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { TypeBadge, StatusBadge, ScopeBadge, ProtectedIndicator, RiskBadge } from "./RoleBadges";
import { useAuthStore } from "@/store/authStore";
import type { Role } from "@/types/accessControl";

interface RoleSummaryTabProps {
  role: Role;
  highRiskCount: number;
  criticalCount: number;
  onEdit: () => void;
  onClone: () => void;
  onActivate: () => void;
  onDeactivate: () => void;
  onDelete: () => void;
}

export function RoleSummaryTab({
  role,
  highRiskCount,
  criticalCount,
  onEdit,
  onClone,
  onActivate,
  onDeactivate,
  onDelete,
}: RoleSummaryTabProps) {
  const { hasPermission } = useAuthStore();
  const canConfigure = hasPermission("role:configure");
  const canCreate = hasPermission("role:create");
  const canDelete = hasPermission("role:delete");
  const userCount = (role._count?.roleAssignments ?? 0) + (role._count?.users ?? 0);

  return (
    <div className="space-y-5">
      {/* Role Identity */}
      <Card variant="outlined" hover={false} tilt={false}>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <InfoRow label="Display Name" value={role.displayName || role.name} />
              <InfoRow label="Role Code" value={role.code} mono />
              <InfoRow label="Description" value={role.description || "No description provided."} />
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500 w-28 shrink-0">Type</span>
                <TypeBadge type={role.type} />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500 w-28 shrink-0">Default Scope</span>
                <ScopeBadge scope={role.defaultScope} />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500 w-28 shrink-0">Status</span>
                <StatusBadge status={role.status} />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500 w-28 shrink-0">Protected</span>
                <ProtectedIndicator isProtected={role.isProtected} />
                {!role.isProtected && (
                  <Badge variant="muted" size="sm">Not Protected</Badge>
                )}
              </div>
              <InfoRow
                label="Assigned Users"
                value={`${userCount} user${userCount !== 1 ? "s" : ""}`}
                icon={<User size={12} className="text-slate-400" />}
              />
              <InfoRow
                label="Version"
                value={`v${role.version}`}
                mono
              />
              <InfoRow
                label="Created"
                value={new Date(role.createdAt).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
                icon={<Calendar size={12} className="text-slate-400" />}
              />
              <InfoRow
                label="Last Modified"
                value={new Date(role.updatedAt).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
                icon={<Calendar size={12} className="text-slate-400" />}
              />
              {role.organizationId && (
                <InfoRow label="Organization" value={role.organizationId} mono />
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Risk Summary */}
      <Card variant="outlined" hover={false} tilt={false}>
        <CardContent>
          <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
            <AlertTriangle size={14} className="text-amber-500" />
            Risk Summary
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/40">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Permissions</p>
              <p className="text-xl font-bold text-slate-800 mt-1">{role.permissions.length}</p>
            </div>
            <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-200/40">
              <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">High Risk</p>
              <p className="text-xl font-bold text-amber-800 mt-1">{highRiskCount}</p>
            </div>
            <div className="p-3 bg-red-50/80 rounded-xl border border-red-200/40">
              <p className="text-[10px] font-bold text-red-600 uppercase tracking-wider">Critical</p>
              <p className="text-xl font-bold text-red-800 mt-1">{criticalCount}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      {!role.isProtected && (
        <div className="flex flex-wrap items-center gap-2 pt-2">
          {canConfigure && (
            <Button variant="outline" size="sm" icon={Pencil} onClick={onEdit}>
              Edit Details
            </Button>
          )}
          {canCreate && (
            <Button variant="outline" size="sm" icon={Copy} onClick={onClone}>
              Clone Role
            </Button>
          )}
          {canConfigure && role.status === "ACTIVE" && (
            <Button variant="warning" size="sm" icon={Power} onClick={onDeactivate}>
              Deactivate
            </Button>
          )}
          {canConfigure && role.status === "INACTIVE" && (
            <Button variant="primary" size="sm" icon={Power} onClick={onActivate}>
              Activate
            </Button>
          )}
          {canDelete && !role.isSystemRole && (
            <Button variant="danger" size="sm" icon={Trash2} onClick={onDelete}>
              Delete Role
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

function InfoRow({
  label,
  value,
  mono,
  icon,
}: {
  label: string;
  value: string;
  mono?: boolean;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-xs font-semibold text-slate-500 w-28 shrink-0 pt-0.5">{label}</span>
      <div className="flex items-center gap-1.5">
        {icon}
        <span className={`text-sm text-slate-800 ${mono ? "font-mono text-xs bg-slate-50 px-1.5 py-0.5 rounded" : ""}`}>
          {value}
        </span>
      </div>
    </div>
  );
}
