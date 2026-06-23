import { supabase } from "../../lib/supabase";
import { triggerCrawlAction, updateStatusAction, loginAction, logoutAction } from "./actions";
import { Landmark, ShieldAlert, Terminal, Play, CheckCircle, XCircle, FileSignature, RefreshCw, BarChart2, Eye, Users, FileText } from "lucide-react";
import Link from "next/link";
import { cookies } from "next/headers";

export const revalidate = 0; // Fetch fresh data on every visit

interface AdminProps {
  searchParams: Promise<{
    error?: string;
  }>;
}

export default async function AdminDashboard({ searchParams }: AdminProps) {
  const params = await searchParams;
  const errorParam = params.error || "";

  const cookieStore = await cookies();
  const isAuthenticated = cookieStore.get("admin_session")?.value === "authenticated";

  if (!isAuthenticated) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-16 bg-slate-50">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[200px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-8 space-y-6 shadow-xl relative z-10">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 flex items-center justify-center gap-2">
              <Landmark className="h-6 w-6 text-blue-600" /> Admin Console Login
            </h1>
            <p className="text-xs text-slate-500">
              Authorized personnel only. Please sign in to access CMS & Analytics.
            </p>
          </div>

          {errorParam === "invalid" && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs flex items-center gap-2">
              <XCircle className="h-4 w-4 shrink-0" /> Invalid email address or password.
            </div>
          )}

          {errorParam === "not-configured" && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-xs flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 shrink-0" /> Credentials not configured. Please set ADMIN_EMAIL and ADMIN_PASSWORD in environment variables.
            </div>
          )}

          <form action={loginAction} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 block">Email Address</label>
              <input
                type="email"
                name="email"
                required
                placeholder="admin@example.com"
                className="w-full bg-white border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg py-2.5 px-3.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 block">Password</label>
              <input
                type="password"
                name="password"
                required
                placeholder="••••••••"
                className="w-full bg-white border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg py-2.5 px-3.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 mt-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-sm transition shadow-md shadow-blue-500/10 cursor-pointer text-center"
            >
              Sign In
            </button>
          </form>
        </div>
      </div>
    );
  }
  // 1. Query Crawls Statistics from Supabase
  const { data: crawls } = await supabase
    .from("crawls")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(10);

  // 2. Query Recent Notifications from Supabase
  const { data: notifications } = await supabase
    .from("notifications")
    .select("id, article_title, category, source_name, status, created_at")
    .order("created_at", { ascending: false })
    .limit(15);

  // 3. Query Total Published Articles count
  const { count: totalArticles } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("status", "published");

  // 4. Query Page Views for Analytics aggregation
  const { data: pageViews } = await supabase
    .from("page_views")
    .select("referrer, slug, ip_hash");

  // Scraper metrics
  const totalCrawls = crawls ? crawls.length : 0;
  const successfulCrawls = crawls ? crawls.filter(c => c.status === 'success').length : 0;
  const successRate = totalCrawls > 0 ? Math.round((successfulCrawls / totalCrawls) * 100) : 0;

  // Analytics Metrics
  const totalViews = pageViews ? pageViews.length : 0;
  const uniqueVisitors = pageViews ? new Set(pageViews.map(v => v.ip_hash || "")).size : 0;

  // Aggregate Traffic Sources (Referrers)
  const referrers: Record<string, number> = {
    "Direct": 0,
    "Google Search": 0,
    "Telegram": 0,
    "WhatsApp": 0,
    "YouTube": 0,
    "Facebook": 0,
    "Others": 0
  };

  // Aggregate Most Popular Pages
  const popularPages: Record<string, number> = {};

  if (pageViews) {
    pageViews.forEach(v => {
      // 1. Count referrers
      if (v.referrer in referrers) {
        referrers[v.referrer] += 1;
      } else {
        referrers["Others"] += 1;
      }
      
      // 2. Count page views
      popularPages[v.slug] = (popularPages[v.slug] || 0) + 1;
    });
  }

  // Sort most popular pages (top 5)
  const sortedPages = Object.entries(popularPages)
    .map(([slug, count]) => ({ slug, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-2">
            <ShieldAlert className="h-8 w-8 text-blue-600" /> Admin CMS & Analytics
          </h1>
          <p className="text-sm text-slate-500 mt-2">
            Monitor crawls, toggle draft articles, and track live visitor referrals on your dashboard.
          </p>
        </div>
        
        {/* Sign Out & Trigger Manual Crawl */}
        <div className="flex items-center gap-3">
          <form action={logoutAction}>
            <button
              type="submit"
              className="px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold rounded-lg text-sm transition flex items-center gap-2 cursor-pointer shadow-xs"
            >
              Sign Out
            </button>
          </form>
          
          <form action={triggerCrawlAction}>
            <button
              type="submit"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-sm transition shadow-md shadow-blue-500/15 flex items-center gap-2 cursor-pointer"
            >
              <Play className="h-4 w-4 fill-current" /> Trigger Manual Crawl
            </button>
          </form>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-5 bg-white border border-slate-200 rounded-xl flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs uppercase font-semibold text-slate-400">Published Posts</span>
            <span className="block text-3xl font-bold text-slate-900 mt-1">{totalArticles || 0}</span>
            <span className="text-[10px] text-slate-500 mt-1 block">Live on website</span>
          </div>
          <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
            <FileText className="h-6 w-6" />
          </div>
        </div>

        <div className="p-5 bg-white border border-slate-200 rounded-xl flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs uppercase font-semibold text-slate-400">Page Views</span>
            <span className="block text-3xl font-bold text-slate-900 mt-1">{totalViews.toLocaleString()}</span>
            <span className="text-[10px] text-slate-500 mt-1 block">Total clicks logged</span>
          </div>
          <div className="p-3 bg-indigo-50 rounded-lg text-indigo-650">
            <Eye className="h-6 w-6" />
          </div>
        </div>

        <div className="p-5 bg-white border border-slate-200 rounded-xl flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs uppercase font-semibold text-slate-400">Unique Visitors</span>
            <span className="block text-3xl font-bold text-slate-900 mt-1">{uniqueVisitors.toLocaleString()}</span>
            <span className="text-[10px] text-slate-500 mt-1 block">Based on hashed IPs</span>
          </div>
          <div className="p-3 bg-pink-50 rounded-lg text-pink-650">
            <Users className="h-6 w-6" />
          </div>
        </div>

        <div className="p-5 bg-white border border-slate-200 rounded-xl flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs uppercase font-semibold text-slate-400">Crawl Success</span>
            <span className="block text-3xl font-bold text-slate-900 mt-1">{successRate}%</span>
            <span className="text-[10px] text-slate-500 mt-1 block">For last 10 script runs</span>
          </div>
          <div className="p-3 bg-emerald-50 rounded-lg text-emerald-650">
            <CheckCircle className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Traffic Analytics (Visual Referrers and Popular Pages) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Traffic Sources progress bars */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <BarChart2 className="h-5 w-5 text-blue-600" /> Traffic Referrals
          </h2>
          <div className="space-y-4 pt-2">
            {Object.entries(referrers)
              .sort((a, b) => b[1] - a[1])
              .map(([source, count]) => {
                const percentage = totalViews > 0 ? Math.round((count / totalViews) * 100) : 0;
                return (
                  <div key={source} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-600">{source}</span>
                      <span className="text-slate-500">{count} clicks ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-slate-50 h-2 rounded-full overflow-hidden border border-slate-200">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${
                          source === "Google Search" ? "from-emerald-500 to-teal-500" :
                          source === "Telegram" ? "from-sky-500 to-blue-500" :
                          source === "WhatsApp" ? "from-green-500 to-emerald-500" :
                          "from-blue-500 to-indigo-500"
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Most Popular Pages list */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
          <h2 className="text-lg font-bold text-slate-800">Most Popular Pages</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="pb-3">Page Path / Slug</th>
                  <th className="pb-3 text-right">Views</th>
                  <th className="pb-3 text-right">Share of Traffic</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sortedPages.map((page) => {
                  const share = totalViews > 0 ? Math.round((page.count / totalViews) * 100) : 0;
                  return (
                    <tr key={page.slug} className="text-slate-700 hover:bg-slate-50/50 transition">
                      <td className="py-4 font-mono text-slate-500">
                        {page.slug === "homepage" ? "/" : `/jobs/${page.slug}`}
                      </td>
                      <td className="py-4 text-right font-bold text-slate-800">{page.count}</td>
                      <td className="py-4 text-right text-slate-500">{share}%</td>
                    </tr>
                  );
                })}
                {sortedPages.length === 0 && (
                  <tr>
                    <td colSpan={3} className="py-4 text-center text-slate-400">
                      No visitor views recorded yet. Active page requests will display statistics here.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Scraper Logs & CMS Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Scraper Run History */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Terminal className="h-5 w-5 text-blue-600" /> Scraper Log (Last 10 Runs)
          </h2>
          <div className="overflow-x-auto pt-2">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="pb-3">Started At</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">New Notices</th>
                  <th className="pb-3 text-right">Tokens Used</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {crawls && crawls.map((c) => (
                  <tr key={c.id} className="text-slate-700 hover:bg-slate-50/50 transition">
                    <td className="py-3.5 text-slate-600">{new Date(c.started_at).toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', day: '2-digit', month: 'short' })}</td>
                    <td className="py-3.5">
                      <span className={`inline-flex items-center gap-1 font-bold ${c.status === 'success' ? 'text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100' : 'text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-100'}`}>
                        {c.status === 'success' ? <CheckCircle className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                        {c.status}
                      </span>
                    </td>
                    <td className="py-3.5 text-right font-bold text-slate-800">{c.new_notices}</td>
                    <td className="py-3.5 text-right text-slate-500">{c.tokens_used}</td>
                  </tr>
                ))}
                {(!crawls || crawls.length === 0) && (
                  <tr>
                    <td colSpan={4} className="py-4 text-center text-slate-400">No crawls recorded. Run python main.py to seed.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Content Review board */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <FileSignature className="h-5 w-5 text-blue-600" /> Article Review Board (CMS)
          </h2>
          <div className="space-y-4 pt-2">
            {notifications && notifications.map((n) => (
              <div key={n.id} className="flex justify-between items-start gap-4 border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                <div className="space-y-1">
                  <span className="block text-xs font-bold text-slate-800 line-clamp-1 leading-snug hover:text-blue-600 transition">
                    {n.article_title}
                  </span>
                  <div className="flex gap-2 text-[10px] text-slate-500 font-bold">
                    <span>{n.source_name}</span>
                    <span>•</span>
                    <span>{n.category}</span>
                    <span>•</span>
                    <span>{new Date(n.created_at).toLocaleDateString('en-IN')}</span>
                  </div>
                </div>
                
                {/* Status Toggle Action Form */}
                <form action={updateStatusAction}>
                  <input type="hidden" name="id" value={n.id} />
                  <input type="hidden" name="currentStatus" value={n.status} />
                  <button
                    type="submit"
                    className={`px-2.5 py-1 text-[10px] rounded font-bold border cursor-pointer transition ${
                      n.status === 'published'
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-amber-50 hover:border-amber-200 hover:text-amber-700'
                        : 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700'
                    }`}
                  >
                    {n.status === 'published' ? 'Published' : 'Draft'}
                  </button>
                </form>
              </div>
            ))}
            {(!notifications || notifications.length === 0) && (
              <p className="text-xs text-slate-400 text-center py-4">No notifications processed yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
