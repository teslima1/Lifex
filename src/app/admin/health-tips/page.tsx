"use client";
import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Plus, FileText, Eye, EyeOff, Pencil, Trash2, ExternalLink } from "lucide-react";
import Link from "next/link";
import { Topbar } from "@/components/layout/topbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { PageLoader } from "@/components/ui/spinner";
import { formatDate } from "@/lib/utils";

interface HealthTip {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  category?: string | null;
  imageUrl?: string | null;
  isPublished: boolean;
  publishedAt?: string | null;
  createdAt: string;
  author: { name: string };
}

const EMPTY = {
  title: "",
  slug: "",
  excerpt: "",
  category: "",
  imageUrl: "",
  content: "",
  isPublished: false,
};

export default function AdminHealthTipsPage() {
  const [tips, setTips]       = useState<HealthTip[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal]     = useState<"create" | "edit" | null>(null);
  const [editId, setEditId]   = useState<string | null>(null);
  const [form, setForm]       = useState(EMPTY);
  const [saving, setSaving]   = useState(false);
  const [delId, setDelId]     = useState<string | null>(null);

  const set = (k: keyof typeof EMPTY, v: string | boolean) =>
    setForm((f) => ({ ...f, [k]: v }));

  const load = useCallback(async () => {
    const r = await axios.get("/api/health-tips?all=true");
    setTips(r.data.data || []);
  }, []);

  useEffect(() => {
    setLoading(true);
    load().finally(() => setLoading(false));
  }, [load]);

  function openCreate() {
    setForm(EMPTY);
    setEditId(null);
    setModal("create");
  }

  function openEdit(tip: HealthTip) {
    setForm({
      title: tip.title,
      slug: tip.slug,
      excerpt: tip.excerpt || "",
      category: tip.category || "",
      imageUrl: tip.imageUrl || "",
      content: "",   // content is not returned in list; kept blank
      isPublished: tip.isPublished,
    });
    setEditId(tip.id);
    setModal("edit");
  }

  async function handleSave() {
    setSaving(true);
    try {
      if (modal === "create") {
        await axios.post("/api/health-tips", form);
        toast.success("Health tip created");
      } else {
        await axios.patch(`/api/health-tips/${editId}`, form);
        toast.success("Health tip updated");
      }
      setModal(null);
      await load();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || "Save failed";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!delId) return;
    setSaving(true);
    try {
      await axios.delete(`/api/health-tips/${delId}`);
      toast.success("Deleted");
      setDelId(null);
      await load();
    } catch {
      toast.error("Delete failed");
    } finally {
      setSaving(false);
    }
  }

  async function togglePublish(tip: HealthTip) {
    try {
      await axios.patch(`/api/health-tips/${tip.id}`, { isPublished: !tip.isPublished });
      toast.success(tip.isPublished ? "Unpublished" : "Published");
      await load();
    } catch {
      toast.error("Failed to update status");
    }
  }

  if (loading) return <PageLoader />;

  return (
    <div>
      <Topbar
        title="Health Tips"
        actions={
          <Button size="sm" onClick={openCreate}>
            <Plus className="h-4 w-4 mr-1.5" /> New Article
          </Button>
        }
      />
      <div className="p-6 space-y-4">
        {tips.length === 0 ? (
          <div className="text-center py-16">
            <FileText className="h-12 w-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 mb-4">No health tips yet</p>
            <Button onClick={openCreate}><Plus className="h-4 w-4 mr-1.5" /> Write first article</Button>
          </div>
        ) : (
          <div className="space-y-3">
            {tips.map((tip) => (
              <Card key={tip.id}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    {tip.imageUrl ? (
                      <div className="h-14 w-14 rounded-xl overflow-hidden shrink-0 bg-gray-100">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={tip.imageUrl} alt={tip.title} className="h-full w-full object-cover" />
                      </div>
                    ) : (
                      <div className="h-14 w-14 rounded-xl bg-[#E8F5EE] flex items-center justify-center shrink-0">
                        <FileText className="h-6 w-6 text-[#1A5C38]" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-gray-900 truncate">{tip.title}</p>
                        {tip.category && (
                          <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{tip.category}</span>
                        )}
                      </div>
                      {tip.excerpt && (
                        <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">{tip.excerpt}</p>
                      )}
                      <div className="flex items-center gap-3 mt-1 flex-wrap text-xs text-gray-400">
                        <span>By {tip.author.name}</span>
                        {tip.publishedAt && <span>· {formatDate(tip.publishedAt)}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      tip.isPublished ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                    }`}>
                      {tip.isPublished ? "Published" : "Draft"}
                    </span>
                    <button
                      title={tip.isPublished ? "Unpublish" : "Publish"}
                      onClick={() => togglePublish(tip)}
                      className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-500"
                    >
                      {tip.isPublished ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                    {tip.isPublished && (
                      <Link
                        href={`/health-tips/${tip.slug}`}
                        target="_blank"
                        className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-500"
                        title="View on site"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    )}
                    <button
                      onClick={() => openEdit(tip)}
                      className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-500"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setDelId(tip.id)}
                      className="p-1.5 rounded-lg hover:bg-red-50 transition-colors text-red-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      <Modal
        open={modal === "create" || modal === "edit"}
        onClose={() => setModal(null)}
        title={modal === "create" ? "New Health Tip" : "Edit Health Tip"}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => {
                set("title", e.target.value);
                // Auto-generate slug for new articles
                if (modal === "create") {
                  set("slug", e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
                }
              }}
              placeholder="5 Tips for a Healthier Heart"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5C38]/30"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
            <input
              type="text"
              value={form.slug}
              onChange={(e) => set("slug", e.target.value)}
              placeholder="5-tips-for-a-healthier-heart"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5C38]/30 font-mono"
            />
            <p className="text-xs text-gray-400 mt-0.5">URL: /health-tips/{form.slug || "..."}</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <input
                type="text"
                value={form.category}
                onChange={(e) => set("category", e.target.value)}
                placeholder="e.g. Nutrition"
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5C38]/30"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
              <input
                type="url"
                value={form.imageUrl}
                onChange={(e) => set("imageUrl", e.target.value)}
                placeholder="https://..."
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5C38]/30"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Excerpt</label>
            <textarea
              rows={2}
              value={form.excerpt}
              onChange={(e) => set("excerpt", e.target.value)}
              placeholder="A short summary shown in the tip listing..."
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5C38]/30 resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Content {modal === "edit" && <span className="text-gray-400 font-normal">(leave blank to keep existing)</span>}
            </label>
            <textarea
              rows={8}
              value={form.content}
              onChange={(e) => set("content", e.target.value)}
              placeholder="Write the full article content here..."
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5C38]/30"
            />
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isPublished}
                onChange={(e) => set("isPublished", e.target.checked)}
                className="h-4 w-4 rounded accent-[#1A5C38]"
              />
              <span className="text-sm font-medium text-gray-700">Publish immediately</span>
            </label>
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={() => setModal(null)}>Cancel</Button>
            <Button className="flex-1" loading={saving} onClick={handleSave}>
              {modal === "create" ? "Create Article" : "Save Changes"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal open={!!delId} onClose={() => setDelId(null)} title="Delete Health Tip">
        <div className="space-y-4">
          <p className="text-gray-600 text-sm">Are you sure you want to delete this health tip? This cannot be undone.</p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setDelId(null)}>Cancel</Button>
            <Button
              className="flex-1 !bg-red-600 hover:!bg-red-700"
              loading={saving}
              onClick={handleDelete}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
