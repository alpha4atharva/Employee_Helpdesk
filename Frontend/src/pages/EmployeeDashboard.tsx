
import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import TicketForm from "../components/TicketForm";
import TicketCard from "../components/TicketCard";
import TicketDetail from "../components/TicketDetail";
import { useAuth } from "../contexts/AuthContext";
import * as ticketService from "../services/ticketService";
import type { Ticket, TicketPriority } from "../types/types";

const EmployeeDashboard = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    try {
      const data = await ticketService.getMyTickets();
      setTickets(data);
    } catch (err) {
      console.error("Failed to load tickets:", err);
    }
  };

  const handleCreate = async (data: {
    title: string;
    description: string;
    assetType?: string;
    priority?: TicketPriority;
  }) => {
    setSubmitting(true);
    setError("");
    try {
      await ticketService.createTicket(data);
      await loadTickets();
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message || "Failed to create ticket"
          : "Failed to create ticket";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) return null;

  const openCount = tickets.filter((t) => t.status === "OPEN" || t.status === "IN_PROGRESS").length;
  const resolvedCount = tickets.filter((t) => t.status === "RESOLVED").length;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground">
            Welcome back, {user.name} 👋
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Submit a new ticket or track your existing requests.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "Total Tickets", value: tickets.length, gradient: "var(--gradient-primary)", icon: "🎫" },
            { label: "Active", value: openCount, gradient: "var(--gradient-warning)", icon: "🔄" },
            { label: "Resolved", value: resolvedCount, gradient: "var(--gradient-success)", icon: "✅" },
          ].map((stat) => (
            <div key={stat.label} className="relative overflow-hidden rounded-xl p-5 text-white shadow-lg" style={{ background: stat.gradient }}>
              <span className="absolute top-3 right-3 text-2xl opacity-30">{stat.icon}</span>
              <p className="text-3xl font-extrabold">{stat.value}</p>
              <p className="text-sm font-medium opacity-80 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* New Ticket Form */}
          <div>
            <TicketForm onSubmit={handleCreate} isSubmitting={submitting} />
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-sm p-3 rounded-xl mt-3">
                {error}
              </div>
            )}
          </div>

          {/* My Tickets */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <h3 className="text-lg font-bold text-foreground">My Tickets</h3>
              <span className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground font-medium">
                {tickets.length}
              </span>
            </div>
            {tickets.length === 0 ? (
              <div className="bg-card rounded-xl border p-12 text-center shadow-sm">
                <span className="text-4xl mb-3 block">📭</span>
                <p className="text-muted-foreground">No tickets yet. Create your first one!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tickets.map((ticket, i) => (
                  <div key={ticket.id} className="animate-fade-in-up" style={{ animationDelay: `${i * 50}ms` }}>
                    <TicketCard ticket={ticket} onClick={setSelectedTicket} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {selectedTicket && (
        <TicketDetail
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
          onTicketUpdate={() => {
            loadTickets();
            setSelectedTicket(null);
          }}
        />
      )}
    </div>
  );
};

export default EmployeeDashboard;
