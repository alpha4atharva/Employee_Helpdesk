/**
 * AdminDashboard - Premium admin view with full user management, tickets, and assets.
 */

import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import TicketCard from "../components/TicketCard";
import TicketDetail from "../components/TicketDetail";
import { useAuth } from "../contexts/AuthContext";
import * as userService from "../services/userService";
import * as ticketService from "../services/ticketService";
import * as assetService from "../services/assetService";
import type { User, Ticket, Asset, UserRole } from "../types/types";

const roleOptions: { value: UserRole; label: string }[] = [
  { value: "EMPLOYEE", label: "Employee" },
  { value: "IT_AGENT", label: "IT Support" },
  { value: "ADMIN", label: "Admin" },
];

const AdminDashboard = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [activeTab, setActiveTab] = useState<"employees" | "it" | "tickets" | "assets">("employees");
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  // New user form
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState<UserRole>("EMPLOYEE");
  const [userSubmitting, setUserSubmitting] = useState(false);
  const [userError, setUserError] = useState("");
  const [userSuccess, setUserSuccess] = useState("");

  // Asset form
  const [assetName, setAssetName] = useState("");
  const [assetSerial, setAssetSerial] = useState("");
  const [assetDesc, setAssetDesc] = useState("");
  const [assetSubmitting, setAssetSubmitting] = useState(false);
  const [assetError, setAssetError] = useState("");

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [allUsers, allTickets, allAssets] = await Promise.all([
        userService.getAllUsers(),
        ticketService.getAllTickets(),
        assetService.getAllAssets(),
      ]);
      setUsers(allUsers);
      setTickets(allTickets);
      setAssets(allAssets);
    } catch (err) {
      console.error("Failed to load data:", err);
    }
  };

  // --- User Management ---
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserSubmitting(true);
    setUserError("");
    setUserSuccess("");
    try {
      await userService.createUser({
        name: newName, email: newEmail, password: newPassword, role: newRole,
      });
      setNewName(""); setNewEmail(""); setNewPassword(""); setNewRole("EMPLOYEE");
      setUserSuccess("User created successfully!");
      setTimeout(() => setUserSuccess(""), 3000);
      await loadData();
    } catch (err: unknown) {
      const message = err && typeof err === "object" && "response" in err
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message || "Failed to create user"
        : "Failed to create user";
      setUserError(message);
    } finally { setUserSubmitting(false); }
  };

  const handleDeleteUser = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await userService.deleteUser(id);
      await loadData();
    } catch (err) {
      console.error("Failed to delete user:", err);
    }
  };

  const handleRoleChange = async (id: number, role: UserRole) => {
    try {
      await userService.updateUserRole(id, role);
      await loadData();
    } catch (err) {
      console.error("Failed to update role:", err);
    }
  };

  // --- Asset Management ---
  const handleCreateAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    setAssetSubmitting(true);
    setAssetError("");
    try {
      await assetService.createAsset({
        name: assetName, serial_number: assetSerial, description: assetDesc || undefined,
      });
      setAssetName(""); setAssetSerial(""); setAssetDesc("");
      await loadData();
    } catch (err: unknown) {
      const message = err && typeof err === "object" && "response" in err
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message || "Failed to create asset"
        : "Failed to create asset";
      setAssetError(message);
    } finally { setAssetSubmitting(false); }
  };

  const handleDeleteAsset = async (id: number) => {
    try { await assetService.deleteAsset(id); await loadData(); }
    catch (err) { console.error("Failed to delete asset:", err); }
  };

  const employees = users.filter((u) => u.role === "EMPLOYEE");
  const itPersons = users.filter((u) => u.role === "IT_AGENT");
  const availableAssets = assets.filter((a) => a.status === "AVAILABLE");

  if (!user) return null;

  const overviewStats = [
    { label: "Employees", value: employees.length, gradient: "var(--gradient-primary)", icon: "👥" },
    { label: "IT Staff", value: itPersons.length, gradient: "var(--gradient-success)", icon: "🛠️" },
    { label: "Tickets", value: tickets.length, gradient: "var(--gradient-warning)", icon: "🎫" },
    { label: "Resolved", value: tickets.filter((t) => t.status === "RESOLVED").length, gradient: "var(--gradient-success)", icon: "✅" },
    { label: "SLA Breached", value: tickets.filter((t) => t.status === "SLA_BREACHED").length, gradient: "var(--gradient-danger)", icon: "🔴" },
    { label: "Assets", value: assets.length, gradient: "var(--gradient-primary)", icon: "📦" },
  ];

  const inputClass = "px-4 py-2.5 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[hsl(234,85%,60%)] focus:border-transparent transition-all text-sm";

  const tabs = [
    { key: "employees", label: "👥 Employees", count: employees.length },
    { key: "it", label: "🛠️ IT Staff", count: itPersons.length },
    { key: "tickets", label: "🎫 All Tickets", count: tickets.length },
    { key: "assets", label: "📦 Assets", count: availableAssets.length },
  ] as const;

  // Reusable: User table for employees or IT staff
  const renderUserTable = (userList: User[], showActiveTickets: boolean) => (
    <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="text-left p-4 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Name</th>
            <th className="text-left p-4 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Email</th>
            {showActiveTickets && <th className="text-left p-4 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Active Tickets</th>}
            <th className="text-left p-4 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Status</th>
            <th className="text-left p-4 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Role</th>
            <th className="text-left p-4 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Actions</th>
          </tr>
        </thead>
        <tbody>
          {userList.map((u, i) => (
            <tr key={u.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors animate-fade-in-up" style={{ animationDelay: `${i * 40}ms` }}>
              <td className="p-4 font-semibold text-foreground">{u.name}</td>
              <td className="p-4 text-muted-foreground">{u.email}</td>
              {showActiveTickets && (
                <td className="p-4">
                  <span className="bg-muted px-2 py-0.5 rounded-full text-xs font-semibold text-foreground">
                    {u.activeTicketsCount}
                  </span>
                </td>
              )}
              <td className="p-4">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-full font-semibold ${u.isAvailable ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${u.isAvailable ? "bg-emerald-500" : "bg-red-500"}`}></span>
                  {u.isAvailable ? "Available" : "Busy"}
                </span>
              </td>
              <td className="p-4">
                <select
                  value={u.role}
                  onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                  disabled={u.id === user.id}
                  className="px-2 py-1 bg-muted border border-border rounded-lg text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-[hsl(234,85%,60%)] disabled:opacity-50"
                >
                  {roleOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </td>
              <td className="p-4">
                {u.id !== user.id ? (
                  <button
                    onClick={() => handleDeleteUser(u.id)}
                    className="text-red-500 hover:text-red-400 text-xs font-semibold hover:underline transition-colors"
                  >
                    Delete
                  </button>
                ) : (
                  <span className="text-xs text-muted-foreground italic">You</span>
                )}
              </td>
            </tr>
          ))}
          {userList.length === 0 && (
            <tr><td colSpan={showActiveTickets ? 6 : 5} className="p-8 text-center text-muted-foreground">No users found.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground">Admin Dashboard</h2>
          <p className="text-muted-foreground text-sm mt-1">Overview of your entire helpdesk system.</p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
          {overviewStats.map((stat) => (
            <div key={stat.label} className="relative overflow-hidden rounded-xl p-4 text-white shadow-lg" style={{ background: stat.gradient }}>
              <span className="absolute top-2 right-2 text-lg opacity-30">{stat.icon}</span>
              <p className="text-2xl font-extrabold">{stat.value}</p>
              <p className="text-[11px] font-medium opacity-80 mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                activeTab === tab.key
                  ? "text-white shadow-lg"
                  : "bg-card border text-muted-foreground hover:text-foreground hover:border-[hsl(234,85%,60%)]/30"
              }`}
              style={activeTab === tab.key ? { background: "var(--gradient-primary)" } : undefined}
            >
              {tab.label}
              <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${activeTab === tab.key ? "bg-white/20" : "bg-muted"}`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Create User Form — shown in Employee and IT tabs */}
        {(activeTab === "employees" || activeTab === "it") && (
          <div className="bg-card rounded-xl border p-6 shadow-sm mb-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg">➕</span>
              <h3 className="text-base font-bold text-foreground">Add New User</h3>
            </div>
            {userError && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-sm p-3 rounded-xl mb-4">{userError}</div>
            )}
            {userSuccess && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-sm p-3 rounded-xl mb-4">{userSuccess}</div>
            )}
            <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-5 gap-3">
              <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} required placeholder="Full name" className={inputClass} />
              <input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} required placeholder="Email address" className={inputClass} />
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={6} placeholder="Password (6+ chars)" className={inputClass} />
              <select value={newRole} onChange={(e) => setNewRole(e.target.value as UserRole)} className={inputClass}>
                {roleOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <button type="submit" disabled={userSubmitting}
                className="py-2.5 px-4 rounded-xl font-semibold text-white text-sm transition-all hover:shadow-lg disabled:opacity-50"
                style={{ background: "var(--gradient-primary)" }}
              >
                {userSubmitting ? "Adding..." : "Add User"}
              </button>
            </form>
          </div>
        )}

        {/* Employees Tab */}
        {activeTab === "employees" && renderUserTable(employees, false)}

        {/* IT Staff Tab */}
        {activeTab === "it" && renderUserTable(itPersons, true)}

        {/* Tickets Tab */}
        {activeTab === "tickets" && (
          tickets.length === 0 ? (
            <div className="bg-card rounded-xl border p-12 text-center shadow-sm">
              <span className="text-4xl mb-3 block">📭</span>
              <p className="text-muted-foreground">No tickets yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tickets.map((ticket, i) => (
                <div key={ticket.id} className="animate-fade-in-up" style={{ animationDelay: `${i * 40}ms` }}>
                  <TicketCard ticket={ticket} onClick={setSelectedTicket} />
                </div>
              ))}
            </div>
          )
        )}

        {/* Assets Tab */}
        {activeTab === "assets" && (
          <div className="space-y-6">
            <div className="bg-card rounded-xl border p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-lg">➕</span>
                <h3 className="text-base font-bold text-foreground">Add New Asset</h3>
              </div>
              {assetError && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-sm p-3 rounded-xl mb-4">{assetError}</div>
              )}
              <form onSubmit={handleCreateAsset} className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <input id="asset-name" type="text" value={assetName} onChange={(e) => setAssetName(e.target.value)} required placeholder="Asset name" className={inputClass} />
                <input id="asset-serial" type="text" value={assetSerial} onChange={(e) => setAssetSerial(e.target.value)} required placeholder="Serial number" className={inputClass} />
                <input id="asset-description" type="text" value={assetDesc} onChange={(e) => setAssetDesc(e.target.value)} placeholder="Description (optional)" className={inputClass} />
                <button id="asset-submit" type="submit" disabled={assetSubmitting}
                  className="py-2.5 px-4 rounded-xl font-semibold text-white text-sm transition-all hover:shadow-lg disabled:opacity-50"
                  style={{ background: "var(--gradient-primary)" }}
                >
                  {assetSubmitting ? "Adding..." : "Add Asset"}
                </button>
              </form>
            </div>

            {assets.length === 0 ? (
              <div className="bg-card rounded-xl border p-12 text-center shadow-sm">
                <span className="text-4xl mb-3 block">📦</span>
                <p className="text-muted-foreground">No assets yet.</p>
              </div>
            ) : (
              <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left p-4 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Name</th>
                      <th className="text-left p-4 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Serial #</th>
                      <th className="text-left p-4 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Description</th>
                      <th className="text-left p-4 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Status</th>
                      <th className="text-left p-4 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Assigned To</th>
                      <th className="text-left p-4 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Actions</th>
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
                            asset.status === "AVAILABLE" ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${asset.status === "AVAILABLE" ? "bg-emerald-500" : "bg-amber-500"}`}></span>
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
                        <td className="p-4">
                          <button onClick={() => handleDeleteAsset(asset.id)} className="text-red-500 hover:text-red-400 text-xs font-semibold hover:underline transition-colors">
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>

      {selectedTicket && (
        <TicketDetail ticket={selectedTicket} onClose={() => setSelectedTicket(null)} onTicketUpdate={() => { loadData(); setSelectedTicket(null); }} />
      )}
    </div>
  );
};

export default AdminDashboard;
