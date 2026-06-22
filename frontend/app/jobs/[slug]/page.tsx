import Link from "next/link";
import { supabase } from "../../../lib/supabase";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, GraduationCap, MapPin, CheckCircle, RefreshCw, Share2, Printer, Train } from "lucide-react";
import PrintButton from "../../../components/PrintButton";
import ViewTracker from "../../../components/ViewTracker";
import { marked } from "marked";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function JobDetail({ params }: PageProps) {
  const { slug } = await params;

  // Fetch notification details
  const { data: notification, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !notification) {
    notFound();
  }

  const {
    id,
    source_name,
    source_url,
    category,
    article_title,
    article_content,
    last_date,
    qualifications,
    states,
    is_updated,
    updated_at,
    schemas
  } = notification;

  // Convert markdown content to HTML
  const htmlContent = marked.parse(article_content);
  
  const todayISO = new Date().toISOString().split('T')[0];

  // Fetch related jobs (same category, excluding current)
  const { data: related } = await supabase
    .from("notifications")
    .select("article_title, slug, category, last_date")
    .eq("category", category)
    .eq("status", "published")
    .neq("slug", slug)
    .order("created_at", { ascending: false })
    .limit(4);

  // Setup category routes
  const getCategoryDetails = (cat: string) => {
    switch (cat.toLowerCase()) {
      case "job":
        return { label: "Jobs", path: "/jobs" };
      case "result":
        return { label: "Results", path: "/results" };
      case "admit card":
        return { label: "Admit Cards", path: "/admit-cards" };
      case "answer key":
        return { label: "Answer Keys", path: "/answer-keys" };
      default:
        return { label: "Notifications", path: "/" };
    }
  };

  const categoryDetails = getCategoryDetails(category);

  return (
    <article className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <ViewTracker slug={slug} />
      
      {/* Schema.org JSON-LD for Search Engines */}
      {schemas && Object.entries(schemas).map(([key, schemaObj]) => {
        if (!schemaObj) return null;
        const updatedSchema = { ...(schemaObj as any) };
        if (key === "job_posting") {
          updatedSchema.datePosted = todayISO;
          updatedSchema.dateModified = todayISO;
        }
        return (
          <script
            key={key}
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(updatedSchema)
            }}
          />
        );
      })}
      
      {/* Breadcrumbs */}
      <nav className="text-xs sm:text-sm text-slate-500 mb-4 flex items-center gap-2 font-medium">
        <Link href="/" className="hover:text-blue-600">Home</Link>
        <span className="text-slate-300">/</span>
        <Link href={categoryDetails.path} className="hover:text-blue-600">{categoryDetails.label}</Link>
        <span className="text-slate-300">/</span>
        <span className="text-slate-700 truncate">{source_name} Notification</span>
      </nav>

      {/* Back Button */}
      <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-600 border border-slate-200 rounded-xl px-4 py-2 hover:bg-slate-50 transition">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Article Body */}
        <div className="lg:col-span-8 space-y-6">
          <header className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs bg-blue-50 text-blue-600 border border-blue-100 px-3 py-0.5 rounded-full font-bold uppercase tracking-wider">
                {category}
              </span>
              <span className="text-xs bg-slate-100 border border-slate-200 text-slate-600 px-2.5 py-0.5 rounded-lg font-bold">
                Official: {source_name}
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 px-2.5 py-0.5 border border-emerald-100 rounded-lg font-bold">
                <RefreshCw className="h-3 w-3 animate-spin-slow text-emerald-600" /> अंतिम अपडेट: {new Date().toLocaleDateString('hi-IN', { day: '2-digit', month: 'long', year: 'numeric' })}
              </span>
            </div>

            {/* Dynamic Banner Image */}
            <div className="relative aspect-[1.91/1] w-full overflow-hidden rounded-3xl border border-slate-200/80 shadow-sm my-6 bg-white">
              <img
                src={`/api/og?title=${slug}`}
                alt={article_title}
                className="object-cover w-full h-full"
                loading="eager"
              />
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 leading-tight">
              {article_title}
            </h1>

            {/* Quick Fact Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs text-slate-700">
              <div className="space-y-1">
                <span className="text-slate-400 font-semibold block uppercase tracking-wider text-[10px]">Education</span>
                <span className="font-bold flex items-center gap-1">
                  <GraduationCap className="h-4 w-4 text-blue-600 flex-shrink-0" />
                  {qualifications && qualifications.length > 0 ? qualifications.join(", ") : "Refer to PDF"}
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-slate-400 font-semibold block uppercase tracking-wider text-[10px]">Region</span>
                <span className="font-bold flex items-center gap-1">
                  <MapPin className="h-4 w-4 text-blue-600 flex-shrink-0" />
                  {states && states.length > 0 ? states.join(", ") : "National"}
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-slate-400 font-semibold block uppercase tracking-wider text-[10px]">Closing Date</span>
                <span className={`font-bold flex items-center gap-1 ${last_date ? "text-amber-600" : ""}`}>
                  <Calendar className="h-4 w-4 text-amber-600 flex-shrink-0" />
                  {last_date ? new Date(last_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : "Apply Now"}
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-slate-400 font-semibold block uppercase tracking-wider text-[10px]">Verified Status</span>
                <span className="font-bold flex items-center gap-1 text-emerald-600">
                  <CheckCircle className="h-4 w-4 text-emerald-600 flex-shrink-0" /> Govt. Gazette
                </span>
              </div>
            </div>
          </header>

          {/* Render Markdown Content as Clean HTML */}
          <div
            className="prose max-w-none bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xs text-slate-700"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
        </div>

        {/* Sidebar */}
        <aside className="lg:col-span-4 space-y-6">
          {/* Apply Card */}
          <div className="bg-white border border-slate-200/85 rounded-2xl p-5 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-800 text-xs uppercase tracking-widest border-b border-slate-100 pb-2 flex items-center gap-1.5">
              <Train className="h-4 w-4 text-blue-600" /> Actions
            </h3>
            <p className="text-xs text-slate-450 leading-relaxed">
              Ensure you read the official notification PDF in detail before filing the application form online.
            </p>
            <div className="flex flex-col gap-2">
              <a
                href={source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-xs uppercase tracking-widest text-center shadow-xs transition duration-200 cursor-pointer"
              >
                Apply Online
              </a>
              <a
                href={source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-xs uppercase tracking-widest text-center shadow-xs transition duration-200 cursor-pointer"
              >
                Download Official PDF
              </a>
            </div>
            {/* Share and Print Actions */}
            <div className="flex justify-between items-center pt-2.5 border-t border-slate-100 text-xs text-slate-400">
              <button className="flex items-center gap-1.5 hover:text-blue-600 transition cursor-pointer font-semibold">
                <Share2 className="h-4 w-4" /> Share
              </button>
              <PrintButton label="Print Notification" />
            </div>
          </div>

          {/* Related Jobs */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs">
            <h3 className="font-bold text-slate-800 text-xs uppercase tracking-widest border-b border-slate-100 pb-2">Related Alerts</h3>
            {related && related.length === 0 ? (
              <p className="text-xs text-slate-400">No related jobs found.</p>
            ) : (
              <div className="space-y-3.5">
                {related &&
                  related.map((job) => (
                    <div key={job.slug} className="group border-b border-slate-100 last:border-0 pb-3 last:pb-0">
                      <Link href={`/jobs/${job.slug}`} className="block text-xs font-bold text-slate-700 group-hover:text-blue-600 transition-colors line-clamp-2">
                        {job.article_title}
                      </Link>
                      <span className="text-[10px] text-slate-400 mt-1 block">
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
