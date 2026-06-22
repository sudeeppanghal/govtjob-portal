import { supabase } from "../../lib/supabase";

export const revalidate = 600; // Cache for 10 minutes

export async function GET() {
  const baseUrl = "https://railwayadmitcard.online";

  // Fetch 20 latest published notices
  const { data: articles } = await supabase
    .from("notifications")
    .select("slug, article_title, meta_description, category, created_at")
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(20);

  const rssItems: string[] = [];

  if (articles) {
    articles.forEach((item) => {
      const isYojana = ["sarkari yojana", "scholarship"].includes(item.category.toLowerCase());
      const path = isYojana ? `/yojana/${item.slug}` : `/jobs/${item.slug}`;
      const pubDate = new Date(item.created_at).toUTCString();

      rssItems.push(`
      <item>
        <title><![CDATA[${item.article_title}]]></title>
        <link>${baseUrl}${path}</link>
        <guid>${baseUrl}${path}</guid>
        <pubDate>${pubDate}</pubDate>
        <description><![CDATA[${item.meta_description}]]></description>
        <category>${item.category}</category>
      </item>
      `);
    });
  }

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
  <rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
    <channel>
      <title>Sarkari Govt Job - Live Notifications Feed</title>
      <link>${baseUrl}</link>
      <description>Real-time, automated updates for government recruitments, yojanas, admit cards, and results.</description>
      <language>en-IN</language>
      <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
      <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml" />
      ${rssItems.join("\n")}
    </channel>
  </rss>
  `;

  return new Response(rss.trim(), {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=600, stale-while-revalidate=60"
    }
  });
}
