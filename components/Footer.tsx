import Link from "next/link";
import Image from "next/image";
import { Mail, Phone, MapPin, Globe, ExternalLink, Heart, Sparkles } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-orange-100 text-zinc-600 text-sm">
      {/* Top accent bar with Punjab / University tricolor nuance */}
      <div className="h-1.5 w-full bg-gradient-to-r from-orange-400 via-amber-200 to-emerald-500" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Col 1: University Identity */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12 bg-white rounded-full p-1 border border-orange-200">
                <Image
                  src="/sbssu-logo.png"
                  alt="SBSSU Logo"
                  width={48}
                  height={48}
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h3 className="font-bold text-zinc-900 text-base leading-tight">
                  Shaheed Bhagat Singh State University
                </h3>
                <p className="text-xs text-orange-700 font-medium">
                  Alumni Association (alumni.sbssu.ac.in)
                </p>
              </div>
            </div>

            <p className="text-xs text-zinc-500 leading-relaxed">
              Established by the Govt. of Punjab in 1995 as SBSCET, upgraded to state technical campus in 2011 (SBSSTC), and elevated to full State University status (SBSSU) in 2021-22.
            </p>

            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="text-[10px] font-semibold bg-orange-50 text-orange-800 border border-orange-200 px-2 py-0.5 rounded-full">
                SBSCET 1995
              </span>
              <span className="text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full">
                SBSSTC 2011
              </span>
              <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full">
                SBSSU 2021-Present
              </span>
            </div>
          </div>

          {/* Col 2: Sanjh 2026 Spotlight */}
          <div className="space-y-3">
            <h4 className="font-semibold text-zinc-900 text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-orange-600" />
              Sanjh 2026 – SECA
            </h4>
            <p className="text-xs text-zinc-500 leading-relaxed">
              SECA Annual Cultural Function & Grand Alumni Meet 2026. A celebration of togetherness, memories, and bonding.
            </p>
            <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-1.5 text-xs">
              <div className="font-medium text-emerald-950">
                🗓️ November 14, 2026 at 5:00 PM
              </div>
              <div className="text-emerald-800 text-[11px]">
                Main University Auditorium & Lawns, SBSSU Campus
              </div>
              <div className="text-[11px] font-semibold text-emerald-700 pt-1">
                📜 Participation Certificates for all registered performers!
              </div>
            </div>
          </div>

          {/* Col 3: Quick Navigation */}
          <div className="space-y-3">
            <h4 className="font-semibold text-zinc-900 text-sm">Quick Links</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/" className="hover:text-orange-600 transition-colors">
                  Home & VC Message
                </Link>
              </li>
              <li>
                <Link href="/sanjh-2026" className="hover:text-orange-600 transition-colors">
                  Sanjh 2026 Cultural Schedule
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-orange-600 transition-colors">
                  University History & Evolution
                </Link>
              </li>
              <li>
                <Link href="/sanjh-2026/register" className="hover:text-orange-600 transition-colors">
                  Alumni & Student Registration
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-orange-600 transition-colors">
                  Admin Management Portal
                </Link>
              </li>
              <li>
                <a
                  href="https://sbssu.ac.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-orange-700 hover:text-orange-800 font-medium"
                >
                  Official University Site (sbssu.ac.in) <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Campus Contact */}
          <div className="space-y-3">
            <h4 className="font-semibold text-zinc-900 text-sm">Campus Contact</h4>
            <ul className="space-y-2.5 text-xs text-zinc-600">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
                <span>
                  Shaheed Bhagat Singh State University, Moga Road, Ferozepur - 152004, Punjab, India.
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-600 shrink-0" />
                <a href="mailto:alumni@sbssu.ac.in" className="hover:underline">
                  alumni@sbssu.ac.in
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-orange-600 shrink-0" />
                <span>+91 1632 242138 / 244012</span>
              </li>
              <li className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-emerald-600 shrink-0" />
                <a href="https://sbssu.ac.in" target="_blank" rel="noopener noreferrer" className="hover:underline">
                  https://sbssu.ac.in
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="mt-12 pt-6 border-t border-zinc-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <p>
            © 2026 Shaheed Bhagat Singh State University (SBSSU), Ferozepur. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <span className="text-zinc-400">alumni.sbssu.ac.in</span>
            <span>•</span>
            <span className="inline-flex items-center gap-1 text-zinc-600">
              Crafted for our Alumni & Students <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
