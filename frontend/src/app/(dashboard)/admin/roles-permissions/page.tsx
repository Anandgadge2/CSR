"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LegacyRolesPermissionsRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/access-control/roles");
  }, [router]);

  return (
    <div className="p-8 text-center text-slate-500 text-sm">
      Redirecting to Access Control Management...
    </div>
  );
}
