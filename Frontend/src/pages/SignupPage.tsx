/**
 * SignupPage - Premium registration with gradient accent.
 */

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import type { UserRole } from "../types/types";

const SignupPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("EMPLOYEE");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const user = await register(name, email, password, role);
      if (user.role === "EMPLOYEE") navigate("/employee-dashboard");
      else if (user.role === "IT_AGENT") navigate("/it-dashboard");
      else if (user.role === "ADMIN") navigate("/admin-dashboard");
    } catch (err: unknown) {
      if (
        err &&
        typeof err === "object" &&
        "response" in err &&
        (err as { response?: { data?: { message?: string } } }).response?.data?.message
      ) {
        setError(
          (err as { response: { data: { message: string } } }).response.data.message,
        );
      } else {
        setError(err instanceof Error ? err.message : "Signup failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, hsl(199, 65%, 50%), hsl(130, 43%, 55%), hsl(41, 71%, 49%))" }}
    >
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full opacity-20"
        style={{ background: "radial-gradient(circle, hsl(262 80% 60%), transparent 70%)" }} />
      <div className="absolute bottom-[-15%] right-[-10%] w-[500px] h-[500px] rounded-full opacity-15"
        style={{ background: "radial-gradient(circle, hsl(234 85% 60%), transparent 70%)" }} />

      <div className="w-full max-w-md relative z-10 animate-fade-in-up">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center text-3xl"
            style={{ background: "var(--gradient-primary)" }}>
            🎫
          </div>
          <h1 className="text-3xl font-bold text-white">
            Create Account
          </h1>
          <p className="text-white/50 mt-2 text-sm">
            Join the IT Helpdesk team
          </p>
        </div>

        <form
          onSubmit={handleSignup}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl space-y-5"
        >
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-xl">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-white/70 mb-1.5">Full Name</label>
            <input
              id="signup-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="John Doe"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[hsl(234,85%,60%)] focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/70 mb-1.5">Email</label>
            <input
              id="signup-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@company.com"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[hsl(234,85%,60%)] focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/70 mb-1.5">Password</label>
            <input
              id="signup-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              placeholder="At least 6 characters"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[hsl(234,85%,60%)] focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/70 mb-1.5">Role</label>
            <select
              id="signup-role"
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[hsl(234,85%,60%)] focus:border-transparent transition-all"
            >
              <option value="EMPLOYEE" className="bg-gray-900">Employee</option>
              <option value="IT_AGENT" className="bg-gray-900">IT Support</option>
              
            </select>
          </div>

          <button
            id="signup-submit"
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl font-semibold text-white transition-all duration-200 hover:opacity-90 hover:shadow-lg disabled:opacity-50"
            style={{ background: "var(--gradient-primary)" }}
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>

          <p className="text-center text-sm text-white/40">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-[hsl(234,85%,70%)] font-medium hover:underline"
            >
              Sign In
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default SignupPage;
