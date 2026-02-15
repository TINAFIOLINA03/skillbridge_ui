import { useState } from "react";
import { useNavigate, useLocation, Link, Navigate } from "react-router-dom";
import { authenticate } from "../api/authApi";
import { isAuthenticated } from "../utils/auth";

export default function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const isSignup = location.pathname === "/signup";
  const mode = isSignup ? "SIGNUP" : "LOGIN";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [userNotFound, setUserNotFound] = useState(false);
  const [loading, setLoading] = useState(false);

  if (isAuthenticated()) return <Navigate to="/dashboard" replace />;

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setUserNotFound(false);
    setLoading(true);
    try {
      await authenticate(email, password, mode);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      const status = err.response?.status;
      const msg = err.response?.data?.error;
      if (status === 404 && msg === "USER_NOT_FOUND") setUserNotFound(true);
      else setError(status === 403 || status === 401 ? "Invalid email or password." : msg || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-page">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-brand-400 text-white font-bold text-lg mb-4 shadow-soft">
            S
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            {isSignup ? "Create your account" : "Welcome back"}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {isSignup ? "Start tracking your learning journey" : "Log in to continue learning"}
          </p>
        </div>

        {/* Card */}
        <div className="bg-surface rounded-2xl shadow-card p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 text-sm
                           focus:border-brand-400 focus:ring-2 focus:ring-brand-100 focus:bg-white
                           outline-none transition-all placeholder:text-gray-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 text-sm
                           focus:border-brand-400 focus:ring-2 focus:ring-brand-100 focus:bg-white
                           outline-none transition-all placeholder:text-gray-400"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-brand-400 hover:bg-brand-500 active:bg-brand-600
                         text-white text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Please wait…" : isSignup ? "Create Account" : "Log In"}
            </button>
          </form>

          {error && (
            <p className="mt-3 text-sm text-red-500 animate-fadeIn">{error}</p>
          )}
          {userNotFound && (
            <p className="mt-3 text-sm text-gray-600 animate-fadeIn">
              No account found.{" "}
              <Link to="/signup" className="text-brand-400 hover:text-brand-500 font-medium">
                Create one?
              </Link>
            </p>
          )}
        </div>

        {/* Toggle */}
        <p className="text-center text-sm text-gray-500 mt-6">
          {isSignup ? (
            <>Already have an account?{" "}<Link to="/login" className="text-brand-400 hover:text-brand-500 font-medium">Log in</Link></>
          ) : (
            <>Don&apos;t have an account?{" "}<Link to="/signup" className="text-brand-400 hover:text-brand-500 font-medium">Sign up</Link></>
          )}
        </p>
      </div>
    </div>
  );
}
