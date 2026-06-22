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

    if (slug) {
      // Fetch details from Supabase to dynamically fill the thumbnail content
      const { data } = await supabase
        .from("notifications")
        .select("source_name, article_title, extracted_json, qualifications, last_date")
        .eq("slug", slug)
        .single();

      if (data) {
        source = data.source_name ? data.source_name.toUpperCase() : source;
        title = data.article_title ? data.article_title : title;
        
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
          lastDateText = `LAST DATE: ${formattedDate.toUpperCase()}`;
        }
      }
    }

    // Clean title for rendering - truncate if too long
    const displayTitle = title.length > 50 ? `${title.slice(0, 50)}...` : title;

    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            backgroundColor: "#ffffff",
            backgroundImage: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
            padding: "40px",
            fontFamily: "sans-serif",
            position: "relative"
          }}
        >
          {/* Top Banner Row */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              width: "100%"
            }}
          >
            <div
              style={{
                fontSize: "38px",
                fontWeight: "900",
                color: "#1e3a8a",
                textTransform: "uppercase",
                letterSpacing: "1px"
              }}
            >
              {source} RECRUITMENT
            </div>
            <div
              style={{
                backgroundColor: "#1e3b8b",
                color: "#ffffff",
                padding: "8px 24px",
                borderRadius: "12px",
                fontSize: "36px",
                fontWeight: "bold",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
              }}
            >
              2026
            </div>
          </div>

          {/* Main Middle Row */}
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              marginTop: "30px",
              width: "100%",
              flexGrow: 1
            }}
          >
            {/* Left Column: Red gradient badge with vacancies count */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                flexGrow: 1,
                marginRight: "40px"
              }}
            >
              <div
                style={{
                  backgroundImage: "linear-gradient(to right, #dc2626, #b91c1c)",
                  color: "#facc15",
                  padding: "24px 40px",
                  borderRadius: "24px",
                  fontSize: "64px",
                  fontWeight: "900",
                  textAlign: "center",
                  boxShadow: "0 10px 15px -3px rgba(220, 38, 38, 0.3)",
                  border: "4px solid #ffffff",
                  textTransform: "uppercase"
                }}
              >
                {vacancies}
              </div>

              {/* Title Description */}
              <div
                style={{
                  fontSize: "24px",
                  color: "#334155",
                  fontWeight: "bold",
                  marginTop: "20px",
                  lineHeight: "1.3"
                }}
              >
                {displayTitle}
              </div>
            </div>

            {/* Right Column: Circular emblem frame (State emblem placeholder) */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                width: "220px",
                height: "220px",
                borderRadius: "50%",
                border: "8px solid #facc15",
                backgroundColor: "#ffffff",
                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                position: "relative"
              }}
            >
              {/* Ashoka Wheel SVG */}
              <svg width="120" height="120" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="50" cy="50" r="45" stroke="#1e3b8b" strokeWidth="2"/>
                <circle cx="50" cy="50" r="10" stroke="#1e3b8b" strokeWidth="2"/>
                {Array.from({ length: 24 }).map((_, i) => {
                  const angle = (i * 360) / 24;
                  const rad = (angle * Math.PI) / 180;
                  const x2 = 50 + 45 * Math.cos(rad);
                  const y2 = 50 + 45 * Math.sin(rad);
                  return (
                    <line
                      key={i}
                      x1="50"
                      y1="50"
                      x2={x2.toString()}
                      y2={y2.toString()}
                      stroke="#1e3b8b"
                      strokeWidth="1.5"
                    />
                  );
                })}
              </svg>
            </div>
          </div>

          {/* Qualifications Pills Row */}
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              gap: "16px",
              marginTop: "20px"
            }}
          >
            {qualifications.map((qual, index) => {
              const bgColors = ["#10b981", "#3b82f6", "#8b5cf6"];
              const borderColors = ["#34d399", "#60a5fa", "#a78bfa"];
              const color = bgColors[index % bgColors.length];
              const borderColor = borderColors[index % borderColors.length];
              return (
                <div
                  key={qual}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    backgroundColor: `${color}15`,
                    border: `2px solid ${borderColor}`,
                    padding: "8px 20px",
                    borderRadius: "16px",
                    fontSize: "22px",
                    fontWeight: "bold",
                    color: color
                  }}
                >
                  🎓 {qual}
                </div>
              );
            })}
          </div>

          {/* Bottom Alert Bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              backgroundImage: "linear-gradient(to right, #1e3b8b, #1d4ed8)",
              color: "#ffffff",
              padding: "16px 30px",
              borderRadius: "16px",
              marginTop: "30px",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
            }}
          >
            <div style={{ display: "flex", alignItems: "center" }}>
              <span style={{ fontSize: "28px", marginRight: "12px" }}>⏱️</span>
              <span style={{ fontSize: "24px", fontWeight: "900", letterSpacing: "0.5px" }}>
                {lastDateText}
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center" }}>
              <span style={{ fontSize: "28px", marginRight: "8px" }}>📢</span>
              <span style={{ fontSize: "18px", fontWeight: "bold" }}>VERIFIED</span>
            </div>
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
