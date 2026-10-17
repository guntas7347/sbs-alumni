import type { Metadata } from "next";
import AdminGuard from "@/components/AdminGuard";

export const metadata: Metadata = {
  title: "Admin Portal | Shaheed Bhagat Singh State University",
  description:
    "Official administrative management console for Shaheed Bhagat Singh State University alumni directory and Sanjh 2026 event registrations.",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminGuard>{children}</AdminGuard>;
}
