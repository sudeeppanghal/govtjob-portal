import Link from "next/link";
import { Calendar, GraduationCap, MapPin, AlertCircle, RefreshCw } from "lucide-react";

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
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "result":
        return "bg-indigo-500/10 text-indigo-400 border-indigo-500/20";
      case "admit card":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "answer key":
        return "bg-purple-500/10 text-purple-400 border-purple-500/20";
      case "sarkari yojana":
        return "bg-pink-500/10 text-pink-400 border-pink-500/20";
      default:
        return "bg-sky-500/10 text-sky-400 border-sky-500/20";
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
    <div className="group relative bg-[#1e293b]/30 border border-slate-800 hover:border-slate-700/80 rounded-xl p-5 hover:shadow-xl hover:shadow-emerald-500/[0.02] hover:-translate-y-0.5 transition-all duration-300 backdrop-blur-sm">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          {/* Category Badge */}
          <span className={`text-xs font-semibold px-2.5 py-0.5 border rounded-full ${getCategoryStyles(category)}`}>
            {category}
          </span>
          {/* Sector Badge */}
          {sector && sector !== "Others" && (
            <span className="text-xs bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2.5 py-0.5 rounded-full font-semibold">
              {sector}
            </span>
          )}
          {/* Source Tag */}
          <span className="text-xs bg-slate-900 border border-slate-800 text-slate-400 px-2 py-0.5 rounded-md font-medium">
            {source_name}
          </span>
        </div>
        
        {/* Updated / Freshness badge */}
        {is_updated && (
          <span className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-400/5 px-2 py-0.5 border border-emerald-400/10 rounded-full font-medium uppercase tracking-wider">
            <RefreshCw className="h-2.5 w-2.5 animate-spin-slow" /> Updated
          </span>
        )}
      </div>

      {/* Main Link/Title */}
      <Link href={detailUrl} className="block group-hover:text-emerald-400 transition-colors">
        <h3 className="text-base font-bold text-slate-100 line-clamp-2 leading-snug group-hover:text-emerald-400 transition duration-150">
          {article_title}
        </h3>
      </Link>

      <div className="mt-4 pt-4 border-t border-slate-800/60 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-400">
        {/* Qualifications */}
        <div className="flex items-center gap-1.5 min-w-0">
          <GraduationCap className="h-4 w-4 text-slate-500 flex-shrink-0" />
          <span className="truncate">
            {qualifications && qualifications.length > 0 ? qualifications.join(", ") : "Not Specified"}
          </span>
        </div>

        {/* States */}
        <div className="flex items-center gap-1.5 min-w-0">
          <MapPin className="h-4 w-4 text-slate-500 flex-shrink-0" />
          <span className="truncate">
            {states && states.length > 0 ? states.join(", ") : "National"}
          </span>
        </div>

        {/* Last Date */}
        <div className={`flex items-center gap-1.5 ${isExpiringSoon() ? "text-amber-400 font-medium" : ""}`}>
          {isExpiringSoon() ? (
            <AlertCircle className="h-4 w-4 text-amber-400 animate-pulse flex-shrink-0" />
          ) : (
            <Calendar className="h-4 w-4 text-slate-500 flex-shrink-0" />
          )}
          <span>
            {last_date ? `Apply by: ${new Date(last_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}` : "Check Details"}
          </span>
        </div>
      </div>
    </div>
  );
}
