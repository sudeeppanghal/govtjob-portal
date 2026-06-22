"use client";

import Link from "next/link";
import { Train, Send, ArrowUp } from "lucide-react";

const FacebookIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const TwitterIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);

const InstagramIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const YoutubeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
  </svg>
);

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-white border-t border-slate-200/80 text-slate-500 py-16 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          
          {/* Brand Column */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                <Train className="h-5 w-5" />
              </div>
              <span className="text-lg font-black tracking-tight text-slate-900">
                Railway Admit Card
              </span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed">
              Your trusted source for Railway Admit Cards, Results, Answer Keys, Syllabus, and Latest Job Updates. Fast, verified information directly from official bulletin boards.
            </p>
            
            {/* Social Media Icons */}
            <div className="flex items-center gap-2 pt-2">
              {[
                { icon: FacebookIcon, href: "#", label: "Facebook" },
                { icon: TwitterIcon, href: "#", label: "Twitter" },
                { icon: Send, href: "#", label: "Telegram" },
                { icon: InstagramIcon, href: "#", label: "Instagram" },
                { icon: YoutubeIcon, href: "#", label: "YouTube" }
              ].map((social, i) => {
                const Icon = social.icon;
                return (
                  <a
                    key={i}
                    href={social.href}
                    aria-label={social.label}
                    className="h-8.5 w-8.5 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-blue-650 hover:border-blue-200 hover:bg-blue-50/50 transition duration-200 cursor-pointer"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Quick Links Column */}
          <div>
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest mb-4">Quick Links</h3>
            <ul className="space-y-2.5 text-[13.5px]">
              <li>
                <Link href="/" className="text-slate-500 hover:text-blue-600 transition">Home</Link>
              </li>
              <li>
                <Link href="/admit-cards" className="text-slate-500 hover:text-blue-600 transition">Admit Card</Link>
              </li>
              <li>
                <Link href="/results" className="text-slate-500 hover:text-blue-600 transition">Result</Link>
              </li>
              <li>
                <Link href="/answer-keys" className="text-slate-500 hover:text-blue-600 transition">Answer Key</Link>
              </li>
              <li>
                <Link href="/yojana" className="text-slate-500 hover:text-blue-600 transition">Sarkari Yojana</Link>
              </li>
              <li>
                <Link href="/jobs" className="text-slate-500 hover:text-blue-600 transition">Jobs</Link>
              </li>
            </ul>
          </div>

          {/* Important Links Column */}
          <div>
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest mb-4">Important Links</h3>
            <ul className="space-y-2.5 text-[13.5px]">
              <li>
                <Link href="/about" className="text-slate-500 hover:text-blue-600 transition">About Us</Link>
              </li>
              <li>
                <Link href="/contact" className="text-slate-500 hover:text-blue-600 transition">Contact Us</Link>
              </li>
              <li>
                <Link href="/privacy" className="text-slate-500 hover:text-blue-600 transition">Privacy Policy</Link>
              </li>
              <li>
                <Link href="/terms" className="text-slate-500 hover:text-blue-600 transition">Terms & Conditions</Link>
              </li>
              <li>
                <Link href="/disclaimer" className="text-slate-500 hover:text-blue-600 transition">Disclaimer</Link>
              </li>
            </ul>
          </div>

          {/* Newsletter Column */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Newsletter</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Subscribe to get the latest exam dates, admit card links, and job notifications straight to your inbox.
            </p>
            <form onSubmit={(e) => e.preventDefault()} className="flex gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/25 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none transition"
                required
              />
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-4 rounded-xl transition shadow-sm cursor-pointer"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="mt-16 pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} RailwayAdmitCard.online. All Rights Reserved.</p>
          <div className="flex items-center gap-6">
            <span className="text-slate-400 font-medium">Not affiliated with any Govt. organization.</span>
          </div>
        </div>
      </div>

      {/* Floating Back to Top Button */}
      <button
        onClick={scrollToTop}
        className="absolute right-6 bottom-6 h-10 w-10 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-blue-500/20 hover:scale-105 transition duration-200 cursor-pointer"
        aria-label="Back to Top"
      >
        <ArrowUp className="h-5 w-5" />
      </button>
    </footer>
  );
}
