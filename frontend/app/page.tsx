import Link from "next/link";
import { Landmark, Award, FileText, CheckCircle2, Search, Briefcase, FileSignature, ArrowRight } from "lucide-react";
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
    // If Postgres full-text search is set up:
    // query = query.textSearch("fts", searchQuery);
    // Otherwise fallback to simple ilike for compatibility
    query = query.ilike("article_title", `%${searchQuery}%`);
  }

  // Limit notifications to latest 10 items for performance
  const { data: notifications, error } = await query.limit(10);

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
    <div className="space-y-12 pb-16">
      <ViewTracker slug="homepage" />
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4 text-center bg-gradient-to-b from-[#0f172a]/50 via-[#090d16] to-[#090d16] border-b border-slate-900">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[250px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 left-1/3 w-[300px] h-[150px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-4xl mx-auto space-y-6 relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-400/10 border border-emerald-400/20 text-emerald-400">
            <CheckCircle2 className="h-3.5 w-3.5" /> 100% Verified Official Sources Only
          </span>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent leading-none">
            Find Government Jobs & Schemes Instantly
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Discover verified notification details, admit cards, answer keys, results, and central/state welfare schemes. Completely automated, updated every 10 minutes.
          </p>

          {/* Search Bar */}
          <form action={searchAction} className="max-w-2xl mx-auto mt-8 flex gap-2">
            <div className="relative flex-grow">
              <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-500" />
              <input
                type="text"
                name="q"
                defaultValue={searchQuery}
                placeholder="Search jobs, departments, results, yojanas (e.g. SSC, UPSC)..."
                className="w-full bg-slate-900/90 border border-slate-800 focus:border-emerald-500 rounded-xl py-3 pl-12 pr-4 text-slate-100 placeholder-slate-500 outline-none transition shadow-2xl"
              />
            </div>
            <button
              type="submit"
              className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-semibold px-6 rounded-xl transition shadow-lg shadow-emerald-500/10 flex items-center gap-1 cursor-pointer"
            >
              Search
            </button>
          </form>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto mt-12 pt-8 border-t border-slate-800/40">
            <div className="p-4 bg-slate-900/40 rounded-xl border border-slate-850">
              <span className="block text-2xl font-bold text-emerald-400">{totalJobs || 0}</span>
              <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Active Jobs</span>
            </div>
            <div className="p-4 bg-slate-900/40 rounded-xl border border-slate-850">
              <span className="block text-2xl font-bold text-indigo-400">{totalResults || 0}</span>
              <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Declared Results</span>
            </div>
            <div className="p-4 bg-slate-900/40 rounded-xl border border-slate-850">
              <span className="block text-2xl font-bold text-amber-400">{totalAdmitCards || 0}</span>
              <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Admit Cards</span>
            </div>
            <div className="p-4 bg-slate-900/40 rounded-xl border border-slate-850">
              <span className="block text-2xl font-bold text-pink-400">{totalYojanas || 0}</span>
              <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Sarkari Yojana</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content (Filters + Results) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <div className="sticky top-20">
              {/* Custom filter wrapper that modifies URL params */}
              <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-emerald-400" /> Discover Feeds
              </h2>
              
              <FilterBar
                selectedQualification={selectedQual}
                selectedState={selectedState}
                selectedCategory={selectedCat}
                selectedSector={selectedSector}
                onFilterChange={async (filters) => {
                  "use server";
                  // Construct parameters
                  const queryParams = new URLSearchParams();
                  if (filters.qualification) queryParams.set("qualification", filters.qualification);
                  if (filters.state) queryParams.set("state", filters.state);
                  if (filters.category) queryParams.set("category", filters.category);
                  if (filters.sector) queryParams.set("sector", filters.sector);
                  if (searchQuery) queryParams.set("search", searchQuery);
                  
                  redirect(`/?${queryParams.toString()}`);
                }}
              />

              {/* Quick links card */}
              <div className="bg-[#111827]/40 border border-slate-800/80 rounded-xl p-4 space-y-3">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Quick Shortcuts</h3>
                <div className="flex flex-col gap-2 text-sm text-slate-300">
                  <Link href="/jobs" className="hover:text-emerald-400 flex justify-between items-center group">
                    Latest Jobs <ArrowRight className="h-4 w-4 text-slate-600 group-hover:text-emerald-400 transition" />
                  </Link>
                  <Link href="/yojana" className="hover:text-pink-400 flex justify-between items-center group">
                    Sarkari Yojana <ArrowRight className="h-4 w-4 text-slate-600 group-hover:text-pink-400 transition" />
                  </Link>
                  <Link href="/results" className="hover:text-indigo-400 flex justify-between items-center group">
                    Latest Results <ArrowRight className="h-4 w-4 text-slate-600 group-hover:text-indigo-400 transition" />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Results Area */}
          <div className="lg:col-span-3 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-100">
                  {searchQuery ? `Search Results for "${searchQuery}"` : "Latest Notifications"}
                </h2>
                <p className="text-xs text-slate-500">
                  Real-time updates pulled direct from Gazette bulletins.
                </p>
              </div>
              <span className="text-xs bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-slate-400 font-semibold">
                {notifications ? notifications.length : 0} items displayed
              </span>
            </div>

            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                Failed to load notifications from database. Check configuration.
              </div>
            )}

            {notifications && notifications.length === 0 ? (
              <div className="text-center py-20 bg-slate-900/10 border border-dashed border-slate-800 rounded-xl">
                <FileSignature className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-slate-300">No Notifications Found</h3>
                <p className="text-sm text-slate-500 max-w-md mx-auto mt-2">
                  We couldn't find any active notifications matching your search or filters. Try resetting the filters or broadening your terms.
                </p>
                <Link
                  href="/"
                  className="inline-block mt-6 px-6 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold rounded-lg transition"
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
