import { Link } from "react-router";
import { ArrowLeft, Package, CheckCircle2, Truck, ShoppingBag } from "lucide-react";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { useOrders } from "@/hooks/useOrders";
import { formatPrice } from "@/lib/currency";

type OrderStatus = "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  pending:   { label: "Pending",   color: "#F57F17", bg: "#FFF8E1",  icon: <Package size={14} /> },
  confirmed: { label: "Confirmed", color: "#1565C0", bg: "#E3F2FD",  icon: <CheckCircle2 size={14} /> },
  shipped:   { label: "Shipped",   color: "#6A1B9A", bg: "#F3E5F5",  icon: <Truck size={14} /> },
  delivered: { label: "Delivered", color: "#2E7D32", bg: "#E8F5E9",  icon: <CheckCircle2 size={14} /> },
  cancelled: { label: "Cancelled", color: "#C62828", bg: "#FFEBEE",  icon: <Package size={14} /> },
};

const STATUS_STEPS: OrderStatus[] = ["pending", "confirmed", "shipped", "delivered"];

export function OrdersPage() {
  const { orders, loading, error } = useOrders();

  return (
    <div style={{ backgroundColor: "#F5F7F5" }}>
      <Navbar />

      <div className="max-w-[1440px] mx-auto px-8 py-10">
        <div className="flex items-center gap-3 mb-8">
          <Link to="/home" className="flex items-center gap-2 no-underline text-sm font-medium" style={{ color: "#2E7D32" }}>
            <ArrowLeft size={16} /> Home
          </Link>
          <span style={{ color: "#90A4AE" }}>/</span>
          <h1 className="text-2xl font-bold" style={{ color: "#263238" }}>My Orders</h1>
        </div>

        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-2xl p-6 animate-pulse" style={{ backgroundColor: "#FFFFFF", boxShadow: "0 2px 12px rgba(46,125,50,0.07)" }}>
                <div className="flex justify-between mb-4">
                  <div className="h-4 rounded w-32" style={{ backgroundColor: "#E8F5E9" }} />
                  <div className="h-4 rounded w-20" style={{ backgroundColor: "#E8F5E9" }} />
                </div>
                <div className="h-3 rounded w-48 mb-6" style={{ backgroundColor: "#E8F5E9" }} />
                <div className="flex gap-4">
                  <div className="w-16 h-16 rounded-xl" style={{ backgroundColor: "#E8F5E9" }} />
                  <div className="w-16 h-16 rounded-xl" style={{ backgroundColor: "#E8F5E9" }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="rounded-2xl p-6 text-sm" style={{ backgroundColor: "#FFEBEE", color: "#C62828" }}>
            ⚠️ Failed to load orders: {error}
          </div>
        )}

        {!loading && !error && orders.length === 0 && (
          <div className="rounded-2xl p-16 text-center" style={{ backgroundColor: "#FFFFFF", boxShadow: "0 2px 12px rgba(46,125,50,0.07)" }}>
            <ShoppingBag size={56} color="#D1E8D1" className="mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2" style={{ color: "#263238" }}>No orders yet</h2>
            <p className="mb-6" style={{ color: "#90A4AE" }}>Start shopping to make your first eco-friendly order.</p>
            <Link to="/shop" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white no-underline" style={{ backgroundColor: "#2E7D32" }}>
              Explore Products
            </Link>
          </div>
        )}

        {!loading && orders.length > 0 && (
          <div className="space-y-6">
            {orders.map((order) => {
              const status = order.status as OrderStatus;
              const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;
              const stepIdx = STATUS_STEPS.indexOf(status);

              return (
                <div key={order.id} className="rounded-2xl overflow-hidden" style={{ backgroundColor: "#FFFFFF", boxShadow: "0 2px 16px rgba(46,125,50,0.08)" }}>
                  {/* Header */}
                  <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid #F0F4F0" }}>
                    <div>
                      <p className="text-xs font-medium mb-1" style={{ color: "#90A4AE" }}>ORDER #{order.id.slice(0, 8).toUpperCase()}</p>
                      <p className="text-sm" style={{ color: "#607D8B" }}>
                        Placed on {new Date(order.createdAt).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold" style={{ color: "#263238" }}>{formatPrice(order.totalAmount)}</span>
                      <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold" style={{ backgroundColor: cfg.bg, color: cfg.color }}>
                        {cfg.icon} {cfg.label}
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {status !== "cancelled" && (
                    <div className="px-6 py-4" style={{ backgroundColor: "#FAFAFA", borderBottom: "1px solid #F0F4F0" }}>
                      <div className="flex items-center justify-between relative">
                        <div className="absolute left-0 right-0 top-3 h-0.5 -z-0" style={{ backgroundColor: "#E8F0E8" }}>
                          <div
                            className="h-full transition-all duration-500"
                            style={{
                              width: stepIdx >= 0 ? `${(stepIdx / (STATUS_STEPS.length - 1)) * 100}%` : "0%",
                              backgroundColor: "#2E7D32",
                            }}
                          />
                        </div>
                        {STATUS_STEPS.map((s, i) => {
                          const done = i <= stepIdx;
                          return (
                            <div key={s} className="flex flex-col items-center gap-1 relative z-10">
                              <div
                                className="w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs"
                                style={{
                                  backgroundColor: done ? "#2E7D32" : "#FFFFFF",
                                  borderColor: done ? "#2E7D32" : "#D1E8D1",
                                  color: done ? "#FFFFFF" : "#90A4AE",
                                }}
                              >
                                {done ? "✓" : i + 1}
                              </div>
                              <span className="text-xs capitalize" style={{ color: done ? "#2E7D32" : "#90A4AE" }}>
                                {STATUS_CONFIG[s].label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Items */}
                  <div className="px-6 py-5">
                    <div className="flex gap-3 flex-wrap">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex items-center gap-3 rounded-xl p-3" style={{ backgroundColor: "#F5F7F5" }}>
                          <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                            {item.image ? (
                              <ImageWithFallback src={item.image} alt={item.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: "#E8F5E9" }}>
                                <Package size={20} color="#A5D6A7" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium" style={{ color: "#263238" }}>{item.name}</p>
                            <p className="text-xs" style={{ color: "#90A4AE" }}>×{item.quantity} · {formatPrice(item.unitPrice * item.quantity)}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {order.shippingName && (
                      <p className="text-xs mt-4" style={{ color: "#90A4AE" }}>
                        Shipping to: <strong style={{ color: "#607D8B" }}>{order.shippingName}</strong>
                        {order.shippingAddress?.city ? `, ${order.shippingAddress.city}` : ""}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
