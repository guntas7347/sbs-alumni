import { Suspense } from "react";
import PassClient from "./PassClient";
import { Loader2 } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Official Sanjh 2026 Event Pass | SBSSU Alumni Meet",
  description:
    "Official Gate Entry Pass and Identity Badge for Sanjh 2026 – 1st Alumni Meet at Shaheed Bhagat Singh State University, Ferozepur.",
};

export default function SanjhPassPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
          <Loader2 className="w-8 h-8 text-orange-600 animate-spin" />
          <p className="text-sm text-zinc-500 font-medium">Loading official event pass...</p>
        </div>
      }
    >
      <PassClient params={params} />
    </Suspense>
  );
}
