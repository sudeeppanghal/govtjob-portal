import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { supabase } from "../../../lib/supabase";

export const runtime = "edge";

let cachedFontData: ArrayBuffer | null = null;
let cachedEmblemBase64: string | null = null;
let cachedPhotoBase64: string | null = null;

async function getFontData(origin: string) {
  if (cachedFontData) return cachedFontData;
  
  try {
    const fontUrl = `${origin}/fonts/Khand-Bold.ttf`;
    const res = await fetch(fontUrl);
    if (res.ok) {
      cachedFontData = await res.arrayBuffer();
      return cachedFontData;
    }
  } catch (err) {
    console.warn("Local font fetch failed, trying fallback:", err);
  }

  const fallbackRes = await fetch("https://github.com/google/fonts/raw/main/ofl/khand/Khand-Bold.ttf");
  cachedFontData = await fallbackRes.arrayBuffer();
  return cachedFontData;
}

async function getEmblemData(origin: string) {
  if (cachedEmblemBase64) return cachedEmblemBase64;
  
  try {
    const emblemUrl = `${origin}/emblem.png`;
    const res = await fetch(emblemUrl);
    if (res.ok) {
      const buffer = await res.arrayBuffer();
      cachedEmblemBase64 = `data:image/png;base64,${Buffer.from(buffer).toString("base64")}`;
      return cachedEmblemBase64;
    }
  } catch (err) {
    console.warn("Local emblem fetch failed, trying fallback:", err);
  }

  try {
    const res = await fetch("https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Emblem_of_India.svg/250px-Emblem_of_India.svg.png", {
      headers: { "User-Agent": "Mozilla/5.0" }
    });
    if (res.ok) {
      const buffer = await res.arrayBuffer();
      cachedEmblemBase64 = `data:image/png;base64,${Buffer.from(buffer).toString("base64")}`;
      return cachedEmblemBase64;
    }
  } catch (err) {
    console.error("Emblem fallback download failed:", err);
  }
  return "";
}

async function getPhotoData(origin: string) {
  if (cachedPhotoBase64) return cachedPhotoBase64;
  
  try {
    const photoUrl = `${origin}/passport_photo.png`;
    const res = await fetch(photoUrl);
    if (res.ok) {
      const buffer = await res.arrayBuffer();
      cachedPhotoBase64 = `data:image/png;base64,${Buffer.from(buffer).toString("base64")}`;
      return cachedPhotoBase64;
    }
  } catch (err) {
    console.warn("Local photo fetch failed:", err);
  }
  return "";
}

function extractHindiTitle(fullTitle: string, category: string, source: string): { title: string; year: string } {
  const parenMatch = fullTitle.match(/\(([^)]+)\)\s*$/);
  let extracted = "";
  if (parenMatch) {
    const candidate = parenMatch[1].trim();
    if (/[\u0900-\u097F]/.test(candidate)) {
      const lower = candidate.toLowerCase();
      if (lower !== "\u0938\u0930\u0915\u093e\u0930\u0940 \u092f\u094b\u091c\u0928\u093e" && lower !== "\u0938\u094d\u0915\u0949\u0932\u0930\u0936\u093f\u092a" && lower !== "\u0938\u092c\u0938\u0947 \u092c\u0947\u0938\u094d\u091f \u1f525" && lower !== "\u0938\u0930\u0915\u093e\u0930\u0940 \u0928\u094c\u0915\u0930\u0940 \u092d\u0930\u094d\u0924\u0940") {
        extracted = candidate;
      }
    }
  }

  if (!extracted) {
    const devanagariMatches = fullTitle.match(/[\u0900-\u097F][\u0900-\u097F\s\d\u0966-\u096f\-:|\u2014,()]+/g);
    if (devanagariMatches) {
      const longest = devanagariMatches.reduce((a, b) => a.length > b.length ? a : b, "");
      if (longest.trim().length > 5) {
        extracted = longest.trim();
      }
    }
  }

  if (!extracted) {
    const cleanSource = source.replace(/blog|feed/gi, "").trim();
    const catLower = category.toLowerCase();
    if (catLower.includes("job")) {
      extracted = `${cleanSource} \u0938\u0930\u0915\u093e\u0930\u0940 \u092d\u0930\u094d\u0924\u0940`;
    } else if (catLower.includes("yojana")) {
      extracted = `${cleanSource} \u0938\u0930\u0915\u093e\u0930\u0940 \u092f\u094b\u091c\u0928\u093e`;
    } else if (catLower.includes("admit")) {
      extracted = `${cleanSource} \u090f\u0921\u092e\u093f\u091f \u0915\u093e\u0930\u094d\u0921`;
    } else if (catLower.includes("result")) {
      extracted = `${cleanSource} \u092a\u0930\u0940\u0915\u094d\u0937\u093e \u092a\u0930\u093f\u0923\u093e\u092e`;
    } else if (catLower.includes("key")) {
      extracted = `${cleanSource} \u0909\u0924\u094d\u0924\u0930 \u0915\u0941\u0902\u091c\u0940`;
    } else {
      extracted = `${cleanSource} \u0928\u092f\u093e \u0905\u092a\u0921\u0947\u091f`;
    }
  }

  extracted = extracted.replace(/^[\s\-:|\u2014,]+|[\s\-:|\u2014,]+$/g, "").trim();

  const yearMatch = fullTitle.match(/\b(202[4-9]|2030)\b/);
  const year = yearMatch ? yearMatch[1] : new Date().getFullYear().toString();

  extracted = extracted.replace(new RegExp(`\\b${year}\\b`, "g"), "").trim();
  extracted = extracted.replace(/\s+/g, " ");

  return { title: extracted, year };
}

function getSubBannerText(category: string, source: string): string {
  const catLower = category.toLowerCase();
  const cleanSource = source.replace(/blog|feed/gi, "").trim();
  
  if (catLower.includes("job") || catLower === "jobs") {
    return `${cleanSource} \u0915\u0947 \u092a\u0926\u094b\u0902 \u092a\u0930 \u0938\u0940\u0927\u0940 \u092d\u0930\u094d\u0924\u0940`;
  } else if (catLower.includes("yojana")) {
    return `\u092f\u094b\u091c\u0928\u093e \u0915\u093e \u092a\u0942\u0930\u093e \u0935\u093f\u0935\u0930\u0923 \u0914\u0930 \u0911\u0928\u0932\u093e\u0907\u0928 \u0906\u0935\u0947\u0926\u0928`;
  } else if (catLower.includes("admit")) {
    return `\u092a\u0930\u0940\u0915\u094d\u0937\u093e \u0924\u093f\u0925\u093f \u0914\u0930 \u090f\u0921\u092e\u093f\u091f \u0915\u093e\u0930\u094d\u0921 \u0921\u093e\u0909\u0928\u0932\u094b\u0921 \u0932\u093f\u0902\u0915`;
  } else if (catLower.includes("result")) {
    return `\u092a\u0930\u0940\u0915\u094d\u0937\u093e \u092a\u0930\u093f\u0923\u093e\u092e \u0914\u0930 \u0915\u091f-\u0911\u092b \u092e\u0947\u0930\u093f\u091f \u0932\u093f\u0938\u094d\u091f`;
  } else if (catLower.includes("key")) {
    return `\u0906\u0927\u093f\u0915\u093e\u0930\u093f\u0915 \u0909\u0924\u094d\u0924\u0930 \u0915\u0941\u0902\u091c\u0940 \u092f\u0939\u093e\u0901 \u0938\u0947 \u0921\u093e\u0909\u0928\u0932\u094b\u0921 \u0915\u0930\u0947\u0902`;
  } else if (catLower.includes("scholarship")) {
    return `\u091b\u093e\u0924\u094d\u0930\u0935\u0943\u0924\u094d\u0924\u093f \u0915\u0947 \u0932\u093f\u090f \u0911\u0928\u0932\u093e\u0907\u0928 \u0906\u0935\u0947\u0926\u0928 \u092a\u094d\u0930\u0915\u094d\u0930\u093f\u092f\u093e`;
  }
  return `\u0928\u092f\u093e \u0928\u094b\u091f\u093f\u092b\u093f\u0915\u0947\u0936\u0928 \u0914\u0930 \u0906\u0935\u0947\u0926\u0928 \u0915\u0940 \u092a\u0942\u0930\u0940 \u091c\u093e\u0928\u0915\u093e\u0930\u0940`;
}

function translateQualifications(quals: string[], category: string): string {
  const catLower = category.toLowerCase();
  const hasValidQual = quals && quals.length > 0 && quals.some(q => {
    const l = q.toLowerCase();
    return !l.includes("check") && !l.includes("refer") && !l.includes("mention") && !l.includes("notif");
  });

  if (!hasValidQual) {
    if (catLower.includes("job") || catLower === "jobs") {
      return "10\u0935\u0940\u0902, 12\u0935\u0940\u0902, \u0917\u094d\u0930\u0947\u091c\u0941\u090f\u091f \u092a\u093e\u0938";
    }
    return "\u092f\u094b\u0917\u094d\u092f\u0924\u093e: \u0928\u094b\u091f\u093f\u092b\u093f\u0915\u0947\u0936\u0928 \u0926\u0947\u0916\u0947\u0902";
  }
  
  const map: Record<string, string> = {
    "10th": "10\u0935\u0940\u0902 \u092a\u093e\u0938",
    "12th": "12\u0935\u0940\u0902 \u092a\u093e\u0938",
    "graduate": "\u0917\u094d\u0930\u0947\u091c\u0941\u090f\u091f \u092a\u093e\u0938",
    "graduation": "\u0917\u094d\u0930\u0947\u091c\u0941\u090f\u091f \u092a\u093e\u0938",
    "iti": "ITI \u092a\u093e\u0938",
    "diploma": "\u0921\u093f\u092a\u094d\u0932\u094b\u092e\u093e \u092a\u093e\u0938",
    "post graduate": "PG \u092a\u093e\u0938",
    "pg": "PG \u092a\u093e\u0938",
    "llb": "LLB \u092a\u093e\u0938",
    "b.ed": "B.Ed \u092a\u093e\u0938",
    "b.tech": "B.Tech \u092a\u093e\u0938"
  };

  const translated = quals.map(q => {
    const clean = q.toLowerCase().replace(/pass/gi, "").trim();
    return map[clean] || q;
  });

  const unique = Array.from(new Set(translated));
  return unique.slice(0, 3).join(", ");
}

function formatHindiDate(lastDateStr: string | null): string {
  if (!lastDateStr) return "\u0906\u0935\u0947\u0926\u0928 \u0936\u0941\u0930\u0942 - \u091c\u0932\u094d\u0926 \u0915\u0930\u0947\u0902";

  try {
    const date = new Date(lastDateStr);
    if (isNaN(date.getTime())) return "\u0906\u0935\u0947\u0926\u0928 \u0936\u0941\u0930\u0942 - \u091c\u0932\u094d\u0926 \u0915\u0930\u0947\u0902";

    const months = [
      "\u091c\u0928\u0935\u0930\u0940", "\u092b\u0930\u0935\u0930\u0940", "\u092e\u093e\u0930\u094d\u091a", "\u0905\u092a\u094d\u0930\u0948\u0932", "\u092e\u0908", "\u091c\u0942\u0928",
      "\u091c\u0941\u0932\u093e\u0908", "\u0905\u0917\u0938\u094d\u0924", "\u0938\u093f\u0924\u092e\u094d\u092c\u0930", "\u0905\u0915\u094d\u091f\u0942\u092c\u0930", "\u0928\u0935\u092e\u094d\u092c\u0930", "\u0926\u093f\u0938\u092e\u094d\u092c\u0930"
    ];

    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    return `\u0905\u0902\u0924\u093f\u092e \u0924\u093f\u0925\u093f - ${day} ${month} ${year}`;
  } catch (e) {
    return "\u0906\u0935\u0947\u0926\u0928 \u0936\u0941\u0930\u0942 - \u091c\u0932\u094d\u0926 \u0915\u0930\u0947\u0902";
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams, origin } = new URL(request.url);
    const slug = searchParams.get("title");
    
    let source = "GOVT JOB";
    let title = "Recruitment Notification";
    let vacancies = "";
    let qualifications = ["10th", "12th", "Graduation"];
    let lastDate: string | null = null;
    let category = "NOTIFICATION";

    if (slug) {
      const { data } = await supabase
        .from("notifications")
        .select("source_name, article_title, category, extracted_json, qualifications, last_date")
        .eq("slug", slug)
        .single();

      if (data) {
        source = data.source_name ? data.source_name.toUpperCase() : source;
        title = data.article_title ? data.article_title : title;
        category = data.category ? data.category.toUpperCase() : category;
        lastDate = data.last_date;
        
        if (data.qualifications && data.qualifications.length > 0) {
          qualifications = data.qualifications;
        }
        
        if (data.extracted_json && data.extracted_json.vacancies) {
          const vacStr = data.extracted_json.vacancies.toString();
          const digits = vacStr.match(/\b\d+[\d,+]*/);
          if (digits) {
            vacancies = digits[0];
          }
        }
      }
    }

    const parsed = extractHindiTitle(title, category, source);
    const subBannerText = getSubBannerText(category, source);
    const eligibilityText = translateQualifications(qualifications, category);
    const dateText = formatHindiDate(lastDate);
    const vacanciesText = vacancies ? `\u092a\u0926 - ${vacancies}` : "\u092c\u095c\u0940 \u092d\u0930\u094d\u0924\u0940";

    const fontData = await getFontData(origin);
    const emblemBase64 = await getEmblemData(origin);
    const photoBase64 = await getPhotoData(origin);

    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            backgroundColor: "#FFFF00",
            fontFamily: "Khand",
            position: "relative",
            overflow: "hidden"
          }}
        >
          <div
            style={{
              height: "120px",
              width: "100%",
              backgroundColor: "#00E5FF",
              display: "flex",
              alignItems: "center",
              borderBottom: "4px solid #000000",
              paddingLeft: "30px",
              paddingRight: "30px",
              position: "relative"
            }}
          >
            {emblemBase64 && (
              <img
                src={emblemBase64}
                style={{
                  width: "70px",
                  height: "100px",
                  marginRight: "25px",
                  objectFit: "contain",
                  display: "flex"
                }}
              />
            )}

            <div
              style={{
                display: "flex",
                flexGrow: 1,
                alignItems: "center",
                justifyContent: "flex-start",
                paddingBottom: "5px"
              }}
            >
              <span style={{ fontSize: "74px", fontWeight: "900", color: "#000000", letterSpacing: "1px" }}>
                {parsed.title}
              </span>
              <span style={{ fontSize: "74px", fontWeight: "900", color: "#FF0000", marginLeft: "25px" }}>
                {parsed.year}
              </span>
            </div>
          </div>

          <div
            style={{
              height: "85px",
              width: "100%",
              backgroundColor: "#2B2D2F",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderBottom: "4px solid #000000"
            }}
          >
            <span style={{ fontSize: "48px", fontWeight: "800", color: "#FFFFFF", letterSpacing: "1px" }}>
              {subBannerText}
            </span>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "row",
              width: "100%",
              height: "425px",
              padding: "25px 40px",
              justifyContent: "space-between",
              alignItems: "center"
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                width: "700px",
                height: "340px",
                justifyContent: "space-between"
              }}
            >
              <div
                style={{
                  display: "flex",
                  backgroundColor: "#FFFFFF",
                  border: "4px solid #000000",
                  borderRadius: "32px",
                  padding: "6px 50px",
                  alignSelf: "flex-start",
                  boxShadow: "6px 6px 0px #000000"
                }}
              >
                <span style={{ fontSize: "56px", fontWeight: "900", color: "#FF0000", lineHeight: "1.1" }}>
                  {vacanciesText}
                </span>
              </div>

              <div
                style={{
                  display: "flex",
                  alignSelf: "flex-start",
                  border: "4px double #00C853",
                  borderRadius: "10px",
                  padding: "8px 30px",
                  backgroundColor: "#FFFF00",
                  boxShadow: "5px 5px 0px #000000"
                }}
              >
                <span style={{ fontSize: "48px", fontWeight: "900", color: "#000000", lineHeight: "1.1" }}>
                  {eligibilityText}
                </span>
              </div>

              <div
                style={{
                  display: "flex",
                  alignSelf: "flex-start",
                  backgroundColor: "#DCFCE7",
                  border: "3px solid #22C55E",
                  borderRadius: "32px",
                  padding: "8px 40px",
                  boxShadow: "5px 5px 0px #000000"
                }}
              >
                <span style={{ fontSize: "38px", fontWeight: "800", color: "#991B1B", lineHeight: "1.1" }}>
                  {dateText}
                </span>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                width: "380px",
                justifyContent: "center",
                alignItems: "center"
              }}
            >
              <div
                style={{
                  width: "320px",
                  height: "350px",
                  backgroundColor: "#FFFFFF",
                  border: "4px solid #000000",
                  borderRadius: "16px",
                  boxShadow: "10px 10px 0px #000000",
                  display: "flex",
                  flexDirection: "column",
                  position: "relative",
                  overflow: "hidden"
                }}
              >
                <div
                  style={{
                    backgroundColor: "#FF0000",
                    height: "60px",
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderBottom: "4px solid #000000"
                  }}
                >
                  <span style={{ fontSize: "34px", fontWeight: "900", color: "#FFFFFF" }}>
                    Notification
                  </span>
                </div>

                <div
                  style={{
                    padding: "15px 15px",
                    display: "flex",
                    flexDirection: "column",
                    flexGrow: 1
                  }}
                >
                  <span
                    style={{
                      fontSize: "18px",
                      fontWeight: "800",
                      color: "#000000",
                      textAlign: "center",
                      marginBottom: "15px",
                      borderBottom: "2px solid #E2E8F0",
                      paddingBottom: "5px"
                    }}
                  >
                    \u0939\u0947\u0924\u0941 \u0906\u0935\u0947\u0926\u0928-\u092a\u0924\u094d\u0930
                  </span>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <div style={{ width: "120px", height: "4px", backgroundColor: "#CBD5E1" }} />
                    <div style={{ width: "150px", height: "4px", backgroundColor: "#CBD5E1" }} />
                    <div style={{ width: "130px", height: "4px", backgroundColor: "#CBD5E1" }} />
                    <div style={{ width: "100px", height: "4px", backgroundColor: "#CBD5E1" }} />
                    <div style={{ width: "140px", height: "4px", backgroundColor: "#CBD5E1" }} />
                  </div>

                  {photoBase64 && (
                    <div
                      style={{
                        position: "absolute",
                        bottom: "20px",
                        right: "20px",
                        width: "84px",
                        height: "105px",
                        border: "3px solid #000000",
                        backgroundColor: "#F1F5F9",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        overflow: "hidden"
                      }}
                    >
                      <img
                        src={photoBase64}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover"
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        fonts: [
          {
            name: "Khand",
            data: fontData,
            style: "normal",
            weight: 700
          }
        ]
      }
    );
  } catch (error) {
    console.error("OG Image generation failed:", error);
    return new Response("Failed to generate image", { status: 500 });
  }
}
