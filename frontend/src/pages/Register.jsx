import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Zap, User, Mail, Lock, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
  });

  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handle = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirm)
      return toast.error("Passwords do not match");

    if (form.password.length < 6)
      return toast.error("Password must be at least 6 characters");

    setLoading(true);

    try {
      await register(form.name, form.email, form.password);
      toast.success("Account created!");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.error || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{ background: "var(--bg)" }}
    >
      {/* Glow */}
      <div
        className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full opacity-10 blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle, #27a36d, transparent)" }}
      />

      <div className="w-full max-w-md relative animate-fade-in">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-8">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg,#27a36d,#1a8459)",
              boxShadow: "0 0 20px rgba(39,163,109,0.4)",
            }}
          >
            <Zap size={18} className="text-white" />
          </div>

          <span
            className="text-xl font-bold text-white"
            style={{ fontFamily: "Clash Display,sans-serif" }}
          >
            AnalyserX
          </span>
        </div>

        <h2
          className="text-3xl font-bold text-white mb-1"
          style={{ fontFamily: "Clash Display,sans-serif" }}
        >
          Create Account
        </h2>

        <p className="mb-8 text-sm" style={{ color: "var(--muted)" }}>
          Already have an account?{" "}
          <Link
            to="/login"
            style={{ color: "var(--brand)" }}
            className="hover:text-white transition-colors"
          >
            Sign in
          </Link>
        </p>

        <form onSubmit={handle} className="space-y-4">
          {/* Full Name */}
          <div>
            <label
              className="block text-sm font-medium mb-1.5"
              style={{ color: "var(--muted)" }}
            >
              Full Name
            </label>

            <div className="relative">
              <User
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: "var(--muted)" }}
              />

              <input
                type="text"
                required
                value={form.name}
                placeholder="Jane Smith"
                onChange={(e) => updateField("name", e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-green-500 focus:border-green-500"
                style={{
                  background: "var(--surface2)",
                  border: "1px solid var(--border)",
                  color: "var(--text)",
                }}
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label
              className="block text-sm font-medium mb-1.5"
              style={{ color: "var(--muted)" }}
            >
              Email
            </label>

            <div className="relative">
              <Mail
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: "var(--muted)" }}
              />

              <input
                type="email"
                required
                value={form.email}
                placeholder="you@example.com"
                onChange={(e) => updateField("email", e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-green-500 focus:border-green-500"
                style={{
                  background: "var(--surface2)",
                  border: "1px solid var(--border)",
                  color: "var(--text)",
                }}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label
              className="block text-sm font-medium mb-1.5"
              style={{ color: "var(--muted)" }}
            >
              Password
            </label>

            <div className="relative">
              <Lock
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: "var(--muted)" }}
              />

              <input
                type={showPw ? "text" : "password"}
                required
                value={form.password}
                placeholder="••••••••"
                onChange={(e) => updateField("password", e.target.value)}
                className="w-full pl-10 pr-10 py-3 rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-green-500 focus:border-green-500"
                style={{
                  background: "var(--surface2)",
                  border: "1px solid var(--border)",
                  color: "var(--text)",
                }}
              />

              <button
                type="button"
                onClick={() => setShowPw((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: "var(--muted)" }}
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label
              className="block text-sm font-medium mb-1.5"
              style={{ color: "var(--muted)" }}
            >
              Confirm Password
            </label>

            <div className="relative">
              <Lock
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: "var(--muted)" }}
              />

              <input
                type={showPw ? "text" : "password"}
                required
                value={form.confirm}
                placeholder="••••••••"
                onChange={(e) => updateField("confirm", e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-green-500 focus:border-green-500"
                style={{
                  background: "var(--surface2)",
                  border: "1px solid var(--border)",
                  color: "var(--text)",
                }}
              />
            </div>
          </div>

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full mt-2 py-3 text-sm"
          >
            {loading ? "Creating account…" : "Create Account"}
          </button>
        </form>
      </div>
    </div>
  );
}
