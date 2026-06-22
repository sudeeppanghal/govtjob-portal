import Link from "next/link";
import { Landmark, Award, FileText, CheckCircle2, Search, Briefcase, FileSignature, ArrowRight, Activity } from "lucide-react";
import { supabase } from "../lib/supabase";
import NotificationCard from "../components/NotificationCard";
import FilterBar from "../components/FilterBar";
import { redirect } from "next/navigation";
import ViewTracker from "../components/ViewTracker";

// Define interface for Page props
interface PageProps {
  searchParams: Promise<{
    qualification?: string;
    state?: string;
    category?: string;
    sector?: string;
    search?: string;
  }>;
}

export default async function Home({ searchParams }: PageProps) {
  const params = await searchParams;
  const selectedQual = params.qualification || "";
  const selectedState = params.state || "";
  const selectedCat = params.category || "";
  const selectedSector = params.sector || "";
  const searchQuery = params.search || "";

  // Perform search action if submitted via a simple HTML form
  async function searchAction(formData: FormData) {
    "use server";
    const q = formData.get("q") as string;
    redirect(q ? `/?search=${encodeURIComponent(q)}` : "/");
  }

  // Build Supabase Query
  let query = supabase
    .from("notifications")
    .select("*")
    .eq("status", "published")
    .order("created_at", { ascending: false });

  if (selectedCat) {
    query = query.eq("category", selectedCat);
  }
  if (selectedQual) {
    query = query.contains("qualifications", [selectedQual]);
  }
  if (selectedState) {
    query = query.contains("states", [selectedState]);
  }
  if (selectedSector) {
    query = query.eq("sector", selectedSector);
  }
  if (searchQuery) {
    query = query.ilike("article_title", `%${searchQuery}%`);
  }

  // Limit notifications to latest 15 items for better page volume
  const { data: notifications, error } = await query.limit(15);

  // Fetch count stats for dashboard counters (Jobs, Results, Admit Cards, Yojanas)
  const { count: totalJobs } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("category", "Job")
    .eq("status", "published");

  const { count: totalResults } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("category", "Result")
    .eq("status", "published");

  const { count: totalAdmitCards } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("category", "Admit Card")
    .eq("status", "published");

  const { count: totalYojanas } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("category", "Sarkari Yojana")
    .eq("status", "published");

  return (
    <div className="space-y-10 pb-20 bg-slate-950/20">
      <ViewTracker slug="homepage" />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden py-24 px-4 text-center bg-gradient-to-b from-slate-950 via-[#070a13] to-[#030712] border-b border-slate-900/60">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-emerald-500/10 rounded-full blur-[130px] pointer-events-none" />
        <div className="absolute top-1/3 left-1/3 w-[350px] h-[180px] bg-indigo-500/10 rounded-full blur-[110px] pointer-events-none" />

        <div className="max-w-4xl mx-auto space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 tracking-wide uppercase">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Live Radar: Verified Government Notifications
          </div>
          
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent leading-none">
            Find Official Jobs & Yojana Notifications
          </h1>
          <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto font-medium">
            Get instant, verified updates direct from state Gazettes, boards, and ministries. Our loop engines crawl and extract files every 1 minute.
          </p>

          {/* Search Bar */}
          <form action={searchAction} className="max-w-2xl mx-auto mt-8 flex gap-2">
            <div className="relative flex-grow">
              <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-500" />
              <input
                type="text"
                name="q"
                defaultValue={searchQuery}
                placeholder="Search departments, boards, exam results (e.g. UPSC, SBI, State boards)..."
                className="w-full bg-slate-900/40 border border-slate-800 focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/25 rounded-xl py-3 pl-12 pr-4 text-slate-100 placeholder-slate-500 outline-none transition duration-200 shadow-2xl"
              />
            </div>
            <button
              type="submit"
              className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold px-6 rounded-xl transition duration-200 shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 hover:scale-[1.01] flex items-center gap-1 cursor-pointer"
            >
              Search
            </button>
          </form>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto mt-12 pt-8 border-t border-slate-900/60">
            <div className="p-4 bg-slate-900/20 rounded-xl border border-slate-800/60 hover:border-slate-800 hover:scale-[1.02] transition duration-200">
              <span className="block text-3xl font-extrabold text-emerald-400">{totalJobs || 0}</span>
              <span className="text-xs text-slate-500 uppercase tracking-widest font-bold">Active Jobs</span>
            </div>
            <div className="p-4 bg-slate-900/20 rounded-xl border border-slate-800/60 hover:border-slate-800 hover:scale-[1.02] transition duration-200">
              <span className="block text-3xl font-extrabold text-indigo-400">{totalResults || 0}</span>
              <span className="text-xs text-slate-500 uppercase tracking-widest font-bold">Exam Results</span>
            </div>
            <div className="p-4 bg-slate-900/20 rounded-xl border border-slate-800/60 hover:border-slate-800 hover:scale-[1.02] transition duration-200">
              <span className="block text-3xl font-extrabold text-amber-400">{totalAdmitCards || 0}</span>
              <span className="text-xs text-slate-500 uppercase tracking-widest font-bold">Admit Cards</span>
            </div>
            <div className="p-4 bg-slate-900/20 rounded-xl border border-slate-800/60 hover:border-slate-800 hover:scale-[1.02] transition duration-200">
              <span className="block text-3xl font-extrabold text-pink-400">{totalYojanas || 0}</span>
              <span className="text-xs text-slate-500 uppercase tracking-widest font-bold">Govt Yojana</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content (Filters + Results) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Full width filter bar for size flexibility and visibility */}
        <FilterBar
          selectedQualification={selectedQual}
          selectedState={selectedState}
          selectedCategory={selectedCat}
          selectedSector={selectedSector}
          onFilterChange={async (filters) => {
            "use server";
            const queryParams = new URLSearchParams();
            if (filters.qualification) queryParams.set("qualification", filters.qualification);
            if (filters.state) queryParams.set("state", filters.state);
            if (filters.category) queryParams.set("category", filters.category);
            if (filters.sector) queryParams.set("sector", filters.sector);
            if (searchQuery) queryParams.set("search", searchQuery);
            
            redirect(`/?${queryParams.toString()}`);
          }}
        />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Column (Quick links and status info card) */}
          <div className="lg:col-span-1 space-y-6">
            <div className="sticky top-20 space-y-6">
              {/* Quick Shortcuts */}
              <div className="bg-slate-900/20 border border-slate-800/80 rounded-2xl p-5 space-y-4 backdrop-blur-md">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 border-b border-slate-800/60 pb-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                  Quick Shortcuts
                </h3>
                <div className="flex flex-col gap-2 text-sm text-slate-300">
                  <Link href="/jobs" className="hover:text-emerald-400 hover:translate-x-1.5 flex justify-between items-center group transition duration-200 py-2 border-b border-slate-800/20">
                    Latest Jobs <ArrowRight className="h-4 w-4 text-slate-650 group-hover:text-emerald-400 transition" />
                  </Link>
                  <Link href="/yojana" className="hover:text-pink-400 hover:translate-x-1.5 flex justify-between items-center group transition duration-200 py-2 border-b border-slate-800/20">
                    Sarkari Yojana <ArrowRight className="h-4 w-4 text-slate-650 group-hover:text-pink-400 transition" />
                  </Link>
                  <Link href="/results" className="hover:text-indigo-400 hover:translate-x-1.5 flex justify-between items-center group transition duration-200 py-2 border-b border-slate-800/20">
                    Latest Results <ArrowRight className="h-4 w-4 text-slate-650 group-hover:text-indigo-400 transition" />
                  </Link>
                  <Link href="/admit-cards" className="hover:text-amber-400 hover:translate-x-1.5 flex justify-between items-center group transition duration-200 py-2 border-b border-slate-800/20">
                    Admit Cards <ArrowRight className="h-4 w-4 text-slate-650 group-hover:text-amber-400 transition" />
                  </Link>
                  <Link href="/answer-keys" className="hover:text-purple-400 hover:translate-x-1.5 flex justify-between items-center group transition duration-200 py-2">
                    Answer Keys <ArrowRight className="h-4 w-4 text-slate-650 group-hover:text-purple-400 transition" />
                  </Link>
                </div>
              </div>

              {/* Informative Disclaimer Widget */}
              <div className="bg-slate-900/15 border border-slate-800/55 rounded-2xl p-5 space-y-3.5 backdrop-blur-md">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                  <Activity className="h-4 w-4 text-emerald-400 animate-pulse" />
                  Live Daemon Info
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Our system crawls RSS aggregators and schedules LLM key rotation to extract verified data automatically every minute.
                </p>
                <div className="text-[10px] bg-slate-950 border border-slate-800/80 rounded-lg p-2.5 text-slate-500 font-semibold flex items-center justify-between">
                  <span>📡 Active Node</span>
                  <span className="text-emerald-400 font-bold uppercase tracking-widest text-[9px]">100% ONLINE</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (Results) */}
          <div className="lg:col-span-3 space-y-6">
            <div className="flex items-center justify-between pb-2 border-b border-slate-900/60">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-100">
                  {searchQuery ? `Search Results for "${searchQuery}"` : "Latest Official Feeds"}
                </h2>
                <p className="text-xs text-slate-500">
                  Updated from employment bulletins.
                </p>
              </div>
              <span className="text-xs bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-slate-400 font-bold">
                {notifications ? notifications.length : 0} items displayed
              </span>
            </div>

            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                Failed to load notifications from database. Check configuration.
              </div>
            )}

            {notifications && notifications.length === 0 ? (
              <div className="text-center py-20 bg-slate-900/5 border border-dashed border-slate-800 rounded-xl p-8">
                <FileSignature className="h-12 w-12 text-slate-700 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-slate-300">No Notifications Found</h3>
                <p className="text-sm text-slate-500 max-w-md mx-auto mt-2">
                  We couldn't find any active notifications matching your search or filters. Try resetting the filters or broadening your terms.
                </p>
                <Link
                  href="/"
                  className="inline-block mt-6 px-6 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-sm font-semibold rounded-lg transition"
                >
                  Clear Filters
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {notifications &&
                  notifications.map((item: any) => (
                    <NotificationCard key={item.id} notification={item} />
                  ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
