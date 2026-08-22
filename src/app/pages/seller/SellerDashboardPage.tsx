import { useState } from "react";
import { Link, useNavigate } from "react-router";
import {
  LayoutDashboard, Package, ShoppingBag, Settings, TrendingUp,
  Bell, Leaf, ArrowUp, ArrowDown, AlertCircle, BarChart2
} from "lucide-react";
import { formatPrice } from "@/lib/currency";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar
} from "recharts";

import { useSellerData } from "@/hooks/useSellerData";

function SellerSidebar({ active }: { active: string }) {
  const navigate = useNavigate();
  const links = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/seller/dashboard" },
    { icon: Package, label: "Products", path: "/seller/products" },
    { icon: ShoppingBag, label: "Orders", path: "/seller/orders" },
    { icon: Settings, label: "Store Settings", path: "/seller/store" },
  ];
  return (
    <aside className="w-[220px] flex-shrink-0">
      <div className="rounded-2xl p-4 sticky top-24" style={{ backgroundColor: "#FFFFFF", boxShadow: "0 2px 16px rgba(46,125,50,0.07)" }}>
        <div className="flex items-center gap-2 px-3 py-2 mb-4">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#2E7D32" }}>
            <Leaf size={16} color="#FFFFFF" />
          </div>
          <span className="font-bold text-sm" style={{ color: "#2E7D32" }}>Seller Portal</span>
        </div>
        <nav className="space-y-1">
          {links.map((l) => (
            <button
              key={l.path}
              onClick={() => navigate(l.path)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl w-full text-left text-sm font-medium transition-all"
              style={{
                backgroundColor: active === l.path ? "#E8F5E9" : "transparent",
                color: active === l.path ? "#2E7D32" : "#607D8B",
              }}
            >
              <l.icon size={16} />
              {l.label}
            </button>
          ))}
        </nav>
        <div className="mt-4 pt-4" style={{ borderTop: "1px solid #E8F0E8" }}>
          <Link to="/home" className="flex items-center gap-2 px-3 py-2 text-xs no-underline" style={{ color: "#90A4AE" }}>
            ← Back to Marketplace
          </Link>
        </div>
      </div>
    </aside>
  );
}

export function SellerDashboardPage() {
  const {
    loading,
    totalRevenue,
    totalOrders,
    activeProducts,
    activeStoreName,
    revenueData,
    topProducts,
    newOrders,
  } = useSellerData();

  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const newOrderCount = newOrders.filter(o => o.status === "new" || o.status === "pending").length;
  const [showNotif, setShowNotif] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-green-200 border-t-green-700"></div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: "#F5F7F5", minHeight: "100vh" }}>
      <div style={{ backgroundColor: "#FFFFFF", borderBottom: "1px solid #E8F0E8" }} className="px-8 py-4 sticky top-0 z-40">
        <div className="max-w-[1440px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#2E7D32" }}>
              <Leaf size={16} color="#FFFFFF" />
            </div>
            <span className="font-bold" style={{ color: "#2E7D32" }}>GreenCart</span>
            <span className="text-sm" style={{ color: "#90A4AE" }}>/ Seller Portal</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Bell size={20} style={{ color: "#607D8B" }} className="cursor-pointer" onClick={() => setShowNotif(!showNotif)} />
              {newOrderCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-xs flex items-center justify-center font-bold" style={{ backgroundColor: "#EF5350", color: "#FFFFFF" }}>
                  {newOrderCount}
                </span>
              )}
              {showNotif && (
                <div className="absolute top-8 right-0 w-80 bg-white rounded-xl p-4 shadow-xl border z-50">
                  <h3 className="font-bold text-sm mb-3">Recent Items</h3>
                  {newOrders.slice(0,5).map(o => (
                     <div key={o.id} className="text-sm py-2 border-b last:border-0 hover:bg-gray-50">
                       <p className="font-medium">Order #{o.id.substring(0,8)}</p>
                       <p className="text-xs text-gray-500 truncate">{o.product}</p>
                     </div>
                  ))}
                  {newOrders.length === 0 && <p className="text-xs text-center text-gray-500">No new notifications</p>}
                </div>
              )}
            </div>
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ backgroundColor: "#E8F5E9", color: "#2E7D32" }}>
              ES
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-8 py-8">
        <div className="flex gap-6">
          <SellerSidebar active="/seller/dashboard" />

          <main className="flex-1">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold" style={{ color: "#263238" }}>Seller Dashboard</h1>
                <p className="text-sm" style={{ color: "#607D8B" }}>EcoNest Store · Last updated just now</p>
              </div>
              {newOrderCount > 0 && (
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl" style={{ backgroundColor: "#FFEBEE", border: "1px solid #FFCDD2" }}>
                  <AlertCircle size={16} color="#EF5350" />
                  <span className="text-sm font-semibold" style={{ color: "#EF5350" }}>
                    {newOrderCount} new orders need attention
                  </span>
                </div>
              )}
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {[
                { label: "Total Revenue", value: formatPrice(totalRevenue), icon: BarChart2, change: "+0%", up: true, bg: "#E8F5E9", col: "#2E7D32" },
                { label: "Total Orders", value: String(totalOrders), icon: ShoppingBag, change: "+0%", up: true, bg: "#E3F2FD", col: "#1565C0" },
                { label: "Avg Order Value", value: formatPrice(avgOrderValue), icon: TrendingUp, change: "+0%", up: true, bg: "#FFF8E1", col: "#F57F17" },
                { label: "Active Products", value: String(activeProducts), icon: Package, change: "All good", up: true, bg: "#FCE4EC", col: "#AD1457" },
              ].map((m) => (
                <div key={m.label} className="rounded-2xl p-5" style={{ backgroundColor: "#FFFFFF", boxShadow: "0 2px 12px rgba(46,125,50,0.07)" }}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: m.bg }}>
                      <m.icon size={18} color={m.col} />
                    </div>
                    <span className="flex items-center gap-1 text-xs font-semibold" style={{ color: m.up ? "#2E7D32" : "#EF5350" }}>
                      {m.up ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                      {m.change}
                    </span>
                  </div>
                  <p className="text-2xl font-bold mb-0.5" style={{ color: "#263238" }}>{m.value}</p>
                  <p className="text-xs" style={{ color: "#90A4AE" }}>{m.label}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Revenue Chart */}
              <div className="lg:col-span-2 rounded-2xl p-6" style={{ backgroundColor: "#FFFFFF", boxShadow: "0 2px 12px rgba(46,125,50,0.07)" }}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold" style={{ color: "#263238" }}>Revenue Overview</h2>
                  <span className="text-xs px-3 py-1.5 rounded-full" style={{ backgroundColor: "#E8F5E9", color: "#2E7D32" }}>Last 6 months</span>
                </div>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={revenueData}>
                    <defs>
                      <linearGradient id="revGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2E7D32" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#2E7D32" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F0F4F0" />
                    <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#90A4AE" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: "#90A4AE" }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v}`} />
                    <Tooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 16px rgba(0,0,0,0.1)", fontSize: "12px" }} formatter={(v: number) => [`₹${v}`, "Revenue"]} />
                    <Area type="monotone" dataKey="revenue" stroke="#2E7D32" strokeWidth={2.5} fill="url(#revGradient)" dot={false} activeDot={{ r: 5, fill: "#2E7D32", strokeWidth: 0 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Orders Chart */}
              <div className="rounded-2xl p-6" style={{ backgroundColor: "#FFFFFF", boxShadow: "0 2px 12px rgba(46,125,50,0.07)" }}>
                <h2 className="font-bold mb-4" style={{ color: "#263238" }}>Monthly Orders</h2>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={revenueData} barSize={20}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F0F4F0" vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#90A4AE" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "#90A4AE" }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: "12px", border: "none", fontSize: "12px" }} formatter={(v: number) => [v, "Orders"]} />
                    <Bar dataKey="orders" fill="#A5D6A7" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* New Orders */}
              <div className="rounded-2xl p-6" style={{ backgroundColor: "#FFFFFF", boxShadow: "0 2px 12px rgba(46,125,50,0.07)" }}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold" style={{ color: "#263238" }}>New Orders</h2>
                  <Link to="/seller/orders" className="text-xs font-medium no-underline" style={{ color: "#2E7D32" }}>View All →</Link>
                </div>
                <div className="space-y-3">
                  {newOrders.map((o) => (
                    <div key={o.id} className="p-3 rounded-xl" style={{ backgroundColor: "#F5F7F5" }}>
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-xs" style={{ color: "#263238" }}>{o.id}</p>
                        <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                          style={{ backgroundColor: o.status === "new" ? "#FFF3E0" : "#E8F5E9", color: o.status === "new" ? "#E65100" : "#2E7D32" }}>
                          {o.status === "new" ? "🔔 New" : "✓ Confirmed"}
                        </span>
                      </div>
                      <p className="text-sm mt-1" style={{ color: "#607D8B" }}>{o.product}</p>
                      <div className="flex justify-between mt-2">
                        <span className="text-xs" style={{ color: "#90A4AE" }}>{o.time}</span>
                        <span className="text-sm font-bold" style={{ color: "#263238" }}>{formatPrice(o.amount)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Products */}
              <div className="lg:col-span-2 rounded-2xl p-6" style={{ backgroundColor: "#FFFFFF", boxShadow: "0 2px 12px rgba(46,125,50,0.07)" }}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold" style={{ color: "#263238" }}>Top Products</h2>
                  <Link to="/seller/products" className="text-xs font-medium no-underline" style={{ color: "#2E7D32" }}>Manage →</Link>
                </div>
                <div className="space-y-3">
                  {topProducts.map((p) => (
                    <div key={p.name} className="flex items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium" style={{ color: "#263238" }}>{p.name}</p>
                          {p.status === "low_stock" && (
                            <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: "#FFF3E0", color: "#E65100" }}>Low Stock</span>
                          )}
                        </div>
                        <div className="mt-1.5 h-1.5 rounded-full" style={{ backgroundColor: "#F0F4F0" }}>
                          <div className="h-full rounded-full" style={{ width: `${Math.min(100, (p.sold / 130) * 100)}%`, backgroundColor: "#2E7D32" }} />
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-bold" style={{ color: "#263238" }}>{formatPrice(p.revenue)}</p>
                        <p className="text-xs" style={{ color: "#90A4AE" }}>{p.sold} sold</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
