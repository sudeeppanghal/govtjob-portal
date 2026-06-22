import { supabase } from "../../lib/supabase";
import NotificationCard from "../../components/NotificationCard";
import FilterBar from "../../components/FilterBar";
import { redirect } from "next/navigation";
import { FileText, Train } from "lucide-react";

interface PageProps {
  searchParams: Promise<{
    qualification?: string;
    state?: string;
    search?: string;
  }>;
}

export default async function AdmitCardsFeed({ searchParams }: PageProps) {
  const params = await searchParams;
  const selectedQual = params.qualification || "";
  const selectedState = params.state || "";
  const searchQuery = params.search || "";

  let query = supabase
    .from("notifications")
    .select("*")
    .eq("category", "Admit Card")
    .eq("status", "published")
    .order("created_at", { ascending: false });

  if (selectedQual) {
    query = query.contains("qualifications", [selectedQual]);
  }
  if (selectedState) {
    query = query.contains("states", [selectedState]);
  }
  if (searchQuery) {
    query = query.ilike("article_title", `%${searchQuery}%`);
  }

  const { data: notifications } = await query;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-2.5">
          <FileText className="h-8 w-8 text-blue-600" /> Exam Admit Cards
        </h1>
        <p className="text-sm text-slate-500 mt-2">
          Direct download links for e-admit cards, exam dates, and hall tickets.
        </p>
      </div>

      <FilterBar
        selectedQualification={selectedQual}
        selectedState={selectedState}
        selectedCategory="Admit Card"
        onFilterChange={async (filters) => {
          "use server";
          const queryParams = new URLSearchParams();
          if (filters.qualification) queryParams.set("qualification", filters.qualification);
          if (filters.state) queryParams.set("state", filters.state);
          if (searchQuery) queryParams.set("search", searchQuery);
          
          redirect(`/admit-cards?${queryParams.toString()}`);
        }}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {notifications && notifications.length === 0 ? (
          <div className="lg:col-span-3 text-center py-20 bg-white border border-dashed border-slate-200 rounded-2xl p-8">
            <Train className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-base font-bold text-slate-700">No Admit Cards Found</h3>
            <p className="text-xs text-slate-400 mt-2">No active admit card releases found matching filters.</p>
          </div>
        ) : (
          notifications &&
          notifications.map((item: any) => (
            <NotificationCard key={item.id} notification={item} />
          ))
        )}
      </div>
    </div>
  );
}

