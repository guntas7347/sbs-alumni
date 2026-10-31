"use client";

import { use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function TicketRedirectClient({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  useEffect(() => {
    if (id) {
      router.replace(`/sanjh-2026/pass/${id}`);
    }
  }, [id, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
      <Loader2 className="w-8 h-8 text-orange-600 animate-spin" />
      <p className="text-sm text-zinc-500 font-medium">
        Redirecting to your official Sanjh 2026 Pass...
      </p>
    </div>
  );
}
