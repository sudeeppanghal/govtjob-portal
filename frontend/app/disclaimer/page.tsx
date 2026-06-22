import Link from "next/link";
import { AlertTriangle } from "lucide-react";

export const metadata = {
  title: "Disclaimer",
  description: "Official disclaimer for railwayadmitcard.online. Learn about our status as a privately operated informational website."
};

export default function Disclaimer() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="border-b border-slate-800 pb-6">
        <h1 className="text-3xl font-extrabold text-white flex items-center gap-2">
          <AlertTriangle className="h-8 w-8 text-amber-400" /> General Disclaimer
        </h1>
        <p className="text-xs text-slate-500 mt-2">
          Last Updated: June 22, 2026
        </p>
      </div>

      <div className="prose prose-invert max-w-none text-slate-300 space-y-6 text-sm leading-relaxed">
        <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-xl space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2 m-0 text-amber-400">
            No Association with Government Entities
          </h2>
          <p className="m-0 text-slate-350">
            <strong>railwayadmitcard.online</strong> is an independent web application. It is <strong>NOT affiliated</strong> with the Ministry of Railways, Railway Recruitment Boards (RRB), Railway Recruitment Cells (RRC), Union Public Service Commission (UPSC), Staff Selection Commission (SSC), or any other Central or State government organization in India.
          </p>
        </div>

        <h2 className="text-lg font-bold text-white mt-6 border-b border-slate-800 pb-2">Source of Information</h2>
        <p>
          All notification details, admit card release schedules, answer keys, results, and government scheme bulletins published on this portal are compiled programmatically or manually from official, publicly available portals. These sources include:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>UPSC Official Site: <a href="https://upsc.gov.in" target="_blank" rel="noopener noreferrer" className="text-emerald-400 underline">https://upsc.gov.in</a></li>
          <li>SSC Official Site: <a href="https://ssc.gov.in" target="_blank" rel="noopener noreferrer" className="text-emerald-400 underline">https://ssc.gov.in</a></li>
          <li>RRB Chandigarh Site: <a href="https://www.rrbcdg.gov.in" target="_blank" rel="noopener noreferrer" className="text-emerald-400 underline">https://www.rrbcdg.gov.in</a></li>
          <li>Press Information Bureau (PIB): <a href="https://pib.gov.in" target="_blank" rel="noopener noreferrer" className="text-emerald-400 underline">https://pib.gov.in</a></li>
        </ul>

        <h2 className="text-lg font-bold text-white mt-6 border-b border-slate-800 pb-2">Verification & Accuracy</h2>
        <p>
          While we make every effort to extract details accurately (dates, qualification levels, application fees) using advanced AI parser check systems, official guidelines are subject to changes. We do not warrant or guarantee the completeness or accuracy of any information presented on this site.
        </p>
        <p className="font-semibold text-white">
          Candidates must read the official notification PDF and verify all guidelines from the recruiting authority's official portals before filling out any registration forms.
        </p>

        <h2 className="text-lg font-bold text-white mt-6 border-b border-slate-800 pb-2">External Links</h2>
        <p>
          Our website contains links to external websites that are not provided or maintained by or in any way affiliated with railwayadmitcard.online. Please note that we do not guarantee the accuracy, relevance, timeliness, or completeness of any information on these external websites.
        </p>
      </div>
    </div>
  );
}
