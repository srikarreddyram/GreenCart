import { Leaf, Recycle, Truck, Users, Award, TreePine, Globe, Heart } from "lucide-react";
import { Navbar } from "../components/Navbar";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const IMPACT_CHART = [
  { year: "2021", co2: 12 },
  { year: "2022", co2: 34 },
  { year: "2023", co2: 78 },
  { year: "2024", co2: 145 },
  { year: "2025", co2: 213 },
  { year: "2026", co2: 280 },
];

const TEAM = [
  {
    name: "Asher Jacob",
    role: "Founder & CEO",
    bio: "Visionary leader driving GreenCart's mission to make sustainable shopping accessible to everyone. Passionate about building a greener future through conscious commerce.",
    avatar: "AJ",
    color: "#A5D6A7",
  },
  {
    name: "Aryan Amit Sinha",
    role: "CTO & Head of Sustainability",
    bio: "Combines deep technical expertise with a commitment to environmental responsibility. Ensures every product meets rigorous eco standards while building the tech that powers GreenCart.",
    avatar: "AS",
    color: "#80CBC4",
  },
  {
    name: "Ramachandra TejSrikar Reddy",
    role: "Head of Design & Development",
    bio: "Crafts the seamless experience behind GreenCart — from pixel-perfect interfaces to robust full-stack architecture. Believes great design can inspire sustainable choices.",
    avatar: "TR",
    color: "#FFE082",
  },
];

const PARTNERS = [
  { name: "1% for the Planet", icon: "🌍" },
  { name: "GOTS Certified", icon: "🏅" },
  { name: "B Corp Pending", icon: "⭐" },
  { name: "Carbon Trust", icon: "🍃" },
  { name: "Zero Waste Int'l", icon: "♻️" },
  { name: "Fair Trade USA", icon: "🤝" },
];

const MILESTONES = [
  { year: "2020", event: "GreenCart founded in a San Francisco garage" },
  { year: "2021", event: "First 100 eco-certified products listed" },
  { year: "2022", event: "Reached 10,000 customers & saved 34 tonnes CO₂" },
  { year: "2023", event: "Launched carbon-neutral shipping across the US" },
  { year: "2024", event: "50,000+ active members & Series A funding" },
  { year: "2026", event: "280 tonnes CO₂ saved — and counting" },
];

export function AboutPage() {
  return (
    <div style={{ backgroundColor: "#F5F7F5", minHeight: "100vh" }}>
      <Navbar />

      {/* Hero */}
      <div
        className="relative overflow-hidden"
        style={{ backgroundColor: "#1B5E20" }}
      >
        <div className="absolute inset-0 opacity-20">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1645307356404-407a1083ec59?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080"
            alt="Green forest"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative max-w-[1440px] mx-auto px-8 py-20 text-center">
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-6"
            style={{ backgroundColor: "rgba(102,187,106,0.25)", color: "#A5D6A7" }}
          >
            <Leaf size={14} />
            Our Story & Mission
          </div>
          <h1
            className="text-5xl font-bold mb-6 max-w-3xl mx-auto"
            style={{ color: "#FFFFFF", lineHeight: "1.15" }}
          >
            Shopping that's good for{" "}
            <span style={{ color: "#66BB6A" }}>you and the planet</span>
          </h1>
          <p
            className="text-lg max-w-2xl mx-auto"
            style={{ color: "#C8E6C9", lineHeight: "1.7" }}
          >
            GreenCart was born from a simple belief: every purchase is a vote for the
            world you want to live in. We make it easy to choose products that are
            better for people, animals, and the environment.
          </p>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-8 py-14">
        {/* Impact Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-16">
          {[
            { value: "280t", label: "CO₂ Saved", icon: Leaf, bg: "#E8F5E9", col: "#2E7D32" },
            { value: "52K+", label: "Happy Customers", icon: Users, bg: "#E3F2FD", col: "#1565C0" },
            { value: "620+", label: "Eco Products", icon: Recycle, bg: "#FFF8E1", col: "#F57F17" },
            { value: "100%", label: "Carbon-Neutral Shipping", icon: Truck, bg: "#FCE4EC", col: "#AD1457" },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="rounded-2xl p-6 text-center"
                style={{
                  backgroundColor: "#FFFFFF",
                  boxShadow: "0 2px 16px rgba(46,125,50,0.08)",
                  border: "1px solid #E8F5E9",
                }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3"
                  style={{ backgroundColor: stat.bg }}
                >
                  <Icon size={22} color={stat.col} />
                </div>
                <p className="text-3xl font-bold mb-1" style={{ color: "#263238" }}>
                  {stat.value}
                </p>
                <p className="text-sm" style={{ color: "#90A4AE" }}>
                  {stat.label}
                </p>
              </div>
            );
          })}
        </div>

        {/* Mission & Photo */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-4"
              style={{ backgroundColor: "#E8F5E9", color: "#2E7D32" }}
            >
              <TreePine size={12} />
              Our Mission
            </div>
            <h2 className="text-3xl font-bold mb-5" style={{ color: "#263238" }}>
              Making sustainability the easy choice
            </h2>
            <p className="mb-4" style={{ color: "#607D8B", lineHeight: "1.75" }}>
              We rigorously vet every product on GreenCart against our Eco Standards
              framework — evaluating carbon footprint, material sourcing, labor
              practices, packaging, and end-of-life recyclability.
            </p>
            <p className="mb-6" style={{ color: "#607D8B", lineHeight: "1.75" }}>
              We partner only with brands that share our commitment to transparency. If
              a product doesn't meet our bar, it doesn't make the shelf — simple as
              that.
            </p>
            <div className="space-y-3">
              {[
                "Every product carbon-footprint rated",
                "Third-party sustainability audits",
                "Plastic-free packaging guaranteed",
                "1% of revenue to reforestation",
              ].map((point) => (
                <div key={point} className="flex items-center gap-3">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: "#E8F5E9" }}
                  >
                    <Leaf size={12} color="#2E7D32" />
                  </div>
                  <span className="text-sm" style={{ color: "#607D8B" }}>
                    {point}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-3xl overflow-hidden shadow-xl" style={{ height: 420 }}>
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1675434303580-98676fd410dc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080"
              alt="GreenCart team"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* CO₂ Impact Chart */}
        <div
          className="rounded-3xl p-8 mb-16"
          style={{
            backgroundColor: "#FFFFFF",
            boxShadow: "0 2px 16px rgba(46,125,50,0.08)",
            border: "1px solid #E8F5E9",
          }}
        >
          <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
            <div>
              <h2 className="text-2xl font-bold mb-1" style={{ color: "#263238" }}>
                Cumulative CO₂ Saved
              </h2>
              <p style={{ color: "#90A4AE" }}>
                Tonnes of carbon dioxide offset through GreenCart purchases
              </p>
            </div>
            <div
              className="px-4 py-2 rounded-xl"
              style={{ backgroundColor: "#E8F5E9" }}
            >
              <span className="font-bold" style={{ color: "#2E7D32" }}>
                280t saved in 2026
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={IMPACT_CHART} barSize={40}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0F4F0" vertical={false} />
              <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fill: "#90A4AE", fontSize: 13 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: "#90A4AE", fontSize: 13 }} unit="t" />
              <Tooltip
                formatter={(v) => [`${v} tonnes`, "CO₂ Saved"]}
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid #E8F5E9",
                  boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
                }}
              />
              <Bar dataKey="co2" radius={[8, 8, 0, 0]}>
                {IMPACT_CHART.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.year === "2026" ? "#2E7D32" : "#A5D6A7"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Timeline */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-8 text-center" style={{ color: "#263238" }}>
            Our Journey
          </h2>
          <div className="relative">
            {/* Line */}
            <div
              className="absolute left-1/2 top-0 bottom-0 w-0.5 -translate-x-1/2 hidden md:block"
              style={{ backgroundColor: "#E8F5E9" }}
            />
            <div className="space-y-6">
              {MILESTONES.map((m, i) => (
                <div
                  key={m.year}
                  className={`flex items-center gap-6 ${i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}
                >
                  <div className={`flex-1 ${i % 2 === 0 ? "md:text-right" : "md:text-left"}`}>
                    <div
                      className="inline-block rounded-2xl px-5 py-4"
                      style={{
                        backgroundColor: "#FFFFFF",
                        boxShadow: "0 2px 12px rgba(46,125,50,0.08)",
                        border: "1px solid #E8F5E9",
                      }}
                    >
                      <p className="text-xs font-bold mb-1" style={{ color: "#66BB6A" }}>
                        {m.year}
                      </p>
                      <p className="text-sm" style={{ color: "#263238" }}>
                        {m.event}
                      </p>
                    </div>
                  </div>
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 z-10 hidden md:flex"
                    style={{ backgroundColor: "#2E7D32" }}
                  >
                    <Leaf size={16} color="#FFFFFF" />
                  </div>
                  <div className="flex-1 hidden md:block" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Team */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-2 text-center" style={{ color: "#263238" }}>
            Meet the Team
          </h2>
          <p className="text-center mb-8" style={{ color: "#90A4AE" }}>
            The people behind GreenCart's mission
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {TEAM.map((member) => (
              <div
                key={member.name}
                className="rounded-2xl p-6 text-center"
                style={{
                  backgroundColor: "#FFFFFF",
                  boxShadow: "0 2px 16px rgba(46,125,50,0.08)",
                  border: "1px solid #E8F5E9",
                }}
              >
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-lg font-bold"
                  style={{ backgroundColor: member.color, color: "#263238" }}
                >
                  {member.avatar}
                </div>
                <p className="font-bold mb-1" style={{ color: "#263238" }}>
                  {member.name}
                </p>
                <p
                  className="text-xs font-semibold mb-3 px-3 py-1 rounded-full inline-block"
                  style={{ backgroundColor: "#E8F5E9", color: "#2E7D32" }}
                >
                  {member.role}
                </p>
                <p className="text-sm" style={{ color: "#90A4AE", lineHeight: "1.6" }}>
                  {member.bio}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Partners */}
        <div
          className="rounded-3xl p-8 mb-16"
          style={{
            backgroundColor: "#FFFFFF",
            boxShadow: "0 2px 16px rgba(46,125,50,0.08)",
            border: "1px solid #E8F5E9",
          }}
        >
          <h2 className="text-xl font-bold mb-2 text-center" style={{ color: "#263238" }}>
            Certifications & Partners
          </h2>
          <p className="text-center mb-8" style={{ color: "#90A4AE" }}>
            We hold ourselves to the highest standards
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {PARTNERS.map((p) => (
              <div
                key={p.name}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl"
                style={{ backgroundColor: "#F5F7F5" }}
              >
                <span className="text-3xl">{p.icon}</span>
                <span className="text-xs text-center font-semibold" style={{ color: "#607D8B" }}>
                  {p.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div
          className="rounded-3xl p-12 text-center"
          style={{
            background: "linear-gradient(135deg, #1B5E20 0%, #2E7D32 60%, #388E3C 100%)",
          }}
        >
          <Globe size={40} color="#A5D6A7" className="mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-3" style={{ color: "#FFFFFF" }}>
            Ready to shop with a purpose?
          </h2>
          <p className="mb-8 max-w-lg mx-auto" style={{ color: "#C8E6C9", lineHeight: "1.7" }}>
            Join 52,000+ conscious shoppers making a difference one eco-friendly
            purchase at a time.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <a
              href="/shop"
              className="px-8 py-3.5 rounded-xl font-semibold no-underline transition-all hover:opacity-90"
              style={{ backgroundColor: "#FFFFFF", color: "#2E7D32" }}
            >
              Shop Now
            </a>
            <a
              href="/signup"
              className="px-8 py-3.5 rounded-xl font-semibold no-underline border transition-all hover:bg-white/10"
              style={{ color: "#FFFFFF", borderColor: "rgba(255,255,255,0.4)" }}
            >
              Create Account
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}