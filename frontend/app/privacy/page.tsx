import Link from "next/link";
import { Shield } from "lucide-react";

export const metadata = {
  title: "Privacy Policy",
  description: "Privacy Policy for railwayadmitcard.online. Learn how we handle cookies, tracking, and user data."
};

export default function PrivacyPolicy() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="border-b border-slate-200 pb-6">
        <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-2">
          <Shield className="h-8 w-8 text-blue-600" /> Privacy Policy
        </h1>
        <p className="text-xs text-slate-500 mt-2">
          Last Updated: June 22, 2026
        </p>
      </div>

      <div className="prose max-w-none text-slate-600 space-y-6 text-sm leading-relaxed">
        <p>
          At <strong>railwayadmitcard.online</strong>, accessible from <Link href="/" className="text-blue-600 underline">https://railwayadmitcard.online</Link>, one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by railwayadmitcard.online and how we use it.
        </p>

        <h2 className="text-lg font-bold text-slate-900 mt-6 border-b border-slate-200 pb-2">Log Files</h2>
        <p>
          railwayadmitcard.online follows a standard procedure of using log files. These files log visitors when they visit websites. All hosting companies do this as part of hosting services' analytics. The information collected by log files includes internet protocol (IP) addresses, browser type, Internet Service Provider (ISP), date and time stamp, referring/exit pages, and possibly the number of clicks. These are not linked to any information that is personally identifiable. The purpose of the information is for analyzing trends, administering the site, tracking users' movement on the website, and gathering demographic information.
        </p>

        <h2 className="text-lg font-bold text-slate-900 mt-6 border-b border-slate-200 pb-2">Cookies and Web Beacons</h2>
        <p>
          Like any other website, railwayadmitcard.online uses "cookies". These cookies are used to store information including visitors' preferences, and the pages on the website that the visitor accessed or visited. The information is used to optimize the users' experience by customizing our web page content based on visitors' browser type and/or other information.
        </p>

        <h2 className="text-lg font-bold text-slate-900 mt-6 border-b border-slate-200 pb-2">Google DoubleClick DART Cookie</h2>
        <p>
          Google is one of the third-party vendors on our site. It also uses cookies, known as DART cookies, to serve ads to our site visitors based upon their visit to railwayadmitcard.online and other sites on the internet. However, visitors may choose to decline the use of DART cookies by visiting the Google ad and content network Privacy Policy at the following URL – <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">https://policies.google.com/technologies/ads</a>.
        </p>

        <h2 className="text-lg font-bold text-slate-900 mt-6 border-b border-slate-200 pb-2">Advertising Partners Privacy Policies</h2>
        <p>
          You may consult this list to find the Privacy Policy for each of the advertising partners of railwayadmitcard.online.
        </p>
        <p>
          Third-party ad servers or ad networks use technologies like cookies, JavaScript, or Web Beacons that are used in their respective advertisements and links that appear on railwayadmitcard.online, which are sent directly to users' browser. They automatically receive your IP address when this occurs. These technologies are used to measure the effectiveness of their advertising campaigns and/or to personalize the advertising content that you see on websites that you visit.
        </p>
        <p>
          Note that railwayadmitcard.online has no access to or control over these cookies that are used by third-party advertisers.
        </p>

        <h2 className="text-lg font-bold text-slate-900 mt-6 border-b border-slate-200 pb-2">Consent</h2>
        <p>
          By using our website, you hereby consent to our Privacy Policy and agree to its terms.
        </p>
      </div>
    </div>
  );
}
