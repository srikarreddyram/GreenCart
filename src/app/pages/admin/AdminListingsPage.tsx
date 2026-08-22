import { useState } from "react";
import { useNavigate } from "react-router";
import { Users, Package, BarChart2, FolderTree, CheckCircle2, XCircle, Clock, Leaf, Search, Shield } from "lucide-react";
import { toast } from "sonner";
import { useProducts, updateProductStatus } from "@/hooks/useProducts";
import { formatPrice } from "@/lib/currency";

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

export function AdminListingsPage() {
  const { products: listings, loading, setProducts: setListings } = useProducts({ adminMode: true });
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | "all">("all");
  const [rejectReason, setRejectReason] = useState<Record<string, string>>({});
  const [showRejectModal, setShowRejectModal] = useState<string | null>(null);

  const filtered = listings.filter((l) => {
    const matchSearch = !search || l.name.toLowerCase().includes(search.toLowerCase()) || (l.storeName || "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || l.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const approve = async (id: string) => {
    try {
      await updateProductStatus([id], "active");
      setListings((prev) => prev.map((l) => (l.id === id ? { ...l, status: "active" } : l)));
      toast.success("Product listing approved! 🌿");
    } catch (e: any) {
      toast.error("Failed to approve product");
    }
  };

  const reject = async (id: string) => {
    try {
      await updateProductStatus([id], "archived");
      setListings((prev) => prev.map((l) => (l.id === id ? { ...l, status: "archived" } : l)));
      toast.error(`Product rejected. Reason: "${rejectReason[id] || "Policy violation"}"`);
      setShowRejectModal(null);
    } catch(e: any) {
      toast.error("Failed to reject product");
    }
  };

  const STATUS_STYLES: Record<string, { bg: string; color: string; icon: React.ReactNode }> = {
    draft: { bg: "#FFF8E1", color: "#F57F17", icon: <Clock size={14} /> },
    active: { bg: "#E8F5E9", color: "#2E7D32", icon: <CheckCircle2 size={14} /> },
    archived: { bg: "#FFEBEE", color: "#C62828", icon: <XCircle size={14} /> },
    out_of_stock: { bg: "#FFF3E0", color: "#E65100", icon: <Clock size={14} /> },
  };

  const pendingCount = listings.filter((l) => l.status === "draft").length;

  return (
    <div style={{ backgroundColor: "#F5F7F5", minHeight: "100vh" }}>
      <div style={{ backgroundColor: "#FFFFFF", borderBottom: "1px solid #E8F0E8" }} className="px-8 py-4 sticky top-0 z-40">
        <div className="max-w-[1440px] mx-auto flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#6A1B9A" }}>
            <Leaf size={16} color="#FFFFFF" />
          </div>
          <span className="font-bold" style={{ color: "#2E7D32" }}>GreenCart</span>
          <span className="text-sm" style={{ color: "#90A4AE" }}>/ Admin / Listing Moderation</span>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-8 py-8">
        <div className="flex gap-6">
          <AdminSidebar active="/admin/listings" />

          <main className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold" style={{ color: "#263238" }}>Listing Moderation</h1>
                <p className="text-sm" style={{ color: "#607D8B" }}>{pendingCount} listings pending review</p>
              </div>
              {pendingCount > 0 && (
                <div className="px-4 py-2 rounded-xl" style={{ backgroundColor: "#FFF8E1" }}>
                  <span className="text-sm font-semibold" style={{ color: "#F57F17" }}>⚡ {pendingCount} awaiting approval</span>
                </div>
              )}
            </div>

            {/* Filters */}
            <div className="flex gap-3 mb-5">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "#90A4AE" }} />
                <input type="text" placeholder="Search by product name or seller..." value={search} onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border outline-none text-sm"
                  style={{ borderColor: "#D1E8D1", backgroundColor: "#FFFFFF", color: "#263238" }} />
              </div>
              {(["all", "draft", "active", "archived", "out_of_stock"] as const).map((s) => (
                <button key={s} onClick={() => setStatusFilter(s)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold capitalize transition-all"
                  style={{ backgroundColor: statusFilter === s ? "#6A1B9A" : "#FFFFFF", color: statusFilter === s ? "#FFFFFF" : "#607D8B", border: `1px solid ${statusFilter === s ? "#6A1B9A" : "#E8F0E8"}` }}>
                  {s === "all" ? "All" : s.replace("_", " ")}
                  {s !== "all" && ` (${listings.filter((l) => l.status === s).length})`}
                </button>
              ))}
            </div>

            {/* Listing Cards */}
            <div className="space-y-4">
              {loading ? (
                <div className="py-16 text-center">
                  <p style={{ color: "#90A4AE" }}>Loading listings...</p>
                </div>
              ) : filtered.map((listing) => {
                const st = STATUS_STYLES[listing.status] || STATUS_STYLES.draft;
                return (
                  <div
                    key={listing.id}
                    className="rounded-2xl p-5 transition-all"
                    style={{
                      backgroundColor: "#FFFFFF",
                      boxShadow: "0 2px 12px rgba(46,125,50,0.07)",
                      border: listing.status === "draft" ? "2px solid #FFE082" : "1px solid #E8F5E9",
                    }}
                  >
                    <div className="flex items-center gap-5">
                      <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                        <img src={listing.image} alt={listing.name} className="w-full h-full object-cover" />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-bold" style={{ color: "#263238" }}>{listing.name}</p>
                          <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-semibold" style={{ backgroundColor: st.bg, color: st.color }}>
                            {st.icon}
                            {listing.status}
                          </span>
                        </div>
                        <p className="text-sm" style={{ color: "#607D8B" }}>
                          Seller: <strong>{listing.storeName}</strong> · Category: {listing.category} · {formatPrice(listing.price)}
                        </p>
                        <p className="text-xs mt-1" style={{ color: "#90A4AE" }}>
                          Eco Score: {listing.ecoScore}/10 · Carbon: {listing.carbonFootprint}
                        </p>
                      </div>

                      {listing.status === "draft" && (
                        <div className="flex gap-2 flex-shrink-0">
                          <button
                            onClick={() => approve(listing.id)}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
                            style={{ backgroundColor: "#2E7D32" }}
                          >
                            <CheckCircle2 size={14} /> Approve
                          </button>
                          <button
                            onClick={() => setShowRejectModal(listing.id)}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
                            style={{ backgroundColor: "#FFEBEE", color: "#C62828" }}
                          >
                            <XCircle size={14} /> Reject
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              {!loading && filtered.length === 0 && (
                <div className="py-16 text-center">
                  <Package size={40} color="#D1E8D1" className="mx-auto mb-3" />
                  <p style={{ color: "#90A4AE" }}>No listings found.</p>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="w-full max-w-md rounded-2xl p-6" style={{ backgroundColor: "#FFFFFF" }}>
            <h2 className="text-lg font-bold mb-4" style={{ color: "#263238" }}>Reject Listing</h2>
            <p className="text-sm mb-4" style={{ color: "#607D8B" }}>Please provide a reason for rejection. The seller will be notified.</p>
            <textarea
              placeholder="e.g. Product does not meet our eco-certification requirements..."
              value={showRejectModal ? (rejectReason[showRejectModal] || "") : ""}
              onChange={(e) => showRejectModal && setRejectReason({ ...rejectReason, [showRejectModal]: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 rounded-xl border outline-none text-sm resize-none mb-4"
              style={{ borderColor: "#FFCDD2", color: "#263238" }}
            />
            <div className="flex gap-3">
              <button onClick={() => setShowRejectModal(null)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold" style={{ backgroundColor: "#F5F7F5", color: "#607D8B" }}>
                Cancel
              </button>
              <button onClick={() => { if (showRejectModal) reject(showRejectModal); }} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white" style={{ backgroundColor: "#C62828" }}>
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
