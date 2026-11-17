import Link from "next/link";
import {
  Stethoscope, Home, Building2, Plane, Heart, CheckCircle2,
  Phone, Mail, ArrowRight, LayoutDashboard, MessageCircle,
  BookOpen, CalendarDays, Users,
} from "lucide-react";
import { getSession } from "@/lib/auth";

const SERVICES = [
  { icon: Stethoscope, name: "General Consultation",    desc: "One-on-one consultations with our medical team — from your phone, at any time." },
  { icon: Heart,       name: "Chronic Illness Follow-Up", desc: "Regular check-ins for Hypertension, Diabetes, Asthma, and more." },
  { icon: CalendarDays,name: "Lab Tests & Vaccinations",  desc: "Book lab tests or vaccination appointments — fast and convenient." },
  { icon: Home,        name: "Home Medical Visits",      desc: "Can't come to us? We come to you. Submit a home visit request and we'll coordinate." },
  { icon: Building2,   name: "Hospital Assistance",      desc: "Navigating hospital care is stressful. We help with admission, navigation, and bedside support." },
  { icon: Plane,       name: "Medical Tourism",          desc: "Planning treatment abroad? We guide you through procedure, travel dates, and arrival support." },
];

const STEPS = [
  { step: "01", title: "Fill the booking form",    desc: "No account needed. Just enter your name, contact details, and choose a service." },
  { step: "02", title: "Pick a date & time",        desc: "Select your preferred appointment slot from the booking form." },
  { step: "03", title: "We confirm your booking",   desc: "Our team reviews your request and calls or emails you to confirm." },
  { step: "04", title: "Attend your appointment",   desc: "Show up at the agreed time — the LIFEX medical team will be ready for you." },
];

export default async function LandingPage() {
  const session = await getSession();

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-[#1A5C38] flex items-center justify-center">
              <Stethoscope className="h-4 w-4 text-white" />
            </div>
            <div>
              <span className="font-bold text-gray-900 text-sm">LIFEX</span>
              <span className="text-gray-400 text-xs ml-1 hidden sm:inline">Mobile Clinic</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/health-tips" className="text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors hidden sm:inline">
              Health Tips
            </Link>
            {session?.role === "ADMIN" ? (
              <Link
                href="/admin/dashboard"
                className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Link>
            ) : (
              <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors hidden sm:inline">
                Staff Login
              </Link>
            )}
            <Link
              href="/book"
              className="bg-[#1A5C38] text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-[#154a2d] transition-colors"
            >
              Book Appointment
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative text-white py-16 lg:py-24 px-4 overflow-hidden">
        <div className="absolute inset-0 z-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/hero-doctor.jpg" alt="Doctor with stethoscope" className="w-full h-full object-cover object-center" />
          <div className="absolute inset-0 bg-[#1A5C38]/80" />
        </div>
        <div className="relative z-10 max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/15 px-3 py-1.5 rounded-full text-sm mb-6">
              <span className="h-1.5 w-1.5 rounded-full bg-[#00A896] animate-pulse" />
              Now accepting bookings
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Your health,{" "}
              <span className="text-[#00A896]">at your fingertips.</span>
            </h1>
            <p className="text-lg sm:text-xl text-white/80 leading-relaxed mb-8 max-w-xl">
              Book a consultation with the LIFEX medical team in minutes — no account needed. Just fill the form, and we&apos;ll contact you to confirm.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/book"
                className="inline-flex items-center justify-center gap-2 bg-[#00A896] hover:bg-[#008f80] text-white font-semibold px-6 py-3 rounded-xl transition-all text-base"
              >
                Book your appointment <ArrowRight className="h-5 w-5" />
              </Link>
              <a
                href="tel:+2347037244339"
                className="inline-flex items-center justify-center gap-2 border-2 border-white/30 hover:border-white/60 text-white font-medium px-6 py-3 rounded-xl transition-all text-base"
              >
                <Phone className="h-4 w-4" /> +234 703 724 4339
              </a>
            </div>
          </div>

          <div className="hidden lg:flex flex-col gap-4 items-end">
            <div className="bg-white/15 backdrop-blur-md border border-white/20 rounded-2xl p-5 w-72">
              <p className="text-xs text-white/60 uppercase tracking-wide mb-1">No account needed</p>
              <p className="text-white font-bold text-lg">Book as a Guest</p>
              <p className="text-[#00A896] text-sm mt-1">We contact you to confirm</p>
            </div>
            <div className="bg-white/15 backdrop-blur-md border border-white/20 rounded-2xl p-5 w-72">
              <div className="flex items-center gap-3 mb-2">
                <Users className="h-5 w-5 text-[#00A896]" />
                <p className="text-white font-semibold text-sm">Home Visits Available</p>
              </div>
              <p className="text-white/60 text-xs">We come to you — anywhere in Lagos</p>
            </div>
            <div className="bg-white/15 backdrop-blur-md border border-white/20 rounded-2xl p-5 w-72">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-[#00A896] flex items-center justify-center text-white font-bold text-sm shrink-0">✓</div>
                <div>
                  <p className="text-white font-semibold text-sm">Booking Confirmed</p>
                  <p className="text-white/60 text-xs">We&apos;ll call or email you</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust bar */}
      <section className="bg-[#E8F5EE] border-y border-green-100 py-4 px-4">
        <div className="max-w-6xl mx-auto flex flex-wrap justify-center gap-6 text-sm text-[#1A5C38] font-medium">
          {[
            "✓ No registration required",
            "✓ Book in under 2 minutes",
            "✓ Home visits available",
            "✓ Medical tourism support",
            "✓ Expert medical team",
          ].map((t) => <span key={t}>{t}</span>)}
        </div>
      </section>

      {/* WhatsApp strip */}
      <section className="bg-[#25D366]/10 border-b border-[#25D366]/20 py-3 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-8 text-sm">
          <a href="https://whatsapp.com/channel/0029Vb8reIG9cDDcOVXbsV24" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 font-medium text-[#128C7E] hover:text-[#075E54] transition-colors">
            <MessageCircle className="h-4 w-4 shrink-0" />
            Follow LIFEX Mobile Clinic on WhatsApp for health tips &amp; updates
          </a>
          <span className="hidden sm:block text-gray-300">|</span>
          <a href="https://wa.me/message/U6UFW6EA5DJLK1" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 font-medium text-[#128C7E] hover:text-[#075E54] transition-colors">
            <MessageCircle className="h-4 w-4 shrink-0" />
            Chat us on WhatsApp
          </a>
        </div>
      </section>

      {/* Services */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">What we offer</h2>
            <p className="mt-3 text-gray-500 text-lg max-w-xl mx-auto">
              Professional healthcare services — delivered where you need them.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {SERVICES.map(({ icon: Icon, name, desc }) => (
              <div key={name}
                className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md hover:border-[#1A5C38]/30 transition-all group">
                <div className="h-10 w-10 rounded-lg bg-[#E8F5EE] flex items-center justify-center mb-4 group-hover:bg-[#1A5C38] transition-colors">
                  <Icon className="h-5 w-5 text-[#1A5C38] group-hover:text-white transition-colors" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{name}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link href="/requests"
              className="inline-flex items-center gap-2 border-2 border-[#1A5C38] text-[#1A5C38] font-semibold px-6 py-3 rounded-xl hover:bg-[#1A5C38] hover:text-white transition-all">
              Home visit or hospital assistance? Submit a special request
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-gray-50 py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">How it works</h2>
            <p className="mt-3 text-gray-500 text-lg">Four simple steps — no account needed.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map(({ step, title, desc }) => (
              <div key={step} className="bg-white rounded-xl p-6 border border-gray-200">
                <div className="text-3xl font-black text-[#00A896] mb-3">{step}</div>
                <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Health Tips CTA */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto bg-gradient-to-br from-[#E8F5EE] to-white rounded-2xl p-8 sm:p-12 text-center border border-[#1A5C38]/10">
          <div className="h-14 w-14 rounded-full bg-[#1A5C38] flex items-center justify-center mx-auto mb-5">
            <BookOpen className="h-7 w-7 text-white" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">Free Health Tips from Our Clinicians</h2>
          <p className="text-gray-600 mb-7 max-w-lg mx-auto">
            Our medical team regularly publishes expert health advice to help you stay well and make informed decisions.
          </p>
          <Link href="/health-tips"
            className="inline-flex items-center gap-2 bg-[#1A5C38] text-white font-semibold px-6 py-3 rounded-xl hover:bg-[#154a2d] transition-colors">
            Read Health Tips <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#1A5C38] py-20 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to book your appointment?
          </h2>
          <p className="text-white/75 text-lg mb-8">
            No account needed — just fill the form and we&apos;ll take care of the rest.
          </p>
          <Link href="/book"
            className="inline-flex items-center gap-2 bg-[#00A896] hover:bg-[#008f80] text-white font-semibold px-8 py-4 rounded-xl transition-all text-lg">
            Book your appointment <ArrowRight className="h-5 w-5" />
          </Link>
          <p className="mt-4 text-white/50 text-sm">Free to book. Works on any phone.</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="h-7 w-7 rounded-lg bg-[#1A5C38] flex items-center justify-center">
                  <Stethoscope className="h-4 w-4 text-white" />
                </div>
                <span className="text-white font-bold">LIFEX Mobile Clinic</span>
              </div>
              <p className="text-sm max-w-xs">Accessible, professional healthcare — delivered where you need it.</p>
            </div>
            <div className="space-y-2 text-sm">
              <p className="text-white font-medium">Services</p>
              <Link href="/book" className="block hover:text-white transition-colors">Book Appointment</Link>
              <Link href="/requests" className="block hover:text-white transition-colors">Special Requests</Link>
              <Link href="/health-tips" className="block hover:text-white transition-colors">Health Tips</Link>
            </div>
            <div className="space-y-2 text-sm">
              <p className="text-white font-medium">Contact us</p>
              <a href="tel:+2347037244339" className="flex items-center gap-2 hover:text-white transition-colors">
                <Phone className="h-3.5 w-3.5" /> +234 703 724 4339
              </a>
              <a href="mailto:lifexmobileClinic@gmail.com" className="flex items-center gap-2 hover:text-white transition-colors">
                <Mail className="h-3.5 w-3.5" /> lifexmobileClinic@gmail.com
              </a>
              <a href="https://whatsapp.com/channel/0029Vb8reIG9cDDcOVXbsV24" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-white transition-colors">
                <MessageCircle className="h-3.5 w-3.5" /> Follow on WhatsApp
              </a>
            </div>
            <div className="space-y-2 text-sm">
              <p className="text-white font-medium">Staff</p>
              <Link href="/login" className="block hover:text-white transition-colors">Staff Login</Link>
              {session?.role === "ADMIN" && (
                <Link href="/admin/dashboard" className="block hover:text-white transition-colors flex items-center gap-1.5">
                  <CheckCircle2 className="h-3 w-3 text-green-400" /> Dashboard
                </Link>
              )}
            </div>
          </div>
          <div className="border-t border-gray-800 mt-10 pt-6 text-xs text-gray-600">
            <p>© 2026 LIFEX Mobile Clinic. Built by <span className="text-gray-400">Tamarcom Technologies</span>. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
