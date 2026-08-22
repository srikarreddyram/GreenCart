import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router";
import {
  Package, Search, Plus, Edit2, Trash2, Upload, X,
  CheckCircle2, AlertCircle, Leaf, LayoutDashboard, ShoppingBag, Settings, Loader2
} from "lucide-react";
import { toast } from "sonner";
import { useProducts, addProduct, updateProductStatus, deleteProductRecord, updateProduct, updateProductImage } from "@/hooks/useProducts";
import { useSellerData } from "@/hooks/useSellerData";
import { formatPrice } from "@/lib/currency";

type ProductStatus = "active" | "draft" | "out_of_stock" | "archived";

const STATUS_STYLES: Record<ProductStatus, { bg: string; color: string; label: string }> = {
  active: { bg: "#E8F5E9", color: "#2E7D32", label: "Active" },
  draft: { bg: "#E8EAF6", color: "#3949AB", label: "Draft" },
  out_of_stock: { bg: "#FFF3E0", color: "#E65100", label: "Out of Stock" },
  archived: { bg: "#ECEFF1", color: "#546E7A", label: "Archived" },
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

export function SellerProductsPage() {
  const { storeId } = useSellerData();
  const { products: rawProducts, loading, setProducts } = useProducts({ storeId: storeId ?? undefined });
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ProductStatus | "all">("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newProduct, setNewProduct] = useState({ title: "", price: "", sku: "", stock: "", description: "" });
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [editForm, setEditForm] = useState({ title: "", price: "", sku: "", stock: "", description: "", imageUrl: "" });
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const openEditModal = (p: any) => {
    setEditingProduct(p);
    setEditForm({
      title: p.name,
      price: String(p.price),
      sku: p.sku || "",
      stock: String(p.stock ?? p.stockQty ?? 0),
      description: p.description || "",
      imageUrl: p.image || "",
    });
  };

  const handleSaveEdit = async () => {
    if (!editingProduct) return;
    setIsSavingEdit(true);
    try {
      await updateProduct(editingProduct.id, {
        title: editForm.title,
        price: Number(editForm.price),
        stock_qty: Number(editForm.stock) || 0,
        description: editForm.description,
        sku: editForm.sku || undefined,
      });
      if (editForm.imageUrl && editForm.imageUrl !== editingProduct.image) {
        await updateProductImage(editingProduct.id, editForm.imageUrl);
      }
      toast.success(`"${editForm.title}" updated successfully!`);
      setProducts(prev => prev.map(p => p.id === editingProduct.id ? {
        ...p,
        name: editForm.title,
        price: Number(editForm.price),
        stockQty: Number(editForm.stock) || 0,
        description: editForm.description,
        sku: editForm.sku || null,
        image: editForm.imageUrl || p.image,
      } : p));
      setEditingProduct(null);
    } catch (err: any) {
      toast.error(err.message || "Failed to update product");
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Format proper product objects directly from the raw database response
  const products = useMemo(
    () => rawProducts.map((p) => ({ ...p, status: p.status as ProductStatus, stock: p.stockQty })),
    [rawProducts]
  );

  const filtered = products.filter((p) => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || (p.sku ?? "").includes(search);
    const matchStatus = statusFilter === "all" || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const bulkStatusChange = async (status: ProductStatus) => {
    try {
      await updateProductStatus(Array.from(selected), status);
      toast.success(`Updated ${selected.size} products to "${STATUS_STYLES[status].label}"`);
      setProducts(prev => prev.map(p => selected.has(p.id) ? { ...p, status } : p));
      setSelected(new Set());
    } catch (err: any) {
      toast.error(err.message || "Failed to update product status");
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      if (!window.confirm("Are you sure you want to delete this product?")) return;
      await deleteProductRecord(id);
      toast.success("Product deleted");
      setProducts(prev => prev.filter(p => p.id !== id));
      selected.delete(id);
      setSelected(new Set(selected));
    } catch (err: any) {
      toast.error(err.message || "Failed to delete product");
    }
  };

  const handleAddProduct = async () => {
    if (!newProduct.title || !newProduct.price || !storeId) {
      toast.error("Please fill in title and price.");
      return;
    }
    setIsSubmitting(true);
    try {
      const added = await addProduct({
        storeId,
        title: newProduct.title,
        price: Number(newProduct.price),
        sku: newProduct.sku,
        stockQty: Number(newProduct.stock) || 0,
        description: newProduct.description
      });
      toast.success(`Product "${newProduct.title}" added successfully!`);
      // Optimistically append the product 
      // Note: mapping logic requires a full row fetch for exact match but this handles immediate UI update
      setProducts([{
         id: added.id as string,
         name: newProduct.title,
         price: Number(newProduct.price),
         comparePrice: null,
         ecoScore: 9.0,
         carbonFootprint: "1.0kg CO₂",
         image: "https://loremflickr.com/800/800/product,eco",
         badge: "Eco Friendly",
         category: "Other",
         categoryId: null,
         material: "Sustainable Materials",
         waterUsage: "Low",
         certification: "Eco Certified",
         description: newProduct.description,
         tags: [],
         stockQty: Number(newProduct.stock) || 0,
         status: "active",
         ratingAvg: 0,
         ratingCount: 0,
         storeId,
         sku: newProduct.sku || null
      }, ...rawProducts]);
      
      setShowAddModal(false);
      setNewProduct({ title: "", price: "", sku: "", stock: "", description: "" });
    } catch (err: any) {
      toast.error(err.message || "Failed to add product");
    } finally {
      setIsSubmitting(false);
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
          <span className="text-sm" style={{ color: "#90A4AE" }}>/ Product Management</span>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-8 py-8">
        <div className="flex gap-6">
          <SellerSidebar active="/seller/products" />

          <main className="flex-1">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold" style={{ color: "#263238" }}>My Products</h1>
                <p className="text-sm" style={{ color: "#607D8B" }}>{loading ? "Loading…" : `${products.length} products · ${products.filter((p) => p.status === "active").length} active`}</p>
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
                style={{ backgroundColor: "#2E7D32" }}
              >
                <Plus size={16} /> Add Product
              </button>
            </div>

            {/* Filters */}
            <div className="flex gap-3 mb-5">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "#90A4AE" }} />
                <input
                  type="text"
                  placeholder="Search by name or SKU..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border outline-none text-sm"
                  style={{ borderColor: "#D1E8D1", backgroundColor: "#FFFFFF", color: "#263238" }}
                />
              </div>
              <div className="flex gap-2">
                {(["all", "active", "draft", "out_of_stock", "archived"] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className="px-3 py-2 rounded-xl text-xs font-semibold transition-all"
                    style={{
                      backgroundColor: statusFilter === s ? "#2E7D32" : "#FFFFFF",
                      color: statusFilter === s ? "#FFFFFF" : "#607D8B",
                      border: `1px solid ${statusFilter === s ? "#2E7D32" : "#E8F0E8"}`,
                    }}
                  >
                    {s === "all" ? "All" : STATUS_STYLES[s].label}
                  </button>
                ))}
              </div>
            </div>

            {/* Bulk actions */}
            {selected.size > 0 && (
              <div className="flex items-center gap-3 mb-4 px-4 py-3 rounded-xl" style={{ backgroundColor: "#E8F5E9" }}>
                <span className="text-sm font-medium" style={{ color: "#2E7D32" }}>{selected.size} selected</span>
                <div className="flex gap-2 ml-2">
                  {(["active", "draft", "archived"] as ProductStatus[]).map((s) => (
                    <button key={s} onClick={() => bulkStatusChange(s)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-80"
                      style={{ backgroundColor: STATUS_STYLES[s].bg, color: STATUS_STYLES[s].color }}>
                      Set {STATUS_STYLES[s].label}
                    </button>
                  ))}
                </div>
                <button onClick={() => setSelected(new Set())} className="ml-auto" style={{ color: "#90A4AE" }}>
                  <X size={16} />
                </button>
              </div>
            )}

            {/* Table */}
            <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: "#FFFFFF", boxShadow: "0 2px 12px rgba(46,125,50,0.07)" }}>
              <table className="w-full">
                <thead>
                  <tr style={{ backgroundColor: "#F5F7F5", borderBottom: "1px solid #E8F0E8" }}>
                    <th className="px-4 py-3 text-left">
                      <input type="checkbox" onChange={(e) => setSelected(e.target.checked ? new Set(filtered.map((p) => p.id)) : new Set())} />
                    </th>
                    {["Product", "SKU", "Price", "Stock", "Status", "Actions"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: "#90A4AE" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-16 text-center">
                        <Loader2 size={32} className="animate-spin mx-auto mb-2" style={{ color: "#A5D6A7" }} />
                        <p style={{ color: "#90A4AE" }}>Loading products…</p>
                      </td>
                    </tr>
                  ) : filtered.map((p) => (
                    <tr key={p.id} className="border-b transition-colors hover:bg-gray-50" style={{ borderColor: "#F0F4F0" }}>
                      <td className="px-4 py-3">
                        <input type="checkbox" checked={selected.has(p.id)} onChange={() => toggleSelect(p.id)} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0" style={{ backgroundColor: "#F5F7F5" }}>
                            <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <p className="font-medium text-sm" style={{ color: "#263238" }}>{p.name}</p>
                            <p className="text-xs" style={{ color: "#90A4AE" }}>{p.category}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm" style={{ color: "#90A4AE" }}>{p.sku}</td>
                      <td className="px-4 py-3 text-sm font-semibold" style={{ color: "#263238" }}>{formatPrice(p.price)}</td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-1 text-sm" style={{ color: p.stock === 0 ? "#EF5350" : p.stock < 10 ? "#E65100" : "#2E7D32" }}>
                          {p.stock === 0 ? <AlertCircle size={14} /> : p.stock < 10 ? <AlertCircle size={14} /> : <CheckCircle2 size={14} />}
                          {p.stock} units
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: STATUS_STYLES[p.status].bg, color: STATUS_STYLES[p.status].color }}>
                          {STATUS_STYLES[p.status].label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button onClick={() => openEditModal(p)} className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-green-50" style={{ color: "#2E7D32" }}>
                            <Edit2 size={14} />
                          </button>
                          <button onClick={() => deleteProduct(p.id)} className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-red-50" style={{ color: "#EF5350" }}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filtered.length === 0 && (
                <div className="py-16 text-center">
                  <Package size={40} color="#D1E8D1" className="mx-auto mb-3" />
                  <p style={{ color: "#90A4AE" }}>No products found.</p>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="w-full max-w-lg rounded-2xl p-6" style={{ backgroundColor: "#FFFFFF" }}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold" style={{ color: "#263238" }}>Add New Product</h2>
              <button onClick={() => setShowAddModal(false)} style={{ color: "#90A4AE" }}><X size={20} /></button>
            </div>

            <div className="space-y-4">
              {[
                { label: "Product Title *", key: "title", placeholder: "e.g. Organic Hemp T-Shirt" },
                { label: "Price (₹) *", key: "price", placeholder: "e.g. 2499" },
                { label: "SKU", key: "sku", placeholder: "e.g. GC-1234" },
                { label: "Stock Quantity", key: "stock", placeholder: "e.g. 50" },
              ].map((f) => (
                <div key={f.key}>
                  <label className="block text-sm font-medium mb-1" style={{ color: "#263238" }}>{f.label}</label>
                  <input
                    type="text"
                    placeholder={f.placeholder}
                    value={newProduct[f.key as keyof typeof newProduct]}
                    onChange={(e) => setNewProduct({ ...newProduct, [f.key]: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border outline-none text-sm"
                    style={{ borderColor: "#D1E8D1", color: "#263238" }}
                  />
                </div>
              ))}

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "#263238" }}>Product Images</label>
                <div className="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer" style={{ borderColor: "#D1E8D1" }}>
                  <Upload size={24} color="#D1E8D1" className="mx-auto mb-2" />
                  <p className="text-sm" style={{ color: "#90A4AE" }}>Upload up to 8 images · JPEG, PNG, WebP · Max 5MB each</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowAddModal(false)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold" style={{ backgroundColor: "#F5F7F5", color: "#607D8B" }}>
                Cancel
              </button>
              <button onClick={handleAddProduct} disabled={isSubmitting} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white flex justify-center items-center gap-2" style={{ backgroundColor: "#2E7D32", opacity: isSubmitting ? 0.7 : 1 }}>
                {isSubmitting ? <><Loader2 size={16} className="animate-spin"/> Saving...</> : "Add Product"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="w-full max-w-lg rounded-2xl p-6 max-h-[90vh] overflow-y-auto" style={{ backgroundColor: "#FFFFFF" }}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold" style={{ color: "#263238" }}>Edit Product</h2>
              <button onClick={() => setEditingProduct(null)} style={{ color: "#90A4AE" }}><X size={20} /></button>
            </div>

            {/* Image Preview + URL */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1" style={{ color: "#263238" }}>Product Image</label>
              <div className="flex gap-3 items-start">
                <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border" style={{ borderColor: "#D1E8D1", backgroundColor: "#F5F7F5" }}>
                  <img src={editForm.imageUrl || "https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&h=200&fit=crop"} alt="Preview" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Paste image URL..."
                    value={editForm.imageUrl}
                    onChange={(e) => setEditForm({ ...editForm, imageUrl: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border outline-none text-sm"
                    style={{ borderColor: "#D1E8D1", color: "#263238" }}
                  />
                  <p className="text-xs mt-1" style={{ color: "#90A4AE" }}>Paste a direct image URL (Unsplash, etc.)</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {[
                { label: "Product Title", key: "title", placeholder: "e.g. Organic Turmeric Powder" },
                { label: "Price (₹)", key: "price", placeholder: "e.g. 180" },
                { label: "SKU", key: "sku", placeholder: "e.g. MF-TUR-500" },
                { label: "Stock Quantity", key: "stock", placeholder: "e.g. 120" },
              ].map((f) => (
                <div key={f.key}>
                  <label className="block text-sm font-medium mb-1" style={{ color: "#263238" }}>{f.label}</label>
                  <input
                    type="text"
                    placeholder={f.placeholder}
                    value={editForm[f.key as keyof typeof editForm]}
                    onChange={(e) => setEditForm({ ...editForm, [f.key]: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border outline-none text-sm"
                    style={{ borderColor: "#D1E8D1", color: "#263238" }}
                  />
                </div>
              ))}

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "#263238" }}>Description</label>
                <textarea
                  placeholder="Product description..."
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl border outline-none text-sm resize-none"
                  style={{ borderColor: "#D1E8D1", color: "#263238" }}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setEditingProduct(null)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold" style={{ backgroundColor: "#F5F7F5", color: "#607D8B" }}>
                Cancel
              </button>
              <button onClick={handleSaveEdit} disabled={isSavingEdit} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white flex justify-center items-center gap-2" style={{ backgroundColor: "#2E7D32", opacity: isSavingEdit ? 0.7 : 1 }}>
                {isSavingEdit ? <><Loader2 size={16} className="animate-spin"/> Saving...</> : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
