"use client";
import { useState } from "react";
import Link from "next/link";
import axios from "axios";
import toast from "react-hot-toast";
import { Home, Building2, Plane, CheckCircle2, Stethoscope, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

const REQUEST_TYPES = [
  {
    value: "HOME_VISIT",
    label: "Home Medical Visit",
    icon: Home,
    description: "A doctor or nurse visits you at your home or workplace.",
    fields: ["address", "preferredDate", "symptoms"],
  },
  {
    value: "HOSPITAL_ASSIST",
    label: "Hospital Assistance",
    icon: Building2,
    description: "Support with hospital admission, navigation, or bedside care.",
    fields: ["hospital", "condition", "assistType"],
  },
  {
    value: "MEDICAL_TOURISM",
    label: "Medical Tourism",
    icon: Plane,
    description: "We help you access medical treatment abroad.",
    fields: ["destination", "procedure", "targetDate"],
  },
];

export default function RequestsPage() {
  const [type, setType] = useState<string | null>(null);
  const [form, setForm] = useState({
    guestName: "",
    guestEmail: "",
    guestPhone: "",
    // HOME_VISIT
    address: "",
    preferredDate: "",
    symptoms: "",
    // HOSPITAL_ASSIST
    hospital: "",
    condition: "",
    assistType: "",
    // MEDICAL_TOURISM
    destination: "",
    procedure: "",
    targetDate: "",
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!type) return;
    setLoading(true);
    try {
      const details: Record<string, string> = {};
      if (type === "HOME_VISIT")      { details.address = form.address; details.preferredDate = form.preferredDate; details.symptoms = form.symptoms; }
      if (type === "HOSPITAL_ASSIST") { details.hospital = form.hospital; details.condition = form.condition; details.assistType = form.assistType; }
      if (type === "MEDICAL_TOURISM") { details.destination = form.destination; details.procedure = form.procedure; details.targetDate = form.targetDate; }

      await axios.post("/api/special-requests", {
        guestName: form.guestName,
        guestEmail: form.guestEmail,
        guestPhone: form.guestPhone,
        type,
        details,
      });
      setSubmitted(true);
    } catch {
      toast.error("Submission failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#E8F5EE] to-white flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-lg p-10 max-w-md w-full text-center">
          <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="h-10 w-10 text-[#1A5C38]" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Request Received!</h1>
          <p className="text-gray-600 mb-2">
            Thank you, <strong>{form.guestName.split(" ")[0]}</strong>! We have received your special service request.
          </p>
          <p className="text-gray-500 text-sm mb-8">
            Our team will review your request and contact you on <strong>{form.guestPhone}</strong> or <strong>{form.guestEmail}</strong> as soon as possible.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-[#1A5C38] text-white px-6 py-3 rounded-xl font-medium hover:bg-[#154a2d] transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E8F5EE] to-white">
      <header className="bg-white/80 backdrop-blur border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-[#1A5C38] flex items-center justify-center">
              <Stethoscope className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-[#1A5C38]">LIFEX Mobile Clinic</span>
          </Link>
          <Link href="/book" className="text-sm text-[#1A5C38] font-medium hover:underline">Book Appointment</Link>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Special Service Request</h1>
          <p className="text-gray-500 mt-2">Need a home visit, hospital assistance, or help travelling for medical care? Tell us what you need.</p>
        </div>

        {/* Type selection */}
        {!type ? (
          <div className="space-y-4">
            <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">What do you need?</p>
            {REQUEST_TYPES.map(({ value, label, icon: Icon, description }) => (
              <button
                key={value}
                type="button"
                onClick={() => setType(value)}
                className="w-full flex items-start gap-4 p-5 bg-white rounded-2xl border-2 border-gray-100 hover:border-[#1A5C38] hover:shadow-md transition-all text-left group"
              >
                <div className="h-12 w-12 rounded-xl bg-[#E8F5EE] flex items-center justify-center shrink-0 group-hover:bg-[#1A5C38] transition-colors">
                  <Icon className="h-6 w-6 text-[#1A5C38] group-hover:text-white transition-colors" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-base">{label}</p>
                  <p className="text-sm text-gray-500 mt-0.5">{description}</p>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-5">
            <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
              <button type="button" onClick={() => setType(null)} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                <ChevronLeft className="h-4 w-4 text-gray-500" />
              </button>
              <div>
                <p className="text-xs text-gray-400">Service type</p>
                <p className="font-semibold text-gray-900">{REQUEST_TYPES.find((t) => t.value === type)?.label}</p>
              </div>
            </div>

            {/* Contact details */}
            <p className="text-sm font-semibold text-gray-700">Your Contact Details</p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name *</label>
              <input required type="text" value={form.guestName} onChange={(e) => set("guestName", e.target.value)} placeholder="Ada Okonkwo"
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5C38]/30" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email *</label>
                <input required type="email" value={form.guestEmail} onChange={(e) => set("guestEmail", e.target.value)} placeholder="ada@example.com"
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5C38]/30" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone *</label>
                <input required type="tel" value={form.guestPhone} onChange={(e) => set("guestPhone", e.target.value)} placeholder="+234 800 000 0000"
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5C38]/30" />
              </div>
            </div>

            {/* Type-specific fields */}
            <p className="text-sm font-semibold text-gray-700 pt-2 border-t border-gray-100">Service Details</p>

            {type === "HOME_VISIT" && (<>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Your Address *</label>
                <textarea required rows={2} value={form.address} onChange={(e) => set("address", e.target.value)} placeholder="House / flat number, street, area, city"
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5C38]/30 resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Preferred Visit Date</label>
                <input type="date" value={form.preferredDate} onChange={(e) => set("preferredDate", e.target.value)} min={new Date().toISOString().split("T")[0]}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5C38]/30" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Symptoms / Reason for Visit</label>
                <textarea rows={3} value={form.symptoms} onChange={(e) => set("symptoms", e.target.value)} placeholder="Describe the symptoms or reason for the visit"
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5C38]/30 resize-none" />
              </div>
            </>)}

            {type === "HOSPITAL_ASSIST" && (<>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Hospital Name *</label>
                <input required type="text" value={form.hospital} onChange={(e) => set("hospital", e.target.value)} placeholder="e.g. Lagos University Teaching Hospital"
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5C38]/30" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Condition / Diagnosis</label>
                <input type="text" value={form.condition} onChange={(e) => set("condition", e.target.value)} placeholder="e.g. Fracture, post-surgery recovery"
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5C38]/30" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Type of Assistance Needed</label>
                <textarea rows={3} value={form.assistType} onChange={(e) => set("assistType", e.target.value)} placeholder="e.g. Admission help, bedside nursing, discharge coordination"
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5C38]/30 resize-none" />
              </div>
            </>)}

            {type === "MEDICAL_TOURISM" && (<>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Destination Country *</label>
                <input required type="text" value={form.destination} onChange={(e) => set("destination", e.target.value)} placeholder="e.g. India, Germany, UAE, UK"
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5C38]/30" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Procedure / Treatment Needed *</label>
                <input required type="text" value={form.procedure} onChange={(e) => set("procedure", e.target.value)} placeholder="e.g. Knee replacement, cancer treatment"
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5C38]/30" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Target Travel Date</label>
                <input type="date" value={form.targetDate} onChange={(e) => set("targetDate", e.target.value)} min={new Date().toISOString().split("T")[0]}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5C38]/30" />
              </div>
            </>)}

            <button
              type="submit"
              disabled={loading}
              className={cn(
                "w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-colors",
                loading ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-[#1A5C38] text-white hover:bg-[#154a2d]"
              )}
            >
              {loading ? (
                <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              {loading ? "Submitting…" : "Submit Request"}
            </button>
          </form>
        )}

        <p className="text-center text-sm text-gray-400 mt-8">
          Want a regular appointment instead?{" "}
          <Link href="/book" className="text-[#1A5C38] font-medium hover:underline">Book here</Link>
        </p>
      </div>
    </div>
  );
}
