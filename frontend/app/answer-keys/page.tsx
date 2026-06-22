import { supabase } from "../../lib/supabase";
import NotificationCard from "../../components/NotificationCard";
import FilterBar from "../../components/FilterBar";
import { redirect } from "next/navigation";
import { KeyRound } from "lucide-react";

interface PageProps {
  searchParams: Promise<{
    qualification?: string;
    state?: string;
    search?: string;
  }>;
}

export default async function AnswerKeysFeed({ searchParams }: PageProps) {
  const params = await searchParams;
  const selectedQual = params.qualification || "";
  const selectedState = params.state || "";
  const searchQuery = params.search || "";

  let query = supabase
    .from("notifications")
    .select("*")
    .eq("category", "Answer Key")
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
        <h1 className="text-3xl font-extrabold text-white flex items-center gap-2">
          <KeyRound className="h-8 w-8 text-purple-400" /> Exam Answer Keys
        </h1>
        <p className="text-sm text-slate-400 mt-2">
          Official question papers, tentative answer keys, and links to submit objections.
        </p>
      </div>

      <FilterBar
        selectedQualification={selectedQual}
        selectedState={selectedState}
        selectedCategory="Answer Key"
        onFilterChange={async (filters) => {
          "use server";
          const queryParams = new URLSearchParams();
          if (filters.qualification) queryParams.set("qualification", filters.qualification);
          if (filters.state) queryParams.set("state", filters.state);
          if (searchQuery) queryParams.set("search", searchQuery);
          
          redirect(`/answer-keys?${queryParams.toString()}`);
        }}
      />

      <div className="grid grid-cols-1 gap-4">
        {notifications && notifications.length === 0 ? (
          <div className="text-center py-16 bg-slate-900/10 border border-dashed border-slate-800 rounded-xl">
            <p className="text-slate-400">No recent exam answer keys found matching filters.</p>
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
