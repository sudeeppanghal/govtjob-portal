import { Mail, Landmark, MessageSquare } from "lucide-react";

export const metadata = {
  title: "Contact Us",
  description: "Contact the administration of railwayadmitcard.online. Get in touch with us for queries or feedback."
};

export default function ContactUs() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="border-b border-slate-800 pb-6">
        <h1 className="text-3xl font-extrabold text-white flex items-center gap-2">
          <MessageSquare className="h-8 w-8 text-emerald-400" /> Contact Us
        </h1>
        <p className="text-sm text-slate-400 mt-2">
          Have queries, feedback, or suggestions? Reach out to our administration team.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 text-sm">
        {/* Contact Info */}
        <div className="md:col-span-5 space-y-6">
          <div className="bg-slate-900/40 border border-slate-850 rounded-xl p-5 space-y-4">
            <h2 className="text-base font-bold text-white">General Inquiries</h2>
            <p className="text-slate-400 leading-relaxed">
              If you spotted any factual errors in our summaries, want to report a broken link, or have general feedback, contact us directly.
            </p>
            <div className="flex items-center gap-2.5 text-slate-300">
              <Mail className="h-5 w-5 text-emerald-400" />
              <span>support@railwayadmitcard.online</span>
            </div>
          </div>

          <div className="text-slate-500 text-xs leading-relaxed">
            Note: We are not a recruiting authority and cannot answer queries regarding individual application statuses, exam cancellations, or recruitment schedules. Please contact the respective RRB/RRC helpdesk for official inquiries.
          </div>
        </div>

        {/* Contact Form */}
        <div className="md:col-span-7 bg-[#111827]/30 border border-slate-850 rounded-2xl p-6 space-y-4">
          <h2 className="text-base font-bold text-slate-200">Send us a Message</h2>
          <form className="space-y-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1 font-medium">Your Name</label>
              <input
                type="text"
                required
                placeholder="Enter your name"
                className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-lg py-2 px-3 text-slate-200 outline-none transition"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1 font-medium">Your Email Address</label>
              <input
                type="email"
                required
                placeholder="Enter your email"
                className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-lg py-2 px-3 text-slate-200 outline-none transition"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1 font-medium">Subject</label>
              <input
                type="text"
                required
                placeholder="What is this regarding?"
                className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-lg py-2 px-3 text-slate-200 outline-none transition"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1 font-medium">Message Body</label>
              <textarea
                rows={4}
                required
                placeholder="Write your message here..."
                className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-lg py-2.5 px-3 text-slate-200 outline-none transition resize-none"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-semibold py-2 rounded-lg text-center transition cursor-pointer"
            >
              Submit Message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
