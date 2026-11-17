"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { Send, Paperclip, X, Image as ImageIcon, CheckCheck } from "lucide-react";
import { cn, timeAgo } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

interface Message {
  id: string;
  content: string;
  attachmentUrl?: string | null;
  attachmentName?: string | null;
  attachmentType?: string | null;
  isRead: boolean;
  createdAt: string;
  sender: { id: string; name: string; role: string };
}

interface ChatPanelProps {
  conversationId: string;
  currentUserId?: string; // optional — fetched from session if omitted
  title?: string;
  className?: string;
  readOnly?: boolean;
  headerActions?: React.ReactNode;
}

export function ChatPanel({
  conversationId,
  currentUserId: propUserId,
  title,
  className,
  readOnly = false,
  headerActions,
}: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [input, setInput] = useState("");
  const [pendingAttachment, setPendingAttachment] = useState<{
    url: string; name: string; type: string;
  } | null>(null);
  const [myUserId, setMyUserId] = useState(propUserId ?? "");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Fetch current user id if not provided
  useEffect(() => {
    if (!propUserId) {
      axios.get("/api/auth/me").then((r) => setMyUserId(r.data.data.id)).catch(() => {});
    }
  }, [propUserId]);

  const fetchMessages = useCallback(async () => {
    try {
      const { data } = await axios.get(`/api/conversations/${conversationId}/messages`);
      setMessages(data.data || []);
    } catch {
      // silently fail during polling
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  useEffect(() => {
    setLoading(true);
    fetchMessages();
    const interval = setInterval(fetchMessages, 4000);
    return () => clearInterval(interval);
  }, [fetchMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 5 MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("File too large. Maximum 5 MB.");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const { data } = await axios.post("/api/upload/chat", formData);
      setPendingAttachment({
        url: data.url,
        name: file.name,
        type: file.type.startsWith("image/") ? "image" : "file",
      });
    } catch {
      alert("Upload failed. Please try again.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function sendMessage() {
    const content = input.trim();
    if ((!content && !pendingAttachment) || sending) return;

    setSending(true);
    try {
      const payload: Record<string, string> = {
        content: content || (pendingAttachment ? `[Attachment: ${pendingAttachment.name}]` : ""),
      };
      // Only include attachment fields if there is one (Zod rejects null)
      if (pendingAttachment) {
        payload.attachmentUrl  = pendingAttachment.url;
        payload.attachmentName = pendingAttachment.name;
        payload.attachmentType = pendingAttachment.type;
      }

      const { data } = await axios.post(`/api/conversations/${conversationId}/messages`, payload);
      setMessages((prev) => [...prev, data.data]);
      setInput("");
      setPendingAttachment(null);
      inputRef.current?.focus();
    } catch (err: any) {
      const msg = err?.response?.data?.error || "Failed to send message. Please try again.";
      toast.error(msg);
    } finally {
      setSending(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  if (loading) {
    return (
      <div className={cn("flex items-center justify-center h-64", className)}>
        <Spinner />
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col bg-white rounded-xl border border-gray-200 overflow-hidden h-full", className)}>
      {/* Header */}
      {(title || headerActions) && (
        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
          {title && <p className="font-semibold text-sm text-gray-900">{title}</p>}
          {headerActions && <div className="flex items-center gap-2">{headerActions}</div>}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[200px]">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-gray-400">No messages yet. Say hello!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMine = msg.sender.id === myUserId;
            const isSystemMsg = msg.content.startsWith("✅") || msg.content.startsWith("👋") ||
                                msg.content.startsWith("🩺") || msg.content.startsWith("🔄");
            if (isSystemMsg) {
              return (
                <div key={msg.id} className="flex justify-center">
                  <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                    {msg.content}
                  </span>
                </div>
              );
            }

            return (
              <div key={msg.id} className={cn("flex", isMine ? "justify-end" : "justify-start")}>
                <div className={cn("max-w-[75%] flex flex-col gap-1", isMine ? "items-end" : "items-start")}>
                  {!isMine && (
                    <span className="text-xs text-gray-500 ml-1 capitalize">
                      {msg.sender.name} <span className="text-gray-400">({msg.sender.role.replace("_", " ")})</span>
                    </span>
                  )}
                  <div
                    className={cn(
                      "px-4 py-2.5 rounded-2xl text-sm",
                      isMine
                        ? "bg-[#1A5C38] text-white rounded-br-sm"
                        : "bg-gray-100 text-gray-900 rounded-bl-sm"
                    )}
                  >
                    {/* Image attachment preview */}
                    {msg.attachmentUrl && msg.attachmentType === "image" && (
                      <a href={msg.attachmentUrl} target="_blank" rel="noopener noreferrer">
                        <img
                          src={msg.attachmentUrl}
                          alt={msg.attachmentName || "Image"}
                          className="rounded-lg max-w-[220px] max-h-[180px] object-cover mb-2 border border-white/20"
                        />
                      </a>
                    )}
                    {/* File attachment */}
                    {msg.attachmentUrl && msg.attachmentType !== "image" && (
                      <a
                        href={msg.attachmentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(
                          "flex items-center gap-1.5 mb-2 text-xs underline",
                          isMine ? "text-white/80" : "text-[#1A5C38]"
                        )}
                      >
                        <Paperclip className="h-3 w-3 shrink-0" />
                        {msg.attachmentName || "Attachment"}
                      </a>
                    )}
                    {msg.content && !(msg.content.startsWith("[Attachment:") && msg.attachmentUrl) && (
                      <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                    )}
                  </div>
                  <span className="text-[11px] text-gray-400 px-1 flex items-center gap-1">
                    {timeAgo(msg.createdAt)}
                    {isMine && <CheckCheck className={cn("h-3 w-3", msg.isRead ? "text-blue-500" : "text-gray-300")} />}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Attachment preview bar */}
      {pendingAttachment && (
        <div className="mx-3 mb-1 flex items-center gap-2 bg-[#E8F5EE] rounded-lg px-3 py-2">
          <ImageIcon className="h-4 w-4 text-[#1A5C38] shrink-0" />
          <span className="text-xs text-[#1A5C38] flex-1 truncate">{pendingAttachment.name}</span>
          <button onClick={() => setPendingAttachment(null)}>
            <X className="h-4 w-4 text-[#1A5C38]" />
          </button>
        </div>
      )}

      {/* Input */}
      {!readOnly && (
        <div className="border-t border-gray-100 p-3">
          <div className="flex items-end gap-2">
            {/* File attach button */}
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="h-10 w-10 flex items-center justify-center rounded-lg border border-gray-200 hover:border-[#1A5C38] hover:text-[#1A5C38] text-gray-400 transition-colors shrink-0"
              title="Attach image / file (max 5 MB)"
            >
              {uploading ? <Spinner className="h-4 w-4" /> : <Paperclip className="h-4 w-4" />}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*,.pdf,.doc,.docx"
              className="hidden"
              onChange={handleFileSelect}
            />

            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message… (Enter to send, Shift+Enter for new line)"
              rows={1}
              className="flex-1 resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-[#1A5C38] focus:border-transparent max-h-28 overflow-y-auto"
              onInput={(e) => {
                const el = e.currentTarget;
                el.style.height = "auto";
                el.style.height = Math.min(el.scrollHeight, 112) + "px";
              }}
            />
            <Button
              onClick={sendMessage}
              loading={sending}
              disabled={!input.trim() && !pendingAttachment}
              size="sm"
              className="shrink-0 h-10 w-10 !p-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
