import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router";
import { Leaf, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useAuthContext } from "@/contexts/AuthContext";
import type { UserRole } from "@/types/database.types";

const ROLES = [
  { id: "buyer" as UserRole, label: "Buyer", icon: "🛒", desc: "Browse & purchase eco products" },
  { id: "seller" as UserRole, label: "Seller", icon: "🏪", desc: "List & sell sustainable products" },
];

export function SignUpPage() {
  const navigate = useNavigate();
  const { signUp, isAuthenticated, isLoading: isSessionLoading } = useAuthContext();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "", newsletter: false });
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>("buyer");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      toast.error("Please fill in all required fields.");
      return;
    }
    if (form.password !== form.confirm) {
      toast.error("Passwords do not match.");
      return;
    }
    if (form.password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    setIsLoading(true);
    try {
      await signUp(form.email, form.password, selectedRole, form.name);
      toast.success("Welcome to GreenCart! 🌱 Your account has been created.");
      navigate(selectedRole === "seller" ? "/seller/onboarding" : "/home");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to create account. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const inputStyle = { borderColor: "#D1E8D1", backgroundColor: "#FFFFFF", color: "#263238" };

  // Already signed in — no reason to show the sign-up form.
  if (!isSessionLoading && isAuthenticated) {
    return <Navigate to="/home" replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12" style={{ backgroundColor: "#F5F7F5" }}>
      <div className="w-full max-w-[920px] flex rounded-3xl overflow-hidden shadow-xl">
        {/* Left Panel */}
        <div className="hidden md:flex flex-col justify-between p-10 w-[380px] flex-shrink-0" style={{ backgroundColor: "#2E7D32" }}>
          <div>
            <div className="flex items-center gap-2 mb-10">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                <Leaf size={20} color="#FFFFFF" strokeWidth={2.5} />
              </div>
              <span className="text-xl font-bold text-white">GreenCart</span>
            </div>
            <h2 className="text-3xl font-bold text-white mb-4 leading-tight">Join the Green Revolution</h2>
            <p className="text-white/75 leading-relaxed">
              Create your account and start shopping eco-friendly products that make a real difference.
            </p>
          </div>
          <div className="space-y-4">
            {[
              "Access 2,400+ sustainable products",
              "Track your carbon footprint savings",
              "Earn Eco Reward Points on every purchase",
              "Choose carbon-neutral delivery options",
            ].map((benefit) => (
              <div key={benefit} className="flex items-center gap-3">
                <CheckCircle2 size={18} color="#A5D6A7" strokeWidth={2} />
                <span className="text-white/85 text-sm">{benefit}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-2 flex-wrap">
            {["🌿 Zero Waste", "♻️ Recycled", "🌍 Carbon Neutral"].map((tag) => (
              <span key={tag} className="px-3 py-1.5 rounded-full text-xs font-medium text-white" style={{ backgroundColor: "rgba(255,255,255,0.15)" }}>
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Right Form */}
        <div className="flex-1 bg-white p-10 overflow-y-auto">
          <h1 className="text-2xl font-bold mb-1" style={{ color: "#263238" }}>Create your account</h1>
          <p className="text-sm mb-6" style={{ color: "#607D8B" }}>
            Already have an account?{" "}
            <Link to="/" className="font-semibold no-underline" style={{ color: "#2E7D32" }}>Login</Link>
          </p>

          {/* Role Selector */}
          <div className="flex gap-3 mb-6">
            {ROLES.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setSelectedRole(r.id)}
                className="flex-1 p-4 rounded-2xl text-center transition-all"
                style={{
                  border: `2px solid ${selectedRole === r.id ? "#2E7D32" : "#E8F0E8"}`,
                  backgroundColor: selectedRole === r.id ? "#F0FAF0" : "#FFFFFF",
                }}
              >
                <span className="text-2xl block mb-1">{r.icon}</span>
                <p className="font-semibold text-sm" style={{ color: selectedRole === r.id ? "#2E7D32" : "#263238" }}>{r.label}</p>
                <p className="text-xs" style={{ color: "#90A4AE" }}>{r.desc}</p>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "#263238" }}>Full Name</label>
              <input type="text" placeholder="Jane Smith" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-3 rounded-xl border outline-none transition-all" style={inputStyle} onFocus={(e) => (e.target.style.borderColor = "#2E7D32")} onBlur={(e) => (e.target.style.borderColor = "#D1E8D1")} />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "#263238" }}>Email Address</label>
              <input type="email" placeholder="jane@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-4 py-3 rounded-xl border outline-none transition-all" style={inputStyle} onFocus={(e) => (e.target.style.borderColor = "#2E7D32")} onBlur={(e) => (e.target.style.borderColor = "#D1E8D1")} />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "#263238" }}>Password</label>
              <div className="relative">
                <input type={showPass ? "text" : "password"} placeholder="Min. 8 characters" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full px-4 py-3 rounded-xl border outline-none transition-all pr-12" style={inputStyle} onFocus={(e) => (e.target.style.borderColor = "#2E7D32")} onBlur={(e) => (e.target.style.borderColor = "#D1E8D1")} />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "#90A4AE" }}>
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "#263238" }}>Confirm Password</label>
              <div className="relative">
                <input type={showConfirm ? "text" : "password"} placeholder="Re-enter password" value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} className="w-full px-4 py-3 rounded-xl border outline-none transition-all pr-12" style={inputStyle} onFocus={(e) => (e.target.style.borderColor = "#2E7D32")} onBlur={(e) => (e.target.style.borderColor = "#D1E8D1")} />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "#90A4AE" }}>
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <label className="flex items-start gap-3 cursor-pointer">
              <div className="relative mt-0.5">
                <div
                  onClick={() => setForm({ ...form, newsletter: !form.newsletter })}
                  className="w-5 h-5 rounded flex items-center justify-center border-2 transition-all cursor-pointer"
                  style={{ borderColor: form.newsletter ? "#2E7D32" : "#D1E8D1", backgroundColor: form.newsletter ? "#2E7D32" : "#FFFFFF" }}
                >
                  {form.newsletter && (
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
              </div>
              <span className="text-sm leading-relaxed" style={{ color: "#607D8B" }}>
                I want to receive sustainability tips and eco product updates.
              </span>
            </label>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl font-semibold text-white transition-all hover:opacity-90 active:scale-[0.99] mt-2 flex items-center justify-center gap-2 disabled:opacity-60"
              style={{ backgroundColor: "#2E7D32" }}
            >
              {isLoading ? (
                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Creating account…</>
              ) : `Create ${selectedRole === "seller" ? "Seller" : ""} Account`}
            </button>
          </form>

          <div className="mt-6 py-3 px-4 rounded-xl text-center text-sm" style={{ backgroundColor: "#E8F5E9", color: "#2E7D32" }}>
            🌱 Every account plants a virtual seed towards a greener planet.
          </div>
        </div>
      </div>
    </div>
  );
}
