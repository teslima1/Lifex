"use client";
import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Plus, Pencil, Package, ToggleLeft, ToggleRight } from "lucide-react";
import { Topbar } from "@/components/layout/topbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { PageLoader } from "@/components/ui/spinner";
import { formatCurrency } from "@/lib/utils";

interface ServiceType {
  id: string;
  name: string;
  description?: string | null;
  price?: number | null;    // kobo
  durationMin: number;
  isActive: boolean;
}

const EMPTY = {
  name: "",
  description: "",
  price: "",        // empty = price on request
  durationMin: "30",
  isActive: true,
};

export default function ServicesPage() {
  const [services, setServices] = useState<ServiceType[]>([]);
  const [loading, setLoading]   = useState(true);
  const [modal, setModal]       = useState(false);
  const [editing, setEditing]   = useState<ServiceType | null>(null);
  const [form, setForm]         = useState(EMPTY);
  const [saving, setSaving]     = useState(false);

  const set = (k: keyof typeof EMPTY, v: string | boolean) =>
    setForm((f) => ({ ...f, [k]: v }));

  const load = useCallback(async () => {
    // include inactive for admin
    const r = await axios.get("/api/services?all=true");
    setServices(r.data.data || []);
  }, []);

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, [load]);

  function openCreate() {
    setEditing(null);
    setForm(EMPTY);
    setModal(true);
  }

  function openEdit(svc: ServiceType) {
    setEditing(svc);
    setForm({
      name: svc.name,
      description: svc.description || "",
      price: svc.price != null ? String(svc.price / 100) : "",
      durationMin: String(svc.durationMin),
      isActive: svc.isActive,
    });
    setModal(true);
  }

  async function handleSave() {
    if (!form.name.trim()) { toast.error("Service name is required"); return; }
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description || undefined,
        price: form.price ? Math.round(parseFloat(form.price) * 100) : null,
        durationMin: parseInt(form.durationMin) || 30,
        isActive: form.isActive,
      };
      if (editing) {
        await axios.patch(`/api/services/${editing.id}`, payload);
        toast.success("Service updated");
      } else {
        await axios.post("/api/services", payload);
        toast.success("Service created");
      }
      setModal(false);
      await load();
    } catch {
      toast.error("Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(svc: ServiceType) {
    try {
      await axios.patch(`/api/services/${svc.id}`, { isActive: !svc.isActive });
      await load();
    } catch {
      toast.error("Update failed");
    }
  }

  if (loading) return <PageLoader />;

  return (
    <div>
      <Topbar
        title="Services & Pricing"
        actions={
          <Button size="sm" onClick={openCreate}>
            <Plus className="h-4 w-4 mr-1.5" /> New Service
          </Button>
        }
      />
      <div className="p-6 space-y-4">
        {services.length === 0 ? (
          <div className="text-center py-16">
            <Package className="h-12 w-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 mb-4">No services yet</p>
            <Button onClick={openCreate}><Plus className="h-4 w-4 mr-1.5" /> Add first service</Button>
          </div>
        ) : (
          <div className="space-y-3">
            {services.map((svc) => (
              <Card key={svc.id} className={!svc.isActive ? "opacity-60" : ""}>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-gray-900">{svc.name}</p>
                      {!svc.isActive && (
                        <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Inactive</span>
                      )}
                    </div>
                    {svc.description && <p className="text-sm text-gray-500 mt-0.5 truncate">{svc.description}</p>}
                    <p className="text-xs text-gray-400 mt-1">{svc.durationMin} min per session</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <p className="font-bold text-[#1A5C38] text-base">
                      {svc.price != null ? formatCurrency(svc.price / 100) : "Price on request"}
                    </p>
                    <button
                      title="Edit"
                      onClick={() => openEdit(svc)}
                      className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <Pencil className="h-4 w-4 text-gray-500" />
                    </button>
                    <button
                      title={svc.isActive ? "Deactivate" : "Activate"}
                      onClick={() => toggleActive(svc)}
                      className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      {svc.isActive
                        ? <ToggleRight className="h-5 w-5 text-[#1A5C38]" />
                        : <ToggleLeft className="h-5 w-5 text-gray-400" />
                      }
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Modal
        open={modal}
        onClose={() => setModal(false)}
        title={editing ? "Edit Service" : "New Service"}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Service Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="e.g. General Consultation"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5C38]/30"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              rows={2}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Brief description of this service"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5C38]/30 resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price (₦)</label>
              <input
                type="number"
                min="0"
                value={form.price}
                onChange={(e) => set("price", e.target.value)}
                placeholder="e.g. 15000 (leave blank = price on request)"
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5C38]/30"
              />
              <p className="text-xs text-gray-400 mt-0.5">Leave blank for &quot;price on request&quot;</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
              <input
                type="number"
                min="5"
                value={form.durationMin}
                onChange={(e) => set("durationMin", e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5C38]/30"
              />
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => set("isActive", e.target.checked)}
              className="h-4 w-4 rounded accent-[#1A5C38]"
            />
            <span className="text-sm font-medium text-gray-700">Active (visible to patients)</span>
          </label>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={() => setModal(false)}>Cancel</Button>
            <Button className="flex-1" loading={saving} onClick={handleSave}>
              {editing ? "Save changes" : "Create service"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
