import { Link } from "react-router";
import { Leaf, Github, Twitter, Instagram, Mail } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const LINKS = {
  Shop: [
    { label: "Browse All", path: "/shop" },
    { label: "New Arrivals", path: "/shop" },
    { label: "Best Sellers", path: "/shop" },
    { label: "Eco Certified", path: "/shop" },
  ],
  Company: [
    { label: "About Us", path: "/about" },
    { label: "Our Mission", path: "/about" },
    { label: "Sustainability Report", path: "/about" },
    { label: "Careers", path: "/about" },
  ],
  Support: [
    { label: "My Orders", path: "/orders" },
    { label: "Wishlist", path: "/wishlist" },
    { label: "Dashboard", path: "/dashboard" },
    { label: "Help Center", path: "/about" },
  ],
};

export function Footer() {
  const [email, setEmail] = useState("");

  const handleSubscribe = () => {
    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address.");
      return;
    }
    toast.success("🌿 You're subscribed to GreenCart updates!");
    setEmail("");
  };
  return (
    <footer style={{ backgroundColor: "#1A2E1A", color: "#FFFFFF" }}>
      <div className="max-w-[1440px] mx-auto px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: "#2E7D32" }}
              >
                <Leaf size={19} color="#FFFFFF" strokeWidth={2.5} />
              </div>
              <span className="text-xl font-bold">GreenCart</span>
            </div>
            <p className="text-sm leading-relaxed mb-6" style={{ color: "#A5D6A7" }}>
              The world's most trusted eco-friendly marketplace. Every product
              rated, verified, and carbon-offset — so you can shop with total
              confidence.
            </p>
            {/* Newsletter */}
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubscribe()}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none"
                style={{
                  backgroundColor: "rgba(255,255,255,0.08)",
                  color: "#FFFFFF",
                  border: "1px solid rgba(255,255,255,0.12)",
                }}
              />
              <button
                onClick={handleSubscribe}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
                style={{ backgroundColor: "#2E7D32", color: "#FFFFFF" }}
              >
                Subscribe
              </button>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(LINKS).map(([section, links]) => (
            <div key={section}>
              <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider" style={{ color: "#66BB6A" }}>
                {section}
              </h3>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.path}
                      className="text-sm no-underline transition-colors hover:text-white"
                      style={{ color: "#90A4AE" }}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div
          className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8"
          style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
        >
          <p className="text-sm" style={{ color: "#607D8B" }}>
            © 2026 GreenCart — Shop Smarter. Choose Sustainable.
          </p>
          <div className="flex items-center gap-4">
            {[
              { Icon: Twitter, href: "#" },
              { Icon: Instagram, href: "#" },
              { Icon: Github, href: "#" },
              { Icon: Mail, href: "mailto:hello@greencart.eco" },
            ].map(({ Icon, href }, i) => (
              <a
                key={i}
                href={href}
                className="w-9 h-9 rounded-lg flex items-center justify-center transition-all hover:bg-white/10"
                style={{ color: "#90A4AE" }}
              >
                <Icon size={16} />
              </a>
            ))}
          </div>
          <div className="text-xs" style={{ color: "#607D8B" }}>
            🌿 Carbon-neutral hosting · 1% for the Planet
          </div>
        </div>
      </div>
    </footer>
  );
}
