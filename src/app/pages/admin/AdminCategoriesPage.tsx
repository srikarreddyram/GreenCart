import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Users, Package, BarChart2, FolderTree, Plus, Edit2, Trash2, Shield, Leaf } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

interface Category {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  productCount: number;
  isActive: boolean;
  icon: string;
}



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

export function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newCat, setNewCat] = useState({ name: "", slug: "", parentId: "", icon: "🌿" });
  const [loading, setLoading] = useState(true);

  const fetchCategories = async () => {
    setLoading(true);
    const { data: catData } = await supabase.from("categories").select("id, name, slug, parent_id");
    const { data: countData } = await supabase.from("products").select("category_id");
    
    // Count products per category
    const catCounts = new Map<string, number>();
    if (countData) {
      countData.forEach(p => {
        if (p.category_id) {
          catCounts.set(p.category_id, (catCounts.get(p.category_id) || 0) + 1);
        }
      });
    }

    if (catData) {
      const formatted: Category[] = catData.map(c => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        parentId: c.parent_id,
        productCount: catCounts.get(c.id) || 0,
        isActive: true, // DB doesnt have isActive right now, default to true
        icon: "🌿"
      }));
      setCategories(formatted);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const rootCategories = categories.filter((c) => !c.parentId);
  const getChildren = (id: string) => categories.filter((c) => c.parentId === id);

  const toggleActive = (id: string) => {
    // Only toggling active visually since it's not strictly connected to DB schema isActive yet
    setCategories((prev) => prev.map((c) => {
      if (c.id !== id) return c;
      toast.success(`Category ${c.isActive ? "archived" : "restored"}`);
      return { ...c, isActive: !c.isActive };
    }));
  };

  const deleteCategory = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (!error) {
      setCategories((prev) => prev.filter((c) => c.id !== id && c.parentId !== id));
      toast.success("Category removed");
    } else {
      toast.error(error.message);
    }
  };

  const addCategory = async () => {
    if (!newCat.name) { toast.error("Category name is required."); return; }
    const slug = newCat.slug || newCat.name.toLowerCase().replace(/\s+/g, "-");
    
    const { data, error } = await supabase.from("categories").insert({
      name: newCat.name,
      slug: slug,
      parent_id: newCat.parentId || null
    }).select().single();

    if (error) {
      toast.error(error.message);
      return;
    }

    const cat: Category = {
      id: data.id,
      name: data.name,
      slug: data.slug,
      parentId: data.parent_id,
      productCount: 0,
      isActive: true,
      icon: newCat.icon,
    };
    
    setCategories((prev) => [...prev, cat]);
    toast.success(`Category "${cat.name}" created!`);
    setShowAddModal(false);
    setNewCat({ name: "", slug: "", parentId: "", icon: "🌿" });
  };

  return (
    <div style={{ backgroundColor: "#F5F7F5", minHeight: "100vh" }}>
      <div style={{ backgroundColor: "#FFFFFF", borderBottom: "1px solid #E8F0E8" }} className="px-8 py-4 sticky top-0 z-40">
        <div className="max-w-[1440px] mx-auto flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#6A1B9A" }}>
            <Leaf size={16} color="#FFFFFF" />
          </div>
          <span className="font-bold" style={{ color: "#2E7D32" }}>GreenCart</span>
          <span className="text-sm" style={{ color: "#90A4AE" }}>/ Admin / Category Management</span>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-8 py-8">
        <div className="flex gap-6">
          <AdminSidebar active="/admin/categories" />

          <main className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold" style={{ color: "#263238" }}>Category Management</h1>
                <p className="text-sm" style={{ color: "#607D8B" }}>{categories.length} categories · {rootCategories.length} top-level</p>
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
                style={{ backgroundColor: "#6A1B9A" }}
              >
                <Plus size={16} /> Add Category
              </button>
            </div>

            {/* Category Tree */}
            <div className="space-y-3">
              {rootCategories.map((cat) => {
                const children = getChildren(cat.id);
                return (
                  <div key={cat.id} className="rounded-2xl overflow-hidden" style={{ backgroundColor: "#FFFFFF", boxShadow: "0 2px 12px rgba(46,125,50,0.07)" }}>
                    {/* Root Category */}
                    <div className="flex items-center gap-4 px-5 py-4" style={{ borderBottom: children.length > 0 ? "1px solid #F0F4F0" : "none" }}>
                      <span className="text-2xl">{cat.icon}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-bold" style={{ color: "#263238" }}>{cat.name}</p>
                          <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: cat.isActive ? "#E8F5E9" : "#ECEFF1", color: cat.isActive ? "#2E7D32" : "#546E7A" }}>
                            {cat.isActive ? "Active" : "Archived"}
                          </span>
                        </div>
                        <p className="text-xs" style={{ color: "#90A4AE" }}>/{cat.slug} · {cat.productCount} products · {children.length} subcategories</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => setEditingId(editingId === cat.id ? null : cat.id)} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ color: "#6A1B9A", backgroundColor: "#F3E5F5" }}>
                          <Edit2 size={13} />
                        </button>
                        <button onClick={() => toggleActive(cat.id)} className="w-8 h-8 rounded-lg flex items-center justify-center transition-all" style={{ color: cat.isActive ? "#E65100" : "#2E7D32", backgroundColor: cat.isActive ? "#FFF3E0" : "#E8F5E9" }}>
                          {cat.isActive ? "⊘" : "✓"}
                        </button>
                        <button onClick={() => deleteCategory(cat.id)} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ color: "#EF5350", backgroundColor: "#FFEBEE" }}>
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>

                    {/* Children */}
                    {children.length > 0 && (
                      <div className="px-5 py-3 space-y-2" style={{ backgroundColor: "#FAFAFA" }}>
                        {children.map((child) => (
                          <div key={child.id} className="flex items-center gap-3 py-2 px-3 rounded-xl" style={{ backgroundColor: "#FFFFFF", border: "1px solid #F0F4F0" }}>
                            <span className="text-base">{child.icon}</span>
                            <div className="flex-1">
                              <p className="text-sm font-medium" style={{ color: "#263238" }}>{child.name}</p>
                              <p className="text-xs" style={{ color: "#90A4AE" }}>/{child.slug} · {child.productCount} products</p>
                            </div>
                            <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: child.isActive ? "#E8F5E9" : "#ECEFF1", color: child.isActive ? "#2E7D32" : "#546E7A" }}>
                              {child.isActive ? "Active" : "Archived"}
                            </span>
                            <div className="flex gap-1">
                              <button onClick={() => toggleActive(child.id)} className="w-7 h-7 rounded-lg flex items-center justify-center text-xs" style={{ color: child.isActive ? "#E65100" : "#2E7D32", backgroundColor: child.isActive ? "#FFF3E0" : "#E8F5E9" }}>
                                {child.isActive ? "⊘" : "✓"}
                              </button>
                              <button onClick={() => deleteCategory(child.id)} className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ color: "#EF5350", backgroundColor: "#FFEBEE" }}>
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </main>
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="w-full max-w-md rounded-2xl p-6" style={{ backgroundColor: "#FFFFFF" }}>
            <h2 className="text-lg font-bold mb-5" style={{ color: "#263238" }}>Add Category</h2>
            <div className="space-y-4">
              {[
                { label: "Category Name *", key: "name", placeholder: "e.g. Organic Food" },
                { label: "URL Slug", key: "slug", placeholder: "e.g. organic-food (auto-generated)" },
                { label: "Icon (emoji)", key: "icon", placeholder: "🌿" },
              ].map((f) => (
                <div key={f.key}>
                  <label className="block text-sm font-medium mb-1" style={{ color: "#263238" }}>{f.label}</label>
                  <input type="text" placeholder={f.placeholder} value={newCat[f.key as keyof typeof newCat]} onChange={(e) => setNewCat({ ...newCat, [f.key]: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border outline-none text-sm" style={{ borderColor: "#D1E8D1", color: "#263238" }} />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "#263238" }}>Parent Category (optional)</label>
                <select value={newCat.parentId} onChange={(e) => setNewCat({ ...newCat, parentId: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border outline-none text-sm" style={{ borderColor: "#D1E8D1", color: "#263238" }}>
                  <option value="">None (Top-Level)</option>
                  {rootCategories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowAddModal(false)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold" style={{ backgroundColor: "#F5F7F5", color: "#607D8B" }}>Cancel</button>
              <button onClick={addCategory} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white" style={{ backgroundColor: "#6A1B9A" }}>Create Category</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
