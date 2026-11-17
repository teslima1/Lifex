import { notFound } from "next/navigation";
import Link from "next/link";
import { Stethoscope, ArrowLeft, Calendar, User2, BookOpen } from "lucide-react";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/utils";

export const revalidate = 60;

export async function generateStaticParams() {
  const tips = await db.healthTip.findMany({ where: { isPublished: true }, select: { slug: true } });
  return tips.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tip = await db.healthTip.findUnique({ where: { slug }, select: { title: true, excerpt: true } });
  if (!tip) return {};
  return { title: tip.title, description: tip.excerpt };
}

export default async function HealthTipPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tip = await db.healthTip.findUnique({
    where: { slug, isPublished: true },
    include: { author: { select: { name: true } } },
  });

  if (!tip) notFound();

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-white/80 backdrop-blur border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-[#1A5C38] flex items-center justify-center">
              <Stethoscope className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-[#1A5C38]">LIFEX Mobile Clinic</span>
          </Link>
          <Link
            href="/book"
            className="bg-[#1A5C38] text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-[#154a2d] transition-colors"
          >
            Book Appointment
          </Link>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-10">
        <Link href="/health-tips" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#1A5C38] transition-colors mb-8">
          <ArrowLeft className="h-4 w-4" /> Back to Health Tips
        </Link>

        {tip.category && (
          <span className="inline-block px-3 py-1 rounded-full bg-[#E8F5EE] text-[#1A5C38] text-xs font-semibold uppercase tracking-wide mb-4">
            {tip.category}
          </span>
        )}

        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight mb-4">{tip.title}</h1>

        <div className="flex items-center gap-5 text-sm text-gray-400 mb-8">
          <span className="flex items-center gap-1.5"><User2 className="h-4 w-4" /> {tip.author.name}</span>
          {tip.publishedAt && (
            <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" /> {formatDate(tip.publishedAt)}</span>
          )}
        </div>

        {tip.imageUrl && (
          <div className="rounded-2xl overflow-hidden mb-8">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={tip.imageUrl} alt={tip.title} className="w-full object-cover max-h-96" />
          </div>
        )}

        {tip.excerpt && (
          <p className="text-lg text-gray-600 font-medium leading-relaxed border-l-4 border-[#1A5C38] pl-5 mb-8 italic">
            {tip.excerpt}
          </p>
        )}

        <div className="prose prose-gray max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap text-base">
          {tip.content}
        </div>

        {/* CTA */}
        <div className="mt-12 bg-gradient-to-br from-[#E8F5EE] to-white rounded-2xl p-8 text-center border border-[#1A5C38]/10">
          <div className="h-12 w-12 rounded-full bg-[#1A5C38] flex items-center justify-center mx-auto mb-4">
            <Stethoscope className="h-6 w-6 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Need Medical Attention?</h3>
          <p className="text-gray-600 text-sm mb-6">Our team of healthcare professionals is here to help. Book an appointment today.</p>
          <div className="flex items-center justify-center gap-4">
            <Link
              href="/book"
              className="bg-[#1A5C38] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#154a2d] transition-colors"
            >
              Book Appointment
            </Link>
            <Link
              href="/health-tips"
              className="flex items-center gap-1.5 text-sm text-[#1A5C38] font-semibold hover:underline"
            >
              <BookOpen className="h-4 w-4" /> More Tips
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
