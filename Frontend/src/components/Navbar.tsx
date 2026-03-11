/**
 * Navbar - Premium top navigation bar using shadcn/ui components.
 */

import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const roleLabels: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
  EMPLOYEE: { label: "Employee", variant: "secondary" },
  IT_AGENT: { label: "IT Support", variant: "default" },
  ADMIN: { label: "Administrator", variant: "outline" },
};

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (!user) return null;

  const roleInfo = roleLabels[user.role] || roleLabels.EMPLOYEE;

  return (
    <nav
      className="sticky top-0 z-40 border-b border-white/10"
      style={{
        background: "linear-gradient(135deg, hsl(234 85% 25%), hsl(234 85% 35%), hsl(262 70% 30%))",
      }}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
            </svg>
          </div>
          <div className="flex flex-col">
            <h1 className="text-lg font-bold text-white tracking-tight leading-none">IT Helpdesk</h1>
            <p className="text-[11px] text-white/50 font-medium leading-none mt-0.5">Service Management Portal</p>
          </div>
        </div>

        {/* User Info + Logout */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-lg border border-white/10">
            <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white text-xs font-bold">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col text-right">
              <p className="text-sm font-semibold text-white leading-tight">{user.name}</p>
              <Badge variant={roleInfo.variant} className="text-[10px] px-1.5 py-0 h-4 mt-0.5 w-fit ml-auto">
                {roleInfo.label}
              </Badge>
            </div>
          </div>
          <Button
            id="logout-button"
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-white/80 hover:text-white hover:bg-white/15 border border-white/10"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
            </svg>
            Logout
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;