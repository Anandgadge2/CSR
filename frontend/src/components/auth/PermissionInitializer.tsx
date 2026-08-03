"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";

export function PermissionInitializer({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, fetchEffectivePermissions, user } = useAuthStore();
  const userId = user?.id;

  useEffect(() => {
    if (isAuthenticated && userId) {
      fetchEffectivePermissions();
    }
  }, [isAuthenticated, userId, fetchEffectivePermissions]);

  return <>{children}</>;
}

export function useInitializePermissions() {
  const { isAuthenticated, fetchEffectivePermissions, user } = useAuthStore();
  const userId = user?.id;

  useEffect(() => {
    if (isAuthenticated && userId) {
      fetchEffectivePermissions();
    }
  }, [isAuthenticated, userId, fetchEffectivePermissions]);
}

export function PermissionRefreshTrigger({ onRefresh }: { onRefresh?: () => void }) {
  const { fetchEffectivePermissions } = useAuthStore();

  useEffect(() => {
    fetchEffectivePermissions().then(() => onRefresh?.());
  }, [fetchEffectivePermissions, onRefresh]);

  return null;
}
