import { Suspense } from "react";
import VerifyClient from "./VerifyClient";
import { Loader2 } from "lucide-react";

export const metadata = {
  title: "Verify Pass & Barcode | Sanjh 2026 • SBSSU",
  description:
    "Public gate pass and barcode verification desk for Sanjh 2026 – SECA Cultural Function & SBSSU Alumni Meet.",
};

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
          <Loader2 className="w-8 h-8 text-orange-600 animate-spin" />
          <p className="text-sm text-zinc-500">Loading barcode verification scanner...</p>
        </div>
      }
    >
      <VerifyClient />
    </Suspense>
  );
}
