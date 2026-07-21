"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { fetchUserPermissions } from "@/lib/api";

/**
 * Component that initializes the permission system on app load
 * Should be placed at the root layout or app wrapper
 * 
 * @example
 * ```tsx
 * // In layout.tsx or app wrapper
 * export default function RootLayout({ children }) {
 *   return (
 *     <PermissionInitializer>
 *       {children}
 *     </PermissionInitializer>
 *   );
 * }
 * ```
 */
export function PermissionInitializer({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, setPermissions, setLoadingPermissions, permissions = [] } = useAuthStore();
  const permissionsCount = permissions?.length || 0;

  useEffect(() => {
    // Load permissions if authenticated and not already loaded
    if (isAuthenticated && permissionsCount === 0) {
      const loadPermissions = async () => {
        setLoadingPermissions(true);
        try {
          const data = await fetchUserPermissions();
          setPermissions(data);
        } catch (error) {
          console.error("Failed to load permissions:", error);
        } finally {
          setLoadingPermissions(false);
        }
      };

      loadPermissions();
    }
  }, [isAuthenticated, permissionsCount, setPermissions, setLoadingPermissions]);

  return <>{children}</>;
}

/**
 * Hook to initialize permissions (alternative to component)
 */
export function useInitializePermissions() {
  const { isAuthenticated, setPermissions, setLoadingPermissions, permissions = [] } = useAuthStore();
  const permissionsCount = permissions?.length || 0;

  useEffect(() => {
    if (isAuthenticated && permissionsCount === 0) {
      const loadPermissions = async () => {
        setLoadingPermissions(true);
        try {
          const data = await fetchUserPermissions();
          setPermissions(data);
        } catch (error) {
          console.error("Failed to load permissions:", error);
        } finally {
          setLoadingPermissions(false);
        }
      };

      loadPermissions();
    }
  }, [isAuthenticated, permissionsCount, setPermissions, setLoadingPermissions]);
}

/**
 * Permission refresh trigger component
 * Use this after role/permission changes to refresh permissions
 */
export function PermissionRefreshTrigger({ onRefresh }: { onRefresh?: () => void }) {
  const { setPermissions, setLoadingPermissions } = useAuthStore();

  useEffect(() => {
    const refresh = async () => {
      setLoadingPermissions(true);
      try {
        const data = await fetchUserPermissions();
        setPermissions(data);
        onRefresh?.();
      } catch (error) {
        console.error("Failed to refresh permissions:", error);
      } finally {
        setLoadingPermissions(false);
      }
    };

    refresh();
  }, [setPermissions, setLoadingPermissions, onRefresh]);

  return null;
}
