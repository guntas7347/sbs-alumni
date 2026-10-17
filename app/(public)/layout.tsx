import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Suspense } from "react";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Suspense fallback={<div className="h-18 bg-white border-b border-orange-100" />}>
        <Navbar />
      </Suspense>
      <main className="flex-1 flex flex-col">{children}</main>
      <Footer />
    </>
  );
}
