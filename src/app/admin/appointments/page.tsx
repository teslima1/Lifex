"use client";
import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import {
  CalendarDays, Phone, Mail, Users, Filter,
  CheckCircle2, XCircle, Clock, ChevronDown,
} from "lucide-react";
import { Topbar } from "@/components/layout/topbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { PageLoader } from "@/components/ui/spinner";
import { formatAppointmentDate, formatDateTime } from "@/lib/utils";

interface Appointment {
  id: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  guestGender?: string;
  guestCountry?: string;
  numberOfPeople: number;
  slotDatetime: string;
  status: string;
  guestNotes?: string;
  staffNotes?: string;
  serviceType: { name: string };
  createdAt: string;
}

const STATUS_CLS: Record<string, string> = {
  PENDING:   "bg-amber-100 text-amber-700",
  CONFIRMED: "bg-green-100 text-green-700",
  COMPLETED: "bg-gray-100 text-gray-500",
  CANCELLED: "bg-red-100 text-red-700",
};

const FILTERS = [
  { label: "All",       value: "" },
  { label: "Pending",   value: "PENDING" },
  { label: "Confirmed", value: "CONFIRMED" },
  { label: "Completed", value: "COMPLETED" },
  { label: "Cancelled", value: "CANCELLED" },
];

export default function AdminAppointmentsPage() {
  const searchParams = useSearchParams();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading]           = useState(true);
  const [filter, setFilter]             = useState(() => searchParams.get("status") ?? "");
  const [selected, setSelected]         = useState<Appointment | null>(null);
  const [newStatus, setNewStatus]       = useState("");
  const [staffNotes, setStaffNotes]     = useState("");
  const [saving, setSaving]             = useState(false);

  const load = useCallback(async () => {
    const url = filter ? `/api/appointments?status=${filter}` : "/api/appointments";
    const r = await axios.get(url);
    setAppointments(r.data.data || []);
  }, [filter]);

  useEffect(() => {
    setLoading(true);
    load().finally(() => setLoading(false));
  }, [load]);

  async function handleUpdate() {
    if (!selected) return;
    setSaving(true);
    try {
      await axios.patch(`/api/appointments/${selected.id}`, {
        status: newStatus || undefined,
        staffNotes: staffNotes || undefined,
      });
      toast.success("Appointment updated");
      setSelected(null);
      await load();
    } catch {
      toast.error("Update failed");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <PageLoader />;

  return (
    <div>
      <Topbar title="Appointments" subtitle={
        <span className="text-xs text-gray-400 ml-3">{appointments.length} record{appointments.length !== 1 ? "s" : ""}</span>
      } />
      <div className="p-6 space-y-5">

        {/* Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <Filter className="h-4 w-4 text-gray-400 shrink-0" />
          {FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setFilter(f.value)}
              className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium transition-all
                ${filter === f.value ? "bg-[#1A5C38] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {appointments.length === 0 ? (
          <div className="text-center py-16">
            <CalendarDays className="h-12 w-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500">No appointments found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {appointments.map((appt) => (
              <Card key={appt.id}>
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="h-10 w-10 rounded-full bg-[#E8F5EE] flex items-center justify-center text-[#1A5C38] text-sm font-bold shrink-0">
                      {appt.guestName[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-gray-900">{appt.guestName}</p>
                        {appt.guestGender && <span className="text-xs text-gray-400">· {appt.guestGender}</span>}
                        {appt.guestCountry && <span className="text-xs text-gray-400">· {appt.guestCountry}</span>}
                      </div>
                      <div className="flex items-center gap-4 mt-1 flex-wrap">
                        <span className="flex items-center gap-1 text-xs text-gray-600">
                          <Mail className="h-3 w-3" /> {appt.guestEmail}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-gray-600">
                          <Phone className="h-3 w-3" /> {appt.guestPhone}
                        </span>
                        {appt.numberOfPeople > 1 && (
                          <span className="flex items-center gap-1 text-xs text-gray-600">
                            <Users className="h-3 w-3" /> {appt.numberOfPeople} people
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                        <span className="flex items-center gap-1 text-sm font-medium text-[#1A5C38]">
                          <CalendarDays className="h-3.5 w-3.5" />
                          {formatAppointmentDate(appt.slotDatetime)}
                        </span>
                        <span className="text-xs text-gray-400">· {appt.serviceType.name}</span>
                      </div>
                      {appt.guestNotes && (
                        <p className="text-sm text-gray-500 mt-2 p-2 bg-gray-50 rounded-lg">
                          <span className="font-medium">Note: </span>{appt.guestNotes}
                        </p>
                      )}
                      {appt.staffNotes && (
                        <p className="text-sm text-green-700 mt-1 p-2 bg-green-50 rounded-lg">
                          <span className="font-medium">Staff: </span>{appt.staffNotes}
                        </p>
                      )}
                      <p className="text-xs text-gray-300 mt-1">Booked {formatDateTime(appt.createdAt)}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_CLS[appt.status] || "bg-gray-100 text-gray-600"}`}>
                      {appt.status}
                    </span>
                    {appt.status !== "COMPLETED" && appt.status !== "CANCELLED" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelected(appt);
                          setNewStatus(appt.status === "PENDING" ? "CONFIRMED" : "COMPLETED");
                          setStaffNotes(appt.staffNotes || "");
                        }}
                      >
                        Update
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Modal open={!!selected} onClose={() => setSelected(null)} title="Update Appointment">
        {selected && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-3 text-sm">
              <p className="font-semibold text-gray-900">{selected.guestName}</p>
              <p className="text-gray-600">{selected.serviceType.name} · {formatAppointmentDate(selected.slotDatetime)}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5C38]/30 bg-white"
              >
                <option value="PENDING">Pending</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Staff notes (internal)</label>
              <textarea
                rows={3}
                value={staffNotes}
                onChange={(e) => setStaffNotes(e.target.value)}
                placeholder="e.g. Called patient to confirm..."
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5C38]/30"
              />
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setSelected(null)}>Cancel</Button>
              <Button className="flex-1" loading={saving} onClick={handleUpdate}>Save changes</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
