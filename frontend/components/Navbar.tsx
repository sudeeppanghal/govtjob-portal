"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Landmark, FileText } from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const isLinkActive = (path: string) => pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-900/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="p-2 bg-gradient-to-tr from-emerald-500 via-teal-600 to-indigo-600 rounded-lg text-white shadow-md shadow-emerald-500/10 group-hover:scale-105 group-hover:shadow-emerald-500/20 transition-all duration-300">
                <Landmark className="h-5 w-5" />
              </div>
              <span className="text-lg font-black tracking-tight text-white">
                Sarkari<span className="text-emerald-400 bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">GovtJob</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-2">
            {[
              { label: "Latest Jobs", href: "/jobs" },
              { label: "Sarkari Yojana", href: "/yojana" },
              { label: "Results", href: "/results" },
              { label: "Admit Cards", href: "/admit-cards" },
              { label: "Answer Keys", href: "/answer-keys" }
            ].map((link) => {
              const active = isLinkActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-200 border ${
                    active
                      ? "bg-slate-900 border-slate-800 text-emerald-400 font-bold"
                      : "border-transparent text-slate-400 hover:text-white hover:bg-slate-900/40 hover:border-slate-800/40"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}

            <div className="h-4 w-px bg-slate-800/80 mx-2" />

            <Link
              href="/admin"
              className={`px-4 py-1.5 border rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200 flex items-center gap-1.5 ${
                isLinkActive("/admin")
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                  : "border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white hover:bg-slate-900/60"
              }`}
            >
              <FileText className="h-3.5 w-3.5" /> Admin
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent hover:border-slate-800 transition focus:outline-none cursor-pointer"
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-slate-950 border-b border-slate-900/90 animate-in fade-in slide-in-from-top-4 duration-200 p-2 space-y-1">
          {[
            { label: "Latest Jobs", href: "/jobs" },
            { label: "Sarkari Yojana", href: "/yojana" },
            { label: "Results", href: "/results" },
            { label: "Admit Cards", href: "/admit-cards" },
            { label: "Answer Keys", href: "/answer-keys" }
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className={`block px-4 py-2.5 rounded-lg text-sm font-semibold uppercase tracking-wider ${
                isLinkActive(link.href)
                  ? "bg-slate-900 text-emerald-400"
                  : "text-slate-400 hover:text-white hover:bg-slate-900/60"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/admin"
            onClick={() => setIsOpen(false)}
            className={`block px-4 py-2.5 rounded-lg text-sm font-bold uppercase tracking-wider ${
              isLinkActive("/admin")
                ? "bg-emerald-500/10 text-emerald-400"
                : "text-slate-300 hover:text-white hover:bg-slate-900/60"
            }`}
          >
            Admin Panel
          </Link>
        </div>
      )}
    </nav>
  );
}
