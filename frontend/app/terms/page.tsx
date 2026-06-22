import Link from "next/link";
import { FileText } from "lucide-react";

export const metadata = {
  title: "Terms of Service",
  description: "Terms and Conditions of use for railwayadmitcard.online. Learn about our terms, content rights, and guidelines."
};

export default function TermsOfService() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="border-b border-slate-800 pb-6">
        <h1 className="text-3xl font-extrabold text-white flex items-center gap-2">
          <FileText className="h-8 w-8 text-emerald-400" /> Terms of Service
        </h1>
        <p className="text-xs text-slate-500 mt-2">
          Last Updated: June 22, 2026
        </p>
      </div>

      <div className="prose prose-invert max-w-none text-slate-300 space-y-6 text-sm leading-relaxed">
        <p>
          Welcome to <strong>railwayadmitcard.online</strong>. By accessing this website, we assume you accept these terms and conditions. Do not continue to use railwayadmitcard.online if you do not agree to take all of the terms and conditions stated on this page.
        </p>

        <h2 className="text-lg font-bold text-white mt-6 border-b border-slate-850 pb-2">Disclaimer of Government Affiliation</h2>
        <p className="text-amber-400 font-semibold bg-amber-500/5 border border-amber-500/10 p-4 rounded-lg">
          IMPORTANT: railwayadmitcard.online is a privately owned informational website. We are NOT affiliated with, authorized, or endorsed by the Ministry of Railways, Government of India, Railway Recruitment Boards (RRB), Railway Recruitment Cells (RRC), or any other government agency. All information provided here is gathered from official bulletins for educational/informational purposes.
        </p>

        <h2 className="text-lg font-bold text-white mt-6 border-b border-slate-850 pb-2">Intellectual Property Rights</h2>
        <p>
          Other than the content you own, under these Terms, railwayadmitcard.online and/or its licensors own all the intellectual property rights and materials contained in this Website. You are granted limited license only for purposes of viewing the material contained on this Website.
        </p>

        <h2 className="text-lg font-bold text-white mt-6 border-b border-slate-850 pb-2">Restrictions</h2>
        <p>You are specifically restricted from all of the following:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Publishing any Website material in any other media without source attribution.</li>
          <li>Selling, sublicensing, and/or otherwise commercializing any Website material.</li>
          <li>Using this Website in any way that is or may be damaging to this Website.</li>
          <li>Using this Website in any way that impacts user access to this Website.</li>
        </ul>

        <h2 className="text-lg font-bold text-white mt-6 border-b border-slate-850 pb-2">No Warranties</h2>
        <p>
          This Website is provided "as is," with all faults, and railwayadmitcard.online expresses no representations or warranties, of any kind related to this Website or the materials contained on this Website. Also, nothing contained on this Website shall be interpreted as advising you.
        </p>

        <h2 className="text-lg font-bold text-white mt-6 border-b border-slate-850 pb-2">Limitation of Liability</h2>
        <p>
          In no event shall railwayadmitcard.online, nor any of its officers, directors, and employees, be held liable for anything arising out of or in any way connected with your use of this Website whether such liability is under contract.
        </p>
      </div>
    </div>
  );
}
