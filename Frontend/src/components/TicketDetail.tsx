/**
 * TicketDetail - Detail modal using shadcn/ui Dialog, Badge, Button, Input, Separator.
 */

import { useState, useEffect, useRef } from "react";
import type { Ticket, Message, TicketStatus, Asset } from "../types/types";
import { useAuth } from "../contexts/AuthContext";
import * as messageService from "../services/messageService";
import * as ticketService from "../services/ticketService";
import * as assetService from "../services/assetService";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

interface TicketDetailProps {
  ticket: Ticket;
  onClose: () => void;
  onTicketUpdate?: () => void;
}

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  OPEN: { label: "Open", variant: "outline" },
  IN_PROGRESS: { label: "In Progress", variant: "default" },
  RESOLVED: { label: "Resolved", variant: "secondary" },
  CLOSED: { label: "Closed", variant: "secondary" },
  SLA_BREACHED: { label: "SLA Breached", variant: "destructive" },
};

const TicketDetail = ({ ticket, onClose, onTicketUpdate }: TicketDetailProps) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
    if (canAssignAsset) loadAvailableAssets();
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
            <Badge variant={status.variant}>{status.label}</Badge>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </Button>
        </div>

        {/* Ticket Details */}
        <div className="p-5 border-b space-y-4 overflow-y-auto">
          <div>
            <h3 className="text-lg font-bold text-foreground">{ticket.title}</h3>
            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{ticket.description}</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { label: "Created by", value: ticket.createdBy?.name || "—" },
              { label: "Assigned to", value: ticket.assignedTo?.name || "Unassigned" },
              { label: "Priority", value: ticket.priority },
              ...(ticket.assetType ? [{ label: "Asset Type", value: ticket.assetType }] : []),
              { label: "Created", value: new Date(ticket.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) },
              ...(ticket.slaDeadline ? [{ label: "SLA Deadline", value: new Date(ticket.slaDeadline).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) }] : []),
            ].map((item) => (
              <div key={item.label} className="bg-muted/50 rounded-xl px-3 py-2.5">
                <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">{item.label}</p>
                <p className="text-sm font-semibold text-foreground mt-0.5">{item.value}</p>
              </div>
            ))}
          </div>

          {/* Currently assigned asset */}
          {ticket.asset && (
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <p className="text-xs text-white/60 uppercase tracking-wider font-semibold mb-2">Assigned Asset</p>
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

          {/* Asset Assignment */}
          {canAssignAsset && (
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
              <p className="text-xs text-primary uppercase tracking-wider font-semibold mb-3">
                {ticket.asset ? "Reassign Asset" : "Assign Asset"}
              </p>
              <div className="flex gap-2">
                <select
                  value={selectedAssetId}
                  onChange={(e) => setSelectedAssetId(e.target.value)}
                  className="flex-1 px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                >
                  <option value="">Select an available asset...</option>
                  {availableAssets.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} — {a.serial_number} {a.description ? `(${a.description})` : ""}
                    </option>
                  ))}
                </select>
                <Button
                  onClick={handleAssignAsset}
                  disabled={!selectedAssetId || assigningAsset}
                  size="sm"
                >
                  {assigningAsset ? "..." : "Assign"}
                </Button>
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
                  <Button onClick={() => handleStatusUpdate("IN_PROGRESS")} size="sm">
                    Start Working
                  </Button>
                )}
                {(ticket.status === "IN_PROGRESS" || ticket.status === "SLA_BREACHED") && (
                  <Button
                    onClick={() => handleStatusUpdate("RESOLVED")}
                    size="sm"
                    variant="secondary"
                    className="bg-white/10 text-white hover:bg-white/20 border border-white/20"
                  >
                    Mark Resolved
                  </Button>
                )}
              </div>
            )}
        </div>

        {/* Messages Thread */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3 min-h-[150px]">
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-2">
            Conversation
          </p>
          {loadingMessages ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-muted border-t-primary rounded-full animate-spin" />
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
                        ? "bg-primary text-primary-foreground rounded-br-md"
                        : "bg-muted text-foreground rounded-bl-md"
                    }`}
                  >
                    {!isMe && (
                      <p className="text-xs font-semibold mb-1 opacity-70">
                        {msg.sender?.name}
                      </p>
                    )}
                    <p>{msg.content}</p>
                    <p className={`text-[10px] mt-1 ${isMe ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
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
          <>
            <Separator />
            <form onSubmit={handleSendMessage} className="p-4 flex gap-2">
              <Input
                id="chat-message-input"
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1"
              />
              <Button
                id="chat-send-button"
                type="submit"
                disabled={sending || !newMessage.trim()}
                size="sm"
              >
                {sending ? (
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                    </svg>
                    Send
                  </>
                )}
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default TicketDetail;