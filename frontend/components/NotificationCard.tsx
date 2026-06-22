import Link from "next/link";
import { Calendar, GraduationCap, MapPin, AlertCircle, RefreshCw, ChevronRight } from "lucide-react";

interface Notification {
  id: string;
  source_name: string;
  source_url: string;
  category: string;
  article_title: string;
  slug: string;
  last_date: string | null;
  qualifications: string[];
  states: string[];
  is_updated: boolean;
  created_at: string;
  sector?: string;
}

interface NotificationCardProps {
  notification: Notification;
}

export default function NotificationCard({ notification }: NotificationCardProps) {
  const {
    source_name,
    category,
    article_title,
    slug,
    last_date,
    qualifications,
    states,
    is_updated,
    sector
  } = notification;

  // Determine category badge colors
  const getCategoryStyles = (cat: string) => {
    switch (cat.toLowerCase()) {
      case "job":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_12px_rgba(16,185,129,0.06)]";
      case "result":
        return "bg-indigo-500/10 text-indigo-400 border-indigo-500/20 shadow-[0_0_12px_rgba(99,102,241,0.06)]";
      case "admit card":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-[0_0_12px_rgba(245,158,11,0.06)]";
      case "answer key":
        return "bg-purple-500/10 text-purple-400 border-purple-500/20 shadow-[0_0_12px_rgba(168,85,247,0.06)]";
      case "sarkari yojana":
        return "bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-[0_0_12px_rgba(244,63,94,0.06)]";
      default:
        return "bg-sky-500/10 text-sky-400 border-sky-500/20 shadow-[0_0_12px_rgba(14,165,233,0.06)]";
    }
  };

  // Determine application path
  const isYojana = ["sarkari yojana", "scholarship"].includes(category.toLowerCase());
  const detailUrl = isYojana ? `/yojana/${slug}` : `/jobs/${slug}`;

  // Check if closing date is near (under 3 days)
  const isExpiringSoon = () => {
    if (!last_date) return false;
    const diffTime = new Date(last_date).getTime() - new Date().getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 3;
  };

  return (
    <div className="group relative bg-slate-900/35 border border-slate-800/80 hover:border-emerald-500/25 rounded-2xl p-5 hover:shadow-2xl hover:shadow-emerald-500/[0.02] hover:-translate-y-0.5 transition-all duration-300 backdrop-blur-md">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3.5">
        <div className="flex flex-wrap items-center gap-2">
          {/* Category Badge */}
          <span className={`text-xs font-bold px-3 py-0.5 border rounded-full uppercase tracking-wider ${getCategoryStyles(category)}`}>
            {category}
          </span>
          {/* Sector Badge */}
          {sector && sector !== "Others" && (
            <span className="text-xs bg-indigo-500/10 text-indigo-300 border border-indigo-500/15 px-3 py-0.5 rounded-full font-bold uppercase tracking-wider">
              {sector}
            </span>
          )}
          {/* Source Tag */}
          <span className="text-xs bg-slate-950 border border-slate-800 text-slate-400 px-2.5 py-0.5 rounded-lg font-medium tracking-wide">
            {source_name}
          </span>
        </div>
        
        {/* Updated / Freshness badge */}
        {is_updated && (
          <span className="flex items-center gap-1.5 text-[10px] text-emerald-400 bg-emerald-400/5 px-2.5 py-0.5 border border-emerald-400/10 rounded-full font-semibold uppercase tracking-widest">
            <RefreshCw className="h-3 w-3 animate-spin-slow text-emerald-400" /> Updated
          </span>
        )}
      </div>

      {/* Main Link/Title with Hover Transition */}
      <div className="flex justify-between items-start gap-4">
        <Link href={detailUrl} className="block flex-grow group-hover:text-emerald-400">
          <h3 className="text-base sm:text-lg font-extrabold text-slate-100 leading-snug group-hover:text-emerald-400 transition-colors duration-200 line-clamp-2">
            {article_title}
          </h3>
        </Link>
        <Link href={detailUrl} className="hidden sm:flex items-center justify-center h-8 w-8 rounded-full bg-slate-950 border border-slate-800 text-slate-500 group-hover:text-emerald-400 group-hover:border-emerald-500/30 group-hover:bg-emerald-500/5 transition-all duration-300">
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Info footer */}
      <div className="mt-4 pt-4 border-t border-slate-800/50 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-400">
        {/* Qualifications */}
        <div className="flex items-center gap-2 min-w-0">
          <GraduationCap className="h-4 w-4 text-emerald-400/80 flex-shrink-0" />
          <span className="truncate">
            {qualifications && qualifications.length > 0 ? qualifications.join(", ") : "Refer to PDF"}
          </span>
        </div>

        {/* States */}
        <div className="flex items-center gap-2 min-w-0">
          <MapPin className="h-4 w-4 text-indigo-400/80 flex-shrink-0" />
          <span className="truncate">
            {states && states.length > 0 ? states.join(", ") : "All India"}
          </span>
        </div>

        {/* Last Date */}
        <div className={`flex items-center gap-2 ${isExpiringSoon() ? "text-amber-400 font-bold" : ""}`}>
          {isExpiringSoon() ? (
            <AlertCircle className="h-4 w-4 text-amber-400 animate-pulse flex-shrink-0" />
          ) : (
            <Calendar className="h-4 w-4 text-slate-500 flex-shrink-0" />
          )}
          <span className="truncate">
            {last_date ? `Apply by: ${new Date(last_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}` : "Apply Online Now"}
          </span>
        </div>
      </div>
    </div>
  );
}
