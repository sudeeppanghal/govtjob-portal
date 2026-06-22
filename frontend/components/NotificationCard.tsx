import Link from "next/link";
import { Calendar, ArrowRight, Train, Landmark, CheckCircle2, Briefcase, FileText, Award } from "lucide-react";

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
  meta_description?: string;
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
    created_at,
    meta_description
  } = notification;

  // Determine application path
  const isYojana = ["sarkari yojana", "scholarship"].includes(category.toLowerCase());
  const detailUrl = isYojana ? `/yojana/${slug}` : `/jobs/${slug}`;

  // Formatted date
  const formattedDate = new Date(created_at).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });

  // Get illustration parameters based on category
  const getCategoryDetails = (cat: string) => {
    const normalCat = cat.toLowerCase();
    if (normalCat === "admit card") {
      return {
        labelColor: "text-blue-600",
        bgGradient: "from-blue-400 to-indigo-500",
        icon: Train,
        badgeBg: "bg-blue-50"
      };
    } else if (normalCat === "result") {
      return {
        labelColor: "text-emerald-600",
        bgGradient: "from-emerald-400 to-teal-500",
        icon: Award,
        badgeBg: "bg-emerald-50"
      };
    } else if (normalCat === "answer key") {
      return {
        labelColor: "text-purple-600",
        bgGradient: "from-purple-400 to-indigo-500",
        icon: CheckCircle2,
        badgeBg: "bg-purple-50"
      };
    } else if (normalCat === "jobs" || normalCat === "job") {
      return {
        labelColor: "text-rose-600",
        bgGradient: "from-rose-400 to-red-500",
        icon: Briefcase,
        badgeBg: "bg-rose-50"
      };
    } else if (normalCat === "sarkari yojana" || normalCat === "scholarship") {
      return {
        labelColor: "text-amber-600",
        bgGradient: "from-amber-400 to-orange-500",
        icon: Landmark,
        badgeBg: "bg-amber-50"
      };
    } else {
      return {
        labelColor: "text-sky-600",
        bgGradient: "from-sky-400 to-blue-500",
        icon: FileText,
        badgeBg: "bg-sky-50"
      };
    }
  };

  const details = getCategoryDetails(category);
  const IconComponent = details.icon;

  return (
    <div className="group bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:scale-[1.01] transition-all duration-300 flex flex-col h-full">
      {/* Top Category Illustration Header */}
      <div className={`h-36 bg-gradient-to-tr ${details.bgGradient} relative flex items-center justify-center overflow-hidden`}>
        {/* Decorative Grid Lines */}
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:15px_15px]" />
        
        {/* Glow overlay */}
        <div className="absolute -right-10 -top-10 w-28 h-28 bg-white/20 rounded-full blur-xl" />
        
        <IconComponent className="h-14 w-14 text-white drop-shadow-md z-10" />

        {/* Source badge overlay */}
        <span className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-lg border border-slate-100 uppercase tracking-wider">
          {source_name}
        </span>
      </div>

      {/* Card Body */}
      <div className="p-5 flex-grow flex flex-col justify-between">
        <div className="space-y-2">
          {/* Category Tag */}
          <span className={`text-[10px] font-extrabold uppercase tracking-widest ${details.labelColor}`}>
            {category}
          </span>
          
          {/* Title */}
          <Link href={detailUrl} className="block group-hover:text-blue-600">
            <h3 className="text-[15px] font-bold text-slate-900 leading-snug group-hover:text-blue-600 transition-colors duration-150 line-clamp-2">
              {article_title}
            </h3>
          </Link>

          {/* Description snippet */}
          <p className="text-[13px] text-slate-400 leading-relaxed line-clamp-2">
            {meta_description || `Download official ${source_name} ${category} recruitment notice PDF. Check qualifications, eligibility, fees, and application details.`}
          </p>
        </div>

        {/* Card Footer */}
        <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5 font-medium">
            <Calendar className="h-3.5 w-3.5 text-slate-400" />
            <span>{formattedDate}</span>
          </div>

          <Link
            href={detailUrl}
            className="flex items-center gap-1 font-bold text-blue-600 hover:text-blue-700 transition"
          >
            <span>Read More</span>
            <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
}
