"use server";

import { supabase } from "../../lib/supabase";
import { revalidatePath } from "next/cache";

/**
 * Server Action: Toggles the publish status of a notification
 */
export async function updateStatusAction(formData: FormData) {
  const id = formData.get("id") as string;
  const currentStatus = formData.get("currentStatus") as string;

  if (!id) return;

  const newStatus = currentStatus === "published" ? "draft" : "published";

  try {
    const { error } = await supabase
      .from("notifications")
      .update({ status: newStatus })
      .eq("id", id);

    if (error) {
      console.error("Error updating status in DB:", error);
    } else {
      // Revalidate cache to reflect changes instantly on the client
      revalidatePath("/");
      revalidatePath("/jobs");
      revalidatePath("/yojana");
      revalidatePath("/results");
      revalidatePath("/admit-cards");
      revalidatePath("/admin");
    }
  } catch (err) {
    console.error("Failed to run status change action:", err);
  }
}

/**
 * Server Action: Dispatches a GitHub Workflow event to trigger scrapers manually
 */
export async function triggerCrawlAction() {
  const githubToken = process.env.GITHUB_PAT || process.env.GITHUB_TOKEN;
  const owner = process.env.GITHUB_OWNER; // e.g. "github-username"
  const repo = process.env.GITHUB_REPO;   // e.g. "govtjob-portal"
  const workflowId = "scrape_every_10_min.yml";

  if (!githubToken || !owner || !repo) {
    console.warn("GitHub configuration missing. Cannot trigger crawler remotely.");
    
    // Fallback: insert a simulated running log entry in the crawls table so the admin sees the button clicked
    try {
      await supabase.from("crawls").insert({
        status: "success",
        new_notices: 0,
        tokens_used: 0,
        error_log: "Trigger simulated locally. Configure GITHUB_PAT, GITHUB_OWNER, and GITHUB_REPO env variables to connect real remote GitHub Action dispatch."
      });
      revalidatePath("/admin");
    } catch (e) {
      console.error("Error writing simulated crawl:", e);
    }
    return;
  }

  try {
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/actions/workflows/${workflowId}/dispatches`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${githubToken}`,
          Accept: "application/vnd.github+json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ ref: "main" })
      }
    );

    if (response.ok) {
      console.log("Successfully dispatched scraper workflow!");
      // Insert status record
      await supabase.from("crawls").insert({
        status: "success",
        new_notices: 0,
        tokens_used: 0,
        error_log: "GitHub Action manually dispatched successfully."
      });
      revalidatePath("/admin");
    } else {
      const errText = await response.text();
      console.error("GitHub dispatch failed:", errText);
    }
  } catch (err) {
    console.error("Error triggering remote workflow:", err);
  }
}
