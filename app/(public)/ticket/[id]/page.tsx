import { Suspense } from "react";
import TicketRedirectClient from "./TicketRedirectClient";
import { Loader2 } from "lucide-react";

export default function TicketPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
          <Loader2 className="w-8 h-8 text-orange-600 animate-spin" />
          <p className="text-sm text-zinc-500 font-medium">Loading pass...</p>
        </div>
      }
    >
      <TicketRedirectClient params={params} />
    </Suspense>
  );
}
