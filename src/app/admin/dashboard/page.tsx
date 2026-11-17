"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import {
  CalendarDays, Send, ArrowRight, AlertCircle,
  CheckCircle2, Clock, Users, TrendingUp,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { Topbar } from "@/components/layout/topbar";
import { Card, StatCard } from "@/components/ui/card";
import { PageLoader } from "@/components/ui/spinner";
import { formatAppointmentDate, formatDate } from "@/lib/utils";

interface Stats {
  totalAppointments: number;
  todayAppointments: number;
  pendingAppointments: number;
  confirmedAppointments: number;
  completedAppointments: number;
  openSpecialRequests: number;
  pendingRequests: number;
  monthlyAppointments: { month: string; count: number }[];
}

interface Appointment {
  id: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  slotDatetime: string;
  status: string;
  numberOfPeople: number;
  serviceType: { name: string };
}

const STATUS_CLS: Record<string, string> = {
  PENDING:   "bg-amber-100 text-amber-700",
  CONFIRMED: "bg-green-100 text-green-700",
  COMPLETED: "bg-gray-100 text-gray-500",
  CANCELLED: "bg-red-100 text-red-700",
};

export default function AdminDashboard() {
  const [stats, setStats]       = useState<Stats | null>(null);
  const [upcoming, setUpcoming] = useState<Appointment[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    Promise.all([
      axios.get("/api/admin/stats"),
      axios.get("/api/appointments?status=PENDING"),
      axios.get(`/api/appointments?status=CONFIRMED`),
    ]).then(([statsRes, pendingRes, confirmedRes]) => {
      setStats(statsRes.data.data);
      // Merge and sort by date — show nearest upcoming
      const all: Appointment[] = [
        ...(pendingRes.data.data || []),
        ...(confirmedRes.data.data || []),
      ].sort((a, b) => new Date(a.slotDatetime).getTime() - new Date(b.slotDatetime).getTime());
      setUpcoming(all.slice(0, 8));
    }).finally(() => setLoading(false));
  }, []);

  if (loading || !stats) return <PageLoader />;

  return (
    <div>
      <Topbar title="Dashboard" />
      <div className="p-6 space-y-6">

        {/* Alerts */}
        {stats.pendingAppointments > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
            <div className="flex-1">
              <p className="font-semibold text-amber-800">
                {stats.pendingAppointments} new booking{stats.pendingAppointments > 1 ? "s" : ""} awaiting confirmation
              </p>
              <p className="text-sm text-amber-700">Review and confirm or reschedule.</p>
            </div>
            <Link href="/admin/appointments?status=PENDING" className="text-sm font-semibold text-amber-700 hover:text-amber-900 flex items-center gap-1 shrink-0">
              Review <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}

        {stats.pendingRequests > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center gap-3">
            <Send className="h-5 w-5 text-blue-600 shrink-0" />
            <div className="flex-1">
              <p className="font-semibold text-blue-800">
                {stats.openSpecialRequests} special request{stats.openSpecialRequests > 1 ? "s" : ""} open
              </p>
              <p className="text-sm text-blue-700">Review and respond to patient service requests.</p>
            </div>
            <Link href="/admin/requests" className="text-sm font-semibold text-blue-700 hover:text-blue-900 flex items-center gap-1 shrink-0">
              Review <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}

        {/* KPI stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard
            label="Today's Appointments"
            value={stats.todayAppointments}
            icon={<CalendarDays className="h-5 w-5" />}
            color="green"
            href="/admin/appointments"
          />
          <StatCard
            label="Pending Confirmation"
            value={stats.pendingAppointments}
            icon={<Clock className="h-5 w-5" />}
            color={stats.pendingAppointments > 0 ? "amber" : "gray"}
            href="/admin/appointments?status=PENDING"
          />
          <StatCard
            label="Confirmed"
            value={stats.confirmedAppointments}
            icon={<CheckCircle2 className="h-5 w-5" />}
            color="teal"
            href="/admin/appointments?status=CONFIRMED"
          />
          <StatCard
            label="Total All Time"
            value={stats.totalAppointments}
            icon={<Users className="h-5 w-5" />}
            color="gray"
            href="/admin/appointments"
          />
        </div>

        {/* Upcoming appointments + chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upcoming list */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Upcoming Appointments</h3>
              <Link href="/admin/appointments" className="text-xs text-[#1A5C38] font-medium hover:underline">
                View all
              </Link>
            </div>
            {upcoming.length === 0 ? (
              <div className="text-center py-8">
                <CalendarDays className="h-10 w-10 text-gray-200 mx-auto mb-2" />
                <p className="text-sm text-gray-400">No upcoming appointments</p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcoming.map((appt) => (
                  <Link
                    key={appt.id}
                    href={`/admin/appointments`}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                  >
                    <div className="h-9 w-9 rounded-full bg-[#E8F5EE] flex items-center justify-center text-[#1A5C38] text-sm font-bold shrink-0">
                      {appt.guestName[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm truncate">{appt.guestName}</p>
                      <p className="text-xs text-gray-500 truncate">{appt.serviceType.name}</p>
                      <p className="text-xs text-gray-400">{formatAppointmentDate(appt.slotDatetime)}</p>
                    </div>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${STATUS_CLS[appt.status] ?? "bg-gray-100 text-gray-500"}`}>
                      {appt.status}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </Card>

          {/* Monthly chart */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-[#1A5C38]" /> Bookings — Last 6 Months
              </h3>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={stats.monthlyAppointments}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#1A5C38" radius={[4, 4, 0, 0]} name="Bookings" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Quick actions */}
        <div>
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Quick Actions</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "All Appointments", href: "/admin/appointments", icon: CalendarDays, desc: "View & manage bookings" },
              { label: "Special Requests", href: "/admin/requests",     icon: Send,          desc: "Home visits, hospital assist" },
              { label: "Health Tips",      href: "/admin/health-tips",  icon: TrendingUp,    desc: "Publish health articles" },
              { label: "Services",         href: "/admin/services",     icon: CheckCircle2,  desc: "Manage clinic services" },
            ].map(({ label, href, icon: Icon, desc }) => (
              <Link key={href} href={href}>
                <Card className="hover:border-[#1A5C38]/30 hover:shadow-md transition-all cursor-pointer h-full">
                  <div className="h-10 w-10 rounded-xl bg-[#E8F5EE] flex items-center justify-center mb-3">
                    <Icon className="h-5 w-5 text-[#1A5C38]" />
                  </div>
                  <p className="font-semibold text-gray-900 text-sm">{label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
                </Card>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
