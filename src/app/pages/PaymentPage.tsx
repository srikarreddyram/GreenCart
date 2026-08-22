import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import { CreditCard, CheckCircle2, Loader2, ShieldCheck, Smartphone, Building2, Banknote } from "lucide-react";
import { toast } from "sonner";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { formatPrice } from "@/lib/currency";

type PaymentMethod = "card" | "upi" | "netbanking" | "cod";

export function PaymentPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [method, setMethod] = useState<PaymentMethod>("card");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // If no state is passed (user navigated directly), redirect to shop
  useEffect(() => {
    if (!location.state || !location.state.orderId) {
      navigate("/shop");
    }
  }, [location.state, navigate]);

  if (!location.state) return null;

  const { orderId, total, itemCount, shippingName, shippingAddress } = location.state;

  const handlePayment = () => {
    setIsProcessing(true);
    // Simulate payment processing delay
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      toast.success(method === "cod" ? "Order confirmed!" : "Payment successful! Your order has been placed.");
      
      // Redirect to orders page after short delay to show success state
      setTimeout(() => {
        navigate("/orders");
      }, 2000);
    }, 2500);
  };

  const inputStyle = {
    borderColor: "#D1E8D1",
    backgroundColor: "#FFFFFF",
    color: "#263238",
  };

  if (isSuccess) {
    return (
      <div style={{ backgroundColor: "#F5F7F5", minHeight: "100vh" }} className="flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center py-12 px-4">
          <div className="max-w-md w-full bg-white rounded-3xl p-10 text-center shadow-sm border" style={{ borderColor: "#E8F5E9" }}>
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={40} style={{ color: "#2E7D32" }} />
            </div>
            <h1 className="text-2xl font-bold mb-2" style={{ color: "#263238" }}>
              {method === "cod" ? "Order Confirmed!" : "Payment Successful!"}
            </h1>
            <p className="text-gray-500 mb-8">Thank you for your order. We are redirecting you to your orders...</p>
            <Loader2 className="w-6 h-6 animate-spin mx-auto" style={{ color: "#2E7D32" }} />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: "#F5F7F5", minHeight: "100vh" }} className="flex flex-col">
      <Navbar />
      
      <div className="flex-1 max-w-[1000px] mx-auto px-8 py-10 w-full">
        <h1 className="text-2xl font-bold mb-8 text-center" style={{ color: "#263238" }}>Select Payment Method</h1>
        
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Payment Selection & Forms */}
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              {[
                { id: "card", label: "Card", icon: CreditCard },
                { id: "upi", label: "UPI", icon: Smartphone },
                { id: "netbanking", label: "NetBanking", icon: Building2 },
                { id: "cod", label: "Cash on Delivery", icon: Banknote },
              ].map((m) => {
                const Icon = m.icon;
                const active = method === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => setMethod(m.id as PaymentMethod)}
                    className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium transition-all"
                    style={{
                      backgroundColor: active ? "#2E7D32" : "#FFFFFF",
                      color: active ? "#FFFFFF" : "#607D8B",
                      border: "1px solid",
                      borderColor: active ? "#2E7D32" : "#D1E8D1",
                    }}
                  >
                    <Icon size={18} /> {m.label}
                  </button>
                );
              })}
            </div>

            <div className="rounded-3xl p-8" style={{ backgroundColor: "#FFFFFF", boxShadow: "0 2px 16px rgba(46,125,50,0.05)" }}>
              {method === "card" && (
                <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2">
                  <h2 className="text-xl font-semibold mb-4" style={{ color: "#263238" }}>Credit / Debit Card</h2>
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: "#263238" }}>Name on Card</label>
                    <input
                      type="text"
                      placeholder="e.g. Jane Smith"
                      className="w-full px-4 py-3 rounded-xl border outline-none text-sm transition-colors"
                      style={inputStyle}
                      onFocus={(e) => (e.target.style.borderColor = "#2E7D32")}
                      onBlur={(e) => (e.target.style.borderColor = "#D1E8D1")}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: "#263238" }}>Card Number</label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="0000 0000 0000 0000"
                        maxLength={19}
                        className="w-full px-4 py-3 rounded-xl border outline-none text-sm transition-colors"
                        style={inputStyle}
                        onFocus={(e) => (e.target.style.borderColor = "#2E7D32")}
                        onBlur={(e) => (e.target.style.borderColor = "#D1E8D1")}
                      />
                      <CreditCard size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium mb-1.5" style={{ color: "#263238" }}>Expiry Date</label>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        maxLength={5}
                        className="w-full px-4 py-3 rounded-xl border outline-none text-sm transition-colors"
                        style={inputStyle}
                        onFocus={(e) => (e.target.style.borderColor = "#2E7D32")}
                        onBlur={(e) => (e.target.style.borderColor = "#D1E8D1")}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1.5" style={{ color: "#263238" }}>CVV</label>
                      <input
                        type="password"
                        placeholder="123"
                        maxLength={4}
                        className="w-full px-4 py-3 rounded-xl border outline-none text-sm transition-colors"
                        style={inputStyle}
                        onFocus={(e) => (e.target.style.borderColor = "#2E7D32")}
                        onBlur={(e) => (e.target.style.borderColor = "#D1E8D1")}
                      />
                    </div>
                  </div>
                </div>
              )}

              {method === "upi" && (
                <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2">
                  <h2 className="text-xl font-semibold mb-4" style={{ color: "#263238" }}>UPI Payment</h2>
                  <p className="text-sm" style={{ color: "#607D8B" }}>Enter your UPI ID to receive a payment request, or scan a QR code.</p>
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: "#263238" }}>UPI ID (VPA)</label>
                    <input
                      type="text"
                      placeholder="username@bank"
                      className="w-full px-4 py-3 rounded-xl border outline-none text-sm transition-colors"
                      style={inputStyle}
                      onFocus={(e) => (e.target.style.borderColor = "#2E7D32")}
                      onBlur={(e) => (e.target.style.borderColor = "#D1E8D1")}
                    />
                  </div>
                </div>
              )}

              {method === "netbanking" && (
                <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2">
                  <h2 className="text-xl font-semibold mb-4" style={{ color: "#263238" }}>Net Banking</h2>
                  <p className="text-sm" style={{ color: "#607D8B" }}>Select your bank from the list below.</p>
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    {["SBI", "HDFC Bank", "ICICI Bank", "Axis Bank", "Kotak", "Other Banks"].map(bank => (
                      <label key={bank} className="flex items-center gap-3 p-3 rounded-xl border cursor-pointer hover:bg-gray-50 transition-colors" style={{ borderColor: "#D1E8D1" }}>
                        <input type="radio" name="bank" className="text-green-600" style={{ accentColor: "#2E7D32" }} />
                        <span className="text-sm" style={{ color: "#263238" }}>{bank}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {method === "cod" && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 text-center py-6">
                  <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-2 text-blue-600">
                    <Banknote size={28} />
                  </div>
                  <h2 className="text-xl font-semibold" style={{ color: "#263238" }}>Cash on Delivery</h2>
                  <p className="text-sm px-4" style={{ color: "#607D8B", lineHeight: "1.6" }}>
                    You can pay in cash or via UPI when your order is delivered to your doorstep.
                  </p>
                </div>
              )}
              
              <button
                onClick={handlePayment}
                disabled={isProcessing}
                className="w-full py-4 mt-8 rounded-xl font-bold text-white text-base transition-all hover:opacity-90 active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-60"
                style={{ backgroundColor: "#2E7D32" }}
              >
                {isProcessing ? (
                  <><Loader2 size={18} className="animate-spin" /> Processing...</>
                ) : (
                  method === "cod" ? "Place Order" : `Pay ${formatPrice(total)}`
                )}
              </button>
              
              <div className="flex items-center justify-center gap-2 mt-4 text-xs" style={{ color: "#607D8B" }}>
                <ShieldCheck size={14} /> Payments are secure and encrypted
              </div>
            </div>
          </div>
          
          {/* Order Summary Sidebar */}
          <div className="w-full md:w-[320px] shrink-0">
            <div className="bg-white rounded-3xl p-6 border shadow-sm sticky top-24" style={{ borderColor: "#E8F5E9" }}>
              <h3 className="font-bold text-lg mb-4" style={{ color: "#263238" }}>Summary</h3>
              
              <div className="space-y-4 text-sm mb-6 pb-6 border-b border-gray-100">
                <div className="flex justify-between">
                  <span className="text-gray-500">Order ID</span>
                  <span className="font-medium">{String(orderId).slice(0, 8).toUpperCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Items</span>
                  <span className="font-medium">{itemCount} items</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Total Due</span>
                  <span className="font-bold" style={{ color: "#2E7D32" }}>{formatPrice(total)}</span>
                </div>
              </div>
              
              <h4 className="font-semibold text-sm mb-2" style={{ color: "#263238" }}>Shipping to:</h4>
              <p className="text-sm text-gray-600 mb-1">{shippingName}</p>
              <p className="text-sm text-gray-500 leading-relaxed">{shippingAddress}</p>
            </div>
          </div>
          
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
