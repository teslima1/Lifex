"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import axios from "axios";
import toast from "react-hot-toast";
import {
  ChevronRight, ChevronLeft, CheckCircle2, Stethoscope,
  MessageCircle, Sparkles, UserPlus, RotateCcw, Phone, AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────
interface ServiceType {
  id: string; name: string; description?: string | null;
  durationMin: number; price?: number | null;
}
type Gate = null | "new" | "returning";

// ─── Constants ────────────────────────────────────────────────────────────────
const TITLES      = ["Mr", "Mrs", "Miss", "Ms", "Dr", "Prof", "Alhaji", "Alhaja"];
const GENDERS     = ["Male", "Female", "Prefer not to say"];
const HOW_OPTIONS = [
  "Friends & Family", "Google Search", "Instagram", "Facebook",
  "Twitter / X", "WhatsApp", "Referred by a Doctor", "Walk-in", "Other",
];

const NEW_STEPS      = ["Personal Details", "About Your Visit", "Referral & Source", "Booking Details"];
const RETURNING_STEPS = ["Confirm Your Details", "About Your Visit", "Booking Details"];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatPrice(price: number | null | undefined) {
  if (price == null) return "Price on request";
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: 0 }).format(price / 100);
}

function Field({ label, required, children, hint, error }: {
  label: string; required?: boolean; children: React.ReactNode; hint?: string; error?: string | null;
}) {
  return (
    <div>
      <label className="block text-sm font-bold text-gray-800 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error  && <p className="text-xs text-red-500 mt-1">{error}</p>}
      {!error && hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  );
}

const inputCls  = "w-full border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#1A5C38]/30 focus:border-[#1A5C38] transition-colors placeholder:text-gray-400";
const errCls    = "border-red-400 focus:border-red-400 focus:ring-red-200";
const selectCls = inputCls + " appearance-none cursor-pointer";
const STORAGE_KEY = "lifex_booking_form";

const defaultForm = {
  title: "", firstName: "", lastName: "", email: "", phone: "",
  gender: "", country: "Nigeria", numberOfPeople: "1",
  serviceTypeId: "",
  referredBy: "", howFound: "",
  slotDate: "", slotTime: "", guestNotes: "",
};

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function BookPage() {
  const [gate, setGate]         = useState<Gate>(null);
  const [step, setStep]         = useState(1);
  const [services, setServices] = useState<ServiceType[]>([]);
  const [loading, setLoading]   = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [attempted, setAttempted] = useState(false);

  // Returning-patient phone lookup
  const [lookupPhone, setLookupPhone]   = useState("");
  const [lookupState, setLookupState]   = useState<"idle" | "searching" | "found" | "notfound">("idle");
  const [lookupTimer, setLookupTimer]   = useState<ReturnType<typeof setTimeout> | null>(null);
  const lookupRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [form, setForm] = useState(() => {
    if (typeof window === "undefined") return defaultForm;
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      return saved ? { ...defaultForm, ...JSON.parse(saved) } : defaultForm;
    } catch { return defaultForm; }
  });

  const set = (k: keyof typeof form, v: string) =>
    setForm((f) => {
      const next = { ...f, [k]: v };
      try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
      return next;
    });

  useEffect(() => {
    axios.get("/api/services").then((r) => setServices(r.data.data || []));
  }, []);

  // ── Phone lookup for returning patients ──────────────────────────────────
  function handleLookupPhoneChange(val: string) {
    setLookupPhone(val);
    setLookupState("idle");
    if (lookupRef.current) clearTimeout(lookupRef.current);
    const digits = val.replace(/[\s\-+]/g, "");
    if (digits.length < 8) return;
    setLookupState("searching");
    lookupRef.current = setTimeout(async () => {
      try {
        const { data } = await axios.get(`/api/appointments/lookup?phone=${encodeURIComponent(val)}`);
        if (data.data) {
          const p = data.data;
          setForm((f) => {
            const next = {
              ...f,
              title:     p.title     || "",
              firstName: p.firstName || "",
              lastName:  p.lastName  || "",
              email:     p.email     || "",
              phone:     p.phone     || val,
              gender:    p.gender    || "",
              country:   p.country   || "Nigeria",
            };
            try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
            return next;
          });
          setLookupState("found");
        } else {
          setLookupState("notfound");
        }
      } catch { setLookupState("notfound"); }
    }, 700);
  }

  // ── Steps depending on gate ──────────────────────────────────────────────
  const steps = gate === "returning" ? RETURNING_STEPS : NEW_STEPS;

  function isStepValid(): boolean {
    if (gate === "new") {
      if (step === 1) return !!(form.firstName.trim() && form.lastName.trim() && form.email.trim() && form.phone.trim());
      if (step === 2) return !!form.serviceTypeId;
      if (step === 3) return !!form.howFound;
      if (step === 4) return !!(form.slotDate && form.slotTime);
    }
    if (gate === "returning") {
      if (step === 1) return !!(form.firstName.trim() && form.lastName.trim() && form.email.trim() && form.phone.trim());
      if (step === 2) return !!form.serviceTypeId;
      if (step === 3) return !!(form.slotDate && form.slotTime);
    }
    return false;
  }

  function err(key: keyof typeof form, label: string): string | null {
    if (!attempted) return null;
    const v = form[key];
    if (typeof v === "string" && !v.trim()) return `${label} is required`;
    return null;
  }

  // ── Submit ───────────────────────────────────────────────────────────────
  async function handleSubmit() {
    setLoading(true);
    try {
      const slotDatetime = new Date(`${form.slotDate}T${form.slotTime}`).toISOString();
      const isReturning  = gate === "returning";
      const guestNotes = [
        isReturning ? "Returning patient." : "",
        form.referredBy ? `Referred by: ${form.referredBy}.` : "",
        form.howFound   ? `Found us via: ${form.howFound}.`  : "",
        form.guestNotes ? form.guestNotes : "",
      ].filter(Boolean).join(" ") || undefined;

      await axios.post("/api/appointments", {
        guestName:      `${form.title ? form.title + " " : ""}${form.firstName} ${form.lastName}`.trim(),
        guestEmail:     form.email,
        guestPhone:     form.phone,
        guestGender:    form.gender || undefined,
        guestCountry:   form.country || undefined,
        numberOfPeople: parseInt(form.numberOfPeople) || 1,
        serviceTypeId:  form.serviceTypeId,
        slotDatetime,
        guestNotes,
      });
      try { sessionStorage.removeItem(STORAGE_KEY); } catch {}
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { error?: string } } })?.response?.data?.error || "Booking failed. Please try again.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  const selectedService = services.find((s) => s.id === form.serviceTypeId);
  const priceText = selectedService?.price != null
    ? new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: 0 }).format(selectedService.price / 100)
    : "Price on request";
  const whatsappMsg = encodeURIComponent(
    `Hello LIFEX Mobile Clinic, I just booked my appointment on your website.\n\nName: ${form.title ? form.title + " " : ""}${form.firstName} ${form.lastName}\nService: ${selectedService?.name || ""}\nPrice: ${priceText}\nDate: ${form.slotDate} at ${form.slotTime}\nPhone: ${form.phone}`
  );

  // ── Success screen ───────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#E8F5EE] to-white flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-lg p-8 sm:p-12 max-w-md w-full text-center">
          <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="h-10 w-10 text-[#1A5C38]" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Booking Received!</h1>
          <p className="text-gray-600 mb-1">
            Thank you, <strong>{form.firstName}</strong>! Your appointment has been submitted.
          </p>
          <p className="text-gray-500 text-sm mb-8">
            Our team will contact you on <strong>{form.phone}</strong> or <strong>{form.email}</strong> to confirm.
          </p>
          <div className="bg-[#E8F5EE] rounded-xl p-4 mb-6">
            <p className="text-sm font-semibold text-gray-700 mb-1">Let us know on WhatsApp too</p>
            <p className="text-xs text-gray-500 mb-3">Speed things up — we confirm faster via WhatsApp.</p>
            <a
              href={`https://wa.me/2347037244339?text=${whatsappMsg}`}
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#25D366] text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-[#1da855] transition-colors text-sm"
            >
              <MessageCircle className="h-4 w-4" /> Chat us on WhatsApp
            </a>
          </div>
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-[#1A5C38] font-medium hover:underline">
            <ChevronLeft className="h-4 w-4" /> Back to Home
          </Link>
        </div>
      </div>
    );
  }

  // ── Shared header ────────────────────────────────────────────────────────
  const Header = () => (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-[#1A5C38] flex items-center justify-center">
            <Stethoscope className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-[#1A5C38]">LIFEX Mobile Clinic</span>
        </Link>
        <span className="text-sm font-semibold text-gray-700">Book Appointment</span>
      </div>
    </header>
  );

  // ════════════════════════════════════════════════════════════════════
  // GATE SCREEN — New or Returning?
  // ════════════════════════════════════════════════════════════════════
  if (gate === null) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
          <div className="text-center mb-10">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Book an Appointment</h1>
            <p className="text-gray-500 mt-2 text-sm sm:text-base">
              Have you visited or booked with LIFEX Mobile Clinic before?
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            {/* New Patient */}
            <button
              type="button"
              onClick={() => { setGate("new"); setStep(1); }}
              className="group bg-white border-2 border-gray-200 hover:border-[#1A5C38] rounded-2xl p-7 text-left transition-all hover:shadow-md"
            >
              <div className="h-14 w-14 rounded-2xl bg-[#E8F5EE] flex items-center justify-center mb-5 group-hover:bg-[#1A5C38] transition-colors">
                <UserPlus className="h-7 w-7 text-[#1A5C38] group-hover:text-white transition-colors" />
              </div>
              <h2 className="text-lg font-bold text-gray-900 mb-1">New Patient</h2>
              <p className="text-sm text-gray-500 leading-relaxed">
                First time visiting LIFEX? We&apos;ll collect your details to get you started.
              </p>
              <div className="mt-5 flex items-center gap-1 text-[#1A5C38] font-semibold text-sm">
                Get started <ChevronRight className="h-4 w-4" />
              </div>
            </button>

            {/* Returning Patient */}
            <button
              type="button"
              onClick={() => { setGate("returning"); setStep(0); }}
              className="group bg-white border-2 border-gray-200 hover:border-[#1A5C38] rounded-2xl p-7 text-left transition-all hover:shadow-md"
            >
              <div className="h-14 w-14 rounded-2xl bg-[#E8F5EE] flex items-center justify-center mb-5 group-hover:bg-[#1A5C38] transition-colors">
                <RotateCcw className="h-7 w-7 text-[#1A5C38] group-hover:text-white transition-colors" />
              </div>
              <h2 className="text-lg font-bold text-gray-900 mb-1">Returning Patient</h2>
              <p className="text-sm text-gray-500 leading-relaxed">
                Been here before? We&apos;ll look up your records and make re-booking quick.
              </p>
              <div className="mt-5 flex items-center gap-1 text-[#1A5C38] font-semibold text-sm">
                Continue <ChevronRight className="h-4 w-4" />
              </div>
            </button>
          </div>

          <p className="text-center text-sm text-gray-400 mt-8">
            Need a home visit or hospital assistance?{" "}
            <Link href="/requests" className="text-[#1A5C38] font-semibold hover:underline">
              Submit a special request
            </Link>
          </p>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════
  // RETURNING — Phone lookup screen (step 0)
  // ════════════════════════════════════════════════════════════════════
  if (gate === "returning" && step === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">

          <button
            onClick={() => { setGate(null); setLookupPhone(""); setLookupState("idle"); }}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6"
          >
            <ChevronLeft className="h-4 w-4" /> Back
          </button>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-[#1A5C38] px-6 py-5">
              <h2 className="text-lg font-bold text-white">Welcome Back!</h2>
              <p className="text-white/70 text-sm mt-0.5">Enter your phone number to find your records</p>
            </div>

            <div className="p-6 space-y-5">
              <div className="relative">
                <label className="block text-sm font-bold text-gray-800 mb-2">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="tel"
                    value={lookupPhone}
                    onChange={(e) => handleLookupPhoneChange(e.target.value)}
                    placeholder="+234 800 000 0000"
                    className={cn(inputCls, "pl-10")}
                    autoFocus
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">The number you used when you first booked</p>
              </div>

              {/* Searching */}
              {lookupState === "searching" && (
                <div className="flex items-center gap-3 text-sm text-gray-500 py-2">
                  <span className="h-4 w-4 border-2 border-gray-300 border-t-[#1A5C38] rounded-full animate-spin shrink-0" />
                  Looking up your records…
                </div>
              )}

              {/* Found */}
              {lookupState === "found" && (
                <div className="bg-[#E8F5EE] border border-[#1A5C38]/20 rounded-xl p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <Sparkles className="h-5 w-5 text-[#1A5C38] shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-[#1A5C38] text-sm">Records found!</p>
                      <p className="text-xs text-gray-600 mt-0.5">We found a previous booking for this number.</p>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg px-4 py-3 text-sm space-y-1">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Name</span>
                      <span className="font-medium text-gray-900">{form.title ? `${form.title} ` : ""}{form.firstName} {form.lastName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Email</span>
                      <span className="font-medium text-gray-900">{form.email}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#1A5C38] text-white font-semibold text-sm hover:bg-[#154a2d] transition-colors"
                  >
                    Yes, that&apos;s me — Continue <ChevronRight className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => { setGate("new"); setStep(1); setLookupState("idle"); }}
                    className="w-full text-center text-xs text-gray-500 hover:text-gray-700 py-1"
                  >
                    Not me — Book as new patient instead
                  </button>
                </div>
              )}

              {/* Not found */}
              {lookupState === "notfound" && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-amber-800 text-sm">No records found</p>
                      <p className="text-xs text-amber-700 mt-0.5">
                        We couldn&apos;t find any previous bookings for this number. Try a different number or continue as a new patient.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setGate("new"); setStep(1); }}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-amber-300 text-amber-800 font-semibold text-sm hover:bg-amber-100 transition-colors"
                  >
                    Continue as New Patient <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════
  // MAIN FORM (New: steps 1-4 | Returning: steps 1-3)
  // ════════════════════════════════════════════════════════════════════
  const totalSteps  = steps.length;
  const stepLabel   = steps[step - 1] || "";
  const prevLabel   = step > 1 ? `Back: ${steps[step - 2]}` : null;
  const nextLabel   = step < totalSteps ? `Next: ${steps[step]}` : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">

        {/* Step progress */}
        <div className="mb-8">
          <div className="flex items-center gap-0 mb-4">
            {steps.map((s, i) => (
              <div key={s} className="flex items-center flex-1">
                <div className={cn("flex flex-col items-center gap-1", i < steps.length - 1 ? "flex-1" : "")}>
                  <div className={cn(
                    "h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all shrink-0",
                    step > i + 1 ? "bg-[#1A5C38] border-[#1A5C38] text-white"
                      : step === i + 1 ? "bg-white border-[#1A5C38] text-[#1A5C38]"
                        : "bg-white border-gray-200 text-gray-400"
                  )}>
                    {step > i + 1 ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
                  </div>
                  <span className={cn(
                    "text-[10px] font-medium text-center leading-tight hidden sm:block w-20",
                    step === i + 1 ? "text-[#1A5C38]" : "text-gray-400"
                  )}>{s}</span>
                </div>
                {i < steps.length - 1 && (
                  <div className={cn("h-0.5 flex-1 mx-1 mt-[-12px]", step > i + 1 ? "bg-[#1A5C38]" : "bg-gray-200")} />
                )}
              </div>
            ))}
          </div>
          <p className="sm:hidden text-sm font-semibold text-[#1A5C38] text-center">
            Step {step} of {totalSteps}: {stepLabel}
            {gate === "returning" && <span className="ml-2 text-[10px] font-normal text-gray-400 uppercase tracking-wide">Returning</span>}
          </p>
        </div>

        {/* Form card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="bg-[#1A5C38] px-6 py-4">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">{stepLabel}</h2>
              {gate === "returning" && (
                <span className="bg-white/20 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide">
                  Returning
                </span>
              )}
            </div>
            <p className="text-white/70 text-sm mt-0.5">
              {gate === "new" && step === 1 && "Tell us about yourself"}
              {gate === "returning" && step === 1 && "Check your details — update anything that has changed"}
              {step === 2 && "What brings you in today?"}
              {gate === "new"       && step === 3 && "How did you hear about us?"}
              {gate === "returning" && step === 3 && "When would you like to come in?"}
              {gate === "new"       && step === 4 && "When would you like to come in?"}
            </p>
          </div>

          <div className="p-6 space-y-5">

            {/* ── STEP 1: Personal Details ──────────────────────────── */}
            {step === 1 && (
              <>
                {gate === "returning" && (
                  <div className="flex items-start gap-3 bg-[#E8F5EE] border border-[#1A5C38]/20 rounded-xl px-4 py-3 mb-1">
                    <Sparkles className="h-4 w-4 text-[#1A5C38] mt-0.5 shrink-0" />
                    <p className="text-xs text-gray-600">
                      Your details have been pre-filled from your last visit. Please review and update anything that&apos;s changed.
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-3 gap-3">
                  <Field label="Title">
                    <select value={form.title} onChange={(e) => set("title", e.target.value)} className={selectCls}>
                      <option value="">—</option>
                      {TITLES.map((t) => <option key={t}>{t}</option>)}
                    </select>
                  </Field>
                  <div className="col-span-2">
                    <Field label="First Name" required error={err("firstName", "First Name")}>
                      <input type="text" value={form.firstName} onChange={(e) => set("firstName", e.target.value)}
                        placeholder="Ada" className={cn(inputCls, err("firstName","First Name") && errCls)} />
                    </Field>
                  </div>
                </div>

                <Field label="Last Name" required error={err("lastName", "Last Name")}>
                  <input type="text" value={form.lastName} onChange={(e) => set("lastName", e.target.value)}
                    placeholder="Okonkwo" className={cn(inputCls, err("lastName","Last Name") && errCls)} />
                </Field>

                <Field label="Email Address" required error={err("email", "Email")}>
                  <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)}
                    placeholder="ada@example.com" className={cn(inputCls, err("email","Email") && errCls)} />
                </Field>

                <Field label="Phone Number" required hint="Include country code e.g. +234 for Nigeria" error={err("phone", "Phone")}>
                  <input type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)}
                    placeholder="+234 800 000 0000" className={cn(inputCls, err("phone","Phone") && errCls)} />
                </Field>

                <div className="grid grid-cols-2 gap-4">
                  <Field label="Gender">
                    <select value={form.gender} onChange={(e) => set("gender", e.target.value)} className={selectCls}>
                      <option value="">Select…</option>
                      {GENDERS.map((g) => <option key={g}>{g}</option>)}
                    </select>
                  </Field>
                  <Field label="Country">
                    <input type="text" value={form.country} onChange={(e) => set("country", e.target.value)}
                      placeholder="Nigeria" className={inputCls} />
                  </Field>
                </div>

                {/* Number of people only for new patients — returning patients re-book for themselves */}
                {gate === "new" && (
                  <Field label="Number of People" hint="For family or group visits">
                    <select value={form.numberOfPeople} onChange={(e) => set("numberOfPeople", e.target.value)} className={selectCls}>
                      {[1,2,3,4,5,6,7,8,9,10].map((n) => (
                        <option key={n} value={n}>{n} {n === 1 ? "person" : "people"}</option>
                      ))}
                    </select>
                  </Field>
                )}
              </>
            )}

            {/* ── STEP 2: Service ───────────────────────────────────── */}
            {step === 2 && (
              <Field label="Select Service" required>
                <div className="space-y-2.5">
                  {services.length === 0 && (
                    <p className="text-sm text-gray-400 py-4 text-center">Loading services…</p>
                  )}
                  {services.map((svc) => (
                    <label
                      key={svc.id}
                      className={cn(
                        "flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all",
                        form.serviceTypeId === svc.id
                          ? "border-[#1A5C38] bg-[#E8F5EE]"
                          : "border-gray-200 hover:border-gray-300 bg-white"
                      )}
                    >
                      <input type="radio" name="service" value={svc.id}
                        checked={form.serviceTypeId === svc.id}
                        onChange={() => set("serviceTypeId", svc.id)}
                        className="mt-0.5 accent-[#1A5C38] shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-gray-900">{svc.name}</p>
                        {svc.description && <p className="text-xs text-gray-500 mt-0.5">{svc.description}</p>}
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-xs font-semibold text-[#1A5C38]">{formatPrice(svc.price)}</span>
                          <span className="text-xs text-gray-400">· {svc.durationMin} min</span>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </Field>
            )}

            {/* ── STEP 3 (New only): Referral & Source ─────────────── */}
            {gate === "new" && step === 3 && (
              <>
                <Field label="Referred By" hint="Enter the full name of whoever referred you (if applicable)">
                  <input type="text" value={form.referredBy} onChange={(e) => set("referredBy", e.target.value)}
                    placeholder="Full name of who referred you" className={inputCls} />
                </Field>
                <Field label="How did you find out about us?" required>
                  <select value={form.howFound} onChange={(e) => set("howFound", e.target.value)} className={selectCls}>
                    <option value="">-- Select Option --</option>
                    {HOW_OPTIONS.map((o) => <option key={o}>{o}</option>)}
                  </select>
                </Field>
              </>
            )}

            {/* ── Booking Details — New: step 4, Returning: step 3 ─── */}
            {((gate === "new" && step === 4) || (gate === "returning" && step === 3)) && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Preferred Date" required>
                    <input type="date" value={form.slotDate}
                      min={new Date().toISOString().split("T")[0]}
                      onChange={(e) => set("slotDate", e.target.value)} className={inputCls} />
                  </Field>
                  <Field label="Preferred Time" required>
                    <input type="time" value={form.slotTime}
                      onChange={(e) => set("slotTime", e.target.value)} className={inputCls} />
                  </Field>
                </div>

                <Field label="Additional comments or message">
                  <textarea rows={4} value={form.guestNotes}
                    onChange={(e) => set("guestNotes", e.target.value)}
                    placeholder="Any special instructions or information for the clinic…"
                    className={inputCls + " resize-none"} />
                </Field>

                {/* Booking summary */}
                <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 text-sm space-y-1.5">
                  <p className="font-semibold text-gray-800 mb-2">Booking Summary</p>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Name</span>
                    <span className="font-medium text-gray-900">{form.title ? `${form.title} ` : ""}{form.firstName} {form.lastName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Service</span>
                    <span className="font-medium text-gray-900">{selectedService?.name || "—"}</span>
                  </div>
                  {selectedService && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Price</span>
                      <span className="font-semibold text-[#1A5C38]">{priceText}</span>
                    </div>
                  )}
                  {form.slotDate && form.slotTime && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Date & Time</span>
                      <span className="font-medium text-gray-900 text-right">
                        {new Date(`${form.slotDate}T${form.slotTime}`).toLocaleDateString("en-NG", {
                          weekday: "short", day: "numeric", month: "short", year: "numeric",
                        })} · {form.slotTime}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-500">Patient type</span>
                    <span className="font-medium text-gray-900">{gate === "returning" ? "Returning Patient" : "New Patient"}</span>
                  </div>
                </div>

                <p className="text-xs text-gray-400 text-center">
                  By submitting, the LIFEX medical team will contact you to confirm. No payment required now.
                </p>
              </>
            )}

          </div>

          {/* Nav buttons */}
          <div className={cn("px-6 pb-6 flex gap-3", prevLabel ? "justify-between" : "justify-end")}>
            {prevLabel ? (
              <button type="button"
                onClick={() => { setAttempted(false); setStep(step - 1); }}
                className="flex items-center gap-2 px-5 py-3 rounded-xl border-2 border-gray-200 font-semibold text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-colors text-sm"
              >
                <ChevronLeft className="h-4 w-4" /> {prevLabel}
              </button>
            ) : (
              <button type="button"
                onClick={() => gate === "returning" ? setStep(0) : setGate(null)}
                className="flex items-center gap-2 px-5 py-3 rounded-xl border-2 border-gray-200 font-semibold text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-colors text-sm"
              >
                <ChevronLeft className="h-4 w-4" /> Back
              </button>
            )}

            {step < totalSteps ? (
              <button type="button"
                onClick={() => {
                  if (!isStepValid()) { setAttempted(true); return; }
                  setAttempted(false); setStep(step + 1);
                }}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[#1A5C38] text-white font-semibold hover:bg-[#154a2d] transition-colors text-sm ml-auto"
              >
                {nextLabel} <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <button type="button"
                onClick={() => {
                  if (!isStepValid()) { setAttempted(true); return; }
                  handleSubmit();
                }}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#1A5C38] text-white font-semibold hover:bg-[#154a2d] transition-colors text-sm disabled:opacity-40 disabled:cursor-not-allowed ml-auto"
              >
                {loading
                  ? <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <CheckCircle2 className="h-4 w-4" />
                }
                {loading ? "Submitting…" : "Submit Booking"}
              </button>
            )}
          </div>
        </div>

        <p className="text-center text-sm text-gray-400 mt-6">
          Need a home visit or hospital assistance?{" "}
          <Link href="/requests" className="text-[#1A5C38] font-semibold hover:underline">
            Submit a special request
          </Link>
        </p>
      </div>
    </div>
  );
}
