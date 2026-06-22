import { NextRequest, NextResponse } from "next/server";
import { supabase } from "../../../lib/supabase";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const { slug } = await req.json();
    if (!slug) {
      return NextResponse.json({ error: "Missing slug parameter" }, { status: 400 });
    }

    // Exclude logged-in administrator visits from traffic statistics
    const isAdmin = req.cookies.get("admin_session")?.value === "authenticated";
    if (isAdmin) {
      return NextResponse.json({ success: true, message: "Admin visit excluded from traffic tracking" });
    }

    const userAgent = req.headers.get("user-agent") || "";
    const rawReferrer = req.headers.get("referer") || "";
    
    // Attempt to parse client IP
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "127.0.0.1";
    // Hash IP address with SHA-256 for user privacy compliance
    const ipHash = crypto.createHash("sha256").update(ip).digest("hex");
    
    // Categorize referrer source
    let referrer = "Direct";
    if (rawReferrer) {
      try {
        const url = new URL(rawReferrer);
        const host = url.hostname.toLowerCase();
        if (host.includes("google")) {
          referrer = "Google Search";
        } else if (host.includes("t.me") || host.includes("telegram")) {
          referrer = "Telegram";
        } else if (host.includes("wa.me") || host.includes("whatsapp")) {
          referrer = "WhatsApp";
        } else if (host.includes("youtube")) {
          referrer = "YouTube";
        } else if (host.includes("facebook") || host.includes("fb.me")) {
          referrer = "Facebook";
        } else {
          referrer = url.hostname; // E.g., twitter.com
        }
      } catch {
        referrer = "Other";
      }
    }

    // Insert view record into Supabase page_views table
    const { error } = await supabase.from("page_views").insert({
      slug,
      referrer,
      user_agent: userAgent.slice(0, 500), // Slice to fit column sizes
      ip_hash: ipHash
    });

    if (error) {
      console.error("Supabase page view record error:", error.message);
      // We do not fail the API response if insertion fails due to RLS or DB hiccups
      return NextResponse.json({ success: false, warning: error.message });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Views API exception:", err);
    return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 });
  }
}
