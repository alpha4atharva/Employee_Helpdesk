/**
 * TicketCard - Premium ticket card using shadcn/ui Card and Badge components.
 */

import type { Ticket } from "../types/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface TicketCardProps {
  ticket: Ticket;
  onAssign?: (ticketId: number) => void;
  onResolve?: (ticketId: number) => void;
  onClick?: (ticket: Ticket) => void;
}

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; dot: string }> = {
  OPEN: { label: "Open", variant: "outline", dot: "bg-white/60" },
  IN_PROGRESS: { label: "In Progress", variant: "default", dot: "bg-white/80" },
  RESOLVED: { label: "Resolved", variant: "secondary", dot: "bg-white" },
  CLOSED: { label: "Closed", variant: "secondary", dot: "bg-gray-400" },
  SLA_BREACHED: { label: "SLA Breached", variant: "destructive", dot: "bg-white/50 animate-pulse-soft" },
};

const priorityConfig: Record<string, { color: string }> = {
  CRITICAL: { color: "text-white/80" },
  HIGH: { color: "text-white/70" },
  MEDIUM: { color: "text-white/60" },
  LOW: { color: "text-muted-foreground" },
};

function getSlaInfo(ticket: Ticket) {
  if (!ticket.slaDeadline) return null;
  if (ticket.status === "RESOLVED" || ticket.status === "CLOSED") return null;

  const now = new Date();
  const deadline = new Date(ticket.slaDeadline);
  const diff = deadline.getTime() - now.getTime();

  if (diff <= 0 || ticket.status === "SLA_BREACHED") {
    return { text: "Breached", color: "text-white/60 font-semibold" };
  }

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (hours < 1) return { text: `${minutes}m left`, color: "text-red-400" };
  return { text: `${hours}h ${minutes}m`, color: hours < 2 ? "text-amber-400" : "text-muted-foreground" };
}

const TicketCard = ({ ticket, onAssign, onResolve, onClick }: TicketCardProps) => {
  const sla = getSlaInfo(ticket);
  const status = statusConfig[ticket.status] || statusConfig.OPEN;
  const priority = priorityConfig[ticket.priority] || priorityConfig.MEDIUM;

  return (
    <Card
      className={`group transition-all duration-200 hover:shadow-lg ${onClick ? "cursor-pointer hover:border-primary/30 hover:-translate-y-0.5" : ""}`}
      onClick={() => onClick?.(ticket)}
    >
      <CardContent className="p-5 space-y-3">
        {/* Header: ID + Status */}
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
            #{ticket.id}
          </span>
          <Badge variant={status.variant} className="text-[11px] gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
            {status.label}
          </Badge>
        </div>

        {/* Title */}
        <div>
          <h3 className="font-semibold text-[15px] text-foreground line-clamp-1 group-hover:text-primary transition-colors">
            {ticket.title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed mt-1">{ticket.description}</p>
        </div>

        {/* Meta info */}
        <div className="grid grid-cols-2 gap-y-2 text-xs">
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
            <p className={`font-semibold ${priority.color}`}>{ticket.priority}</p>
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
          <div className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-lg">
            <span className="text-xs">📦</span>
            <span className="text-xs font-semibold text-white/80">
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
        <Separator />
        <div className="flex items-center justify-between text-xs">
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
          <div className="flex gap-2 pt-1" onClick={(e) => e.stopPropagation()}>
            {onAssign && ticket.status === "OPEN" && (
              <Button size="sm" className="flex-1 text-xs" onClick={() => onAssign(ticket.id)}>
                Accept Ticket
              </Button>
            )}
            {onResolve && ticket.status === "IN_PROGRESS" && (
              <Button
                size="sm"
                variant="secondary"
                className="flex-1 text-xs bg-white/10 text-white hover:bg-white/20 border border-white/20"
                onClick={() => onResolve(ticket.id)}
              >
                Mark Resolved
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TicketCard;
