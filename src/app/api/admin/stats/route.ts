// GET /api/admin/stats — dashboard KPIs
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { startOfDay, endOfDay, startOfMonth, endOfMonth, subMonths, format } from "date-fns";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const now        = new Date();
  const todayStart = startOfDay(now);
  const todayEnd   = endOfDay(now);
  const monthStart = startOfMonth(now);
  const monthEnd   = endOfMonth(now);

  const [
    totalAppointments,
    todayAppointments,
    pendingAppointments,
    confirmedAppointments,
    completedAppointments,
    pendingRequests,
    inProgressRequests,
    appointmentsByStatus,
  ] = await Promise.all([
    db.appointment.count(),
    db.appointment.count({ where: { slotDatetime: { gte: todayStart, lte: todayEnd } } }),
    db.appointment.count({ where: { status: "PENDING" } }),
    db.appointment.count({ where: { status: "CONFIRMED" } }),
    db.appointment.count({ where: { status: "COMPLETED" } }),
    db.specialRequest.count({ where: { status: "PENDING" } }),
    db.specialRequest.count({ where: { status: "IN_PROGRESS" } }),
    db.appointment.groupBy({ by: ["status"], _count: { id: true } }),
  ]);

  // Monthly appointment count (last 6 months)
  const monthlyAppointments = await Promise.all(
    Array.from({ length: 6 }, (_, i) => {
      const d = subMonths(now, 5 - i);
      return db.appointment
        .count({ where: { createdAt: { gte: startOfMonth(d), lte: endOfMonth(d) } } })
        .then((count) => ({ month: format(d, "MMM yy"), count }));
    })
  );

  const statusMap = Object.fromEntries(
    appointmentsByStatus.map((s) => [s.status, s._count.id])
  );

  return NextResponse.json({
    data: {
      totalAppointments,
      todayAppointments,
      pendingAppointments,
      confirmedAppointments,
      completedAppointments,
      openSpecialRequests: pendingRequests + inProgressRequests,
      pendingRequests,
      inProgressRequests,
      appointmentsByStatus: statusMap,
      monthlyAppointments,
    },
  });
}
