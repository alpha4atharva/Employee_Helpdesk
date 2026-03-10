/**
 * TicketCard - Premium styled ticket card with gradient accent and hover effects.
 */

import type { Ticket } from "../types/types";

interface TicketCardProps {
  ticket: Ticket;
  onAssign?: (ticketId: number) => void;
  onResolve?: (ticketId: number) => void;
  onClick?: (ticket: Ticket) => void;
}

const statusConfig: Record<string, { bg: string; text: string; label: string; dot: string }> = {
  OPEN: { bg: "bg-amber-500/10", text: "text-amber-500", label: "Open", dot: "bg-amber-500" },
  IN_PROGRESS: { bg: "bg-blue-500/10", text: "text-blue-500", label: "In Progress", dot: "bg-blue-500" },
  RESOLVED: { bg: "bg-emerald-500/10", text: "text-emerald-500", label: "Resolved", dot: "bg-emerald-500" },
  CLOSED: { bg: "bg-gray-500/10", text: "text-gray-400", label: "Closed", dot: "bg-gray-400" },
  SLA_BREACHED: { bg: "bg-red-500/10", text: "text-red-500", label: "SLA Breached", dot: "bg-red-500 animate-pulse-soft" },
};

const priorityConfig: Record<string, { bg: string; text: string }> = {
  CRITICAL: { bg: "bg-red-500/10", text: "text-red-500" },
  HIGH: { bg: "bg-orange-500/10", text: "text-orange-500" },
  MEDIUM: { bg: "bg-blue-500/10", text: "text-blue-500" },
  LOW: { bg: "bg-gray-500/10", text: "text-gray-400" },
};

function getSlaInfo(ticket: Ticket) {
  if (!ticket.slaDeadline) return null;
  if (ticket.status === "RESOLVED" || ticket.status === "CLOSED") return null;

  const now = new Date();
  const deadline = new Date(ticket.slaDeadline);
  const diff = deadline.getTime() - now.getTime();

  if (diff <= 0 || ticket.status === "SLA_BREACHED") {
    return { text: "Breached", color: "text-red-500 font-semibold" };
  }

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (hours < 1) return { text: `${minutes}m left`, color: "text-red-400" };
  return { text: `${hours}h ${minutes}m`, color: hours < 2 ? "text-amber-400" : "text-gray-400" };
}

const TicketCard = ({ ticket, onAssign, onResolve, onClick }: TicketCardProps) => {
  const sla = getSlaInfo(ticket);
  const status = statusConfig[ticket.status] || statusConfig.OPEN;
  const priority = priorityConfig[ticket.priority] || priorityConfig.MEDIUM;

  return (
    <div
      className={`bg-card rounded-xl border p-5 shadow-sm hover:shadow-md transition-all duration-200 ${onClick ? "cursor-pointer hover:border-[hsl(234,85%,60%)]/30 hover:-translate-y-0.5" : ""}`}
      onClick={() => onClick?.(ticket)}
    >
      {/* Header: ID + Status */}
      <div className="flex items-center justify-between mb-3">
        <span className="font-mono text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
          #{ticket.id}
        </span>
        <span className={`text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1.5 ${status.bg} ${status.text}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`}></span>
          {status.label}
        </span>
      </div>

      {/* Title */}
      <h3 className="font-semibold text-[15px] text-foreground mb-1 line-clamp-1">{ticket.title}</h3>
      <p className="text-sm text-muted-foreground mb-4 line-clamp-2 leading-relaxed">{ticket.description}</p>

      {/* Meta info */}
      <div className="grid grid-cols-2 gap-y-2 text-xs mb-4">
        <div>
          <span className="text-muted-foreground">Creator</span>
          <p className="font-medium text-foreground">{ticket.createdBy?.name || "—"}</p>
        </div>
        <div>
          <span className="text-muted-foreground">Assigned</span>
          <p className="font-medium text-foreground">{ticket.assignedTo?.name || "Unassigned"}</p>
        </div>
        <div>
          <span className="text-muted-foreground">Priority</span>
          <p className={`font-semibold ${priority.text}`}>{ticket.priority}</p>
        </div>
        {ticket.assetType && (
          <div>
            <span className="text-muted-foreground">Asset Type</span>
            <p className="font-medium text-foreground">{ticket.assetType}</p>
          </div>
        )}
      </div>

      {/* Assigned asset chip */}
      {ticket.asset && (
        <div className="flex items-center gap-2 mb-4 px-3 py-2 bg-emerald-500/5 border border-emerald-500/20 rounded-lg">
          <span className="text-xs">📦</span>
          <span className="text-xs font-semibold text-emerald-500">
            {ticket.asset.name}
          </span>
          <span className="text-[10px] font-mono text-muted-foreground">
            {ticket.asset.serial_number}
          </span>
          {ticket.createdBy && (
            <span className="text-[10px] text-muted-foreground ml-auto">
              → {ticket.createdBy.name}
            </span>
          )}
        </div>
      )}

      {/* Footer: Date + SLA */}
      <div className="flex items-center justify-between text-xs pt-3 border-t border-border">
        <span className="text-muted-foreground">
          {new Date(ticket.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
        </span>
        {sla && (
          <span className={`flex items-center gap-1 ${sla.color}`}>
            ⏱ {sla.text}
          </span>
        )}
      </div>

      {/* Actions */}
      {(onAssign || onResolve) && ticket.status !== "RESOLVED" && ticket.status !== "CLOSED" && (
        <div className="flex gap-2 mt-3 pt-3 border-t border-border" onClick={(e) => e.stopPropagation()}>
          {onAssign && ticket.status === "OPEN" && (
            <button
              onClick={() => onAssign(ticket.id)}
              className="flex-1 py-2 px-3 rounded-lg text-xs font-semibold text-white transition-all hover:shadow-md"
              style={{ background: "var(--gradient-primary)" }}
            >
              Accept Ticket
            </button>
          )}
          {onResolve && ticket.status === "IN_PROGRESS" && (
            <button
              onClick={() => onResolve(ticket.id)}
              className="flex-1 py-2 px-3 rounded-lg text-xs font-semibold text-white transition-all hover:shadow-md"
              style={{ background: "var(--gradient-success)" }}
            >
              Mark Resolved
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default TicketCard;
