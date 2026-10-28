import type { Metadata } from "next";
import ScheduleClient from "./ScheduleClient";

export const metadata: Metadata = {
  title: "Event Schedule | 1st Alumni Meet 2026 – SBSSU Ferozepur",
  description:
    "Official minute-to-minute programme for the 1st Alumni Meet 2026 & Sanjh 2026 Cultural Function at Shaheed Bhagat Singh State University (SBSSU), Ferozepur.",
  openGraph: {
    title: "1st Alumni Meet 2026 Programme Schedule | SBSSU",
    description:
      "Tentative Minute-to-Minute Programme for the 1st Alumni Meet & Sanjh 2026 at Shaheed Bhagat Singh State University, Ferozepur on November 14, 2026.",
  },
};

export default function SchedulePage() {
  return <ScheduleClient />;
}
