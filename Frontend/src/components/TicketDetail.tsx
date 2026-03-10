/**
 * TicketDetail - Premium styled detail modal with messaging/chat and asset assignment.
 */

import { useState, useEffect, useRef } from "react";
import type { Ticket, Message, TicketStatus, Asset } from "../types/types";
import { useAuth } from "../contexts/AuthContext";
import * as messageService from "../services/messageService";
import * as ticketService from "../services/ticketService";
import * as assetService from "../services/assetService";

interface TicketDetailProps {
  ticket: Ticket;
  onClose: () => void;
  onTicketUpdate?: () => void;
}

const statusConfig: Record<string, { label: string; color: string; dot: string }> = {
  OPEN: { label: "Open", color: "bg-amber-500/10 text-amber-500", dot: "bg-amber-500" },
  IN_PROGRESS: { label: "In Progress", color: "bg-blue-500/10 text-blue-500", dot: "bg-blue-500" },
  RESOLVED: { label: "Resolved", color: "bg-emerald-500/10 text-emerald-500", dot: "bg-emerald-500" },
  CLOSED: { label: "Closed", color: "bg-gray-500/10 text-gray-400", dot: "bg-gray-400" },
  SLA_BREACHED: { label: "SLA Breached", color: "bg-red-500/10 text-red-500", dot: "bg-red-500 animate-pulse-soft" },
};

const TicketDetail = ({ ticket, onClose, onTicketUpdate }: TicketDetailProps) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Asset assignment state
  const [availableAssets, setAvailableAssets] = useState<Asset[]>([]);
  const [selectedAssetId, setSelectedAssetId] = useState<string>("");
  const [assigningAsset, setAssigningAsset] = useState(false);

  const isITAgent = user?.role === "IT_AGENT";
  const isAssignedAgent = ticket.assignedTo?.id === user?.id;
  const canChat =
    user &&
    (ticket.createdBy?.id === user.id || ticket.assignedTo?.id === user.id);
  const canAssignAsset =
    isITAgent &&
    isAssignedAgent &&
    ticket.status !== "RESOLVED" &&
    ticket.status !== "CLOSED";

  useEffect(() => {
    loadMessages();
    if (canAssignAsset) {
      loadAvailableAssets();
    }
  }, [ticket.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadMessages = async () => {
    setLoadingMessages(true);
    try {
      const data = await messageService.getMessages(ticket.id);
      setMessages(data);
    } catch {
      setMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  };

  const loadAvailableAssets = async () => {
    try {
      const data = await assetService.getAvailableAssets();
      setAvailableAssets(data);
    } catch (err) {
      console.error("Failed to load assets:", err);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;
    setSending(true);
    try {
      const msg = await messageService.sendMessage(ticket.id, newMessage.trim());
      setMessages((prev) => [...prev, msg]);
      setNewMessage("");
    } catch (err) {
      console.error("Failed to send message:", err);
    } finally {
      setSending(false);
    }
  };

  const handleStatusUpdate = async (status: TicketStatus) => {
    try {
      await ticketService.updateTicketStatus(ticket.id, status);
      onTicketUpdate?.();
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const handleAssignAsset = async () => {
    if (!selectedAssetId || assigningAsset) return;
    setAssigningAsset(true);
    try {
      await ticketService.assignAssetToTicket(ticket.id, parseInt(selectedAssetId));
      setSelectedAssetId("");
      onTicketUpdate?.();
    } catch (err) {
      console.error("Failed to assign asset:", err);
    } finally {
      setAssigningAsset(false);
    }
  };

  const status = statusConfig[ticket.status] || statusConfig.OPEN;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-card text-card-foreground rounded-2xl border shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-lg">
              #{ticket.id}
            </span>
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1.5 ${status.color}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`}></span>
              {status.label}
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Ticket Details */}
        <div className="p-5 border-b space-y-4 overflow-y-auto">
          <div>
            <h3 className="text-lg font-bold text-foreground">{ticket.title}</h3>
            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{ticket.description}</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { label: "Created by", value: ticket.createdBy?.name || "—", icon: "👤" },
              { label: "Assigned to", value: ticket.assignedTo?.name || "Unassigned", icon: "🛠️" },
              { label: "Priority", value: ticket.priority, icon: "⚡" },
              ...(ticket.assetType ? [{ label: "Asset Type", value: ticket.assetType, icon: "📦" }] : []),
              { label: "Created", value: new Date(ticket.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }), icon: "📅" },
              ...(ticket.slaDeadline ? [{ label: "SLA Deadline", value: new Date(ticket.slaDeadline).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }), icon: "⏱️" }] : []),
            ].map((item) => (
              <div key={item.label} className="bg-muted/50 rounded-xl px-3 py-2.5">
                <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">{item.icon} {item.label}</p>
                <p className="text-sm font-semibold text-foreground mt-0.5">{item.value}</p>
              </div>
            ))}
          </div>

          {/* Currently assigned asset */}
          {ticket.asset && (
            <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4">
              <p className="text-xs text-emerald-600 uppercase tracking-wider font-semibold mb-2">📦 Assigned Asset</p>
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs">Name</p>
                  <p className="font-semibold text-foreground">{ticket.asset.name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Serial #</p>
                  <p className="font-mono text-xs text-foreground">{ticket.asset.serial_number}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Assigned To</p>
                  <p className="font-semibold text-foreground">{ticket.createdBy?.name || "—"}</p>
                </div>
              </div>
            </div>
          )}

          {/* Asset Assignment Dropdown (IT Agent only) */}
          {canAssignAsset && (
            <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4">
              <p className="text-xs text-blue-500 uppercase tracking-wider font-semibold mb-3">
                📦 {ticket.asset ? "Reassign Asset" : "Assign Asset"}
              </p>
              <div className="flex gap-2">
                <select
                  value={selectedAssetId}
                  onChange={(e) => setSelectedAssetId(e.target.value)}
                  className="flex-1 px-3 py-2 bg-background border border-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[hsl(234,85%,60%)] focus:border-transparent transition-all"
                >
                  <option value="">Select an available asset...</option>
                  {availableAssets.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} — {a.serial_number} {a.description ? `(${a.description})` : ""}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleAssignAsset}
                  disabled={!selectedAssetId || assigningAsset}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:shadow-md disabled:opacity-50"
                  style={{ background: "var(--gradient-primary)" }}
                >
                  {assigningAsset ? "..." : "Assign"}
                </button>
              </div>
              {availableAssets.length === 0 && (
                <p className="text-xs text-muted-foreground mt-2">No available assets. Ask Admin to add inventory.</p>
              )}
            </div>
          )}

          {/* IT Agent status controls */}
          {isITAgent &&
            isAssignedAgent &&
            ticket.status !== "RESOLVED" &&
            ticket.status !== "CLOSED" && (
              <div className="flex gap-2">
                {ticket.status === "OPEN" && (
                  <button
                    onClick={() => handleStatusUpdate("IN_PROGRESS")}
                    className="py-2 px-4 rounded-xl text-sm font-semibold text-white transition-all hover:shadow-md"
                    style={{ background: "var(--gradient-primary)" }}
                  >
                    ▶ Start Working
                  </button>
                )}
                {(ticket.status === "IN_PROGRESS" || ticket.status === "SLA_BREACHED") && (
                  <button
                    onClick={() => handleStatusUpdate("RESOLVED")}
                    className="py-2 px-4 rounded-xl text-sm font-semibold text-white transition-all hover:shadow-md"
                    style={{ background: "var(--gradient-success)" }}
                  >
                    ✓ Mark Resolved
                  </button>
                )}
              </div>
            )}
        </div>

        {/* Messages Thread */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3 min-h-[150px]">
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-2">
            💬 Conversation
          </p>
          {loadingMessages ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-muted border-t-primary rounded-full animate-spin"></div>
            </div>
          ) : messages.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              No messages yet. Start the conversation!
            </p>
          ) : (
            messages.map((msg) => {
              const isMe = msg.sender?.id === user?.id;
              return (
                <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                      isMe
                        ? "text-white rounded-br-md"
                        : "bg-muted text-foreground rounded-bl-md"
                    }`}
                    style={isMe ? { background: "var(--gradient-primary)" } : undefined}
                  >
                    {!isMe && (
                      <p className="text-xs font-semibold mb-1 opacity-70">
                        {msg.sender?.name}
                      </p>
                    )}
                    <p>{msg.content}</p>
                    <p className={`text-[10px] mt-1 ${isMe ? "text-white/60" : "text-muted-foreground"}`}>
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        {canChat && ticket.status !== "RESOLVED" && ticket.status !== "CLOSED" && (
          <form onSubmit={handleSendMessage} className="p-4 border-t flex gap-2">
            <input
              id="chat-message-input"
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 px-4 py-2.5 border rounded-xl bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[hsl(234,85%,60%)] focus:border-transparent transition-all text-sm"
            />
            <button
              id="chat-send-button"
              type="submit"
              disabled={sending || !newMessage.trim()}
              className="px-5 py-2.5 rounded-xl font-semibold text-white text-sm transition-all hover:shadow-md disabled:opacity-50"
              style={{ background: "var(--gradient-primary)" }}
            >
              {sending ? "..." : "Send"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default TicketDetail;
