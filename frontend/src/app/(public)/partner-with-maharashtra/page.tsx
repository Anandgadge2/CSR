"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

/**
 * Public anonymous corporate-enquiry creation has been REMOVED.
 * Enquiries are now filed from the authenticated corporate dashboard only,
 * and only after the organization's onboarding is verified (backend enforces
 * this via requireApprovedOrganization on POST /corporate-enquiries).
 *
 * This route is kept as a redirect shim so existing links/bookmarks still work:
 *  - logged-in corporate user  → dashboard enquiry form
 *  - anyone else               → login, then bounced back here
 */
export default function PartnerWithMaharashtraPage() {
  const router = useRouter();

  useEffect(() => {
    let isLoggedIn = false;
    try {
      isLoggedIn = Boolean(localStorage.getItem("accessToken"));
    } catch {
      isLoggedIn = false;
    }

    if (isLoggedIn) {
      router.replace("/partner/enquiries/new");
    } else {
      router.replace("/login?next=/partner-with-maharashtra");
    }
  }, [router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-[#f6f8fb] text-slate-600">
      <Loader2 size={28} className="animate-spin text-blue-900" />
      <p className="text-sm">Redirecting you to sign in…</p>
    </div>
  );
}
