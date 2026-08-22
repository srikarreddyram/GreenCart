import { useNavigate } from "react-router";
import { Users, Package, BarChart2, FolderTree, TrendingUp, Leaf, Shield, ArrowUp } from "lucide-react";
import { formatPrice } from "@/lib/currency";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, Legend
} from "recharts";

import { useAdminData } from "@/hooks/useAdminData";

function AdminSidebar({ active }: { active: string }) {
  const navigate = useNavigate();
  const links = [
    { icon: Users, label: "Users", path: "/admin/users" },
    { icon: Package, label: "Listings", path: "/admin/listings" },
    { icon: BarChart2, label: "Analytics", path: "/admin/analytics" },
    { icon: FolderTree, label: "Categories", path: "/admin/categories" },
  ];
  return (
    <aside className="w-[220px] flex-shrink-0">
      <div className="rounded-2xl p-4 sticky top-24" style={{ backgroundColor: "#FFFFFF", boxShadow: "0 2px 16px rgba(46,125,50,0.07)" }}>
        <div className="flex items-center gap-2 px-3 py-2 mb-2">
          <Shield size={16} color="#6A1B9A" />
          <span className="font-bold text-sm" style={{ color: "#6A1B9A" }}>Admin Panel</span>
        </div>
        <p className="px-3 text-xs mb-4" style={{ color: "#90A4AE" }}>GreenCart Platform</p>
        <nav className="space-y-1">
          {links.map((l) => (
            <button key={l.path} onClick={() => navigate(l.path)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl w-full text-left text-sm font-medium transition-all"
              style={{ backgroundColor: active === l.path ? "#F3E5F5" : "transparent", color: active === l.path ? "#6A1B9A" : "#607D8B" }}>
              <l.icon size={16} />{l.label}
            </button>
          ))}
        </nav>
      </div>
    </aside>
  );
}

export function AdminAnalyticsPage() {
  const { loading, totalGmv, totalUsers, activeSellers, avgOrderValue, gmvData, categoryPie, signupsData } = useAdminData();

  return (
    <div style={{ backgroundColor: "#F5F7F5", minHeight: "100vh" }}>
      <div style={{ backgroundColor: "#FFFFFF", borderBottom: "1px solid #E8F0E8" }} className="px-8 py-4 sticky top-0 z-40">
        <div className="max-w-[1440px] mx-auto flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#6A1B9A" }}>
            <Leaf size={16} color="#FFFFFF" />
          </div>
          <span className="font-bold" style={{ color: "#2E7D32" }}>GreenCart</span>
          <span className="text-sm" style={{ color: "#90A4AE" }}>/ Admin / Analytics</span>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-8 py-8">
        <div className="flex gap-6">
          <AdminSidebar active="/admin/analytics" />

          <main className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold" style={{ color: "#263238" }}>Platform Analytics</h1>
                <p className="text-sm" style={{ color: "#607D8B" }}>Last 6 months overview</p>
              </div>
              <span className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold" style={{ backgroundColor: "#E8F5E9", color: "#2E7D32" }}>
                <TrendingUp size={14} />
                +34% vs last period
              </span>
            </div>

            {/* KPI Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {[
                { label: "Gross Merchandise Value", value: formatPrice(totalGmv), change: "+0%", icon: "💰", bg: "#E8F5E9", col: "#2E7D32" },
                { label: "Active Users", value: totalUsers.toLocaleString(), change: "+0%", icon: "👥", bg: "#E3F2FD", col: "#1565C0" },
                { label: "Active Sellers", value: String(activeSellers), change: "+0%", icon: "🏪", bg: "#FFF8E1", col: "#F57F17" },
                { label: "Avg Order Value", value: formatPrice(avgOrderValue), change: "+0%", icon: "📦", bg: "#F3E5F5", col: "#6A1B9A" },
              ].map((m) => (
                <div key={m.label} className="rounded-2xl p-5" style={{ backgroundColor: "#FFFFFF", boxShadow: "0 2px 12px rgba(46,125,50,0.07)" }}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ backgroundColor: m.bg }}>{m.icon}</div>
                    <span className="flex items-center gap-1 text-xs font-bold" style={{ color: m.col }}>
                      <ArrowUp size={11} />{m.change}
                    </span>
                  </div>
                  <p className="text-xl font-bold" style={{ color: "#263238" }}>{m.value}</p>
                  <p className="text-xs mt-0.5" style={{ color: "#90A4AE" }}>{m.label}</p>
                </div>
              ))}
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              {/* GMV Chart */}
              <div className="lg:col-span-2 rounded-2xl p-6" style={{ backgroundColor: "#FFFFFF", boxShadow: "0 2px 12px rgba(46,125,50,0.07)" }}>
                <h2 className="font-bold mb-4" style={{ color: "#263238" }}>GMV Over Time</h2>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={gmvData}>
                    <defs>
                      <linearGradient id="gmvGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6A1B9A" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#6A1B9A" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F0F4F0" />
                    <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#90A4AE" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: "#90A4AE" }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                    <Tooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 16px rgba(0,0,0,0.1)", fontSize: "12px" }} formatter={(v: number) => [`₹${v.toLocaleString()}`, "GMV"]} />
                    <Area type="monotone" dataKey="gmv" stroke="#6A1B9A" strokeWidth={2.5} fill="url(#gmvGrad)" dot={false} activeDot={{ r: 5, fill: "#6A1B9A", strokeWidth: 0 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Category Pie */}
              <div className="rounded-2xl p-6" style={{ backgroundColor: "#FFFFFF", boxShadow: "0 2px 12px rgba(46,125,50,0.07)" }}>
                <h2 className="font-bold mb-4" style={{ color: "#263238" }}>Sales by Category</h2>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={categoryPie} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                      {categoryPie.map((entry: any, i: number) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Legend iconType="circle" iconSize={8} formatter={(value) => <span style={{ fontSize: "11px", color: "#607D8B" }}>{value}</span>} />
                    <Tooltip formatter={(v: number) => [`${v}%`, ""]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* User Growth */}
              <div className="rounded-2xl p-6" style={{ backgroundColor: "#FFFFFF", boxShadow: "0 2px 12px rgba(46,125,50,0.07)" }}>
                <h2 className="font-bold mb-4" style={{ color: "#263238" }}>Active User Growth</h2>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={gmvData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F0F4F0" />
                    <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#90A4AE" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: "#90A4AE" }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: "12px", border: "none", fontSize: "12px" }} formatter={(v: number) => [v, "Users"]} />
                    <Line type="monotone" dataKey="users" stroke="#2E7D32" strokeWidth={2.5} dot={{ r: 4, fill: "#2E7D32" }} activeDot={{ r: 6, strokeWidth: 0 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* New Sign-ups */}
              <div className="rounded-2xl p-6" style={{ backgroundColor: "#FFFFFF", boxShadow: "0 2px 12px rgba(46,125,50,0.07)" }}>
                <h2 className="font-bold mb-4" style={{ color: "#263238" }}>New Sign-ups (This Month)</h2>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={signupsData} barSize={20} barGap={4}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F0F4F0" vertical={false} />
                    <XAxis dataKey="week" tick={{ fontSize: 12, fill: "#90A4AE" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: "#90A4AE" }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: "12px", border: "none", fontSize: "12px" }} />
                    <Bar dataKey="buyers" name="Buyers" fill="#A5D6A7" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="sellers" name="Sellers" fill="#2E7D32" radius={[4, 4, 0, 0]} />
                    <Legend iconType="circle" iconSize={8} formatter={(v) => <span style={{ fontSize: "11px", color: "#607D8B" }}>{v}</span>} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
