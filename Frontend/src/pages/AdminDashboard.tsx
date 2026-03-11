
import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import TicketCard from "../components/TicketCard";
import TicketDetail from "../components/TicketDetail";
import { useAuth } from "../contexts/AuthContext";
import * as userService from "../services/userService";
import * as ticketService from "../services/ticketService";
import * as assetService from "../services/assetService";
import type { User, Ticket, Asset, UserRole } from "../types/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
    { label: "Employees", value: employees.length, color: "text-white", bg: "bg-white/10" },
    { label: "IT Staff", value: itPersons.length, color: "text-white/70", bg: "bg-white/5" },
    { label: "Tickets", value: tickets.length, color: "text-white/70", bg: "bg-white/5" },
    { label: "Resolved", value: tickets.filter((t) => t.status === "RESOLVED").length, color: "text-white/70", bg: "bg-white/5" },
    { label: "SLA Breached", value: tickets.filter((t) => t.status === "SLA_BREACHED").length, color: "text-white/70", bg: "bg-white/5" },
    { label: "Assets", value: assets.length, color: "text-white/70", bg: "bg-white/5" },
  ];

  const renderUserTable = (userList: User[], showActiveTickets: boolean) => (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            {showActiveTickets && <TableHead>Active Tickets</TableHead>}
            <TableHead>Status</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {userList.map((u, i) => (
            <TableRow key={u.id} className="animate-fade-in-up" style={{ animationDelay: `${i * 40}ms` }}>
              <TableCell className="font-semibold">{u.name}</TableCell>
              <TableCell className="text-muted-foreground">{u.email}</TableCell>
              {showActiveTickets && (
                <TableCell>
                  <Badge variant="secondary" className="text-xs">{u.activeTicketsCount}</Badge>
                </TableCell>
              )}
              <TableCell>
                <Badge variant={u.isAvailable ? "secondary" : "outline"} className="gap-1.5 text-xs">
                  <span className={`w-1.5 h-1.5 rounded-full ${u.isAvailable ? "bg-white" : "bg-white/40"}`} />
                  {u.isAvailable ? "Available" : "Busy"}
                </Badge>
              </TableCell>
              <TableCell>
                <Select
                  value={u.role}
                  onValueChange={(value) => handleRoleChange(u.id, value as UserRole)}
                  disabled={u.id === user.id}
                >
                  <SelectTrigger className="h-8 w-[120px] text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {roleOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>
                {u.id !== user.id ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white/50 hover:text-white hover:bg-white/10 text-xs h-7"
                    onClick={() => handleDeleteUser(u.id)}
                  >
                    Delete
                  </Button>
                ) : (
                  <span className="text-xs text-muted-foreground italic">You</span>
                )}
              </TableCell>
            </TableRow>
          ))}
          {userList.length === 0 && (
            <TableRow>
              <TableCell colSpan={showActiveTickets ? 6 : 5} className="text-center py-8 text-muted-foreground">
                No users found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Card>
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
            <Card key={stat.label} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <p className="text-2xl font-extrabold text-foreground">{stat.value}</p>
                <p className={`text-[11px] font-medium mt-0.5 ${stat.color}`}>{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="employees" className="space-y-6">
          <TabsList className="bg-muted/50 p-1">
            <TabsTrigger value="employees" className="gap-2">
              Employees
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">{employees.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="it" className="gap-2">
              IT Staff
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">{itPersons.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="tickets" className="gap-2">
              All Tickets
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">{tickets.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="assets" className="gap-2">
              Assets
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">{availableAssets.length}</Badge>
            </TabsTrigger>
          </TabsList>

          {/* Employees / IT Staff tabs */}
          {(["employees", "it"] as const).map((tabKey) => (
            <TabsContent key={tabKey} value={tabKey} className="space-y-6">
              {/* Add user form */}
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-base">Add New User</CardTitle>
                </CardHeader>
                <CardContent>
                  {userError && <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm p-3 rounded-lg mb-4">{userError}</div>}
                  {userSuccess && <div className="bg-white/5 border border-white/10 text-white/80 text-sm p-3 rounded-lg mb-4">{userSuccess}</div>}
                  <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-5 gap-3">
                    <Input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} required placeholder="Full name" />
                    <Input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} required placeholder="Email address" />
                    <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={6} placeholder="Password (6+ chars)" />
                    <Select value={newRole} onValueChange={(v) => setNewRole(v as UserRole)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {roleOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button type="submit" disabled={userSubmitting}>
                      {userSubmitting ? "Adding..." : "Add User"}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {tabKey === "employees" && renderUserTable(employees, false)}
              {tabKey === "it" && renderUserTable(itPersons, true)}
            </TabsContent>
          ))}

          {/* Tickets tab */}
          <TabsContent value="tickets" className="space-y-6">
            {tickets.length === 0 ? (
              <Card className="p-12 text-center">
                <CardContent className="p-0">
                  <p className="text-muted-foreground">No tickets yet.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tickets.map((ticket, i) => (
                  <div key={ticket.id} className="animate-fade-in-up" style={{ animationDelay: `${i * 40}ms` }}>
                    <TicketCard ticket={ticket} onClick={setSelectedTicket} />
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Assets tab */}
          <TabsContent value="assets" className="space-y-6">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-base">Add New Asset</CardTitle>
              </CardHeader>
              <CardContent>
                {assetError && <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm p-3 rounded-lg mb-4">{assetError}</div>}
                <form onSubmit={handleCreateAsset} className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <Input id="asset-name" type="text" value={assetName} onChange={(e) => setAssetName(e.target.value)} required placeholder="Asset name" />
                  <Input id="asset-serial" type="text" value={assetSerial} onChange={(e) => setAssetSerial(e.target.value)} required placeholder="Serial number" />
                  <Input id="asset-description" type="text" value={assetDesc} onChange={(e) => setAssetDesc(e.target.value)} placeholder="Description (optional)" />
                  <Button id="asset-submit" type="submit" disabled={assetSubmitting}>
                    {assetSubmitting ? "Adding..." : "Add Asset"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {assets.length > 0 && (
              <Card>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Serial Number</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Assigned To</TableHead>
                      <TableHead>Actions</TableHead>
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
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-white/50 hover:text-white hover:bg-white/10 text-xs h-7"
                            onClick={() => handleDeleteAsset(asset.id)}
                          >
                            Delete
                          </Button>
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
        <TicketDetail ticket={selectedTicket} onClose={() => setSelectedTicket(null)} onTicketUpdate={() => { loadData(); setSelectedTicket(null); }} />
      )}
    </div>
  );
};

export default AdminDashboard;