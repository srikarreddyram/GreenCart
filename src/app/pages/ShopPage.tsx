import { useState, useMemo } from "react";
import { Link } from "react-router";
import { Star, SlidersHorizontal, Search, Leaf, ShoppingCart, Loader2, Heart } from "lucide-react";
import { toast } from "sonner";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { useCartContext } from "@/contexts/CartContext";
import { useProducts, useCategories, type Product } from "@/hooks/useProducts";
import { useWishlist } from "@/hooks/useWishlist";
import { formatPrice } from "@/lib/currency";

function EcoScoreStars({ score }: { score: number }) {
  const filled = Math.round(score / 2);
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={12} fill={i <= filled ? "#66BB6A" : "transparent"} color={i <= filled ? "#66BB6A" : "#D1E8D1"} strokeWidth={2} />
      ))}
      <span className="ml-1 text-xs font-semibold" style={{ color: "#2E7D32" }}>{score.toFixed(1)}</span>
    </div>
  );
}

const FILTER_TAGS = [
  { id: "certifiedGreen", label: "Certified Green" },
  { id: "plasticFree", label: "Plastic Free" },
  { id: "recycledMaterials", label: "Recycled Materials" },
  { id: "ecoFriendly", label: "Eco Friendly Manufacturing" },
];

const SORT_OPTIONS = [
  { value: "default", label: "Featured" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "eco_desc", label: "Eco Score: Best First" },
];

function ProductSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden animate-pulse" style={{ backgroundColor: "#FFFFFF", boxShadow: "0 2px 16px rgba(46,125,50,0.08)" }}>
      <div style={{ height: "200px", backgroundColor: "#E8F5E9" }} />
      <div className="p-5 space-y-3">
        <div className="h-4 rounded" style={{ backgroundColor: "#E8F5E9", width: "70%" }} />
        <div className="h-3 rounded" style={{ backgroundColor: "#E8F5E9", width: "50%" }} />
        <div className="h-3 rounded" style={{ backgroundColor: "#E8F5E9", width: "40%" }} />
        <div className="flex justify-between items-center mt-4">
          <div className="h-5 rounded" style={{ backgroundColor: "#E8F5E9", width: "30%" }} />
          <div className="h-8 w-20 rounded-xl" style={{ backgroundColor: "#E8F5E9" }} />
        </div>
      </div>
    </div>
  );
}

export function ShopPage() {
  const [search, setSearch] = useState("");
  const [activeFilters, setActiveFilters] = useState<Record<string, boolean>>({});
  const [minEcoScore, setMinEcoScore] = useState(1);
  const [maxPrice, setMaxPrice] = useState(10000);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [sort, setSort] = useState("default");

  const { products, loading, error } = useProducts();
  const { categories, loading: catsLoading } = useCategories();
  const { addItem, isInCart } = useCartContext();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const toggleFilter = (id: string) =>
    setActiveFilters((prev) => ({ ...prev, [id]: !prev[id] }));
  const anyFilterActive = Object.values(activeFilters).some(Boolean);

  const filtered = useMemo(() => {
    let list = products.filter((p) => {
      const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
      const matchPrice = p.price <= maxPrice;
      const matchEco = p.ecoScore >= minEcoScore;
      const matchFilters = !anyFilterActive || FILTER_TAGS.some((f) => {
        if (!activeFilters[f.id]) return false;
        return p.tags.some((t) => t.toLowerCase().includes(f.label.toLowerCase().split(" ")[0].toLowerCase()));
      });
      const matchCat = !selectedCategoryId || p.categoryId === selectedCategoryId;
      return matchSearch && matchPrice && matchEco && matchFilters && matchCat;
    });

    if (sort === "price_asc") list = [...list].sort((a, b) => a.price - b.price);
    else if (sort === "price_desc") list = [...list].sort((a, b) => b.price - a.price);
    else if (sort === "eco_desc") list = [...list].sort((a, b) => b.ecoScore - a.ecoScore);
    return list;
  }, [products, search, maxPrice, minEcoScore, anyFilterActive, activeFilters, selectedCategoryId, sort]);

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    addItem(product, 1);
    toast.success(`${product.name} added to cart! 🛒`);
  };

  const handleToggleWishlist = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    toggleWishlist(product);
    if (!isInWishlist(product.id)) {
      toast.success(`${product.name} added to wishlist! ❤️`);
    } else {
      toast.success(`${product.name} removed from wishlist`);
    }
  };

  return (
    <div style={{ backgroundColor: "#F5F7F5" }}>
      <Navbar />

      <div className="max-w-[1440px] mx-auto px-8 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: "#263238" }}>Eco-Friendly Shop</h1>
          <p style={{ color: "#607D8B" }}>
            Browse {loading ? "…" : products.length} certified sustainable products.
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          <button
            onClick={() => setSelectedCategoryId(null)}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all"
            style={{
              backgroundColor: !selectedCategoryId ? "#2E7D32" : "#FFFFFF",
              color: !selectedCategoryId ? "#FFFFFF" : "#607D8B",
              border: `1px solid ${!selectedCategoryId ? "#2E7D32" : "#E8F0E8"}`,
            }}
          >
            All
          </button>
          {catsLoading ? null : categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategoryId(cat.id)}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all"
              style={{
                backgroundColor: selectedCategoryId === cat.id ? "#2E7D32" : "#FFFFFF",
                color: selectedCategoryId === cat.id ? "#FFFFFF" : "#607D8B",
                border: `1px solid ${selectedCategoryId === cat.id ? "#2E7D32" : "#E8F0E8"}`,
              }}
            >
              {cat.name}
            </button>
          ))}
        </div>

        <div className="flex gap-8">
          {/* Sidebar Filters */}
          <aside className="w-[260px] flex-shrink-0 hidden lg:block">
            <div className="rounded-2xl p-6 sticky top-24" style={{ backgroundColor: "#FFFFFF", boxShadow: "0 2px 16px rgba(46,125,50,0.07)" }}>
              <div className="flex items-center gap-2 mb-6">
                <SlidersHorizontal size={16} color="#2E7D32" />
                <h2 className="font-semibold" style={{ color: "#263238" }}>Filters</h2>
              </div>

              <div className="mb-6">
                <h3 className="text-sm font-semibold mb-3" style={{ color: "#263238" }}>Sustainable Product Filter</h3>
                <div className="space-y-3">
                  {FILTER_TAGS.map((f) => (
                    <label key={f.id} className="flex items-center gap-3 cursor-pointer">
                      <div
                        onClick={() => toggleFilter(f.id)}
                        className="w-4 h-4 rounded flex items-center justify-center border-2 transition-all cursor-pointer flex-shrink-0"
                        style={{ borderColor: activeFilters[f.id] ? "#2E7D32" : "#D1E8D1", backgroundColor: activeFilters[f.id] ? "#2E7D32" : "#FFFFFF" }}
                      >
                        {activeFilters[f.id] && (
                          <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                            <path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </div>
                      <span className="text-sm" style={{ color: "#607D8B" }}>{f.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="h-px my-5" style={{ backgroundColor: "#E8F0E8" }} />

              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold" style={{ color: "#263238" }}>Eco Score</h3>
                  <span className="text-sm font-bold px-2 py-0.5 rounded" style={{ backgroundColor: "#E8F5E9", color: "#2E7D32" }}>{minEcoScore}+</span>
                </div>
                <input type="range" min={1} max={10} step={0.5} value={minEcoScore} onChange={(e) => setMinEcoScore(Number(e.target.value))} className="w-full" style={{ accentColor: "#2E7D32" }} />
                <div className="flex justify-between text-xs mt-1" style={{ color: "#90A4AE" }}><span>1</span><span>10</span></div>
              </div>

              <div className="h-px my-5" style={{ backgroundColor: "#E8F0E8" }} />

              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold" style={{ color: "#263238" }}>Max Price</h3>
                  <span className="text-sm font-bold px-2 py-0.5 rounded" style={{ backgroundColor: "#E8F5E9", color: "#2E7D32" }}>{formatPrice(maxPrice)}</span>
                </div>
                <input type="range" min={100} max={10000} step={100} value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))} className="w-full" style={{ accentColor: "#2E7D32" }} />
                <div className="flex justify-between text-xs mt-1" style={{ color: "#90A4AE" }}><span>₹100</span><span>₹10,000</span></div>
              </div>
            </div>
          </aside>

          {/* Main Grid */}
          <main className="flex-1">
            <div className="flex gap-3 mb-5">
              <div className="relative flex-1">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "#90A4AE" }} />
                <input
                  type="text"
                  placeholder="Search eco-friendly products..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl border outline-none transition-all"
                  style={{ borderColor: "#D1E8D1", backgroundColor: "#FFFFFF", color: "#263238" }}
                  onFocus={(e) => (e.target.style.borderColor = "#2E7D32")}
                  onBlur={(e) => (e.target.style.borderColor = "#D1E8D1")}
                />
              </div>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="px-4 py-3.5 rounded-xl border outline-none text-sm font-medium"
                style={{ borderColor: "#D1E8D1", backgroundColor: "#FFFFFF", color: "#263238" }}
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            {error && (
              <div className="py-6 px-4 rounded-2xl mb-4 text-sm" style={{ backgroundColor: "#FFEBEE", color: "#C62828" }}>
                ⚠️ Failed to load products: {error}
              </div>
            )}

            <p className="text-sm mb-5" style={{ color: "#607D8B" }}>
              Showing <strong style={{ color: "#263238" }}>{loading ? "…" : filtered.length}</strong> products
            </p>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => <ProductSkeleton key={i} />)}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-20">
                <Leaf size={48} color="#D1E8D1" className="mx-auto mb-4" />
                <p style={{ color: "#90A4AE" }}>No products match your filters.</p>
                <button onClick={() => { setSearch(""); setSelectedCategoryId(null); setActiveFilters({}); setMinEcoScore(1); setMaxPrice(500); }} className="mt-4 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all" style={{ backgroundColor: "#E8F5E9", color: "#2E7D32" }}>
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((product) => (
                  <Link key={product.id} to={`/product/${product.id}`} className="no-underline group">
                    <div
                      className="rounded-2xl overflow-hidden transition-all hover:-translate-y-1 hover:shadow-lg"
                      style={{ backgroundColor: "#FFFFFF", boxShadow: "0 2px 16px rgba(46,125,50,0.08)", border: "1px solid #E8F5E9" }}
                    >
                      <div className="relative overflow-hidden" style={{ height: "200px" }}>
                        <ImageWithFallback
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: "#E8F5E9", color: "#2E7D32" }}>
                          🌿 {product.badge}
                        </div>
                        {product.comparePrice && (
                          <div className="absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-bold" style={{ backgroundColor: "#FFEBEE", color: "#C62828" }}>
                            SALE
                          </div>
                        )}
                        <button
                          onClick={(e) => handleToggleWishlist(e, product)}
                          className="absolute bottom-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all bg-white hover:scale-110 shadow-sm"
                          style={{
                            color: isInWishlist(product.id) ? "#E53935" : "#B0BEC5",
                          }}
                        >
                          <Heart size={16} fill={isInWishlist(product.id) ? "#E53935" : "transparent"} />
                        </button>
                      </div>

                      <div className="p-5">
                        <h3 className="font-semibold mb-2" style={{ color: "#263238" }}>{product.name}</h3>
                        <EcoScoreStars score={product.ecoScore} />
                        <div className="mt-2 mb-4 text-xs px-2.5 py-1 rounded-full inline-flex items-center gap-1" style={{ backgroundColor: "#E8F5E9", color: "#2E7D32" }}>
                          🍃 Carbon: {product.carbonFootprint}
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-bold text-lg" style={{ color: "#263238" }}>{formatPrice(product.price)}</p>
                            {product.comparePrice && (
                              <p className="text-xs line-through" style={{ color: "#90A4AE" }}>{formatPrice(product.comparePrice)}</p>
                            )}
                          </div>
                          <button
                            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
                            style={{ backgroundColor: isInCart(product.id) ? "#1B5E20" : "#2E7D32" }}
                            onClick={(e) => handleAddToCart(e, product)}
                          >
                            <ShoppingCart size={14} />
                            {isInCart(product.id) ? "In Cart" : "Add"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
      <Footer />
    </div>
  );
}
