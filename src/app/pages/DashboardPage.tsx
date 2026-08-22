import { Link } from "react-router";
import {
  Leaf,
  ShoppingBag,
  Award,
  TrendingUp,
  Package,
  Truck,
  CheckCircle2,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Navbar } from "../components/Navbar";
import { useOrders } from "@/hooks/useOrders";
import { formatPrice } from "@/lib/currency";

const CHART_DATA = [
  { month: "Aug", co2: 3.2 },
  { month: "Sep", co2: 5.8 },
  { month: "Oct", co2: 8.1 },
  { month: "Nov", co2: 12.4 },
  { month: "Dec", co2: 16.0 },
  { month: "Jan", co2: 21.3 },
  { month: "Feb", co2: 28.5 },
  { month: "Mar", co2: 45.0 },
];

const SELLERS = [
  { name: "GreenStore", tag: "Certified Seller", rating: 4.9, products: 342, badge: "🏆", color: "#2E7D32" },
  { name: "EcoMart", tag: "Verified Sustainable Vendor", rating: 4.8, products: 218, badge: "🌿", color: "#1565C0" },
  { name: "NaturalNest", tag: "Eco-Certified Partner", rating: 4.7, products: 189, badge: "♻️", color: "#6A1B9A" },
];

type OrderStatus = "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; bg: string }> = {
  pending:   { label: "Pending",   color: "#F57F17", bg: "#FFF8E1" },
  confirmed: { label: "Confirmed", color: "#1565C0", bg: "#E3F2FD" },
  shipped:   { label: "Shipped",   color: "#6A1B9A", bg: "#F3E5F5" },
  delivered: { label: "Delivered", color: "#2E7D32", bg: "#E8F5E9" },
  cancelled: { label: "Cancelled", color: "#C62828", bg: "#FFEBEE" },
};

function statusIcon(status: OrderStatus) {
  if (status === "delivered") return <CheckCircle2 size={18} color="#2E7D32" />;
  if (status === "shipped")   return <Truck size={18} color="#6A1B9A" />;
  return <Package size={18} color="#F57F17" />;
}

export function DashboardPage() {
  const { orders, loading: ordersLoading } = useOrders();
  const recentOrders = orders.slice(0, 3);

  const ecoPoints = Math.min(orders.length * 25, 500);
  const nextMilestone = 500;
  const progress = (ecoPoints / nextMilestone) * 100;

  const totalCo2Saved = orders.reduce((s, o) => s + o.items.reduce((a, i) => a + i.quantity * 0.2, 0), 0);

  return (
    <div style={{ backgroundColor: "#F5F7F5" }}>
      <Navbar />

      <div className="max-w-[1440px] mx-auto px-8 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-1" style={{ color: "#263238" }}>
              My Dashboard
            </h1>
            <p style={{ color: "#607D8B" }}>
              Track your environmental impact and rewards.
            </p>
          </div>
          <div
            className="px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2"
            style={{ backgroundColor: "#E8F5E9", color: "#2E7D32" }}
          >
            <Leaf size={14} />
            Member since Jan 2026
          </div>
        </div>

        {/* Metrics Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
          {[
            {
              icon: <span className="text-2xl">🍃</span>,
              label: "Carbon Saved",
              value: `${totalCo2Saved.toFixed(1)}kg CO₂`,
              sub: "+0.2kg per eco item",
              bg: "#E8F5E9",
              col: "#2E7D32",
            },
            {
              icon: <ShoppingBag size={22} color="#1565C0" />,
              label: "Eco Purchases",
              value: ordersLoading ? "…" : String(orders.length),
              sub: "Total orders",
              bg: "#E3F2FD",
              col: "#1565C0",
            },
            {
              icon: <Leaf size={22} color="#6A1B9A" />,
              label: "Green Products Bought",
              value: ordersLoading ? "…" : String(orders.reduce((s, o) => s + o.items.length, 0)),
              sub: "Verified eco items",
              bg: "#F3E5F5",
              col: "#6A1B9A",
            },
          ].map((m) => (
            <div
              key={m.label}
              className="rounded-2xl p-6 flex items-center gap-5"
              style={{ backgroundColor: "#FFFFFF", boxShadow: "0 2px 16px rgba(46,125,50,0.08)" }}
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: m.bg }}
              >
                {m.icon}
              </div>
              <div>
                <p className="text-sm" style={{ color: "#607D8B" }}>{m.label}</p>
                <p className="text-3xl font-bold" style={{ color: "#263238" }}>{m.value}</p>
                <p className="text-xs" style={{ color: m.col }}>{m.sub}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Chart */}
            <div className="rounded-2xl p-6" style={{ backgroundColor: "#FFFFFF", boxShadow: "0 2px 16px rgba(46,125,50,0.08)" }}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-bold" style={{ color: "#263238" }}>Environmental Impact Dashboard</h2>
                  <p className="text-sm" style={{ color: "#607D8B" }}>Cumulative CO₂ savings over time (kg)</p>
                </div>
                <div
                  className="flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-full"
                  style={{ backgroundColor: "#E8F5E9", color: "#2E7D32" }}
                >
                  <TrendingUp size={14} /> +41% this month
                </div>
              </div>

              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={CHART_DATA}>
                  <defs>
                    <linearGradient id="co2Gradient" x1="0" y1="0" x2="0" y2="1">
                      <stop key="stop-top" offset="5%" stopColor="#2E7D32" stopOpacity={0.15} />
                      <stop key="stop-bottom" offset="95%" stopColor="#2E7D32" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F0F4F0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#90A4AE" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: "#90A4AE" }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 16px rgba(0,0,0,0.1)", fontSize: "12px" }}
                    formatter={(v: number) => [`${v} kg CO₂`, "Carbon Saved"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="co2"
                    stroke="#2E7D32"
                    strokeWidth={2.5}
                    fill="url(#co2Gradient)"
                    dot={false}
                    activeDot={{ r: 6, fill: "#2E7D32", strokeWidth: 0 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Recent Orders - REAL DATA */}
            <div className="rounded-2xl p-6" style={{ backgroundColor: "#FFFFFF", boxShadow: "0 2px 16px rgba(46,125,50,0.08)" }}>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold" style={{ color: "#263238" }}>Recent Eco Orders</h2>
                <Link to="/orders" className="text-sm no-underline font-medium" style={{ color: "#2E7D32" }}>
                  View All →
                </Link>
              </div>

              {ordersLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 rounded-xl animate-pulse" style={{ backgroundColor: "#F5F7F5" }} />
                  ))}
                </div>
              ) : recentOrders.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingBag size={36} color="#D1E8D1" className="mx-auto mb-3" />
                  <p className="text-sm" style={{ color: "#90A4AE" }}>No orders yet. Start shopping! 🌿</p>
                  <Link to="/shop" className="inline-block mt-3 text-sm font-semibold no-underline" style={{ color: "#2E7D32" }}>Browse Products →</Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentOrders.map((order) => {
                    const status = order.status as OrderStatus;
                    const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;
                    const firstName = order.items[0]?.name ?? "Order";
                    return (
                      <div key={order.id} className="flex items-center gap-4 p-4 rounded-xl" style={{ backgroundColor: "#F5F7F5" }}>
                        {statusIcon(status)}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm truncate" style={{ color: "#263238" }}>
                            {firstName}{order.items.length > 1 ? ` +${order.items.length - 1} more` : ""}
                          </p>
                          <p className="text-xs" style={{ color: "#90A4AE" }}>
                            {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <span
                            className="text-xs px-2.5 py-1 rounded-full font-medium"
                            style={{ backgroundColor: cfg.bg, color: cfg.color }}
                          >
                            {cfg.label}
                          </span>
                          <p className="text-xs mt-1 font-semibold" style={{ color: "#263238" }}>
                            {formatPrice(order.totalAmount)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Eco Reward Points */}
            <div
              className="rounded-2xl p-6"
              style={{ backgroundColor: "#2E7D32", boxShadow: "0 4px 24px rgba(46,125,50,0.25)" }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <Award size={20} color="#FFFFFF" />
                </div>
                <h2 className="text-lg font-bold text-white">Eco Reward Points</h2>
              </div>

              <p className="text-5xl font-bold text-white mb-1">{ecoPoints}</p>
              <p className="text-white/75 text-sm mb-5">
                Points Earned · {Math.max(0, nextMilestone - ecoPoints)} until next reward
              </p>

              <div className="w-full h-2.5 rounded-full mb-2" style={{ backgroundColor: "rgba(255,255,255,0.2)" }}>
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${Math.min(100, progress)}%`, backgroundColor: "#A5D6A7" }}
                />
              </div>
              <div className="flex justify-between text-xs mb-5" style={{ color: "rgba(255,255,255,0.65)" }}>
                <span>0</span>
                <span>{nextMilestone} pts</span>
              </div>

              <button
                className="w-full py-3 rounded-xl font-semibold transition-all hover:opacity-90"
                style={{ backgroundColor: "#FFFFFF", color: "#2E7D32" }}
              >
                Redeem Rewards
              </button>
            </div>

            {/* Top Sustainable Sellers */}
            <div className="rounded-2xl p-6" style={{ backgroundColor: "#FFFFFF", boxShadow: "0 2px 16px rgba(46,125,50,0.08)" }}>
              <h2 className="text-lg font-bold mb-5" style={{ color: "#263238" }}>Top Sustainable Sellers</h2>
              <div className="space-y-4">
                {SELLERS.map((seller) => (
                  <div key={seller.name} className="flex items-center gap-3 p-3 rounded-xl transition-all hover:bg-gray-50">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0" style={{ backgroundColor: "#E8F5E9" }}>
                      {seller.badge}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm" style={{ color: "#263238" }}>{seller.name}</p>
                      <p className="text-xs truncate" style={{ color: "#90A4AE" }}>{seller.tag}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs font-bold" style={{ color: seller.color }}>⭐ {seller.rating}</p>
                      <p className="text-xs" style={{ color: "#90A4AE" }}>{seller.products} items</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="rounded-2xl p-6" style={{ backgroundColor: "#FFFFFF", boxShadow: "0 2px 16px rgba(46,125,50,0.08)" }}>
              <h2 className="text-lg font-bold mb-4" style={{ color: "#263238" }}>Quick Actions</h2>
              <div className="space-y-2">
                {[
                  { label: "Browse New Products", path: "/shop", icon: "🛒" },
                  { label: "My Orders", path: "/orders", icon: "📦" },
                  { label: "My Wishlist", path: "/wishlist", icon: "❤️" },
                ].map((action) => (
                  <Link
                    key={action.label}
                    to={action.path}
                    className="flex items-center gap-3 p-3 rounded-xl no-underline transition-all hover:bg-green-50"
                    style={{ color: "#263238" }}
                  >
                    <span className="text-lg">{action.icon}</span>
                    <span className="text-sm font-medium">{action.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}