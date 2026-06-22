import Link from "next/link";
import { Landmark, ArrowUpRight } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#0b0f19] border-t border-slate-900 text-slate-400 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-tr from-emerald-500 to-indigo-600 rounded-lg text-white">
                <Landmark className="h-5 w-5" />
              </div>
              <span className="text-lg font-bold text-white">
                Sarkari<span className="text-emerald-400">GovtJob</span>
              </span>
            </Link>
            <p className="text-sm text-slate-500">
              India's premier automated platform for government job notifications, yojanas, admit cards, answer keys, and exam results. Direct links, no clickbait.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider mb-4">Categories</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/jobs" className="hover:text-white transition-colors duration-150">Latest Govt Jobs</Link>
              </li>
              <li>
                <Link href="/yojana" className="hover:text-white transition-colors duration-150">Sarkari Yojanas</Link>
              </li>
              <li>
                <Link href="/results" className="hover:text-white transition-colors duration-150">Exam Results</Link>
              </li>
              <li>
                <Link href="/admit-cards" className="hover:text-white transition-colors duration-150">Admit Cards</Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider mb-4">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/sitemap.xml" className="hover:text-white transition-colors duration-150 flex items-center gap-1">
                  Sitemap <ArrowUpRight className="h-3 w-3" />
                </Link>
              </li>
              <li>
                <Link href="/feed.xml" className="hover:text-white transition-colors duration-150 flex items-center gap-1">
                  RSS Feed <ArrowUpRight className="h-3 w-3" />
                </Link>
              </li>
              <li>
                <span className="text-slate-500">Disclaimer: We are not affiliated with any government organization. All information is collected from official sources.</span>
              </li>
            </ul>
          </div>

          {/* Official Portals */}
          <div>
            <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider mb-4">Official Portals</h3>
            <ul className="space-y-2 text-sm text-slate-500">
              <li>UPSC: upsc.gov.in</li>
              <li>SSC: ssc.gov.in</li>
              <li>IBPS: ibps.in</li>
              <li>RRB: rrbcdg.gov.in</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-900 text-center text-xs text-slate-650 flex flex-col md:flex-row justify-between gap-4">
          <p>© {new Date().getFullYear()} railwayadmitcard.online. All rights reserved.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/about" className="hover:text-slate-400">About Us</Link>
            <Link href="/contact" className="hover:text-slate-400">Contact Us</Link>
            <Link href="/privacy" className="hover:text-slate-400">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-slate-400">Terms of Service</Link>
            <Link href="/disclaimer" className="hover:text-slate-400">Disclaimer</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
