import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");

  // Validate the cron secret to prevent unauthorized triggers
  const expectedSecret = process.env.CRON_SECRET;
  if (!expectedSecret || secret !== expectedSecret) {
    return NextResponse.json(
      { error: "Unauthorized: Invalid or missing cron secret." },
      { status: 401 }
    );
  }

  const githubToken = process.env.GITHUB_PAT || process.env.GITHUB_TOKEN;
  const owner = process.env.GITHUB_OWNER;
  const repo = process.env.GITHUB_REPO;
  const workflowId = "scrape_every_10_min.yml";

  if (!githubToken || !owner || !repo) {
    const missing = [];
    if (!githubToken) missing.push("GITHUB_PAT");
    if (!owner) missing.push("GITHUB_OWNER");
    if (!repo) missing.push("GITHUB_REPO");
    return NextResponse.json(
      { error: `GitHub configuration missing: ${missing.join(", ")} is undefined.` },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/actions/workflows/${workflowId}/dispatches`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${githubToken}`,
          Accept: "application/vnd.github+json",
          "Content-Type": "application/json",
          "User-Agent": "Govtjob-Portal-App"
        },
        body: JSON.stringify({ ref: "main" })
      }
    );

    if (response.ok) {
      return NextResponse.json({ success: true, message: "Scraper workflow dispatched successfully!" });
    } else {
      const errText = await response.text();
      return NextResponse.json(
        { error: `GitHub dispatch failed: ${errText}` },
        { status: response.status }
      );
    }
  } catch (err: any) {
    return NextResponse.json(
      { error: `Error triggering remote workflow: ${err.message}` },
      { status: 500 }
    );
  }
}
