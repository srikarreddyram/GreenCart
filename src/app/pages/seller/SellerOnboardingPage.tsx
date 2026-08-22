import { useState } from "react";
import { useNavigate } from "react-router";
import { Leaf, Store, Upload, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

const STEPS = ["Store Details", "Media & Branding", "Complete"];

export function SellerOnboardingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ name: "", slug: "", description: "" });

  const handleNext = () => {
    if (step === 0 && (!form.name || !form.slug)) {
      toast.error("Please fill in store name and URL slug.");
      return;
    }
    if (step < STEPS.length - 1) setStep((s) => s + 1);
    else {
      toast.success("🎉 Your store is live! Start listing products.");
      navigate("/seller/dashboard");
    }
  };

  const autoSlug = (name: string) =>
    name.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "");

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F5F7F5" }}>
      {/* Header */}
      <div className="px-8 py-5" style={{ backgroundColor: "#FFFFFF", borderBottom: "1px solid #E8F0E8" }}>
        <div className="flex items-center gap-2 max-w-[900px] mx-auto">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#2E7D32" }}>
            <Leaf size={17} color="#FFFFFF" />
          </div>
          <span className="text-xl font-bold" style={{ color: "#2E7D32" }}>GreenCart</span>
          <span className="ml-2 text-sm" style={{ color: "#90A4AE" }}>Seller Onboarding</span>
        </div>
      </div>

      <div className="max-w-[900px] mx-auto px-8 py-12">
        {/* Progress */}
        <div className="flex items-center gap-4 mb-12">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-3 flex-1">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                style={{
                  backgroundColor: i <= step ? "#2E7D32" : "#E8F0E8",
                  color: i <= step ? "#FFFFFF" : "#90A4AE",
                }}
              >
                {i < step ? <CheckCircle2 size={16} /> : i + 1}
              </div>
              <span className="text-sm font-medium" style={{ color: i <= step ? "#2E7D32" : "#90A4AE" }}>{s}</span>
              {i < STEPS.length - 1 && <div className="flex-1 h-px" style={{ backgroundColor: i < step ? "#2E7D32" : "#E8F0E8" }} />}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            {step === 0 && (
              <div className="rounded-2xl p-8" style={{ backgroundColor: "#FFFFFF", boxShadow: "0 2px 16px rgba(46,125,50,0.08)" }}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#E8F5E9" }}>
                    <Store size={20} color="#2E7D32" />
                  </div>
                  <h2 className="text-xl font-bold" style={{ color: "#263238" }}>Store Details</h2>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: "#263238" }}>Store Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. EcoNest Store"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value, slug: autoSlug(e.target.value) })}
                      className="w-full px-4 py-3 rounded-xl border outline-none transition-all"
                      style={{ borderColor: "#D1E8D1", backgroundColor: "#FFFFFF", color: "#263238" }}
                      onFocus={(e) => (e.target.style.borderColor = "#2E7D32")}
                      onBlur={(e) => (e.target.style.borderColor = "#D1E8D1")}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: "#263238" }}>Store URL Slug *</label>
                    <div className="flex items-center rounded-xl border overflow-hidden" style={{ borderColor: "#D1E8D1" }}>
                      <span className="px-3 py-3 text-sm border-r" style={{ borderColor: "#D1E8D1", backgroundColor: "#F5F7F5", color: "#90A4AE" }}>
                        greencart.eco/store/
                      </span>
                      <input
                        type="text"
                        value={form.slug}
                        onChange={(e) => setForm({ ...form, slug: autoSlug(e.target.value) })}
                        className="flex-1 px-3 py-3 outline-none text-sm"
                        style={{ color: "#263238" }}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: "#263238" }}>Store Description</label>
                    <textarea
                      placeholder="Tell customers what makes your store unique and sustainable..."
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-3 rounded-xl border outline-none transition-all resize-none"
                      style={{ borderColor: "#D1E8D1", backgroundColor: "#FFFFFF", color: "#263238" }}
                      onFocus={(e) => (e.target.style.borderColor = "#2E7D32")}
                      onBlur={(e) => (e.target.style.borderColor = "#D1E8D1")}
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="rounded-2xl p-8" style={{ backgroundColor: "#FFFFFF", boxShadow: "0 2px 16px rgba(46,125,50,0.08)" }}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#E8F5E9" }}>
                    <Upload size={20} color="#2E7D32" />
                  </div>
                  <h2 className="text-xl font-bold" style={{ color: "#263238" }}>Media & Branding</h2>
                </div>

                <div className="space-y-6">
                  {[
                    { label: "Store Logo", hint: "Recommended: 200×200px", icon: "🏪" },
                    { label: "Store Banner", hint: "Recommended: 1440×300px", icon: "🖼️" },
                  ].map((item) => (
                    <div key={item.label}>
                      <label className="block text-sm font-medium mb-2" style={{ color: "#263238" }}>{item.label}</label>
                      <div
                        className="border-2 border-dashed rounded-2xl p-8 flex flex-col items-center gap-3 cursor-pointer transition-all hover:border-green-400"
                        style={{ borderColor: "#D1E8D1", backgroundColor: "#F5F7F5" }}
                      >
                        <span className="text-3xl">{item.icon}</span>
                        <div className="text-center">
                          <p className="font-medium text-sm" style={{ color: "#263238" }}>Drop image here or click to upload</p>
                          <p className="text-xs" style={{ color: "#90A4AE" }}>{item.hint} · JPEG, PNG, WebP · Max 5MB</p>
                        </div>
                        <button className="px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:opacity-90" style={{ backgroundColor: "#2E7D32", color: "#FFFFFF" }}>
                          Choose File
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="rounded-2xl p-10 text-center" style={{ backgroundColor: "#FFFFFF", boxShadow: "0 2px 16px rgba(46,125,50,0.08)" }}>
                <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: "#E8F5E9" }}>
                  <CheckCircle2 size={36} color="#2E7D32" />
                </div>
                <h2 className="text-2xl font-bold mb-3" style={{ color: "#263238" }}>You're all set!</h2>
                <p className="mb-8" style={{ color: "#607D8B" }}>
                  Your store <strong style={{ color: "#2E7D32" }}>{form.name || "GreenStore"}</strong> is ready. Start listing your eco-friendly products.
                </p>
                <div className="grid grid-cols-3 gap-4 mb-8">
                  {["Add Products", "Set Prices", "Go Live"].map((s, i) => (
                    <div key={s} className="p-4 rounded-xl" style={{ backgroundColor: "#F5F7F5" }}>
                      <p className="text-2xl mb-1">{["📦", "💰", "🚀"][i]}</p>
                      <p className="text-sm font-medium" style={{ color: "#263238" }}>{s}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between mt-6">
              {step > 0 ? (
                <button onClick={() => setStep((s) => s - 1)} className="px-6 py-3 rounded-xl text-sm font-semibold transition-all" style={{ backgroundColor: "#F5F7F5", color: "#607D8B" }}>
                  ← Back
                </button>
              ) : <div />}
              <button onClick={handleNext} className="px-8 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90" style={{ backgroundColor: "#2E7D32" }}>
                {step === STEPS.length - 1 ? "Go to Dashboard →" : "Next Step →"}
              </button>
            </div>
          </div>

          {/* Right sidebar */}
          <div className="space-y-4">
            <div className="rounded-2xl p-5" style={{ backgroundColor: "#2E7D32" }}>
              <h3 className="font-bold text-white mb-3">Seller Benefits</h3>
              <div className="space-y-2.5">
                {["Zero listing fees", "Real-time order alerts", "Revenue analytics dashboard", "Carbon footprint tracking"].map((b) => (
                  <div key={b} className="flex items-center gap-2">
                    <CheckCircle2 size={14} color="#A5D6A7" />
                    <span className="text-xs text-white/80">{b}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-2xl p-5" style={{ backgroundColor: "#FFFFFF", boxShadow: "0 2px 12px rgba(46,125,50,0.07)" }}>
              <h3 className="font-semibold mb-2" style={{ color: "#263238" }}>Need help?</h3>
              <p className="text-sm" style={{ color: "#90A4AE" }}>Our seller support team is available 24/7 to help you get started.</p>
              <button className="mt-3 text-sm font-semibold" style={{ color: "#2E7D32" }}>Contact Support →</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
