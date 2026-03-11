/**
 * ITDashboard - IT agent view with tickets and asset inventory using shadcn/ui.
 */

import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import TicketCard from "../components/TicketCard";
import TicketDetail from "../components/TicketDetail";
import { useAuth } from "../contexts/AuthContext";
import * as ticketService from "../services/ticketService";
import * as assetService from "../services/assetService";
import type { Ticket, Asset } from "../types/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type FilterType = "all" | "open" | "in-progress" | "resolved" | "breached";

const ITDashboard = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [filter, setFilter] = useState<FilterType>("all");
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

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

  const stats: { label: string; count: number; value: FilterType; color: string; bg: string }[] = [
    { label: "Total", count: tickets.length, value: "all", color: "text-white", bg: "bg-white/10" },
    { label: "Open", count: tickets.filter((t) => t.status === "OPEN").length, value: "open", color: "text-white/70", bg: "bg-white/5" },
    { label: "In Progress", count: tickets.filter((t) => t.status === "IN_PROGRESS").length, value: "in-progress", color: "text-white/70", bg: "bg-white/5" },
    { label: "Resolved", count: tickets.filter((t) => t.status === "RESOLVED").length, value: "resolved", color: "text-white/70", bg: "bg-white/5" },
    { label: "Breached", count: tickets.filter((t) => t.status === "SLA_BREACHED").length, value: "breached", color: "text-white/70", bg: "bg-white/5" },
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

        <Tabs defaultValue="tickets" className="space-y-6">
          <TabsList className="bg-muted/50 p-1">
            <TabsTrigger value="tickets" className="gap-2">
              Tickets
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">{tickets.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="assets" className="gap-2">
              Asset Inventory
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">{assets.length}</Badge>
            </TabsTrigger>
          </TabsList>

          {/* TICKETS TAB */}
          <TabsContent value="tickets" className="space-y-6">
            {/* Filter stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {stats.map((stat) => (
                <Card
                  key={stat.value}
                  className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                    filter === stat.value ? "ring-2 ring-primary shadow-md" : ""
                  }`}
                  onClick={() => setFilter(stat.value)}
                >
                  <CardContent className="p-4">
                    <p className="text-2xl font-extrabold text-foreground">{stat.count}</p>
                    <p className={`text-xs font-medium mt-0.5 ${stat.color}`}>{stat.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Tickets grid */}
            {filteredTickets.length === 0 ? (
              <Card className="p-12 text-center">
                <CardContent className="p-0">
                  <p className="text-muted-foreground">No tickets match this filter.</p>
                </CardContent>
              </Card>
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
          </TabsContent>

          {/* ASSET INVENTORY TAB */}
          <TabsContent value="assets" className="space-y-6">
            {/* Asset stats */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Total Assets", value: assets.length, color: "text-white", bg: "bg-white/10" },
                { label: "Available", value: availableAssets.length, color: "text-white/70", bg: "bg-white/5" },
                { label: "Assigned", value: assignedAssets.length, color: "text-white/70", bg: "bg-white/5" },
              ].map((stat) => (
                <Card key={stat.label} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-5 flex items-start justify-between">
                    <div>
                      <p className="text-3xl font-extrabold text-foreground">{stat.value}</p>
                      <p className={`text-sm font-medium mt-1 ${stat.color}`}>{stat.label}</p>
                    </div>
                    <div className={`p-2.5 rounded-xl ${stat.bg}`}>
                      <svg xmlns="http://www.w3.org/2000/svg" className={`w-5 h-5 ${stat.color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
                      </svg>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Asset table */}
            {assets.length === 0 ? (
              <Card className="p-12 text-center">
                <CardContent className="p-0">
                  <p className="text-muted-foreground">No assets in inventory. Ask an Admin to add assets.</p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Serial Number</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Assigned To</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {assets.map((asset, i) => (
                      <TableRow key={asset.id} className="animate-fade-in-up" style={{ animationDelay: `${i * 40}ms` }}>
                        <TableCell className="font-semibold">{asset.name}</TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">{asset.serial_number}</TableCell>
                        <TableCell className="text-muted-foreground">{asset.description || "—"}</TableCell>
                        <TableCell>
                          <Badge variant={asset.status === "AVAILABLE" ? "secondary" : "outline"} className="gap-1.5">
                            <span className={`w-1.5 h-1.5 rounded-full ${asset.status === "AVAILABLE" ? "bg-white" : "bg-white/40"}`} />
                            {asset.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {asset.assignedUser ? (
                            <span className="font-medium">{asset.assignedUser.name}</span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            )}
          </TabsContent>
        </Tabs>
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