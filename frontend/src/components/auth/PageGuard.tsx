"use client";

import { useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldAlert } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { pageSlugForPath, pageViewKey, findPageByPath } from "@/lib/pageRegistry";

/**
 * Blocks rendering of a page when the current user lacks the PAGE-visibility
 * permission that governs it (`page:<slug>:view`).
 *
 * Visibility rule (per product spec): checkbox lit = page visible, unlit =
 * hidden. Hiding a page removes its nav entry (handled in the layout) AND
 * blocks the route here with a 403-style screen — the two must agree so a
 * hidden page can never be reached by typing the URL.
 *
 * SUPER_ADMIN / isAdmin bypasses all checks. Pages not present in the registry
 * are treated as ungoverned (always allowed) so unrelated routes are unaffected.
 * While permissions are still loading we render nothing to avoid a flash of the
 * blocked screen before the store hydrates.
 */
export default function PageGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = useAuthStore((s) => s.isAdmin);
  const permissions = useAuthStore((s) => s.permissions);
  const isLoadingPermissions = useAuthStore((s) => s.isLoadingPermissions);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const decision = useMemo(() => {
    const slug = pageSlugForPath(pathname || "");
    // Route not governed by the registry → always allow.
    if (!slug) return { allowed: true as const, slug: null };
    if (isAdmin) return { allowed: true as const, slug };
    const allowed = permissions.includes(pageViewKey(slug));
    return { allowed, slug };
  }, [pathname, isAdmin, permissions]);

  // Not a governed page — pass through untouched.
  if (!decision.slug) return <>{children}</>;

  // Wait for permissions to hydrate before deciding, but only when we actually
  // expect them (authenticated). Prevents a blocked-screen flash on first paint.
  if (isAuthenticated && !isAdmin && permissions.length === 0 && isLoadingPermissions) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-t-2 border-blue-900" />
      </div>
    );
  }

  if (decision.allowed) return <>{children}</>;

  const page = findPageByPath(pathname || "");

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-600">
        <ShieldAlert size={32} />
      </div>
      <h1 className="mt-6 text-2xl font-bold text-gray-900">Access restricted</h1>
      <p className="mt-2 text-sm leading-6 text-gray-600">
        You don&apos;t have permission to view
        {page ? ` the ${page.label} page` : " this page"}. If you believe this
        is a mistake, ask your administrator to enable it for your role.
      </p>
      <Link
        href="/dashboard"
        className="mt-6 rounded-lg bg-blue-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-800"
      >
        Back to dashboard
      </Link>
    </div>
  );
}
