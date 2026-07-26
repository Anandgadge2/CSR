"use client";

import { GstVerifiedData } from "@/lib/verificationApi";

/**
 * Read-only grid of government-verified organization details,
 * shown after a successful GSTIN verification.
 */
export default function VerifiedDetailsCard({ data }: { data: GstVerifiedData }) {
  const rows: Array<[string, string | null | undefined]> = [
    ["GSTIN", data.gstin],
    ["PAN", data.pan || (data.gstin && data.gstin.length >= 12 ? data.gstin.substring(2, 12).toUpperCase() : null)],
    ["Legal Business Name", data.legalName],
    ["Trade Name", data.tradeName],
    ["Registration Status", data.gstinStatus],
    ["Registration Date", data.registrationDate],
    ["Constitution of Business", data.constitutionOfBusiness],
    ["Taxpayer Type", data.taxpayerType],
    ["State", data.state],
    ["District", data.district],
    ["Address", data.address],
    ["Pincode", data.pincode]
  ];

  return (
    <div className="mt-3 rounded-md border border-green-200 bg-green-50 p-4">
      <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-green-800">
        Verified with GSTN (Government of India)
      </div>
      <dl className="grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
        {rows
          .filter(([, value]) => value)
          .map(([label, value]) => (
            <div key={label}>
              <dt className="text-xs text-gray-500">{label}</dt>
              <dd className="text-sm font-medium text-gray-900">{value}</dd>
            </div>
          ))}
      </dl>
    </div>
  );
}
