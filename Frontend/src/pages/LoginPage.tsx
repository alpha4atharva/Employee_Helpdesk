
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const LoginPage = () => {
  const navigate = useNavigate();
  const { user, login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (user) {
    if (user.role === "EMPLOYEE") navigate("/employee-dashboard", { replace: true });
    else if (user.role === "IT_AGENT") navigate("/it-dashboard", { replace: true });
    else if (user.role === "ADMIN") navigate("/admin-dashboard", { replace: true });
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const loggedInUser = await login(email, password);
      if (loggedInUser.role === "EMPLOYEE") navigate("/employee-dashboard");
      else if (loggedInUser.role === "IT_AGENT") navigate("/it-dashboard");
      else if (loggedInUser.role === "ADMIN") navigate("/admin-dashboard");
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
        setError("Invalid email or password. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, hsl(199, 65%, 50%), hsl(130, 43%, 55%), hsl(41, 71%, 49%))" }}
   
    >
      {/* Decorative blobs */}
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full opacity-20"
        style={{ background: "radial-gradient(circle, hsl(234 85% 60%), transparent 70%)" }} />
      <div className="absolute bottom-[-15%] left-[-10%] w-[500px] h-[500px] rounded-full opacity-15"
        style={{ background: "radial-gradient(circle, hsl(262 80% 60%), transparent 70%)" }} />

      <div className="w-full max-w-md relative z-10 animate-fade-in-up">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center text-3xl"
            style={{ background: "var(--gradient-primary)" }}>
            🎫
          </div>
          <h1 className="text-3xl font-bold text-white">
            Welcome Back
          </h1>
          <p className="text-white/50 mt-2 text-sm">
            Sign in to your IT Helpdesk account
          </p>
        </div>

        {/* Login Card */}
        <form
          onSubmit={handleLogin}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl space-y-5"
        >
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-xl">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-white/70 mb-1.5">
              Email Address
            </label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@company.com"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[hsl(234,85%,60%)] focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/70 mb-1.5">
              Password
            </label>
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[hsl(234,85%,60%)] focus:border-transparent transition-all"
            />
          </div>

          <button
            id="login-submit"
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl font-semibold text-white transition-all duration-200 hover:opacity-90 hover:shadow-lg disabled:opacity-50"
            style={{ background: "var(--gradient-primary)" }}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>

          <p className="text-center text-sm text-white/40">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="text-[hsl(234,85%,70%)] font-medium hover:underline"
            >
              Sign Up
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
