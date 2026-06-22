"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, Landmark, Search, FileText } from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-[#0f172a]/80 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="p-2 bg-gradient-to-tr from-emerald-500 to-indigo-600 rounded-lg text-white shadow-md shadow-emerald-500/10 group-hover:scale-105 transition-transform duration-200">
                <Landmark className="h-6 w-6" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                Sarkari<span className="text-emerald-400">GovtJob</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/jobs"
              className="text-slate-300 hover:text-white transition-colors duration-200 text-sm font-medium hover:underline decoration-emerald-400 decoration-2 underline-offset-4"
            >
              Latest Jobs
            </Link>
            <Link
              href="/yojana"
              className="text-slate-300 hover:text-white transition-colors duration-200 text-sm font-medium hover:underline decoration-emerald-400 decoration-2 underline-offset-4"
            >
              Sarkari Yojana
            </Link>
            <Link
              href="/results"
              className="text-slate-300 hover:text-white transition-colors duration-200 text-sm font-medium hover:underline decoration-emerald-400 decoration-2 underline-offset-4"
            >
              Results
            </Link>
            <Link
              href="/admit-cards"
              className="text-slate-300 hover:text-white transition-colors duration-200 text-sm font-medium hover:underline decoration-emerald-400 decoration-2 underline-offset-4"
            >
              Admit Cards
            </Link>
            <Link
              href="/answer-keys"
              className="text-slate-300 hover:text-white transition-colors duration-200 text-sm font-medium hover:underline decoration-emerald-400 decoration-2 underline-offset-4"
            >
              Answer Keys
            </Link>
            <Link
              href="/admin"
              className="px-4 py-1.5 border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-1.5"
            >
              <FileText className="h-4 w-4" /> Admin
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-[#0f172a] border-b border-slate-800 animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              href="/jobs"
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:text-white hover:bg-slate-800"
            >
              Latest Jobs
            </Link>
            <Link
              href="/yojana"
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:text-white hover:bg-slate-800"
            >
              Sarkari Yojana
            </Link>
            <Link
              href="/results"
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:text-white hover:bg-slate-800"
            >
              Results
            </Link>
            <Link
              href="/admit-cards"
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:text-white hover:bg-slate-800"
            >
              Admit Cards
            </Link>
            <Link
              href="/answer-keys"
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:text-white hover:bg-slate-800"
            >
              Answer Keys
            </Link>
            <Link
              href="/admin"
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:text-white hover:bg-slate-800"
            >
              Admin Panel
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
