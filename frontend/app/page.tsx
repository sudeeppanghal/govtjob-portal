import Link from "next/link";
import { Train, Award, CheckCircle2, FileText, Briefcase, Send, Search, CheckCircle, ArrowRight, FileDown } from "lucide-react";
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

  // Perform search action
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

  // Fetch notifications
  const { data: notifications, error } = await query.limit(12);

  // Fetch latest 5 admit cards for the bottom list
  const { data: recentAdmitCards } = await supabase
    .from("notifications")
    .select("article_title, slug, created_at")
    .eq("status", "published")
    .eq("category", "Admit Card")
    .order("created_at", { ascending: false })
    .limit(5);

  const categoryCards = [
    { label: "Admit Card", desc: "Download Admit Card", href: "/admit-cards", icon: Train, color: "text-blue-600 bg-blue-50" },
    { label: "Result", desc: "Check Exam Results", href: "/results", icon: Award, color: "text-emerald-600 bg-emerald-50" },
    { label: "Answer Key", desc: "View Answer Keys", href: "/answer-keys", icon: CheckCircle2, color: "text-purple-600 bg-purple-50" },
    { label: "Syllabus", desc: "Download Syllabus", href: "/jobs?search=syllabus", icon: FileText, color: "text-amber-600 bg-amber-50" },
    { label: "Jobs", desc: "Latest Job Notifications", href: "/jobs", icon: Briefcase, color: "text-rose-600 bg-rose-50" },
    { label: "Contact Us", desc: "Get in Touch", href: "/contact", icon: Send, color: "text-teal-600 bg-teal-50" }
  ];

  const trendingSearches = [
    { label: "RRB NTPC Admit Card", query: "RRB NTPC" },
    { label: "RRB Group D Result", query: "Group D" },
    { label: "RRB ALP Admit Card", query: "RRB ALP" },
    { label: "RRB JE Result", query: "RRB JE" },
    { label: "RRB Technician", query: "Technician" }
  ];

  return (
    <div className="space-y-12 pb-20 bg-slate-50/50">
      <ViewTracker slug="homepage" />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 px-4 bg-gradient-to-b from-blue-50/40 via-white to-transparent border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Hero Left Column */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 border border-blue-100 text-blue-600">
              Welcome to Railway Admit Card
            </div>
            
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 leading-tight">
              Get Latest Railway <span className="text-blue-600">Admit Cards, Results</span> & Job Updates
            </h1>
            
            <p className="text-sm sm:text-base text-slate-500 max-w-xl leading-relaxed">
              Find and download admit cards, results, answer keys and get latest updates for all Railway Recruitment Board (RRB) exams.
            </p>

            {/* Search Bar */}
            <form action={searchAction} className="max-w-2xl mt-8 flex gap-2">
              <div className="relative flex-grow shadow-sm">
                <Search className="absolute left-4 top-3.5 h-4.5 w-4.5 text-slate-400" />
                <input
                  type="text"
                  name="q"
                  defaultValue={searchQuery}
                  placeholder="Search Admit Card, Results, Jobs..."
                  className="w-full bg-white border border-slate-200/90 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/25 rounded-2xl py-3 pl-12 pr-4 text-slate-800 placeholder-slate-400 outline-none transition"
                />
              </div>
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-7 rounded-2xl transition shadow-md shadow-blue-500/10 hover:shadow-blue-500/20 flex items-center gap-1 cursor-pointer"
              >
                Search
              </button>
            </form>

            {/* Trending Searches */}
            <div className="flex flex-wrap items-center gap-2 mt-4 pt-1">
              <span className="text-xs text-slate-400 font-semibold">Trending Searches:</span>
              {trendingSearches.map((search, idx) => (
                <Link
                  key={idx}
                  href={`/?search=${encodeURIComponent(search.query)}`}
                  className="px-3 py-1 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 rounded-lg text-xs font-semibold shadow-xs transition"
                >
                  {search.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Hero Right Column (Sleek Train Image) */}
          <div className="lg:col-span-5 flex justify-center">
            <img
              src="/train_hero.png"
              alt="Railway Train"
              className="rounded-3xl shadow-xl border border-slate-200/50 hover:scale-[1.01] transition duration-300 w-full max-w-md lg:max-w-full"
            />
          </div>
        </div>
      </section>

      {/* Main Container */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Category Navigation Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categoryCards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <Link
                key={idx}
                href={card.href}
                className="group bg-white border border-slate-200/80 rounded-2xl p-4.5 text-center flex flex-col items-center justify-center hover:border-blue-200 hover:shadow-md transition duration-350"
              >
                <div className={`p-3 rounded-2xl ${card.color} group-hover:scale-110 transition duration-300`}>
                  <Icon className="h-5.5 w-5.5" />
                </div>
                <h3 className="text-sm font-bold text-slate-800 mt-3 group-hover:text-blue-600 transition">
                  {card.label}
                </h3>
                <span className="text-[11px] text-slate-400 mt-1">
                  {card.desc}
                </span>
              </Link>
            );
          })}
        </div>

        {/* Filter bar (neatly positioned just above latest updates grid) */}
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

        {/* Latest Updates Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              {searchQuery ? `Search Results for "${searchQuery}"` : "Latest Updates"}
            </h2>
            <Link href="/jobs" className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1">
              <span>View All Updates</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
              Failed to load notifications from database. Check configuration.
            </div>
          )}

          {notifications && notifications.length === 0 ? (
            <div className="text-center py-20 bg-white border border-dashed border-slate-200 rounded-2xl p-8">
              <Train className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-base font-bold text-slate-700">No Updates Found</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto mt-2">
                We couldn't find any active notifications matching your search or filters. Try resetting the filters or broadening your terms.
              </p>
              <Link
                href="/"
                className="inline-block mt-5 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition shadow-xs"
              >
                Clear Filters
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {notifications &&
                notifications.map((item: any) => (
                  <NotificationCard key={item.id} notification={item} />
                ))}
            </div>
          )}
        </div>

        {/* Bottom Section (About + Recent Admit Cards list) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-4">
          
          {/* Column 1: About Railway Admit Card (7 cols) */}
          <div className="lg:col-span-7 bg-white border border-slate-200/80 rounded-2xl p-6 space-y-5 shadow-xs">
            <div className="flex items-center gap-2.5 pb-3.5 border-b border-slate-100">
              <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                <Train className="h-4.5 w-4.5" />
              </div>
              <h3 className="text-[15px] font-extrabold text-slate-900 uppercase tracking-wider">
                About Railway Admit Card
              </h3>
            </div>
            
            <p className="text-sm text-slate-500 leading-relaxed">
              RailwayAdmitCard.online is your one-stop destination for all Railway Recruitment Board (RRB) updates. Get the latest admit cards, results, answer keys, syllabus, and job notifications all in one place. We crawl official portals 24/7 to deliver reliable, spam-free data.
            </p>

            <div className="grid grid-cols-2 gap-3 pt-2">
              {[
                "Fast Updates",
                "Accurate Information",
                "Easy Downloads",
                "100% Free"
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                  <CheckCircle className="h-4 w-4 text-blue-600 flex-shrink-0" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Column 2: Recent Admit Cards (5 cols) */}
          <div className="lg:col-span-5 bg-white border border-slate-200/80 rounded-2xl p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
              <h3 className="text-[15px] font-extrabold text-slate-900 uppercase tracking-wider">
                Recent Admit Cards
              </h3>
              <Link href="/admit-cards" className="text-xs font-bold text-blue-600 hover:text-blue-700">
                View All
              </Link>
            </div>

            <div className="flex flex-col gap-3">
              {recentAdmitCards && recentAdmitCards.length > 0 ? (
                recentAdmitCards.map((card: any, idx) => (
                  <Link
                    key={idx}
                    href={`/jobs/${card.slug}`}
                    className="flex items-center justify-between gap-3 text-xs group py-1.5 hover:text-blue-600 transition"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <FileDown className="h-4 w-4 text-blue-600 flex-shrink-0" />
                      <span className="font-semibold text-slate-700 group-hover:text-blue-600 transition truncate">
                        {card.article_title}
                      </span>
                    </div>
                    <span className="flex-shrink-0 text-[10px] bg-slate-100 text-slate-500 font-semibold px-2 py-0.5 rounded uppercase tracking-wider">
                      {new Date(card.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                    </span>
                  </Link>
                ))
              ) : (
                <span className="text-xs text-slate-400 py-4 text-center">No recent admit cards found.</span>
              )}
            </div>
          </div>

        </div>

      </section>
    </div>
  );
}
