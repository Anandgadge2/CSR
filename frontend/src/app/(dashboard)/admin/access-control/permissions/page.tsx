// Permissions Catalog Page — Read-only permission reference
"use client";

import { useState, useMemo } from "react";
import { Search, Shield, Key } from "lucide-react";
import GovPortalLayout from "@/components/layout/GovPortalLayout";
import GovPageHeader from "@/components/layout/GovPageHeader";
import { Card, CardContent } from "@/components/ui/Card";
import { RiskBadge, DelegableBadge } from "@/components/access-control/RoleBadges";
import { usePermissions } from "@/hooks/useAccessControl";
import { cn } from "@/lib/utils";
import type { Permission, RiskLevel } from "@/types/accessControl";
import "@/styles/gov-theme.css";

import AccessControlTabs from "@/components/access-control/AccessControlTabs";

export default function PermissionsPage() {
  const { data: permissions = [], isLoading } = usePermissions();
  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState<string>("ALL");

  const modules = useMemo(() => {
    const map = new Map<string, Permission[]>();
    for (const p of permissions) {
      const mod = p.module || p.key.split(":")[0] || "other";
      if (!map.has(mod)) map.set(mod, []);
      map.get(mod)!.push(p);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [permissions]);

  const filtered = useMemo(() => {
    return modules
      .map(([mod, perms]) => {
        const f = perms.filter((p) => {
          if (riskFilter !== "ALL" && (p.riskLevel || "LOW") !== riskFilter) return false;
          if (!search.trim()) return true;
          const term = search.toLowerCase();
          return (
            p.key.toLowerCase().includes(term) ||
            (p.title || "").toLowerCase().includes(term) ||
            (p.description || "").toLowerCase().includes(term) ||
            mod.toLowerCase().includes(term)
          );
        });
        return [mod, f] as [string, Permission[]];
      })
      .filter(([, perms]) => perms.length > 0);
  }, [modules, search, riskFilter]);

  const totalFiltered = filtered.reduce((acc, [, perms]) => acc + perms.length, 0);

  return (
    <GovPortalLayout>
      <GovPageHeader
        title="Permission Catalog"
        breadcrumb="Administration / Access Control"
      />

      <AccessControlTabs />

      <div className="space-y-4">
        {/* Search + Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search permissions..."
              className="w-full h-10 pl-9 pr-3 bg-white/80 backdrop-blur-sm border border-slate-200/80 rounded-xl text-sm placeholder:text-slate-400 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10"
              aria-label="Search permissions"
            />
          </div>
          <div className="flex items-center gap-1.5">
            {["ALL", "LOW", "MEDIUM", "HIGH", "CRITICAL"].map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => setRiskFilter(level)}
                className={cn(
                  "px-3 py-1.5 text-[10px] font-bold rounded-lg border transition-all min-h-[36px]",
                  riskFilter === level
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-slate-500 border-slate-200/60 hover:border-slate-300"
                )}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        <p className="text-xs text-slate-500">
          <strong>{totalFiltered}</strong> permissions across <strong>{filtered.length}</strong> modules
        </p>

        {isLoading ? (
          <div className="py-12 text-center text-sm text-slate-400">Loading permission catalog...</div>
        ) : (
          filtered.map(([mod, perms]) => (
            <Card key={mod} variant="outlined" hover={false} tilt={false}>
              <CardContent className="p-0">
                <div className="px-5 py-3 bg-slate-50/60 border-b border-slate-100/60">
                  <div className="flex items-center gap-2">
                    <Key size={14} className="text-blue-500" />
                    <h3 className="text-sm font-bold text-slate-700 capitalize">{mod.replace(/[-_]/g, " ")}</h3>
                    <span className="text-[10px] text-slate-400 ml-auto">{perms.length} permissions</span>
                  </div>
                </div>
                <div className="divide-y divide-slate-100/40">
                  {perms.map((perm) => (
                    <div key={perm.id || perm.key} className="px-5 py-3.5 hover:bg-slate-50/30 transition-colors">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-semibold text-slate-800">
                              {perm.title || perm.key}
                            </span>
                            <RiskBadge level={perm.riskLevel || "LOW"} />
                            <DelegableBadge isDelegable={perm.isDelegable !== false} />
                          </div>
                          <p className="text-[11px] font-mono text-blue-600/80 mt-0.5">{perm.key}</p>
                          {perm.description && (
                            <p className="text-xs text-slate-500 mt-1.5">{perm.description}</p>
                          )}
                          {perm.dependencies && perm.dependencies.length > 0 && (
                            <p className="text-[10px] text-slate-400 mt-1">
                              Dependencies: <span className="font-mono">{perm.dependencies.join(", ")}</span>
                            </p>
                          )}
                          {perm.scopeBehavior && (
                            <p className="text-[10px] text-slate-400 mt-0.5">Scope: {perm.scopeBehavior}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </GovPortalLayout>
  );
}
