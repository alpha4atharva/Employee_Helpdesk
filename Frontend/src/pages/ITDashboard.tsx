/**
 * ITDashboard - this is  IT persons  view with tickets and asset inventory.
 */

import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import TicketCard from "../components/TicketCard";
import TicketDetail from "../components/TicketDetail";
import { useAuth } from "../contexts/AuthContext";
import * as ticketService from "../services/ticketService";
import * as assetService from "../services/assetService";
import type { Ticket, Asset } from "../types/types";

type FilterType = "all" | "open" | "in-progress" | "resolved" | "breached";
type TabType = "tickets" | "assets";

const ITDashboard = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [filter, setFilter] = useState<FilterType>("all");
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("tickets");

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [ticketData, assetData] = await Promise.all([
        ticketService.getAllTickets(),
        assetService.getAllAssets(),
      ]);
      setTickets(ticketData);
      setAssets(assetData);
    } catch (err) {
      console.error("Failed to load data:", err);
    }
  };

  const handleResolve = async (ticketId: number) => {
    try {
      await ticketService.updateTicketStatus(ticketId, "RESOLVED");
      await loadData();
    } catch (err) {
      console.error("Failed to resolve ticket:", err);
    }
  };

  // Build a map of asset assigned_to -> employee name from tickets
  const employeeNameMap: Record<number, string> = {};
  tickets.forEach((t) => {
    if (t.asset && t.createdBy) {
      employeeNameMap[t.asset.assigned_to ?? 0] = t.createdBy.name;
    }
    // Also map createdBy id -> name for lookup
    if (t.createdBy) {
      employeeNameMap[t.createdBy.id] = t.createdBy.name;
    }
  });

  const filteredTickets = tickets.filter((t) => {
    if (filter === "all") return true;
    if (filter === "open") return t.status === "OPEN";
    if (filter === "in-progress") return t.status === "IN_PROGRESS";
    if (filter === "resolved") return t.status === "RESOLVED";
    if (filter === "breached") return t.status === "SLA_BREACHED";
    return true;
  });

  const availableAssets = assets.filter((a) => a.status === "AVAILABLE");
  const assignedAssets = assets.filter((a) => a.status === "ASSIGNED");

  if (!user) return null;

  const stats: { label: string; count: number; value: FilterType; icon: string; gradient: string }[] = [
    { label: "Total", count: tickets.length, value: "all", icon: "📋", gradient: "var(--gradient-primary)" },
    { label: "Open", count: tickets.filter((t) => t.status === "OPEN").length, value: "open", icon: "🟡", gradient: "var(--gradient-warning)" },
    { label: "In Progress", count: tickets.filter((t) => t.status === "IN_PROGRESS").length, value: "in-progress", icon: "🔵", gradient: "var(--gradient-primary)" },
    { label: "Resolved", count: tickets.filter((t) => t.status === "RESOLVED").length, value: "resolved", icon: "✅", gradient: "var(--gradient-success)" },
    { label: "Breached", count: tickets.filter((t) => t.status === "SLA_BREACHED").length, value: "breached", icon: "🔴", gradient: "var(--gradient-danger)" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-foreground">IT Support Dashboard</h2>
            <p className="text-muted-foreground text-sm mt-1">Manage tickets and track inventory.</p>
          </div>
        </div>

        {/* Tab buttons */}
        <div className="flex gap-2 mb-6">
          {([
            { key: "tickets", label: "🎫 Tickets", count: tickets.length },
            { key: "assets", label: "📦 Asset Inventory", count: assets.length },
          ] as const).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as TabType)}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                activeTab === tab.key
                  ? "text-white shadow-lg"
                  : "bg-card border text-muted-foreground hover:text-foreground hover:border-[hsl(234,85%,60%)]/30"
              }`}
              style={activeTab === tab.key ? { background: "var(--gradient-primary)" } : undefined}
            >
              {tab.label}
              <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${
                activeTab === tab.key ? "bg-white/20" : "bg-muted"
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* TICKETS TAB */}
        {activeTab === "tickets" && (
          <>
            {/* Stats row - clickable filters */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
              {stats.map((stat) => (
                <button
                  key={stat.value}
                  onClick={() => setFilter(stat.value)}
                  className={`relative overflow-hidden rounded-xl p-4 text-left transition-all duration-200 ${
                    filter === stat.value
                      ? "text-white shadow-lg scale-[1.02]"
                      : "bg-card border hover:border-[hsl(234,85%,60%)]/30"
                  }`}
                  style={filter === stat.value ? { background: stat.gradient } : undefined}
                >
                  <span className="absolute top-2 right-2 text-xl opacity-30">{stat.icon}</span>
                  <p className={`text-2xl font-extrabold ${filter !== stat.value ? "text-foreground" : ""}`}>
                    {stat.count}
                  </p>
                  <p className={`text-xs font-medium mt-0.5 ${filter !== stat.value ? "text-muted-foreground" : "opacity-80"}`}>
                    {stat.label}
                  </p>
                </button>
              ))}
            </div>

            {/* Tickets */}
            {filteredTickets.length === 0 ? (
              <div className="bg-card rounded-xl border p-12 text-center shadow-sm">
                <span className="text-4xl mb-3 block">📭</span>
                <p className="text-muted-foreground">No tickets match this filter.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTickets.map((ticket, i) => (
                  <div key={ticket.id} className="animate-fade-in-up" style={{ animationDelay: `${i * 40}ms` }}>
                    <TicketCard
                      ticket={ticket}
                      onResolve={ticket.assignedTo?.id === user.id ? handleResolve : undefined}
                      onClick={setSelectedTicket}
                    />
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ASSET INVENTORY TAB */}
        {activeTab === "assets" && (
          <>
            {/* Asset summary */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              {[
                { label: "Total Assets", value: assets.length, gradient: "var(--gradient-primary)", icon: "📦" },
                { label: "Available", value: availableAssets.length, gradient: "var(--gradient-success)", icon: "✅" },
                { label: "Assigned", value: assignedAssets.length, gradient: "var(--gradient-warning)", icon: "🔗" },
              ].map((stat) => (
                <div key={stat.label} className="relative overflow-hidden rounded-xl p-5 text-white shadow-lg" style={{ background: stat.gradient }}>
                  <span className="absolute top-3 right-3 text-2xl opacity-30">{stat.icon}</span>
                  <p className="text-3xl font-extrabold">{stat.value}</p>
                  <p className="text-sm font-medium opacity-80 mt-1">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Asset table */}
            {assets.length === 0 ? (
              <div className="bg-card rounded-xl border p-12 text-center shadow-sm">
                <span className="text-4xl mb-3 block">📦</span>
                <p className="text-muted-foreground">No assets in inventory. Ask an Admin to add assets.</p>
              </div>
            ) : (
              <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left p-4 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Name</th>
                      <th className="text-left p-4 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Serial Number</th>
                      <th className="text-left p-4 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Description</th>
                      <th className="text-left p-4 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Status</th>
                      <th className="text-left p-4 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Assigned To</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assets.map((asset, i) => (
                      <tr key={asset.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors animate-fade-in-up" style={{ animationDelay: `${i * 40}ms` }}>
                        <td className="p-4 font-semibold text-foreground">{asset.name}</td>
                        <td className="p-4 font-mono text-xs text-muted-foreground">{asset.serial_number}</td>
                        <td className="p-4 text-muted-foreground">{asset.description || "—"}</td>
                        <td className="p-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-full font-semibold ${
                            asset.status === "AVAILABLE"
                              ? "bg-emerald-500/10 text-emerald-500"
                              : "bg-amber-500/10 text-amber-500"
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              asset.status === "AVAILABLE" ? "bg-emerald-500" : "bg-amber-500"
                            }`}></span>
                            {asset.status}
                          </span>
                        </td>
                        <td className="p-4">
                          {asset.assignedUser ? (
                            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                              {asset.assignedUser.name}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </main>

      {selectedTicket && (
        <TicketDetail
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
          onTicketUpdate={() => {
            loadData();
            setSelectedTicket(null);
          }}
        />
      )}
    </div>
  );
};

export default ITDashboard;
