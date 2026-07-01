import Link from "next/link";
import { supabase } from "../../../lib/supabase";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, GraduationCap, MapPin, CheckCircle, RefreshCw, Share2, Bookmark, Train } from "lucide-react";
import PrintButton from "../../../components/PrintButton";
import ViewTracker from "../../../components/ViewTracker";
import { marked } from "marked";
import { enrichJobPostingSchema } from "../../../lib/schema";

import { Metadata } from "next";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const { data: notification } = await supabase
    .from("notifications")
    .select("article_title, meta_description")
    .eq("slug", slug)
    .single();

  if (!notification) {
    return {
      title: "Notification Not Found",
      description: "This government notification could not be found."
    };
  }

  const title = notification.article_title;
  const description = notification.meta_description || `Read full details about ${notification.article_title}, eligibility criteria, application process, and important dates.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://railwayadmitcard.online/yojana/${slug}`,
      type: "article",
      images: [
        {
          url: `https://railwayadmitcard.online/api/og?title=${slug}`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`https://railwayadmitcard.online/api/og?title=${slug}`],
    },
  };
}

export default async function YojanaDetail({ params }: PageProps) {
  const { slug } = await params;

  // Fetch yojana details
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
    qualifications,
    states,
    is_updated,
    updated_at,
    schemas
  } = notification;

  // Convert markdown content to HTML
  const htmlContent = marked.parse(article_content);
  
  const todayISO = new Date().toISOString().split('T')[0];

  // Fetch related yojana (excluding current)
  const { data: related } = await supabase
    .from("notifications")
    .select("article_title, slug, category, last_date")
    .in("category", ["Sarkari Yojana", "Scholarship"])
    .eq("status", "published")
    .neq("slug", slug)
    .order("created_at", { ascending: false })
    .limit(4);

  return (
    <article className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <ViewTracker slug={slug} />
      
      {/* Schema.org JSON-LD for Search Engines */}
      {schemas && Object.entries(schemas).map(([key, schemaObj]) => {
        if (!schemaObj) return null;
        let updatedSchema = { ...(schemaObj as any) };
        if (key === "job_posting") {
          updatedSchema = enrichJobPostingSchema(updatedSchema, notification, todayISO);
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
        <Link href="/yojana" className="hover:text-blue-600">Sarkari Yojana</Link>
        <span className="text-slate-300">/</span>
        <span className="text-slate-700 truncate">{source_name} Scheme</span>
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
              <span className="text-xs bg-rose-50 text-rose-600 border border-rose-100 px-3 py-0.5 rounded-full font-bold uppercase tracking-wider">
                {category}
              </span>
              <span className="text-xs bg-slate-100 border border-slate-200 text-slate-600 px-2.5 py-0.5 rounded-lg font-bold">
                Release: {source_name}
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
                <span className="text-slate-400 font-semibold block uppercase tracking-wider text-[10px]">Beneficiaries</span>
                <span className="font-bold flex items-center gap-1">
                  <GraduationCap className="h-4 w-4 text-blue-600 flex-shrink-0" />
                  {qualifications && qualifications.length > 0 ? qualifications.join(", ") : "All Citizens"}
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-slate-400 font-semibold block uppercase tracking-wider text-[10px]">State Scope</span>
                <span className="font-bold flex items-center gap-1">
                  <MapPin className="h-4 w-4 text-blue-600 flex-shrink-0" />
                  {states && states.length > 0 ? states.join(", ") : "Central"}
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-slate-400 font-semibold block uppercase tracking-wider text-[10px]">Application Status</span>
                <span className="font-bold flex items-center gap-1 text-emerald-600">
                  <Calendar className="h-4 w-4 text-emerald-600 flex-shrink-0" /> Active / Open
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-slate-400 font-semibold block uppercase tracking-wider text-[10px]">Verify Source</span>
                <span className="font-bold flex items-center gap-1 text-emerald-600">
                  <CheckCircle className="h-4 w-4 text-emerald-600 flex-shrink-0" /> Official Release
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
              <Bookmark className="h-4 w-4 text-blue-600" /> Apply Online
            </h3>
            <p className="text-xs text-slate-455 leading-relaxed">
              Submit your application on the official government welfare portal. Check requirements.
            </p>
            <div className="flex flex-col gap-2">
              <a
                href={source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-xs uppercase tracking-widest text-center shadow-xs transition duration-200 cursor-pointer"
              >
                Go to Official Scheme Portal
              </a>
              <a
                href={source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-xs uppercase tracking-widest text-center shadow-xs transition duration-200 cursor-pointer"
              >
                Download Guidelines PDF
              </a>
            </div>
            {/* Share and Print Actions */}
            <div className="flex justify-between items-center pt-2.5 border-t border-slate-100 text-xs text-slate-400 font-semibold">
              <button className="flex items-center gap-1.5 hover:text-blue-600 transition cursor-pointer">
                <Share2 className="h-4 w-4" /> Share Scheme
              </button>
              <PrintButton label="Print Details" />
            </div>
          </div>

          {/* Related Yojana */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs">
            <h3 className="font-bold text-slate-800 text-xs uppercase tracking-widest border-b border-slate-100 pb-2">Related Schemes</h3>
            {related && related.length === 0 ? (
              <p className="text-xs text-slate-400">No related schemes found.</p>
            ) : (
              <div className="space-y-3.5">
                {related &&
                  related.map((scheme) => (
                    <div key={scheme.slug} className="group border-b border-slate-100 last:border-0 pb-3 last:pb-0">
                      <Link href={`/yojana/${scheme.slug}`} className="block text-xs font-bold text-slate-700 group-hover:text-blue-600 transition-colors line-clamp-2">
                        {scheme.article_title}
                      </Link>
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        {scheme.category} {scheme.last_date ? `• Apply by ${new Date(scheme.last_date).toLocaleDateString('en-IN')}` : ""}
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
