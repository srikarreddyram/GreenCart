import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { ArrowLeft, Minus, Plus, Trash2, ShoppingBag, Leaf, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { useCartContext } from "@/contexts/CartContext";
import { useAuthContext } from "@/contexts/AuthContext";
import { placeOrder } from "@/hooks/useOrders";
import { formatPrice } from "@/lib/currency";

const DELIVERY_OPTIONS = [
  { id: "standard", fee: 0, name: "Standard", sub: "5–7 business days" },
  { id: "carbon_neutral", fee: 49, name: "🌿 Carbon Neutral", sub: "5–7 days · 100% offset" },
  { id: "express", fee: 99, name: "Express", sub: "1–2 business days" },
] as const;

type DeliveryId = (typeof DELIVERY_OPTIONS)[number]["id"];

export function CheckoutPage() {
  const navigate = useNavigate();
  const { items, subtotal, removeItem, updateQuantity, clearCart } = useCartContext();
  const { user, profile } = useAuthContext();
  const [isPlacing, setIsPlacing] = useState(false);
  const [delivery, setDelivery] = useState<DeliveryId>("standard");
  const [form, setForm] = useState({
    name: profile?.display_name ?? "",
    email: user?.email ?? "",
    address: "",
    city: "",
    state: "",
    postal: "",
    country: "India",
  });

  // Re-sync name/email when profile/user loads asynchronously
  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      name: prev.name || profile?.display_name || "",
      email: prev.email || user?.email || "",
    }));
  }, [profile?.display_name, user?.email]);

  const deliveryFee = DELIVERY_OPTIONS.find((o) => o.id === delivery)!.fee;
  const total = subtotal + deliveryFee;
  const carbonSaved = items.reduce((s, i) => s + i.quantity * 0.2, 0);

  const handlePlaceOrder = async () => {
    if (items.length === 0) { toast.error("Your cart is empty."); return; }
    if (!form.name || !form.address || !form.city || !form.postal) {
      toast.error("Please fill in all required shipping fields.");
      return;
    }
    if (!user) { toast.error("Please sign in to place an order."); return; }

    setIsPlacing(true);
    try {
      const order = await placeOrder({
        buyerId: user.id,
        items: items.map((i) => ({
          productId: i.product.id,
          storeId: i.product.storeId,
          quantity: i.quantity,
          unitPrice: i.product.price,
        })),
        totalAmount: total,
        shippingName: form.name,
        shippingAddress: {
          line1: form.address,
          city: form.city,
          state: form.state,
          postal_code: form.postal,
          country: form.country,
        },
      });

      clearCart();
      navigate("/payment", {
        state: {
          orderId: order.id,
          total,
          itemCount: items.length,
          deliveryMethod: delivery,
          shippingName: form.name,
          shippingAddress: `${form.address}, ${form.city}, ${form.state} ${form.postal}`,
        },
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong.";
      toast.error(`Failed to place order: ${msg}`);
    } finally {
      setIsPlacing(false);
    }
  };

  const inputStyle = {
    borderColor: "#D1E8D1", backgroundColor: "#FFFFFF", color: "#263238",
  };

  return (
    <div style={{ backgroundColor: "#F5F7F5" }}>
      <Navbar />

      <div className="max-w-[1440px] mx-auto px-8 py-10">
        <div className="flex items-center gap-3 mb-8">
          <Link to="/shop" className="flex items-center gap-2 no-underline text-sm font-medium" style={{ color: "#2E7D32" }}>
            <ArrowLeft size={16} /> Continue Shopping
          </Link>
          <span style={{ color: "#90A4AE" }}>/</span>
          <h1 className="text-2xl font-bold" style={{ color: "#263238" }}>Checkout</h1>
        </div>

        {items.length === 0 ? (
          <div className="rounded-2xl p-16 text-center" style={{ backgroundColor: "#FFFFFF", boxShadow: "0 2px 12px rgba(46,125,50,0.07)" }}>
            <ShoppingBag size={56} color="#D1E8D1" className="mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2" style={{ color: "#263238" }}>Your cart is empty</h2>
            <p className="mb-6" style={{ color: "#90A4AE" }}>Add some eco-friendly products to get started.</p>
            <Link to="/shop" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white no-underline" style={{ backgroundColor: "#2E7D32" }}>
              <Leaf size={16} /> Start Shopping
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left */}
            <div className="flex-1 space-y-6">
              {/* Cart Items */}
              <div className="rounded-2xl p-6" style={{ backgroundColor: "#FFFFFF", boxShadow: "0 2px 12px rgba(46,125,50,0.07)" }}>
                <h2 className="font-bold text-lg mb-5" style={{ color: "#263238" }}>Cart Items ({items.length})</h2>
                <div className="space-y-5">
                  {items.map(({ product, quantity }) => (
                    <div key={product.id} className="flex gap-4 pb-5 border-b last:border-0 last:pb-0" style={{ borderColor: "#F0F4F0" }}>
                      <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                        <ImageWithFallback src={product.image} alt={product.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-sm" style={{ color: "#263238" }}>{product.name}</p>
                        <p className="text-xs mt-0.5" style={{ color: "#90A4AE" }}>{product.badge}</p>
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center rounded-lg border overflow-hidden" style={{ borderColor: "#D1E8D1" }}>
                            <button onClick={() => updateQuantity(product.id, quantity - 1)} className="px-2.5 py-1.5 transition-colors hover:bg-gray-50">
                              <Minus size={13} color="#607D8B" />
                            </button>
                            <span className="px-3 py-1.5 text-sm font-semibold border-x" style={{ color: "#263238", borderColor: "#D1E8D1" }}>{quantity}</span>
                            <button onClick={() => updateQuantity(product.id, quantity + 1)} className="px-2.5 py-1.5 transition-colors hover:bg-gray-50">
                              <Plus size={13} color="#607D8B" />
                            </button>
                          </div>
                          <div className="flex items-center gap-3">
                            <p className="font-bold" style={{ color: "#263238" }}>{formatPrice(product.price * quantity)}</p>
                            <button onClick={() => removeItem(product.id)} className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-red-50" style={{ color: "#EF5350" }}>
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipping Form */}
              <div className="rounded-2xl p-6" style={{ backgroundColor: "#FFFFFF", boxShadow: "0 2px 12px rgba(46,125,50,0.07)" }}>
                <h2 className="font-bold text-lg mb-5" style={{ color: "#263238" }}>Shipping Information</h2>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: "Full Name *", key: "name", placeholder: "Jane Smith", colSpan: true },
                    { label: "Email *", key: "email", placeholder: "jane@example.com", colSpan: true },
                    { label: "Street Address *", key: "address", placeholder: "123 Green Lane", colSpan: true },
                    { label: "City *", key: "city", placeholder: "Mumbai" },
                    { label: "State", key: "state", placeholder: "Maharashtra" },
                    { label: "ZIP / Postal Code *", key: "postal", placeholder: "400001" },
                    { label: "Country", key: "country", placeholder: "India" },
                  ].map((f) => (
                    <div key={f.key} className={f.colSpan ? "col-span-2" : ""}>
                      <label className="block text-xs font-medium mb-1.5" style={{ color: "#263238" }}>{f.label}</label>
                      <input
                        type="text"
                        value={form[f.key as keyof typeof form]}
                        onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                        placeholder={f.placeholder}
                        className="w-full px-3 py-2.5 rounded-xl border outline-none text-sm"
                        style={inputStyle}
                        onFocus={(e) => (e.target.style.borderColor = "#2E7D32")}
                        onBlur={(e) => (e.target.style.borderColor = "#D1E8D1")}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery */}
              <div className="rounded-2xl p-6" style={{ backgroundColor: "#FFFFFF", boxShadow: "0 2px 12px rgba(46,125,50,0.07)" }}>
                <h2 className="font-bold text-lg mb-5" style={{ color: "#263238" }}>Delivery Method</h2>
                <div className="space-y-3">
                  {DELIVERY_OPTIONS.map((opt) => (
                    <label key={opt.id} className="flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all" style={{ borderColor: delivery === opt.id ? "#2E7D32" : "#E8F0E8", backgroundColor: delivery === opt.id ? "#F0FAF0" : "#FFFFFF" }}>
                      <input type="radio" name="delivery" value={opt.id} checked={delivery === opt.id} onChange={() => setDelivery(opt.id)} style={{ accentColor: "#2E7D32" }} />
                      <div className="flex-1">
                        <p className="text-sm font-semibold" style={{ color: "#263238" }}>
                          {opt.name} {opt.fee === 0 ? "(Free)" : `(+${formatPrice(opt.fee)})`}
                        </p>
                        <p className="text-xs" style={{ color: "#90A4AE" }}>{opt.sub}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Right — Order Summary */}
            <div className="lg:w-[380px]">
              <div className="rounded-2xl p-6 sticky top-24" style={{ backgroundColor: "#FFFFFF", boxShadow: "0 2px 16px rgba(46,125,50,0.10)" }}>
                <h2 className="font-bold text-lg mb-5" style={{ color: "#263238" }}>Order Summary</h2>

                <div className="space-y-3 mb-5">
                  {[
                    { label: `Subtotal (${items.length} items)`, val: formatPrice(subtotal) },
                    { label: "Delivery", val: deliveryFee === 0 ? "Free" : formatPrice(deliveryFee) },
                    { label: "Eco Packaging", val: "Free" },
                  ].map((row) => (
                    <div key={row.label} className="flex items-center justify-between text-sm">
                      <span style={{ color: "#607D8B" }}>{row.label}</span>
                      <span style={{ color: "#263238" }}>{row.val}</span>
                    </div>
                  ))}
                </div>

                <div className="h-px mb-5" style={{ backgroundColor: "#E8F0E8" }} />
                <div className="flex items-center justify-between font-bold text-lg mb-2">
                  <span style={{ color: "#263238" }}>Total</span>
                  <span style={{ color: "#263238" }}>{formatPrice(total)}</span>
                </div>

                {carbonSaved > 0 && (
                  <div className="rounded-xl px-4 py-3 mb-5 text-sm" style={{ backgroundColor: "#E8F5E9" }}>
                    <p className="font-semibold" style={{ color: "#2E7D32" }}>
                      🌍 You're saving ~{carbonSaved.toFixed(1)} kg CO₂
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: "#66BB6A" }}>vs. non-eco equivalent products</p>
                  </div>
                )}

                <button
                  onClick={handlePlaceOrder}
                  disabled={isPlacing}
                  className="w-full py-4 rounded-xl font-bold text-white text-base transition-all hover:opacity-90 active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-60"
                  style={{ backgroundColor: "#2E7D32" }}
                >
                  {isPlacing ? <><Loader2 size={18} className="animate-spin" /> Placing Order…</> : "Place Order 🌿"}
                </button>

                <p className="text-xs text-center mt-3" style={{ color: "#90A4AE" }}>
                  Secure checkout · 30-day returns
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
