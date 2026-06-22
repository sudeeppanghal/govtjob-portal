"use client";

import { useEffect } from "react";

interface ViewTrackerProps {
  slug: string;
}

export default function ViewTracker({ slug }: ViewTrackerProps) {
  useEffect(() => {
    if (!slug) return;

    // Fire-and-forget view recording via Next.js Route Handler
    fetch("/api/views", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ slug }),
    }).catch((err) => {
      // Fail silently on the client to ensure the main page experience is unaffected
      console.warn("Analytics recording failed:", err);
    });
  }, [slug]);

  // This component renders nothing visually
  return null;
}
