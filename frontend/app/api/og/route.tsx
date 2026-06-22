import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { supabase } from "../../../lib/supabase";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("title"); // Scraper sends slug here
    
    let source = "GOVT JOB";
    let title = "Recruitment Notification";
    let vacancies = "Latest Posts";
    let qualifications = ["10th", "12th", "Graduation"];
    let lastDateText = "Apply Online Now";
    let category = "NOTIFICATION";

    if (slug) {
      // Fetch details from Supabase to dynamically fill the thumbnail content
      const { data } = await supabase
        .from("notifications")
        .select("source_name, article_title, category, extracted_json, qualifications, last_date")
        .eq("slug", slug)
        .single();

      if (data) {
        source = data.source_name ? data.source_name.toUpperCase() : source;
        title = data.article_title ? data.article_title : title;
        category = data.category ? data.category.toUpperCase() : category;
        
        // Extract vacancies count
        if (data.extracted_json && data.extracted_json.vacancies) {
          const vacStr = data.extracted_json.vacancies.toString();
          vacancies = vacStr.toLowerCase().includes("post") ? vacStr : `${vacStr} Posts`;
        }
        
        // Extract qualifications
        if (data.qualifications && data.qualifications.length > 0) {
          qualifications = data.qualifications.slice(0, 3);
        }
        
        // Format last date
        if (data.last_date) {
          const date = new Date(data.last_date);
          const formattedDate = date.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric"
          });
          lastDateText = `Apply by: ${formattedDate}`;
        }
      }
    }

    // Clean title for rendering - truncate if too long
    const displayTitle = title.length > 70 ? `${title.slice(0, 70)}...` : title;

    // Theme color based on category
    const getCategoryColor = (cat: string) => {
      const normalCat = cat.toLowerCase();
      if (normalCat === "admit card") return "#3b82f6"; // Blue
      if (normalCat === "result") return "#10b981"; // Emerald
      if (normalCat === "answer key") return "#8b5cf6"; // Purple
      if (normalCat === "sarkari yojana") return "#ec4899"; // Pink
      return "#f43f5e"; // Rose
    };

    const accentColor = getCategoryColor(category);

    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            backgroundColor: "#030712",
            backgroundImage: "linear-gradient(135deg, #090d16 0%, #030712 100%)",
            padding: "50px 60px",
            fontFamily: "sans-serif",
            position: "relative",
            justifyContent: "space-between"
          }}
        >
          {/* Decorative Glowing Circle in top right */}
          <div
            style={{
              position: "absolute",
              top: "-150px",
              right: "-150px",
              width: "500px",
              height: "500px",
              borderRadius: "50%",
              backgroundImage: "radial-gradient(circle, rgba(37, 99, 235, 0.15) 0%, rgba(37, 99, 235, 0) 70%)",
              display: "flex"
            }}
          />

          {/* Top Navbar Row */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              width: "100%",
              zIndex: 10
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <div
                style={{
                  display: "flex",
                  padding: "10px",
                  backgroundColor: "rgba(59, 130, 246, 0.08)",
                  borderRadius: "16px",
                  border: "1px solid rgba(59, 130, 246, 0.2)"
                }}
              >
                {/* Train SVG Icon */}
                <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 3h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/>
                  <path d="M4 11h16"/>
                  <path d="M12 3v8"/>
                  <path d="M6 17l-2 4"/>
                  <path d="M18 17l2 4"/>
                </svg>
              </div>
              <span style={{ fontSize: "24px", fontWeight: "900", color: "#ffffff", letterSpacing: "0.5px" }}>
                RAILWAY ADMIT CARD
              </span>
            </div>

            <div
              style={{
                display: "flex",
                backgroundColor: "rgba(16, 185, 129, 0.08)",
                border: "1.5px solid rgba(16, 185, 129, 0.25)",
                color: "#10b981",
                padding: "8px 20px",
                borderRadius: "9999px",
                fontSize: "14px",
                fontWeight: "800",
                letterSpacing: "1.5px",
                textTransform: "uppercase"
              }}
            >
              VERIFIED OFFICIAL UPDATE
            </div>
          </div>

          {/* Middle Body Row */}
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
              flexGrow: 1,
              marginTop: "40px",
              zIndex: 10
            }}
          >
            {/* Left Content Side */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                flexGrow: 1,
                marginRight: "50px",
                maxWidth: "680px"
              }}
            >
              {/* Category Tag */}
              <div
                style={{
                  display: "flex",
                  fontSize: "15px",
                  fontWeight: "800",
                  color: accentColor,
                  letterSpacing: "2px",
                  textTransform: "uppercase",
                  marginBottom: "16px"
                }}
              >
                {category}
              </div>

              {/* Headline Title */}
              <div
                style={{
                  fontSize: "46px",
                  color: "#ffffff",
                  fontWeight: "900",
                  lineHeight: "1.25",
                  letterSpacing: "-0.5px"
                }}
              >
                {displayTitle}
              </div>

              {/* Source Tag info */}
              <div
                style={{
                  display: "flex",
                  fontSize: "16px",
                  color: "#94a3b8",
                  fontWeight: "600",
                  marginTop: "20px"
                }}
              >
                {`Department: ${source}`}
              </div>
            </div>

            {/* Right Card Panel (Stats Panel) */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                width: "360px",
                backgroundColor: "rgba(255, 255, 255, 0.02)",
                border: "1.5px solid rgba(255, 255, 255, 0.07)",
                borderRadius: "24px",
                padding: "26px",
                gap: "16px"
              }}
            >
              {/* Vacancies */}
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontSize: "12px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "6px" }}>Vacancies</span>
                <span style={{ fontSize: "26px", fontWeight: "900", color: "#facc15" }}>{vacancies}</span>
              </div>

              <div style={{ height: "1px", backgroundColor: "rgba(255, 255, 255, 0.06)", width: "100%" }} />

              {/* Qualifications */}
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontSize: "12px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "6px" }}>Eligibility</span>
                <span style={{ fontSize: "20px", fontWeight: "800", color: "#e2e8f0" }}>
                  {qualifications.join(", ")}
                </span>
              </div>

              <div style={{ height: "1px", backgroundColor: "rgba(255, 255, 255, 0.06)", width: "100%" }} />

              {/* Last Date */}
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontSize: "12px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "6px" }}>Deadline</span>
                <span style={{ fontSize: "20px", fontWeight: "850", color: "#f87171" }}>
                  {lastDateText}
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Footer Line */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              width: "100%",
              borderTop: "1px solid rgba(255, 255, 255, 0.05)",
              paddingTop: "24px",
              marginTop: "20px",
              zIndex: 10
            }}
          >
            <span style={{ fontSize: "14px", fontWeight: "500", color: "#475569" }}>
              Get verified notification alerts directly from official bulletins.
            </span>
            <span style={{ fontSize: "14px", fontWeight: "700", color: "#3b82f6" }}>
              railwayadmitcard.online
            </span>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630
      }
    );
  } catch (error) {
    console.error("OG Image generation failed:", error);
    return new Response("Failed to generate image", { status: 500 });
  }
}
