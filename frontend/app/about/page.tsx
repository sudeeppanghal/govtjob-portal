import { Landmark } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "About Us",
  description: "About railwayadmitcard.online. Learn about our automated notifications mission and details."
};

export default function AboutUs() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="border-b border-slate-800 pb-6">
        <h1 className="text-3xl font-extrabold text-white flex items-center gap-2">
          <Landmark className="h-8 w-8 text-emerald-400" /> About Us
        </h1>
        <p className="text-xs text-slate-500 mt-2">
          Providing verified government exam updates and notifications.
        </p>
      </div>

      <div className="prose prose-invert max-w-none text-slate-300 space-y-6 text-sm leading-relaxed">
        <p>
          Welcome to <strong>railwayadmitcard.online</strong>, your trusted independent source for government recruitment announcements, exam schedules, admit card updates, answer keys, results, and central/state welfare schemes.
        </p>

        <h2 className="text-lg font-bold text-white mt-6 border-b border-slate-800 pb-2">Our Mission</h2>
        <p>
          Our mission is to simplify the job-hunting process for lakhs of Indian candidates. Official government bulletins are often spread across dozens of different boards and portals, making them hard to track. We solve this by gathering verified information into a centralized, clean, and ad-minimal portal.
        </p>

        <h2 className="text-lg font-bold text-white mt-6 border-b border-slate-800 pb-2">How Our Platform Works</h2>
        <p>
          We use state-of-the-art web scrapers to monitor official announcement notice boards (UPSC, SSC, IBPS, RRB, etc.) every 10 minutes. When a new notice is discovered:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>The system automatically downloads the official notification document (PDF).</li>
          <li>It parses the document programmatically using extraction algorithms to capture deadlines, fee limits, syllabus criteria, and salary grades.</li>
          <li>It generates a detailed, SEO-friendly summary article and injects appropriate Google-rich search schemas.</li>
          <li>Our freshness checkers daily sweep past articles to verify if results or admit cards have been released.</li>
        </ul>

        <h2 className="text-lg font-bold text-white mt-6 border-b border-slate-800 pb-2">Important Notice</h2>
        <p className="text-amber-400 font-semibold">
          While we provide a highly optimized feed, we strongly advise all candidates to treat this website as an informational guide only. Always download the official PDF circular directly from the recruitment board's website before applying.
        </p>
      </div>
    </div>
  );
}
