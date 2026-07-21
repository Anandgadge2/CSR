import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

// Permission types
export interface PermissionData {
  permissions: string[];
  roles: string[];
  roleDetails: {
    id: string;
    name: string;
    scope: string;
    isSystemRole: boolean;
  }[];
  isAdmin: boolean;
}

interface UserProfile {
  id: string;
  email: string;
  role: string;
  ngoId?: string | null;
  companyId?: string | null;
  assignedDistrict?: string | null;
  beneficiaryProfileId?: string | null;
  ngo?: any;
  company?: any;
}

interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  permissions: string[];
  roles: string[];
  roleDetails: PermissionData["roleDetails"];
  isAdmin: boolean;
  isLoadingPermissions: boolean;
  
  // Actions
  login: (user: UserProfile) => void;
  logout: () => void;
  setPermissions: (data: PermissionData) => void;
  clearPermissions: () => void;
  setLoadingPermissions: (loading: boolean) => void;
  
  // Permission checkers
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      permissions: [],
      roles: [],
      roleDetails: [],
      isAdmin: false,
      isLoadingPermissions: false,

      // Reset any persisted permission state on login so the
      // PermissionInitializer (guarded on permissions.length === 0) always
      // re-fetches fresh grants for the newly authenticated user. Without this,
      // a stale cached isAdmin/permissions set from a previous session (or a
      // pre-fix backend) sticks and blocks pages the user should now see.
      login: (user) => set({
        user,
        isAuthenticated: true,
        permissions: [],
        roles: [],
        roleDetails: [],
        isAdmin: false,
        isLoadingPermissions: false,
      }),
      
      logout: () => set({
        user: null,
        isAuthenticated: false,
        permissions: [],
        roles: [],
        roleDetails: [],
        isAdmin: false,
        isLoadingPermissions: false,
      }),

      setPermissions: (data) => set({
        permissions: data.permissions,
        roles: data.roles,
        roleDetails: data.roleDetails,
        isAdmin: data.isAdmin,
        isLoadingPermissions: false,
      }),

      clearPermissions: () => set({
        permissions: [],
        roles: [],
        roleDetails: [],
        isAdmin: false,
      }),

      setLoadingPermissions: (loading) => set({ isLoadingPermissions: loading }),

      // Check if user has a specific permission
      hasPermission: (permission) => {
        const state = get();
        // Admin has all permissions
        if (state.isAdmin) return true;
        return (state.permissions || []).includes(permission);
      },

      // Check if user has any of the given permissions
      hasAnyPermission: (permissions) => {
        const state = get();
        if (state.isAdmin) return true;
        return permissions.some((p) => (state.permissions || []).includes(p));
      },

      // Check if user has all of the given permissions
      hasAllPermissions: (permissions) => {
        const state = get();
        if (state.isAdmin) return true;
        return permissions.every((p) => (state.permissions || []).includes(p));
      },

      // Check if user has a specific role
      hasRole: (role) => {
        const state = get();
        return (state.roles || []).includes(role);
      },

      // Check if user has any of the given roles
      hasAnyRole: (roles) => {
        const state = get();
        return roles.some((r) => (state.roles || []).includes(r));
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        permissions: state.permissions,
        roles: state.roles,
        roleDetails: state.roleDetails,
        isAdmin: state.isAdmin,
      }),
    }
  )
);

// Selector hooks for better performance
export const useUser = () => useAuthStore((state) => state.user);
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated);
export const usePermissions = () => useAuthStore((state) => state.permissions);
export const useRoles = () => useAuthStore((state) => state.roles);
export const useIsAdmin = () => useAuthStore((state) => state.isAdmin);
export const usePermissionChecker = () => ({
  hasPermission: useAuthStore((state) => state.hasPermission),
  hasAnyPermission: useAuthStore((state) => state.hasAnyPermission),
  hasAllPermissions: useAuthStore((state) => state.hasAllPermissions),
});
export const useRoleChecker = () => ({
  hasRole: useAuthStore((state) => state.hasRole),
  hasAnyRole: useAuthStore((state) => state.hasAnyRole),
});
