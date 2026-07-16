# Dynamic Roles and Permissions System

This document describes the dynamic RBAC (Role-Based Access Control) system implemented in the CSR Portal.

## Table of Contents
1. [Overview](#overview)
2. [Backend Implementation](#backend-implementation)
3. [Frontend Implementation](#frontend-implementation)
4. [Migration Guide](#migration-guide)
5. [Usage Examples](#usage-examples)
6. [Permission Constants](#permission-constants)
7. [Best Practices](#best-practices)

## Overview

The dynamic permission system allows administrators to:
- Create custom roles with specific permissions
- Assign multiple roles to users
- Control access at a granular level (per action/resource)
- Modify permissions without code changes

### Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                │
├─────────────────────────────────────────────────────────────────┤
│  Components         │  Hooks              │  Store              │
│  ─────────────────  │  ─────────────────  │  ─────────────────  │
│  ProtectedComponent │  usePermission()    │  authStore          │
│  ProtectedButton    │  useHasPermission() │  - permissions[]    │
│  PermissionInit     │  useHasRole()       │  - roles[]          │
│                    │  useModulePermissions│  - isAdmin          │
└──────────────────┬────────────────────────────────────────────────┘
                   │  Fetch /api/auth/permissions on login
                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                         BACKEND                                 │
├─────────────────────────────────────────────────────────────────┤
│  GET /api/auth/permissions                                      │
│  ├── Returns user's permissions from UserOrganizationRole       │
│  ├── Joins OrganizationRole → OrganizationRolePermission        │
│  └── Caches in JWT token or session                           │
└─────────────────────────────────────────────────────────────────┘
```

## Backend Implementation

### API Endpoints

#### 1. Get Current User Permissions
```http
GET /api/auth/permissions
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": {
    "permissions": ["requirement:view", "requirement:create", "project:view"],
    "roles": ["NGO_ADMIN", "CUSTOM_ROLE"],
    "roleDetails": [
      { "id": "123", "name": "NGO_ADMIN", "scope": "GLOBAL", "isSystemRole": true },
      { "id": "456", "name": "CUSTOM_ROLE", "scope": "ORGANIZATION", "isSystemRole": false }
    ],
    "isAdmin": false
  }
}
```

#### 2. Get Module-Specific Permissions
```http
GET /api/auth/permissions/:module
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": {
    "module": "requirement",
    "permissions": ["requirement:view", "requirement:create", "requirement:update"]
  }
}
```

#### 3. Check Specific Permission
```http
POST /api/auth/check-permission
Authorization: Bearer {token}
Content-Type: application/json

Request:
{
  "permission": "requirement:approve"
}

Response:
{
  "success": true,
  "data": {
    "hasPermission": true,
    "permission": "requirement:approve"
  }
}
```

### Database Schema

The permission system uses these Prisma models:

```prisma
model Permission {
  id          String   @id @default(uuid())
  key         String   @unique // e.g., "requirement:create"
  description String?
  module      String   // e.g., "requirement"
  rolePermissions OrganizationRolePermission[]
}

model OrganizationRole {
  id               String   @id @default(uuid())
  name             String
  description      String?
  scope            RoleScope // GLOBAL, TENANT, ORGANIZATION
  isSystemRole     Boolean  @default(false)
  rolePermissions  OrganizationRolePermission[]
  userRoles        UserOrganizationRole[]
}

model OrganizationRolePermission {
  id         String           @id @default(uuid())
  roleId     String
  permissionId String
  role       OrganizationRole @relation(fields: [roleId], references: [id])
  permission Permission       @relation(fields: [permissionId], references: [id])
}

model UserOrganizationRole {
  id             String           @id @default(uuid())
  userId         String
  roleId         String
  tenantId       String?
  organizationId String?
  user           User             @relation(fields: [userId], references: [id])
  role           OrganizationRole @relation(fields: [roleId], references: [id])
}
```

## Frontend Implementation

### 1. Auth Store (Zustand)

The auth store now includes permission management:

```typescript
interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  permissions: string[];
  roles: string[];
  roleDetails: RoleDetails[];
  isAdmin: boolean;
  
  // Permission checkers
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
}
```

### 2. Hooks

#### usePermission Hook
```typescript
import { usePermission } from "@/hooks/usePermission";

function MyComponent() {
  const { 
    hasPermission, 
    hasAnyPermission, 
    hasAllPermissions,
    hasRole,
    hasAnyRole,
    permissions,
    roles,
    isAdmin,
    isLoading,
    refreshPermissions 
  } = usePermission();

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      {hasPermission("requirement:create") && <CreateButton />}
      {hasAnyPermission(["requirement:update", "requirement:delete"]) && <EditButton />}
      {hasAllPermissions(["requirement:view", "requirement:approve"]) && <ApproveButton />}
      {hasRole("NGO_ADMIN") && <AdminPanel />}
      {hasAnyRole(["NGO_ADMIN", "COMPANY_ADMIN"]) && <OrganizationPanel />}
    </div>
  );
}
```

#### useHasPermission Hook (for single permission)
```typescript
import { useHasPermission } from "@/hooks/usePermission";

function MyComponent() {
  const canCreate = useHasPermission("requirement:create");
  
  return (
    <button disabled={!canCreate}>
      Create Requirement
    </button>
  );
}
```

#### useHasRole Hook
```typescript
import { useHasRole } from "@/hooks/usePermission";

function MyComponent() {
  const isNgoAdmin = useHasRole("NGO_ADMIN");
  
  return isNgoAdmin ? <NgoAdminPanel /> : <RegularUserPanel />;
}
```

#### useModulePermissions Hook
```typescript
import { useModulePermissions } from "@/hooks/usePermission";

function RequirementsPage() {
  const { permissions, isLoading, hasPermission } = useModulePermissions("requirement");
  
  return (
    <div>
      {hasPermission("requirement:create") && <CreateForm />}
      <RequirementsList />
    </div>
  );
}
```

### 3. Protected Components

#### ProtectedComponent
```tsx
import { ProtectedComponent } from "@/components/auth/ProtectedComponent";

// Check single permission
<ProtectedComponent permission="requirement:create">
  <CreateButton />
</ProtectedComponent>

// Check all permissions (must have all)
<ProtectedComponent permissions={["requirement:view", "requirement:update"]}>
  <EditRequirementForm />
</ProtectedComponent>

// Check any permission (must have at least one)
<ProtectedComponent anyPermission={["requirement:approve", "requirement:submit"]}>
  <ActionButtons />
</ProtectedComponent>

// Check role
<ProtectedComponent role="NGO_ADMIN">
  <AdminPanel />
</ProtectedComponent>

// Check any role
<ProtectedComponent roles={["NGO_ADMIN", "COMPANY_ADMIN"]}>
  <OrganizationPanel />
</ProtectedComponent>

// With fallback
<ProtectedComponent 
  permission="organization:view"
  fallback={<div>You don't have access to view organizations</div>}
>
  <OrganizationList />
</ProtectedComponent>

// Show loading state
<ProtectedComponent 
  permission="requirement:create"
  showLoading={true}
  loadingComponent={<Spinner />}
>
  <CreateForm />
</ProtectedComponent>
```

#### ProtectedButton
```tsx
import { ProtectedButton } from "@/components/auth/ProtectedComponent";

// Hide button if no permission
<ProtectedButton permission="requirement:delete">
  <button onClick={handleDelete}>Delete</button>
</ProtectedButton>

// Disable instead of hide
<ProtectedButton 
  permission="requirement:delete"
  disableInsteadOfHide={true}
  disabledTooltip="You need delete permission"
>
  <button>Delete</button>
</ProtectedButton>
```

### 4. Permission Initializer

Add to your root layout to auto-load permissions:

```tsx
// app/layout.tsx
import { PermissionInitializer } from "@/components/auth/PermissionInitializer";

export default function RootLayout({ children }) {
  return (
    <PermissionInitializer>
      {children}
    </PermissionInitializer>
  );
}
```

Or use the hook in your app component:

```tsx
// app/dashboard/layout.tsx
import { useInitializePermissions } from "@/components/auth/PermissionInitializer";

export default function DashboardLayout({ children }) {
  useInitializePermissions(); // Auto-loads permissions on mount
  
  return <div>{children}</div>;
}
```

## Migration Guide

### From Hardcoded Role Lists

**OLD WAY:**
```typescript
import { GRIEVANCE_ACCESS_ROLES, hasRoleAccess } from "@/lib/roleAccess";

if (hasRoleAccess(GRIEVANCE_ACCESS_ROLES)) {
  return <GrievanceSection />;
}
```

**NEW WAY:**
```typescript
import { usePermission } from "@/hooks/usePermission";
import { ProtectedComponent } from "@/components/auth/ProtectedComponent";

// Option 1: Using the hook
function MyComponent() {
  const { hasPermission } = usePermission();
  
  if (hasPermission("grievance:view")) {
    return <GrievanceSection />;
  }
}

// Option 2: Using the ProtectedComponent
function MyComponent() {
  return (
    <ProtectedComponent permission="grievance:view">
      <GrievanceSection />
    </ProtectedComponent>
  );
}

// Option 3: Using permission constants
import { PERMISSIONS } from "@/lib/roleAccess";

<ProtectedComponent permission={PERMISSIONS.GRIEVANCE.VIEW}>
  <GrievanceSection />
</ProtectedComponent>
```

### Navigation Filtering

**OLD WAY:**
```typescript
const filteredNavGroups = navGroups.filter((group) => {
  if (!group.roles) return true;
  return group.roles.includes(role);
});
```

**NEW WAY:**
```typescript
import { usePermission } from "@/hooks/usePermission";

// Define nav items with permissions
const navItems = [
  { label: "Requirements", href: "/requirements", permission: "requirement:view" },
  { label: "Create", href: "/requirements/create", permission: "requirement:create" },
  { label: "Admin", href: "/admin", permissions: ["user:invite", "role:create"] },
];

const { hasPermission, hasAllPermissions } = usePermission();

const filteredNavItems = navItems.filter((item) => {
  if (item.permission) return hasPermission(item.permission);
  if (item.permissions) return hasAllPermissions(item.permissions);
  return true;
});
```

## Usage Examples

### Example 1: Conditional Rendering

```tsx
import { usePermission } from "@/hooks/usePermission";

export function ProjectCard({ project }) {
  const { hasPermission } = usePermission();
  
  return (
    <div className="card">
      <h3>{project.name}</h3>
      <p>{project.description}</p>
      
      {/* Only show edit button if user has update permission */}
      {hasPermission("project:update") && (
        <button onClick={() => editProject(project.id)}>
          Edit
        </button>
      )}
      
      {/* Only show delete button if user has delete permission */}
      {hasPermission("project:delete") && (
        <button onClick={() => deleteProject(project.id)} className="danger">
          Delete
        </button>
      )}
    </div>
  );
}
```

### Example 2: Form Fields Based on Permissions

```tsx
import { usePermission } from "@/hooks/usePermission";

export function UserForm({ user }) {
  const { hasPermission } = usePermission();
  
  return (
    <form>
      <input name="name" defaultValue={user.name} />
      <input name="email" defaultValue={user.email} />
      
      {/* Only show role selector if user can manage roles */}
      {hasPermission("role:update") && (
        <select name="role">
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
      )}
      
      {/* Only show status if user can update users */}
      {hasPermission("user:update") && (
        <select name="status">
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      )}
      
      <button type="submit">Save</button>
    </form>
  );
}
```

### Example 3: Table Actions

```tsx
import { ProtectedComponent } from "@/components/auth/ProtectedComponent";

export function UsersTable({ users }) {
  return (
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Email</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {users.map((user) => (
          <tr key={user.id}>
            <td>{user.name}</td>
            <td>{user.email}</td>
            <td>
              {/* View is always available */}
              <button>View</button>
              
              {/* Edit only with permission */}
              <ProtectedComponent permission="user:update">
                <button>Edit</button>
              </ProtectedComponent>
              
              {/* Delete only with permission */}
              <ProtectedComponent permission="user:delete">
                <button className="danger">Delete</button>
              </ProtectedComponent>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

### Example 4: Route Protection (Middleware)

```typescript
// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("accessToken")?.value;
  
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  
  // Note: For route-level protection, use the ProtectedRoute component
  // or check permissions on the server side
  
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};
```

### Example 5: ProtectedRoute Component

```tsx
// components/auth/ProtectedRoute.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePermission } from "@/hooks/usePermission";

interface ProtectedRouteProps {
  children: React.ReactNode;
  permission?: string;
  permissions?: string[];
  fallback?: React.ReactNode;
}

export function ProtectedRoute({
  children,
  permission,
  permissions,
  fallback,
}: ProtectedRouteProps) {
  const router = useRouter();
  const { hasPermission, hasAllPermissions, isLoading, isAuthenticated } = usePermission();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  const hasAccess = permission
    ? hasPermission(permission)
    : permissions
    ? hasAllPermissions(permissions)
    : true;

  if (!hasAccess) {
    return fallback || (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold text-red-600">Access Denied</h2>
        <p>You don't have permission to access this page.</p>
      </div>
    );
  }

  return <>{children}</>;
}
```

## Permission Constants

All available permissions are defined in `@/lib/roleAccess`:

```typescript
export const PERMISSIONS = {
  // Requirement permissions
  REQUIREMENT: {
    CREATE: "requirement:create",
    VIEW: "requirement:view",
    UPDATE: "requirement:update",
    DELETE: "requirement:delete",
    SUBMIT: "requirement:submit",
    APPROVE: "requirement:approve",
    PUBLISH: "requirement:publish",
  },
  
  // Interest permissions
  INTEREST: {
    CREATE: "interest:create",
    VIEW: "interest:view",
    APPROVE: "interest:approve",
  },
  
  // Project permissions
  PROJECT: {
    VIEW: "project:view",
    CREATE: "project:create",
    UPDATE: "project:update",
    APPROVE: "project:approve",
  },
  
  // Milestone permissions
  MILESTONE: {
    CREATE: "milestone:create",
    UPDATE: "milestone:update",
    VERIFY: "milestone:verify",
  },
  
  // Fund permissions
  FUND: {
    VIEW: "fund:view",
    COMMIT: "fund:commit",
    RELEASE: "fund:release",
    VERIFY_UTILIZATION: "fund:verify-utilization",
  },
  
  // Report permissions
  REPORT: {
    VIEW: "report:view",
    EXPORT: "report:export",
  },
  
  // Organization permissions
  ORGANIZATION: {
    VIEW: "organization:view",
    UPDATE: "organization:update",
    APPROVE: "organization:approve",
    SUSPEND: "organization:suspend",
  },
  
  // User permissions
  USER: {
    INVITE: "user:invite",
    UPDATE: "user:update",
  },
  
  // Role permissions
  ROLE: {
    CREATE: "role:create",
    UPDATE: "role:update",
    DELETE: "role:delete",
  },
  
  // Grievance permissions (custom - add to backend)
  GRIEVANCE: {
    VIEW: "grievance:view",
    CREATE: "grievance:create",
    RESPOND: "grievance:respond",
    ESCALATE: "grievance:escalate",
    CLOSE: "grievance:close",
    NODAL_QUEUE: "grievance:nodal-queue",
    STATE_QUEUE: "grievance:state-queue",
  },
  
  // Convergence permissions (custom - add to backend)
  CONVERGENCE: {
    VIEW: "convergence:view",
    CREATE: "convergence:create",
    MANAGE: "convergence:manage",
  },
} as const;
```

## Best Practices

### 1. Always Check Permissions on Server Side
The frontend checks are for UI convenience only. Always validate permissions on the backend:

```typescript
// Backend route
router.post("/requirements", 
  authenticateToken, 
  checkPermission("requirement:create"), // Server-side check
  createRequirement
);
```

### 2. Use Permission Groups for Complex Logic
Instead of checking multiple permissions individually:

```typescript
// Good: Group related permissions
const canManageRequirements = hasAnyPermission([
  "requirement:create",
  "requirement:update", 
  "requirement:delete"
]);

// Better: Use a permission group check
const canManageRequirements = hasPermission("requirement:manage");
```

### 3. Cache Permissions Efficiently
Permissions are cached in the auth store and localStorage. Refresh only when:
- User logs in
- User's roles/permissions change
- Explicit permission refresh is needed

```typescript
const { refreshPermissions } = usePermission();

// After role change
await updateUserRole(userId, newRole);
await refreshPermissions(); // Refresh to get new permissions
```

### 4. Use Constants Instead of Magic Strings
```typescript
// Bad
if (hasPermission("requirement:create")) { }

// Good
import { PERMISSIONS } from "@/lib/roleAccess";
if (hasPermission(PERMISSIONS.REQUIREMENT.CREATE)) { }
```

### 5. Handle Loading States
Always handle the loading state to prevent UI flicker:

```typescript
const { hasPermission, isLoading } = usePermission();

if (isLoading) {
  return <Skeleton />;
}

return hasPermission("requirement:view") ? <Requirements /> : <AccessDenied />;
```

### 6. Provide Meaningful Fallbacks
```typescript
<ProtectedComponent 
  permission="requirement:delete"
  fallback={
    <Tooltip content="Contact your admin to get delete permissions">
      <button disabled>Delete</button>
    </Tooltip>
  }
>
  <button onClick={handleDelete}>Delete</button>
</ProtectedComponent>
```

### 7. Audit Sensitive Actions
```typescript
// In your action handler
const handleDelete = async () => {
  // Log the action for audit
  await apiFetch("/audit/log", {
    method: "POST",
    body: JSON.stringify({
      action: "REQUIREMENT_DELETE",
      entityId: requirementId,
      permissionChecked: "requirement:delete"
    })
  });
  
  await deleteRequirement(requirementId);
};
```

### 8. Test Permission Scenarios
```typescript
// Test different permission scenarios
describe("ProtectedComponent", () => {
  it("renders children when user has permission", () => {
    // Mock auth store with permissions
    // Test component rendering
  });
  
  it("renders fallback when user lacks permission", () => {
    // Mock auth store without permissions
    // Test fallback rendering
  });
});
```

## Troubleshooting

### Issue: Permissions not loading
**Solution:**
- Check if user is authenticated (`useAuthStore.getState().isAuthenticated`)
- Verify API endpoint is accessible (`/api/auth/permissions`)
- Check browser console for errors
- Ensure `PermissionInitializer` is in the component tree

### Issue: Permissions not updating after role change
**Solution:**
Call `refreshPermissions()` after role change:
```typescript
const { refreshPermissions } = usePermission();

await updateRole();
await refreshPermissions();
```

### Issue: Permission check returns wrong result
**Solution:**
- Check if using `hasPermission` vs `hasAnyPermission` vs `hasAllPermissions` correctly
- Verify permission key matches exactly (case-sensitive)
- Check if user has admin bypass (`isAdmin` flag)

### Issue: ProtectedComponent not working
**Solution:**
- Ensure component is wrapped in a Client Component ("use client")
- Check if permissions are loaded (`isLoading` state)
- Verify the permission key exists in backend

## API Reference

### Backend
- `GET /api/auth/permissions` - Get all user permissions
- `GET /api/auth/permissions/:module` - Get module-specific permissions
- `POST /api/auth/check-permission` - Check specific permission

### Frontend Hooks
- `usePermission()` - Main permission hook
- `useHasPermission(permission)` - Single permission check
- `useHasAnyPermission(permissions)` - Any permission check
- `useHasAllPermissions(permissions)` - All permissions check
- `useHasRole(role)` - Single role check
- `useHasAnyRole(roles)` - Any role check
- `useModulePermissions(module)` - Module-specific permissions

### Frontend Components
- `<ProtectedComponent>` - Conditional rendering based on permissions
- `<ProtectedButton>` - Button with permission check
- `<ProtectedMenuItem>` - Menu item with permission check
- `<PermissionInitializer>` - Auto-loads permissions on app start

### Store Methods
- `hasPermission(permission)` - Check single permission
- `hasAnyPermission(permissions)` - Check any permission
- `hasAllPermissions(permissions)` - Check all permissions
- `hasRole(role)` - Check single role
- `hasAnyRole(roles)` - Check any role
- `setPermissions(data)` - Set permissions from API
- `refreshPermissions()` - Refresh permissions from server
