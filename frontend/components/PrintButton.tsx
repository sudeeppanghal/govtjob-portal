"use client";

import { Printer } from "lucide-react";

interface PrintButtonProps {
  label?: string;
}

export default function PrintButton({ label = "Print" }: PrintButtonProps) {
  return (
    <button
      onClick={() => window.print()}
      className="flex items-center gap-1 hover:text-white transition cursor-pointer"
    >
      <Printer className="h-4.5 w-4.5" /> {label}
    </button>
  );
}
