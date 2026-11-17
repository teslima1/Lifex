"use client";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import toast from "react-hot-toast";
import { Building2, CreditCard, Lock, Send } from "lucide-react";
import { Topbar } from "@/components/layout/topbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageLoader } from "@/components/ui/spinner";

interface BankDetailsForm {
  bankName: string;
  accountName: string;
  accountNumber: string;
  reference?: string;
}

interface ClinicForm {
  clinicName: string;
  doctorName: string;
  phone: string;
  email: string;
  address?: string;
  website?: string;
}

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [savingBank, setSavingBank] = useState(false);
  const [savingClinic, setSavingClinic] = useState(false);
  const [changingPw, setChangingPw] = useState(false);
  const [activeTab, setActiveTab] = useState<"bank" | "clinic" | "pricing" | "security">("bank");

  // Special request pricing
  const REQUEST_TYPES = [
    { value: "HOME_VISIT", label: "Home Medical Visit" },
    { value: "HOSPITAL_ASSIST", label: "Hospital Assistance" },
    { value: "MEDICAL_TOURISM", label: "Medical Tourism" },
  ];
  const [pricing, setPricing] = useState<Record<string, { minPrice: number; maxPrice: number; isRange: boolean; notes: string }>>({});
  const [savingPricing, setSavingPricing] = useState<string | null>(null);

  const bankForm = useForm<BankDetailsForm>();
  const clinicForm = useForm<ClinicForm>();
  const pwForm = useForm<{ newPassword: string; confirm: string }>();

  useEffect(() => {
    Promise.all([
      axios.get("/api/bank-details"),
      axios.get("/api/clinic-settings"),
      axios.get("/api/special-request-pricing"),
    ]).then(([bankRes, clinicRes, pricingRes]) => {
      if (bankRes.data.data) bankForm.reset(bankRes.data.data);
      if (clinicRes.data.data) clinicForm.reset(clinicRes.data.data);
      const pricingMap: typeof pricing = {};
      for (const p of (pricingRes.data.data || [])) {
        pricingMap[p.type] = { minPrice: p.minPrice / 100, maxPrice: p.maxPrice / 100, isRange: p.isRange, notes: p.notes || "" };
      }
      setPricing(pricingMap);
    }).finally(() => setLoading(false));
  }, []);

  async function onSaveBank(data: BankDetailsForm) {
    setSavingBank(true);
    try {
      await axios.put("/api/bank-details", data);
      toast.success("Bank details updated.");
    } catch {
      toast.error("Failed to save bank details.");
    } finally {
      setSavingBank(false);
    }
  }

  async function onSaveClinic(data: ClinicForm) {
    setSavingClinic(true);
    try {
      await axios.put("/api/clinic-settings", data);
      toast.success("Clinic info updated.");
    } catch {
      toast.error("Failed to save clinic info.");
    } finally {
      setSavingClinic(false);
    }
  }

  async function savePricing(type: string) {
    const p = pricing[type] || { minPrice: 0, maxPrice: 0, isRange: true, notes: "" };
    setSavingPricing(type);
    try {
      await axios.put("/api/special-request-pricing", {
        type,
        minPrice: Math.round(p.minPrice * 100),
        maxPrice: Math.round(p.maxPrice * 100),
        isRange: p.isRange,
        notes: p.notes,
      });
      toast.success("Pricing saved.");
    } catch {
      toast.error("Failed to save pricing.");
    } finally {
      setSavingPricing(null);
    }
  }

  function updatePricing(type: string, field: string, value: unknown) {
    setPricing((prev) => ({
      ...prev,
      [type]: { ...(prev[type] || { minPrice: 0, maxPrice: 0, isRange: true, notes: "" }), [field]: value },
    }));
  }

  async function onChangePassword(data: { newPassword: string; confirm: string }) {
    if (data.newPassword !== data.confirm) {
      toast.error("Passwords do not match.");
      return;
    }
    setChangingPw(true);
    try {
      await axios.post("/api/auth/change-password", { newPassword: data.newPassword });
      toast.success("Password updated.");
      pwForm.reset();
    } catch {
      toast.error("Failed to change password.");
    } finally {
      setChangingPw(false);
    }
  }

  if (loading) return <PageLoader />;

  return (
    <div>
      <Topbar title="Settings" />
      <div className="p-6 max-w-2xl mx-auto space-y-6">
        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
          {([
            { id: "bank", label: "Bank Details", icon: CreditCard },
            { id: "clinic", label: "Clinic Info", icon: Building2 },
            { id: "pricing", label: "Pricing", icon: Send },
            { id: "security", label: "Security", icon: Lock },
          ] as const).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all
                ${activeTab === id ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

        {activeTab === "bank" && (
          <Card>
            <h3 className="font-semibold text-gray-900 mb-1">Bank Account Details</h3>
            <p className="text-sm text-gray-500 mb-4">
              These details are shown to patients when they need to make payment transfers.
            </p>
            <form onSubmit={bankForm.handleSubmit(onSaveBank)} className="space-y-4">
              <Input label="Bank name" required {...bankForm.register("bankName")} />
              <Input label="Account name" required {...bankForm.register("accountName")} />
              <Input label="Account number" required {...bankForm.register("accountNumber")} />
              <Input
                label="Transfer reference (optional)"
                placeholder="e.g. Patient name + appointment date"
                {...bankForm.register("reference")}
              />
              <Button type="submit" loading={savingBank} className="w-full">Save bank details</Button>
            </form>
          </Card>
        )}

        {activeTab === "clinic" && (
          <Card>
            <h3 className="font-semibold text-gray-900 mb-1">Clinic Information</h3>
            <p className="text-sm text-gray-500 mb-4">
              This information appears across the app and is visible to patients.
            </p>
            <form onSubmit={clinicForm.handleSubmit(onSaveClinic)} className="space-y-4">
              <Input label="Clinic name" required {...clinicForm.register("clinicName")} />
              <Input label="Lead doctor / contact person" required {...clinicForm.register("doctorName")} />
              <Input label="Phone number" required {...clinicForm.register("phone")} />
              <Input label="Email address" type="email" required {...clinicForm.register("email")} />
              <Input label="Address (optional)" {...clinicForm.register("address")} />
              <Input label="Website (optional)" placeholder="https://..." {...clinicForm.register("website")} />
              <Button type="submit" loading={savingClinic} className="w-full">Save clinic info</Button>
            </form>
          </Card>
        )}

        {activeTab === "pricing" && (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
              <p className="text-sm text-blue-800 font-medium">Special Request Pricing</p>
              <p className="text-xs text-blue-700 mt-1">Set the price range or fixed price for each type of special request. Patients are quoted this price by front desk staff when their request is received.</p>
            </div>
            {REQUEST_TYPES.map(({ value, label }) => {
              const p = pricing[value] || { minPrice: 0, maxPrice: 0, isRange: true, notes: "" };
              return (
                <Card key={value}>
                  <h4 className="font-semibold text-gray-900 mb-3">{label}</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <label className="text-sm font-medium text-gray-700">Pricing type:</label>
                      <div className="flex gap-3">
                        <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                          <input type="radio" checked={p.isRange} onChange={() => updatePricing(value, "isRange", true)} /> Range
                        </label>
                        <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                          <input type="radio" checked={!p.isRange} onChange={() => updatePricing(value, "isRange", false)} /> Fixed
                        </label>
                      </div>
                    </div>
                    <div className={`grid gap-3 ${p.isRange ? "grid-cols-2" : "grid-cols-1"}`}>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">{p.isRange ? "Minimum (₦)" : "Fixed Price (₦)"}</label>
                        <input
                          type="number"
                          min="0"
                          value={p.minPrice}
                          onChange={(e) => updatePricing(value, "minPrice", parseFloat(e.target.value) || 0)}
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5C38]/30"
                        />
                      </div>
                      {p.isRange && (
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Maximum (₦)</label>
                          <input
                            type="number"
                            min="0"
                            value={p.maxPrice}
                            onChange={(e) => updatePricing(value, "maxPrice", parseFloat(e.target.value) || 0)}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5C38]/30"
                          />
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Notes (optional)</label>
                      <input
                        type="text"
                        value={p.notes}
                        onChange={(e) => updatePricing(value, "notes", e.target.value)}
                        placeholder="e.g. Price varies with distance"
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5C38]/30"
                      />
                    </div>
                    <Button
                      size="sm"
                      loading={savingPricing === value}
                      onClick={() => savePricing(value)}
                    >
                      Save {label} pricing
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {activeTab === "security" && (
          <Card>
            <h3 className="font-semibold text-gray-900 mb-4">Change Password</h3>
            <form onSubmit={pwForm.handleSubmit(onChangePassword)} className="space-y-4">
              <Input
                label="New password"
                type="password"
                autoComplete="new-password"
                required
                {...pwForm.register("newPassword")}
              />
              <Input
                label="Confirm new password"
                type="password"
                autoComplete="new-password"
                required
                {...pwForm.register("confirm")}
              />
              <Button type="submit" loading={changingPw} className="w-full">Update password</Button>
            </form>
          </Card>
        )}
      </div>
    </div>
  );
}
