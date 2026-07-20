"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

/**
 * Public anonymous government-pitch creation has been REMOVED.
 * Pitches are now filed from the authenticated department dashboard only,
 * and only after the organization's onboarding is verified (backend enforces
 * this via requireApprovedOrganization on POST /government-pitches).
 *
 * This route is kept as a redirect shim so existing links/bookmarks still work:
 *  - logged-in government user → dashboard pitch form
 *  - anyone else               → login, then bounced back here
 */
export default function PitchDevelopmentNeedPage() {
  const router = useRouter();

  useEffect(() => {
    let isLoggedIn = false;
    try {
      isLoggedIn = Boolean(localStorage.getItem("accessToken"));
    } catch {
      isLoggedIn = false;
    }

    if (isLoggedIn) {
      router.replace("/department/pitches/create");
    } else {
      router.replace("/login?next=/pitch-development-need");
    }
  }, [router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-[#f6f8fb] text-slate-600">
      <Loader2 size={28} className="animate-spin text-blue-900" />
      <p className="text-sm">Redirecting you to sign in…</p>
    </div>
  );
}
