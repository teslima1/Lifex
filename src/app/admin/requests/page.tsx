"use client";
import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Home, Building2, Plane, Filter, DollarSign, Mail, Phone } from "lucide-react";
import { Topbar } from "@/components/layout/topbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { PageLoader } from "@/components/ui/spinner";
import { formatDateTime, formatCurrency } from "@/lib/utils";

const TYPE_ICONS: Record<string, typeof Home> = {
  HOME_VISIT:      Home,
  HOSPITAL_ASSIST: Building2,
  MEDICAL_TOURISM: Plane,
};
const TYPE_LABELS: Record<string, string> = {
  HOME_VISIT:      "Home Medical Visit",
  HOSPITAL_ASSIST: "Hospital Assistance",
  MEDICAL_TOURISM: "Medical Tourism",
};
const STATUS_COLORS: Record<string, string> = {
  PENDING:     "bg-amber-100 text-amber-800",
  IN_PROGRESS: "bg-blue-100 text-blue-800",
  COMPLETED:   "bg-green-100 text-green-800",
  CANCELLED:   "bg-gray-100 text-gray-600",
};

interface SpecialRequest {
  id: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  type: string;
  status: string;
  details: Record<string, string>;
  staffNotes?: string | null;
  quotedPrice?: number | null;
  createdAt: string;
}

export default function AdminRequestsPage() {
  const [requests, setRequests] = useState<SpecialRequest[]>([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState("");
  const [selected, setSelected] = useState<SpecialRequest | null>(null);
  const [newStatus, setNewStatus] = useState("IN_PROGRESS");
  const [staffNotes, setStaffNotes] = useState("");
  const [quotedPrice, setQuotedPrice] = useState("");
  const [saving, setSaving]     = useState(false);

  const load = useCallback(async () => {
    const url = filter ? `/api/special-requests?status=${filter}` : "/api/special-requests";
    const r = await axios.get(url);
    setRequests(r.data.data || []);
  }, [filter]);

  useEffect(() => {
    setLoading(true);
    load().finally(() => setLoading(false));
  }, [load]);

  async function handleUpdate() {
    if (!selected) return;
    setSaving(true);
    try {
      const payload: Record<string, unknown> = { status: newStatus, staffNotes };
      if (quotedPrice) payload.quotedPrice = Math.round(parseFloat(quotedPrice) * 100);
      await axios.patch(`/api/special-requests/${selected.id}`, payload);
      toast.success("Request updated");
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
      <Topbar title="Special Requests" />
      <div className="p-6 space-y-5">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <Filter className="h-4 w-4 text-gray-400 shrink-0" />
          {[["", "All"], ["PENDING", "Pending"], ["IN_PROGRESS", "In Progress"], ["COMPLETED", "Completed"]].map(([v, l]) => (
            <button
              key={v}
              type="button"
              onClick={() => setFilter(v)}
              className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium transition-all
                ${filter === v ? "bg-[#1A5C38] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
            >
              {l}
            </button>
          ))}
        </div>

        {requests.length === 0 ? (
          <div className="text-center py-16">
            <Plane className="h-12 w-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500">No requests found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {requests.map((req) => {
              const Icon = TYPE_ICONS[req.type] || Home;
              const details = req.details || {};
              return (
                <Card key={req.id}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="h-10 w-10 rounded-lg bg-[#E8F5EE] flex items-center justify-center shrink-0">
                        <Icon className="h-5 w-5 text-[#1A5C38]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900">{TYPE_LABELS[req.type] || req.type}</p>
                        <p className="text-sm font-medium text-gray-700 mt-0.5">{req.guestName}</p>
                        <div className="flex items-center gap-4 flex-wrap mt-1">
                          <span className="flex items-center gap-1 text-xs text-gray-500">
                            <Mail className="h-3 w-3" /> {req.guestEmail}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-gray-500">
                            <Phone className="h-3 w-3" /> {req.guestPhone}
                          </span>
                        </div>
                        {details.address      && <p className="text-sm text-gray-600 mt-1">📍 {details.address}</p>}
                        {details.preferredDate && <p className="text-sm text-gray-600">📅 {details.preferredDate}</p>}
                        {details.destination   && <p className="text-sm text-gray-600">✈️ {details.destination} — {details.procedure}</p>}
                        {details.hospital      && <p className="text-sm text-gray-600">🏥 {details.hospital}</p>}
                        {req.quotedPrice != null && (
                          <p className="text-sm font-semibold text-[#1A5C38] mt-1">
                            💰 Quoted: {formatCurrency(String(req.quotedPrice / 100))}
                          </p>
                        )}
                        {req.staffNotes && (
                          <p className="text-sm text-gray-500 mt-2 p-2 bg-gray-50 rounded-lg">
                            <span className="font-medium">Note: </span>{req.staffNotes}
                          </p>
                        )}
                        <p className="text-xs text-gray-300 mt-1">{formatDateTime(req.createdAt)}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_COLORS[req.status] || "bg-gray-100 text-gray-600"}`}>
                        {req.status.replace("_", " ")}
                      </span>
                      {req.status !== "COMPLETED" && req.status !== "CANCELLED" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelected(req);
                            setNewStatus(req.status === "PENDING" ? "IN_PROGRESS" : "COMPLETED");
                            setStaffNotes(req.staffNotes || "");
                            setQuotedPrice(req.quotedPrice != null ? String(req.quotedPrice / 100) : "");
                          }}
                        >
                          Update
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <Modal open={!!selected} onClose={() => setSelected(null)} title="Update Request">
        {selected && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5C38]/30 bg-white"
              >
                <option value="PENDING">Pending</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <DollarSign className="h-3.5 w-3.5 inline mr-1" />
                Quote price (₦)
              </label>
              <input
                type="number"
                min="0"
                value={quotedPrice}
                onChange={(e) => setQuotedPrice(e.target.value)}
                placeholder="e.g. 50000"
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5C38]/30"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Staff note</label>
              <textarea
                rows={3}
                value={staffNotes}
                onChange={(e) => setStaffNotes(e.target.value)}
                placeholder="e.g. Doctor will visit Monday 10am..."
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
