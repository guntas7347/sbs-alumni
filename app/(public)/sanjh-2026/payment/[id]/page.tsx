import { Suspense } from "react";
import PaymentClient from "./PaymentClient";
import { Loader2 } from "lucide-react";

export default function PaymentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
          <Loader2 className="w-8 h-8 text-orange-600 animate-spin" />
          <p className="text-sm text-zinc-500">Loading checkout session...</p>
        </div>
      }
    >
      <PaymentClient params={params} />
    </Suspense>
  );
}
