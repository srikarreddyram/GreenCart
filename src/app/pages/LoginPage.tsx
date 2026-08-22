import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router";
import { Leaf, Eye, EyeOff, Apple } from "lucide-react";
import { toast } from "sonner";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { useAuthContext } from "@/contexts/AuthContext";

export function LoginPage() {
  const navigate = useNavigate();
  const { signIn, isAuthenticated, isLoading: isSessionLoading } = useAuthContext();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all fields.");
      return;
    }
    setIsLoading(true);
    try {
      await signIn(email, password);
      toast.success("Welcome back to GreenCart! 🌿");
      navigate("/home");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Invalid email or password.");
    } finally {
      setIsLoading(false);
    }
  };

  // The Supabase session is persisted, so a signed-in user landing on "/" (or
  // refreshing there) should go straight to the marketplace.
  if (!isSessionLoading && isAuthenticated) {
    return <Navigate to="/home" replace />;
  }

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "#F5F7F5" }}>
      {/* Left — Illustration Panel */}
      <div
        className="hidden lg:flex flex-1 flex-col items-center justify-center relative overflow-hidden"
        style={{ backgroundColor: "#2E7D32" }}
      >
        <div className="absolute inset-0 opacity-10">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full"
              style={{
                width: `${Math.random() * 120 + 40}px`,
                height: `${Math.random() * 120 + 40}px`,
                backgroundColor: "#66BB6A",
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                opacity: Math.random() * 0.5 + 0.1,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 text-center px-12 max-w-lg">
          <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-8">
            <Leaf size={48} color="#FFFFFF" strokeWidth={1.5} />
          </div>
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1673044625980-7fa420a5207e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600"
            alt="Sustainable nature"
            className="w-full rounded-2xl object-cover mb-8 shadow-2xl"
            style={{ height: "260px" }}
          />
          <h2 className="text-3xl font-bold text-white mb-4">Shop Sustainably</h2>
          <p className="text-white/80 text-lg leading-relaxed">
            Join thousands of eco-conscious shoppers making a difference for our planet, one purchase at a time.
          </p>

          <div className="flex gap-6 mt-10 justify-center">
            {[
              { label: "Products", value: "2,400+" },
              { label: "CO₂ Saved", value: "12 tons" },
              { label: "Members", value: "50K+" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-white font-bold text-xl">{stat.value}</p>
                <p className="text-white/70 text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right — Login Form */}
      <div className="flex-1 flex items-center justify-center px-8 py-12">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-2 mb-10">
            <div style={{ backgroundColor: "#2E7D32" }} className="w-9 h-9 rounded-xl flex items-center justify-center">
              <Leaf size={20} color="#FFFFFF" strokeWidth={2.5} />
            </div>
            <span style={{ color: "#2E7D32" }} className="text-2xl font-bold">GreenCart</span>
          </div>

          <h1 className="text-3xl font-bold mb-2" style={{ color: "#263238" }}>Welcome to GreenCart</h1>
          <p className="mb-8" style={{ color: "#607D8B" }}>Sign in to your eco-friendly account.</p>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "#263238" }}>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl border outline-none transition-all"
                style={{ borderColor: "#D1E8D1", backgroundColor: "#FFFFFF", color: "#263238" }}
                onFocus={(e) => (e.target.style.borderColor = "#2E7D32")}
                onBlur={(e) => (e.target.style.borderColor = "#D1E8D1")}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "#263238" }}>Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl border outline-none transition-all pr-12"
                  style={{ borderColor: "#D1E8D1", backgroundColor: "#FFFFFF", color: "#263238" }}
                  onFocus={(e) => (e.target.style.borderColor = "#2E7D32")}
                  onBlur={(e) => (e.target.style.borderColor = "#D1E8D1")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: "#90A4AE" }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl font-semibold text-white transition-all hover:opacity-90 active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-60"
              style={{ backgroundColor: "#2E7D32" }}
            >
              {isLoading ? (
                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Signing in…</>
              ) : "Login"}
            </button>
          </form>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px" style={{ backgroundColor: "#E8F0E8" }} />
            <span className="text-sm" style={{ color: "#90A4AE" }}>or continue with</span>
            <div className="flex-1 h-px" style={{ backgroundColor: "#E8F0E8" }} />
          </div>

          <div className="space-y-3">
            <button className="w-full py-3 rounded-xl border font-medium flex items-center justify-center gap-3 transition-all hover:bg-gray-50" style={{ borderColor: "#D1E8D1", color: "#263238" }}>
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Sign in with Google
            </button>
            <button className="w-full py-3 rounded-xl border font-medium flex items-center justify-center gap-3 transition-all hover:bg-gray-50" style={{ borderColor: "#D1E8D1", color: "#263238" }}>
              <Apple size={18} />
              Sign in with Apple
            </button>
          </div>

          <p className="text-center mt-8 text-sm" style={{ color: "#607D8B" }}>
            Don't have an account?{" "}
            <Link to="/signup" className="font-semibold no-underline hover:underline" style={{ color: "#2E7D32" }}>Create an account</Link>
          </p>

          <div className="mt-8 py-3 px-4 rounded-xl text-center text-sm font-medium" style={{ backgroundColor: "#E8F5E9", color: "#2E7D32" }}>
            🌿 Shop smarter. Choose sustainable.
          </div>
        </div>
      </div>
    </div>
  );
}
