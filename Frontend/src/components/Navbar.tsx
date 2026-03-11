/**
 * Navbar - Premium top navigation bar with black/light-grey gradient background.
 */

import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const roleLabels: Record<string, string> = {
  EMPLOYEE: "Employee",
  IT_AGENT: "IT Support",
  ADMIN: "Administrator",
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
    <nav
      className="sticky top-0 z-40 border-b border-white/10"
      style={{
        background: "linear-gradient(to right, #000000, #d3d3d3)",
      }}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-14">

        {/* Header */}
        <div className="flex flex-col justify-center px-4">
          <h1 className="text-xl font-extrabold text-white font-serif tracking-wide leading-none">
            IT Helpdesk
          </h1>
          <p className="text-xs text-gray-300 font-medium font-mono leading-none -mt-0.5">
            Service Management Portal
          </p>
        </div>

        {/* User Info + Logout */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col text-right px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-lg">
            <p className="text-sm font-semibold text-white leading-tight">{user.name}</p>
            <p className="text-[11px] text-white/70">{roleLabels[user.role]}</p>
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