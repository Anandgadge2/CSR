"use client";

// This combined page was split into two dedicated pages:
//   /admin/user-management   — user directory, create/edit/toggle/delete users
//   /admin/roles-permissions — dynamic roles & permission matrix
// Kept as a redirect so old links/bookmarks keep working.

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function RedirectContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const tab = searchParams.get("tab");
    router.replace(tab === "roles" ? "/admin/roles-permissions" : "/admin/user-management");
  }, [router, searchParams]);

  return null;
}

export default function AdminUsersRolesPage() {
  return (
    <Suspense fallback={null}>
      <RedirectContent />
    </Suspense>
  );
}
