"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RazorpayRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/transactions");
  }, [router]);

  return null;
}
