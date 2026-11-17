import Link from "next/link";
import { Stethoscope, ArrowRight, BookOpen } from "lucide-react";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/utils";

export const revalidate = 60;

export default async function HealthTipsPage() {
  const tips = await db.healthTip.findMany({
    where: { isPublished: true },
    orderBy: { publishedAt: "desc" },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      category: true,
      imageUrl: true,
      publishedAt: true,
      author: { select: { name: true } },
    },
  });

  const categories = [...new Set(tips.map((t) => t.category).filter(Boolean))] as string[];

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-white/80 backdrop-blur border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
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

      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="h-5 w-5 text-[#1A5C38]" />
            <span className="text-sm font-semibold text-[#1A5C38] uppercase tracking-wide">Health Tips</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Clinician Insights & Health Advice</h1>
          <p className="text-gray-500 mt-3 text-lg max-w-xl">Expert tips from our medical team to help you stay healthy and informed.</p>
        </div>

        {categories.length > 0 && (
          <div className="flex gap-2 flex-wrap mb-8">
            {categories.map((cat) => (
              <span key={cat} className="px-3 py-1 rounded-full bg-[#E8F5EE] text-[#1A5C38] text-xs font-semibold">
                {cat}
              </span>
            ))}
          </div>
        )}

        {tips.length === 0 ? (
          <div className="text-center py-24">
            <BookOpen className="h-16 w-16 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No health tips published yet.</p>
            <p className="text-gray-400 text-sm mt-1">Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {tips.map((tip) => (
              <Link
                key={tip.id}
                href={`/health-tips/${tip.slug}`}
                className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg hover:border-[#1A5C38]/20 transition-all"
              >
                {tip.imageUrl ? (
                  <div className="aspect-[16/9] bg-gray-100 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={tip.imageUrl} alt={tip.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                ) : (
                  <div className="aspect-[16/9] bg-gradient-to-br from-[#E8F5EE] to-[#c8e6d8] flex items-center justify-center">
                    <BookOpen className="h-10 w-10 text-[#1A5C38]/40" />
                  </div>
                )}
                <div className="p-5">
                  {tip.category && (
                    <span className="text-xs font-semibold text-[#1A5C38] uppercase tracking-wide">{tip.category}</span>
                  )}
                  <h2 className="font-bold text-gray-900 mt-1 text-base leading-snug group-hover:text-[#1A5C38] transition-colors">
                    {tip.title}
                  </h2>
                  {tip.excerpt && (
                    <p className="text-sm text-gray-500 mt-2 line-clamp-2">{tip.excerpt}</p>
                  )}
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-xs text-gray-400">
                      {tip.publishedAt ? formatDate(tip.publishedAt) : ""}
                    </span>
                    <span className="flex items-center gap-1 text-xs font-semibold text-[#1A5C38] group-hover:gap-2 transition-all">
                      Read <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
