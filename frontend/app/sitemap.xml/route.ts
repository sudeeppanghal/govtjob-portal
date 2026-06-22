import { supabase } from "../../lib/supabase";

export const revalidate = 600; // Cache for 10 minutes

export async function GET() {
  const baseUrl = "https://railwayadmitcard.online";

  // Fetch all published articles
  const { data: articles } = await supabase
    .from("notifications")
    .select("slug, updated_at, category")
    .eq("status", "published")
    .order("created_at", { ascending: false });

  const xmlEntries = [
    // Static Pages
    `
    <url>
      <loc>${baseUrl}</loc>
      <lastmod>${new Date().toISOString()}</lastmod>
      <changefreq>always</changefreq>
      <priority>1.0</priority>
    </url>
    <url>
      <loc>${baseUrl}/jobs</loc>
      <lastmod>${new Date().toISOString()}</lastmod>
      <changefreq>hourly</changefreq>
      <priority>0.9</priority>
    </url>
    <url>
      <loc>${baseUrl}/yojana</loc>
      <lastmod>${new Date().toISOString()}</lastmod>
      <changefreq>hourly</changefreq>
      <priority>0.8</priority>
    </url>
    <url>
      <loc>${baseUrl}/results</loc>
      <lastmod>${new Date().toISOString()}</lastmod>
      <changefreq>hourly</changefreq>
      <priority>0.8</priority>
    </url>
    <url>
      <loc>${baseUrl}/admit-cards</loc>
      <lastmod>${new Date().toISOString()}</lastmod>
      <changefreq>hourly</changefreq>
      <priority>0.8</priority>
    </url>
    `
  ];

  if (articles) {
    articles.forEach((item) => {
      const isYojana = ["sarkari yojana", "scholarship"].includes(item.category.toLowerCase());
      const path = isYojana ? `/yojana/${item.slug}` : `/jobs/${item.slug}`;
      const lastMod = item.updated_at ? new Date(item.updated_at).toISOString() : new Date().toISOString();
      
      xmlEntries.push(`
      <url>
        <loc>${baseUrl}${path}</loc>
        <lastmod>${lastMod}</lastmod>
        <changefreq>daily</changefreq>
        <priority>0.7</priority>
      </url>
      `);
    });
  }

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${xmlEntries.join("\n")}
  </urlset>
  `;

  return new Response(sitemap.trim(), {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=600, stale-while-revalidate=60"
    }
  });
}
