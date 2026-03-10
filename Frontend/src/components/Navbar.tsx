/**
 * Navbar - Premium top navigation bar with gradient background.
 */

import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const roleLabels: Record<string, string> = {
  EMPLOYEE: "Employee",
  IT_AGENT: "IT Support",
  ADMIN: "Administrator",
};

const roleIcons: Record<string, string> = {
  EMPLOYEE: "👤",
  IT_AGENT: "🛠️",
  ADMIN: "🔑",
};

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (!user) return null;

  return (
    <nav className="sticky top-0 z-40 border-b border-white/10" style={{ background: "var(--gradient-primary)" }}>
      <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center justify-between">
        {/* Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center text-lg backdrop-blur-sm">
            🎫
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight">
              IT Helpdesk
            </h1>
            <p className="text-[11px] text-white/60 font-medium -mt-0.5">
              Service Management Portal
            </p>
          </div>
        </div>

        {/* User Info + Logout */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-1.5">
            <span className="text-sm">{roleIcons[user.role]}</span>
            <div className="text-right">
              <p className="text-sm font-semibold text-white leading-tight">{user.name}</p>
              <p className="text-[11px] text-white/70">{roleLabels[user.role]}</p>
            </div>
          </div>
          <button
            id="logout-button"
            onClick={handleLogout}
            className="bg-white/15 hover:bg-white/25 text-white px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 backdrop-blur-sm"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
