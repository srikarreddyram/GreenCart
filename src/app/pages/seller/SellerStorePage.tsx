import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { Store, Package, ShoppingBag, Settings, Leaf, Upload, Save } from "lucide-react";
import { toast } from "sonner";
import { useSellerData, useSellerStore } from "@/hooks/useSellerData";

function SellerSidebar({ active }: { active: string }) {
  const navigate = useNavigate();
  const links = [
    { icon: Package, label: "Dashboard", path: "/seller/dashboard" },
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

export function SellerStorePage() {
  const { storeId } = useSellerData();
  const { store, updateStore, loading } = useSellerStore(storeId);
  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
  });

  useEffect(() => {
    if (store) {
      setForm({
        name: store.name || "",
        slug: store.slug || "",
        description: store.description || "",
      });
    }
  }, [store]);

  const handleSave = async () => {
    const err = await updateStore(form);
    if (!err) {
      toast.success("Store settings saved successfully! 🌿");
    } else {
      toast.error("Failed to save changes.");
    }
  };

  return (
    <div style={{ backgroundColor: "#F5F7F5", minHeight: "100vh" }}>
      <div style={{ backgroundColor: "#FFFFFF", borderBottom: "1px solid #E8F0E8" }} className="px-8 py-4 sticky top-0 z-40">
        <div className="max-w-[1440px] mx-auto flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#2E7D32" }}>
            <Leaf size={16} color="#FFFFFF" />
          </div>
          <span className="font-bold" style={{ color: "#2E7D32" }}>GreenCart</span>
          <span className="text-sm" style={{ color: "#90A4AE" }}>/ Store Settings</span>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-8 py-8">
        <div className="flex gap-6">
          <SellerSidebar active="/seller/store" />

          <main className="flex-1">
            <h1 className="text-2xl font-bold mb-6" style={{ color: "#263238" }}>Store Settings</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Store Info */}
              <div className="lg:col-span-2 space-y-4">
                <div className="rounded-2xl p-6" style={{ backgroundColor: "#FFFFFF", boxShadow: "0 2px 12px rgba(46,125,50,0.07)" }}>
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#E8F5E9" }}>
                      <Store size={18} color="#2E7D32" />
                    </div>
                    <h2 className="font-bold" style={{ color: "#263238" }}>Store Details</h2>
                  </div>

                  <div className="space-y-4">
                    {[
                      { label: "Store Name", key: "name", placeholder: "Your store name" },
                      { label: "URL Slug", key: "slug", placeholder: "your-store" },
                    ].map((f) => (
                      <div key={f.key}>
                        <label className="block text-sm font-medium mb-1.5" style={{ color: "#263238" }}>{f.label}</label>
                        <input
                          type="text"
                          value={form[f.key as keyof typeof form]}
                          onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                          placeholder={f.placeholder}
                          className="w-full px-4 py-2.5 rounded-xl border outline-none text-sm transition-all"
                          style={{ borderColor: "#D1E8D1", color: "#263238" }}
                          onFocus={(e) => (e.target.style.borderColor = "#2E7D32")}
                          onBlur={(e) => (e.target.style.borderColor = "#D1E8D1")}
                        />
                      </div>
                    ))}

                    <div>
                      <label className="block text-sm font-medium mb-1.5" style={{ color: "#263238" }}>Store Description</label>
                      <textarea
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                        rows={4}
                        className="w-full px-4 py-2.5 rounded-xl border outline-none text-sm resize-none transition-all"
                        style={{ borderColor: "#D1E8D1", color: "#263238" }}
                        onFocus={(e) => (e.target.style.borderColor = "#2E7D32")}
                        onBlur={(e) => (e.target.style.borderColor = "#D1E8D1")}
                      />
                    </div>
                  </div>
                </div>

                {/* Media */}
                <div className="rounded-2xl p-6" style={{ backgroundColor: "#FFFFFF", boxShadow: "0 2px 12px rgba(46,125,50,0.07)" }}>
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#E8F5E9" }}>
                      <Upload size={18} color="#2E7D32" />
                    </div>
                    <h2 className="font-bold" style={{ color: "#263238" }}>Store Media</h2>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: "#263238" }}>Store Logo</label>
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl" style={{ backgroundColor: "#E8F5E9" }}>🌿</div>
                        <div className="border-2 border-dashed rounded-xl p-4 flex-1 flex items-center gap-3 cursor-pointer" style={{ borderColor: "#D1E8D1" }}>
                          <Upload size={18} color="#90A4AE" />
                          <div>
                            <p className="text-sm font-medium" style={{ color: "#263238" }}>Upload new logo</p>
                            <p className="text-xs" style={{ color: "#90A4AE" }}>PNG, JPEG · 200×200px recommended · Max 5MB</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: "#263238" }}>Store Banner</label>
                      <div
                        className="border-2 border-dashed rounded-xl p-8 flex flex-col items-center gap-2 cursor-pointer"
                        style={{ borderColor: "#D1E8D1", backgroundColor: "#F5F7F5" }}
                      >
                        <Upload size={24} color="#D1E8D1" />
                        <p className="text-sm font-medium" style={{ color: "#263238" }}>Upload banner image</p>
                        <p className="text-xs" style={{ color: "#90A4AE" }}>1440×300px recommended · Max 5MB</p>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all hover:opacity-90"
                  style={{ backgroundColor: "#2E7D32" }}
                >
                  <Save size={16} />
                  Save Changes
                </button>
              </div>

              {/* Preview */}
              <div>
                <div className="rounded-2xl overflow-hidden sticky top-24" style={{ backgroundColor: "#FFFFFF", boxShadow: "0 2px 12px rgba(46,125,50,0.07)" }}>
                  <div className="h-24 flex items-center justify-center" style={{ background: "linear-gradient(135deg, #2E7D32, #66BB6A)" }}>
                    <span className="text-4xl">🌿</span>
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold mb-1" style={{ color: "#263238" }}>{form.name || "Your Store Name"}</h3>
                    <p className="text-xs mb-3" style={{ color: "#90A4AE" }}>greencart.eco/store/{form.slug || "your-store"}</p>
                    <p className="text-sm line-clamp-3" style={{ color: "#607D8B" }}>{form.description || "Store description..."}</p>
                    <div className="flex gap-2 mt-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: "#E8F5E9", color: "#2E7D32" }}>✓ Active</span>
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: "#E8F5E9", color: "#2E7D32" }}>🌿 Eco Certified</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
