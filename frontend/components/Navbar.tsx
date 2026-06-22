"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Train, Search, Moon, User } from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const isLinkActive = (path: string) => {
    if (path === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(path);
  };

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Admit Card", href: "/admit-cards" },
    { label: "Result", href: "/results" },
    { label: "Answer Key", href: "/answer-keys" },
    { label: "Yojana", href: "/yojana" },
    { label: "Jobs", href: "/jobs" },
    { label: "Contact Us", href: "/contact" }
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-xl group-hover:scale-105 group-hover:bg-blue-100 transition-all duration-300">
                <Train className="h-6 w-6" />
              </div>
              <div className="flex flex-col">
                <span className="text-base sm:text-lg font-black tracking-tight text-slate-900 leading-none">
                  Railway Admit Card
                </span>
                <span className="text-[10px] text-slate-400 font-medium tracking-wide mt-0.5">
                  Latest Updates & Notifications
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => {
              const active = isLinkActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-[13px] font-semibold tracking-wide transition-all duration-200 ${
                    active
                      ? "text-blue-600 font-bold border-b-2 border-blue-600 pb-1.5 pt-1"
                      : "text-slate-600 hover:text-blue-600 pb-1.5 pt-1"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Right side controls (Search, Theme, Admin) */}
          <div className="hidden md:flex items-center gap-3">
            <button className="p-2 text-slate-500 hover:text-blue-600 transition rounded-lg hover:bg-slate-50 cursor-pointer">
              <Search className="h-4.5 w-4.5" />
            </button>
            
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 text-slate-600 border border-slate-200/80 rounded-xl text-xs font-semibold hover:bg-slate-100 hover:text-slate-800 transition cursor-pointer">
              <Moon className="h-3.5 w-3.5" />
              <span>Dark Mode</span>
            </button>

            <div className="h-4 w-px bg-slate-200 mx-1" />

            <Link
              href="/admin"
              className={`px-3 py-1.5 border rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 flex items-center gap-1.5 ${
                isLinkActive("/admin")
                  ? "bg-blue-50 border-blue-200 text-blue-600 shadow-sm"
                  : "border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-900"
              }`}
            >
              <User className="h-3.5 w-3.5" /> Admin
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden flex items-center gap-2">
            <Link
              href="/admin"
              className="p-2 text-slate-500 hover:text-blue-600 transition rounded-lg hover:bg-slate-50"
            >
              <User className="h-5 w-5" />
            </Link>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-50 border border-slate-200 transition focus:outline-none cursor-pointer"
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 animate-in fade-in slide-in-from-top-4 duration-200 p-3 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className={`block px-4 py-2.5 rounded-xl text-sm font-semibold tracking-wide ${
                isLinkActive(link.href)
                  ? "bg-blue-50 text-blue-600 font-bold"
                  : "text-slate-600 hover:text-blue-650 hover:bg-slate-50"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-2 border-t border-slate-100 mt-2 flex items-center justify-between">
            <button className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-50 text-slate-600 border border-slate-200 rounded-xl text-xs font-semibold hover:bg-slate-100 hover:text-slate-800 transition">
              <Moon className="h-3.5 w-3.5" />
              <span>Dark Mode</span>
            </button>
            <Link
              href="/admin"
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-sm transition"
            >
              Admin Panel
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
