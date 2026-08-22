import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { ShoppingBag, Package, LayoutDashboard, Settings, Leaf, Bell, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { formatPrice } from "@/lib/currency";
import { useSellerData, useSellerOrders } from "@/hooks/useSellerData";
import type { ItemStatus } from "@/types/database.types";

const STATUS_COLORS: Record<ItemStatus, { bg: string; color: string }> = {
  pending: { bg: "#FFF8E1", color: "#F57F17" },
  confirmed: { bg: "#E8F5E9", color: "#2E7D32" },
  shipped: { bg: "#E3F2FD", color: "#1565C0" },
  delivered: { bg: "#E8F5E9", color: "#1B5E20" },
  cancelled: { bg: "#FFEBEE", color: "#C62828" },
};



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
            <button key={l.path} onClick={() => navigate(l.path)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl w-full text-left text-sm font-medium transition-all"
              style={{ backgroundColor: active === l.path ? "#E8F5E9" : "transparent", color: active === l.path ? "#2E7D32" : "#607D8B" }}>
              <l.icon size={16} />{l.label}
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

export function SellerOrdersPage() {
  const { storeId } = useSellerData();
  const { orders, updateStatus: commitStatusUpdate, loading } = useSellerOrders(storeId);
  const [filter, setFilter] = useState<ItemStatus | "all">("all");
  
  const pendingCount = orders.filter(o => o.status === "pending").length;
  const newBadge = pendingCount;

  const filtered = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  const updateStatus = async (itemId: string, newStatus: ItemStatus) => {
    const error = await commitStatusUpdate(itemId, newStatus);
    if (!error) {
      toast.success(`Item updated to ${newStatus}`);
    } else {
      toast.error("Failed to update status");
    }
  };

  const NEXT_STATUS: Partial<Record<ItemStatus, ItemStatus>> = {
    pending: "confirmed",
    confirmed: "shipped",
    shipped: "delivered",
  };

  const [showNotif, setShowNotif] = useState(false);

  return (
    <div style={{ backgroundColor: "#F5F7F5", minHeight: "100vh" }}>
      <div style={{ backgroundColor: "#FFFFFF", borderBottom: "1px solid #E8F0E8" }} className="px-8 py-4 sticky top-0 z-40">
        <div className="max-w-[1440px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#2E7D32" }}>
              <Leaf size={16} color="#FFFFFF" />
            </div>
            <span className="font-bold" style={{ color: "#2E7D32" }}>GreenCart</span>
            <span className="text-sm" style={{ color: "#90A4AE" }}>/ Order Management</span>
          </div>
          <div className="relative">
            <Bell size={20} style={{ color: "#607D8B" }} className="cursor-pointer" onClick={() => setShowNotif(!showNotif)} />
            {newBadge > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-xs flex items-center justify-center font-bold" style={{ backgroundColor: "#EF5350", color: "#FFFFFF" }}>
                {newBadge}
              </span>
            )}
            {showNotif && (
              <div className="absolute top-8 right-0 w-80 bg-white rounded-xl p-4 shadow-xl border z-50">
                <h3 className="font-bold text-sm mb-3">Recent Notifications</h3>
                {orders.filter(o => o.status === "pending").slice(0,5).map(o => (
                   <div key={o.id} className="text-sm py-2 border-b last:border-0 hover:bg-gray-50">
                     <p className="font-medium">Order #{String(o.id).substring(0,8)}</p>
                     <p className="text-xs text-gray-500 truncate">{o.product.name}</p>
                   </div>
                ))}
                {orders.filter(o => o.status === "pending").length === 0 && <p className="text-xs text-center text-gray-500">No new notifications</p>}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-8 py-8">
        <div className="flex gap-6">
          <SellerSidebar active="/seller/orders" />

          <main className="flex-1">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold" style={{ color: "#263238" }}>Order Queue</h1>
                <p className="text-sm" style={{ color: "#607D8B" }}>
                  {orders.length} total orders · <span style={{ color: "#E65100" }}>{orders.filter((o) => o.status === "pending").length} pending</span>
                </p>
              </div>
              {newBadge > 0 && (
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl animate-pulse" style={{ backgroundColor: "#FFF3E0" }}>
                  <Bell size={16} color="#E65100" />
                  <span className="text-sm font-semibold" style={{ color: "#E65100" }}>{newBadge} new orders!</span>
                </div>
              )}
            </div>

            {/* Status Tabs */}
            <div className="flex gap-2 mb-5 overflow-x-auto">
              {(["all", "pending", "confirmed", "shipped", "delivered", "cancelled"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setFilter(s)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all"
                  style={{
                    backgroundColor: filter === s ? "#2E7D32" : "#FFFFFF",
                    color: filter === s ? "#FFFFFF" : "#607D8B",
                    border: `1px solid ${filter === s ? "#2E7D32" : "#E8F0E8"}`,
                  }}
                >
                  {s === "all" ? "All Orders" : s.charAt(0).toUpperCase() + s.slice(1)}
                  {s !== "all" && (
                    <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-xs"
                      style={{ backgroundColor: filter === s ? "rgba(255,255,255,0.25)" : "#F0F4F0" }}>
                      {orders.filter((o) => o.status === s).length}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Orders */}
            <div className="space-y-4">
              {loading ? (
                <div className="py-20 text-center"><p style={{ color: "#90A4AE" }}>Loading orders...</p></div>
              ) : filtered.map((order) => (
                <div
                  key={order.itemId}
                  className="rounded-2xl overflow-hidden"
                  style={{
                    backgroundColor: "#FFFFFF",
                    boxShadow: "0 2px 12px rgba(46,125,50,0.07)",
                    border: order.status === "pending" ? "2px solid #FFE082" : "1px solid #E8F5E9",
                  }}
                >
                  <div className="flex items-center justify-between px-5 py-3.5" style={{ borderBottom: "1px solid #F0F4F0" }}>
                    <div className="flex items-center gap-3">
                      <p className="font-bold text-sm" style={{ color: "#263238" }}>{order.id}</p>
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold"
                        style={{ backgroundColor: STATUS_COLORS[order.status].bg, color: STATUS_COLORS[order.status].color }}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                      {order.status === "pending" && (
                        <span className="text-xs font-semibold animate-pulse" style={{ color: "#E65100" }}>⚠ Needs Action</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs" style={{ color: "#90A4AE" }}>{order.date}</span>
                      <span className="text-xs font-semibold px-2 py-1 rounded-lg" style={{ backgroundColor: "#E8F5E9", color: "#2E7D32" }}>
                        🍃 {order.co2}
                      </span>
                    </div>
                  </div>

                  <div className="px-5 py-4 flex items-center gap-5">
                    <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0">
                      <img src={order.product.image} alt={order.product.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm" style={{ color: "#263238" }}>{order.product.name}</p>
                      <p className="text-xs mt-0.5" style={{ color: "#90A4AE" }}>Qty: {order.qty} · Buyer: {order.buyer}</p>
                    </div>
                    <span className="font-bold text-lg" style={{ color: "#263238" }}>{formatPrice(order.amount)}</span>

                    {/* Status update */}
                    <div className="flex items-center gap-2">
                      {NEXT_STATUS[order.status as ItemStatus] && (
                        <button
                          onClick={() => updateStatus(order.itemId, NEXT_STATUS[order.status as ItemStatus]!)}
                          className="px-4 py-2 rounded-xl text-xs font-semibold text-white transition-all hover:opacity-90"
                          style={{ backgroundColor: "#2E7D32" }}
                        >
                          Mark as {NEXT_STATUS[order.status]}
                        </button>
                      )}
                      <div className="relative">
                        <select
                          value={order.status}
                          onChange={(e) => updateStatus(order.itemId, e.target.value as ItemStatus)}
                          className="appearance-none pl-3 pr-8 py-2 rounded-xl text-xs font-semibold outline-none cursor-pointer"
                          style={{
                            backgroundColor: STATUS_COLORS[order.status].bg,
                            color: STATUS_COLORS[order.status].color,
                            border: "none",
                          }}
                        >
                          {(["pending", "confirmed", "shipped", "delivered", "cancelled"] as ItemStatus[]).map((s) => (
                            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                          ))}
                        </select>
                        <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: STATUS_COLORS[order.status].color }} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {!loading && filtered.length === 0 && (
                <div className="py-20 text-center">
                  <ShoppingBag size={40} color="#D1E8D1" className="mx-auto mb-3" />
                  <p style={{ color: "#90A4AE" }}>No orders in this category.</p>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
