import { headers } from "next/headers";
import { supabase } from "./supabase";
import crypto from "crypto";

/**
 * Tracks a page view asynchronously, logging slug, referrer source, and hashed IP.
 */
export async function trackPageView(slug: string) {
  try {
    const headersList = await headers();
    const userAgent = headersList.get("user-agent") || "";
    const rawReferrer = headersList.get("referer") || "";
    const ip = headersList.get("x-forwarded-for") || headersList.get("x-real-ip") || "127.0.0.1";
    
    // Hash IP address for privacy/GDPR compliance
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
          referrer = url.hostname; // E.g. twitter.com
        }
      } catch {
        referrer = "Other";
      }
    }

    // Insert asynchronously into Supabase
    await supabase.from("page_views").insert({
      slug,
      referrer,
      user_agent: userAgent.slice(0, 500), // Truncate user agent if too long
      ip_hash: ipHash
    });
  } catch (err) {
    console.error("Failed to record page view:", err);
  }
}
