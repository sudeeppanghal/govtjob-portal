import { notFound } from "next/navigation";
import Link from "next/link";
import { Calendar, GraduationCap, MapPin, Landmark, ArrowLeft, Share2, Printer, CheckCircle, RefreshCw } from "lucide-react";
import { supabase } from "../../../lib/supabase";
import { marked } from "marked";
import { trackPageView } from "../../../lib/analytics";

interface DetailProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: DetailProps) {
  const { slug } = await params;
  const { data: notification } = await supabase
    .from("notifications")
    .select("article_title, meta_description")
    .eq("slug", slug)
    .single();

  if (!notification) {
    return {
      title: "Not Found",
      description: "Notification not found"
    };
  }

  return {
    title: notification.article_title,
    description: notification.meta_description,
    alternates: {
      canonical: `/jobs/${slug}`
    }
  };
}

export default async function JobDetail({ params }: DetailProps) {
  const { slug } = await params;

  // Log page view asynchronously (non-blocking)
  trackPageView(slug).catch(e => console.error("Analytics log error:", e));

  // Fetch article detail
  const { data: notification, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !notification) {
    notFound();
  }

  const {
    article_title,
    article_content,
    category,
    source_name,
    source_url,
    qualifications,
    states,
    last_date,
    schemas,
    is_updated,
    updated_at
  } = notification;

  // Convert markdown to html on server
  const htmlContent = await marked.parse(article_content || "");

  // Determine dynamic breadcrumb details based on category
  const getCategoryDetails = (cat: string) => {
    switch (cat.toLowerCase()) {
      case "result":
        return { label: "Results", path: "/results" };
      case "admit card":
        return { label: "Admit Cards", path: "/admit-cards" };
      case "answer key":
        return { label: "Answer Keys", path: "/answer-keys" };
      default:
        return { label: "Latest Jobs", path: "/jobs" };
    }
  };
  const categoryDetails = getCategoryDetails(category);

  // Fetch related jobs (same category, limit 5)
  const { data: related } = await supabase
    .from("notifications")
    .select("article_title, slug, last_date, category")
    .eq("category", category)
    .eq("status", "published")
    .neq("slug", slug)
    .order("created_at", { ascending: false })
    .limit(5);

  return (
    <article className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Schemas Injection */}
      {schemas && (
        <>
          {schemas.job_posting && (
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas.job_posting) }}
            />
          )}
          {schemas.faq && (
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas.faq) }}
            />
          )}
          {schemas.breadcrumb && (
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas.breadcrumb) }}
            />
          )}
        </>
      )}

      {/* Breadcrumbs */}
      <nav className="text-sm text-slate-500 mb-6 flex items-center gap-2">
        <Link href="/" className="hover:text-emerald-400">Home</Link>
        <span>/</span>
        <Link href={categoryDetails.path} className="hover:text-emerald-400">{categoryDetails.label}</Link>
        <span>/</span>
        <span className="text-slate-300 truncate">{source_name} Notification</span>
      </nav>

      {/* Back Button */}
      <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white mb-8 border border-slate-800 rounded-lg px-3 py-1.5 hover:bg-slate-900 transition">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Article Body */}
        <div className="lg:col-span-8 space-y-6">
          <header className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full font-semibold">
                {category}
              </span>
              <span className="text-xs bg-slate-900 border border-slate-800 text-slate-400 px-2 py-0.5 rounded-md font-medium">
                Official: {source_name}
              </span>
              {is_updated && (
                <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-400/5 px-2 py-0.5 border border-emerald-400/10 rounded-full font-semibold uppercase tracking-wider">
                  <RefreshCw className="h-2.5 w-2.5" /> Updated on {new Date(updated_at).toLocaleDateString('en-IN')}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-white leading-tight">
              {article_title}
            </h1>

            {/* Quick Fact Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-900/60 border border-slate-850 rounded-xl text-xs text-slate-300">
              <div className="space-y-1">
                <span className="text-slate-500 block">Education</span>
                <span className="font-semibold flex items-center gap-1">
                  <GraduationCap className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                  {qualifications && qualifications.length > 0 ? qualifications.join(", ") : "Refer to PDF"}
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-slate-500 block">Region</span>
                <span className="font-semibold flex items-center gap-1">
                  <MapPin className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                  {states && states.length > 0 ? states.join(", ") : "National"}
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-slate-500 block">Closing Date</span>
                <span className={`font-semibold flex items-center gap-1 ${last_date ? "text-amber-400" : ""}`}>
                  <Calendar className="h-4 w-4 text-amber-400 flex-shrink-0" />
                  {last_date ? new Date(last_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : "Check Notice"}
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-slate-500 block">Verified Status</span>
                <span className="font-semibold flex items-center gap-1 text-emerald-400">
                  <CheckCircle className="h-4 w-4 text-emerald-400 flex-shrink-0" /> Govt. Gazette
                </span>
              </div>
            </div>
          </header>

          {/* Render Markdown Content as Clean HTML */}
          <div
            className="prose prose-invert max-w-none bg-[#111827]/20 border border-slate-850/60 rounded-2xl p-6 sm:p-8"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
        </div>

        {/* Sidebar */}
        <aside className="lg:col-span-4 space-y-6">
          {/* Apply Card */}
          <div className="bg-[#1e293b]/40 border border-slate-800 rounded-xl p-5 shadow-lg backdrop-blur-sm space-y-4">
            <h3 className="font-bold text-slate-100 text-sm uppercase tracking-wider border-b border-slate-800 pb-2">Actions</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Ensure you read the official notification PDF in detail before filing the application form online.
            </p>
            <div className="flex flex-col gap-2">
              <a
                href={source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-semibold py-2.5 rounded-lg text-sm text-center shadow-lg shadow-emerald-500/10 transition cursor-pointer"
              >
                Apply Online
              </a>
              <a
                href={source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 font-semibold py-2.5 rounded-lg text-sm text-center transition cursor-pointer"
              >
                Download Official PDF
              </a>
            </div>
            {/* Share and Print Actions */}
            <div className="flex justify-between items-center pt-2 border-t border-slate-800/60 text-xs text-slate-500">
              <button className="flex items-center gap-1 hover:text-white transition">
                <Share2 className="h-4.5 w-4.5" /> Share
              </button>
              <button onClick={() => window.print()} className="flex items-center gap-1 hover:text-white transition cursor-pointer">
                <Printer className="h-4.5 w-4.5" /> Print Notification
              </button>
            </div>
          </div>

          {/* Related Jobs */}
          <div className="bg-slate-900/20 border border-slate-850 rounded-xl p-5 space-y-4">
            <h3 className="font-bold text-slate-200 text-sm uppercase tracking-wider">Related Alerts</h3>
            {related && related.length === 0 ? (
              <p className="text-xs text-slate-500">No related jobs found.</p>
            ) : (
              <div className="space-y-3">
                {related &&
                  related.map((job) => (
                    <div key={job.slug} className="group border-b border-slate-800/40 last:border-0 pb-3 last:pb-0">
                      <Link href={`/jobs/${job.slug}`} className="block text-xs font-bold text-slate-300 group-hover:text-emerald-400 transition-colors line-clamp-2">
                        {job.article_title}
                      </Link>
                      <span className="text-[10px] text-slate-500 mt-1 block">
                        {job.category} {job.last_date ? `• Apply by ${new Date(job.last_date).toLocaleDateString('en-IN')}` : ""}
                      </span>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </aside>
      </div>
    </article>
  );
}
