import { useState } from "react";
import { useParams, Link } from "react-router";
import { Star, ShoppingCart, ArrowLeft, Shield, Leaf, Minus, Plus, Loader2, Heart } from "lucide-react";
import { toast } from "sonner";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { useCartContext } from "@/contexts/CartContext";
import { useProduct, useProducts, useReviews } from "@/hooks/useProducts";
import { useWishlist } from "@/hooks/useWishlist";
import { formatPrice } from "@/lib/currency";

function EcoScoreStars({ score }: { score: number }) {
  const filled = Math.round(score / 2);
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={16} fill={i <= filled ? "#66BB6A" : "transparent"} color={i <= filled ? "#66BB6A" : "#D1E8D1"} strokeWidth={2} />
      ))}
      <span className="ml-1.5 text-sm font-semibold" style={{ color: "#2E7D32" }}>{score.toFixed(1)}</span>
    </div>
  );
}

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { product, loading, error } = useProduct(id ?? "");
  const { products: related } = useProducts({ limit: 4 });
  const reviews = useReviews(id ?? "");
  const { addItem, isInCart } = useCartContext();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = () => {
    if (!product) return;
    addItem(product, quantity);
    toast.success(`${product.name} ×${quantity} added to cart! 🛒`);
  };

  if (loading) {
    return (
      <div style={{ backgroundColor: "#F5F7F5" }}>
        <Navbar />
        <div className="max-w-[1440px] mx-auto px-8 py-12 animate-pulse">
          <div className="flex gap-12">
            <div className="w-1/2 rounded-2xl" style={{ height: "460px", backgroundColor: "#E8F5E9" }} />
            <div className="flex-1 space-y-5 pt-4">
              <div className="h-6 rounded" style={{ backgroundColor: "#E8F5E9", width: "60%" }} />
              <div className="h-10 rounded" style={{ backgroundColor: "#E8F5E9", width: "85%" }} />
              <div className="h-4 rounded" style={{ backgroundColor: "#E8F5E9", width: "40%" }} />
              <div className="h-4 rounded" style={{ backgroundColor: "#E8F5E9", width: "55%" }} />
              <div className="h-32 rounded" style={{ backgroundColor: "#E8F5E9" }} />
              <div className="h-12 rounded-xl" style={{ backgroundColor: "#E8F5E9" }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div style={{ backgroundColor: "#F5F7F5" }}>
        <Navbar />
        <div className="max-w-[1440px] mx-auto px-8 py-20 text-center">
          <p className="text-xl font-semibold mb-4" style={{ color: "#263238" }}>
            {error ? `Error: ${error}` : "Product not found."}
          </p>
          <Link to="/shop" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white no-underline" style={{ backgroundColor: "#2E7D32" }}>
            <ArrowLeft size={16} /> Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  const relatedFiltered = related.filter((p) => p.id !== product.id).slice(0, 3);

  return (
    <div style={{ backgroundColor: "#F5F7F5" }}>
      <Navbar />

      <div className="max-w-[1440px] mx-auto px-8 py-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm mb-8" style={{ color: "#90A4AE" }}>
          <Link to="/shop" className="no-underline hover:underline flex items-center gap-1" style={{ color: "#2E7D32" }}>
            <ArrowLeft size={14} /> Shop
          </Link>
          <span>/</span>
          <span style={{ color: "#607D8B" }}>{product.category}</span>
          <span>/</span>
          <span style={{ color: "#263238" }} className="font-medium">{product.name}</span>
        </div>

        {/* Main */}
        <div className="flex flex-col lg:flex-row gap-12 mb-16">
          {/* Image */}
          <div className="lg:w-1/2">
            <div className="rounded-2xl overflow-hidden" style={{ boxShadow: "0 4px 24px rgba(46,125,50,0.12)" }}>
              <ImageWithFallback
                src={product.image}
                alt={product.name}
                className="w-full object-cover"
                style={{ height: "460px" }}
              />
            </div>
          </div>

          {/* Info */}
          <div className="flex-1">
            <div className="flex gap-2 flex-wrap mb-4">
              <span className="px-3 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: "#E8F5E9", color: "#2E7D32" }}>
                🌿 {product.badge}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: "#E3F2FD", color: "#1565C0" }}>
                {product.category}
              </span>
              {product.stockQty < 10 && product.stockQty > 0 && (
                <span className="px-3 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: "#FFF8E1", color: "#F57F17" }}>
                  ⚡ Only {product.stockQty} left
                </span>
              )}
            </div>

            <h1 className="text-4xl font-bold mb-3" style={{ color: "#263238" }}>{product.name}</h1>

            <div className="flex items-center gap-3 mb-6">
              <EcoScoreStars score={product.ecoScore} />
              <span className="text-sm" style={{ color: "#90A4AE" }}>({product.ratingCount.toLocaleString()} reviews)</span>
            </div>

            <div className="flex items-end gap-3 mb-6">
              <p className="text-4xl font-bold" style={{ color: "#263238" }}>{formatPrice(product.price)}</p>
              {product.comparePrice && (
                <p className="text-xl line-through mb-1" style={{ color: "#B0BEC5" }}>{formatPrice(product.comparePrice)}</p>
              )}
            </div>

            <p className="text-base leading-relaxed mb-8" style={{ color: "#607D8B" }}>{product.description}</p>

            {/* Eco Stats */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              {[
                { label: "Carbon Footprint", value: product.carbonFootprint, icon: "🍃" },
                { label: "Certification", value: product.certification, icon: "🏅" },
                { label: "Material", value: product.material, icon: "🌱" },
                { label: "Water Usage", value: product.waterUsage, icon: "💧" },
              ].map((stat) => (
                <div key={stat.label} className="rounded-xl px-4 py-3" style={{ backgroundColor: "#F0FAF0" }}>
                  <p className="text-xs mb-0.5" style={{ color: "#90A4AE" }}>{stat.icon} {stat.label}</p>
                  <p className="text-sm font-semibold" style={{ color: "#263238" }}>{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Tags */}
            <div className="flex gap-2 flex-wrap mb-8">
              {product.tags.map((t) => (
                <span key={t} className="px-2.5 py-1 rounded-full text-xs" style={{ backgroundColor: "#E8F5E9", color: "#2E7D32" }}>#{t}</span>
              ))}
            </div>

            {/* Quantity + Add */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center rounded-xl border overflow-hidden" style={{ borderColor: "#D1E8D1" }}>
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-4 py-3 transition-colors hover:bg-gray-50"
                  style={{ color: "#263238" }}
                >
                  <Minus size={16} />
                </button>
                <span className="px-5 py-3 font-semibold text-lg border-x" style={{ color: "#263238", borderColor: "#D1E8D1" }}>
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => Math.min(product.stockQty, q + 1))}
                  className="px-4 py-3 transition-colors hover:bg-gray-50"
                  style={{ color: "#263238" }}
                >
                  <Plus size={16} />
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={product.stockQty === 0}
                className="flex-1 flex items-center justify-center gap-3 py-3.5 rounded-xl font-semibold text-white transition-all hover:opacity-90 active:scale-[0.99] disabled:opacity-50"
                style={{ backgroundColor: isInCart(product.id) ? "#1B5E20" : "#2E7D32" }}
              >
                <ShoppingCart size={18} />
                {product.stockQty === 0 ? "Out of Stock" : isInCart(product.id) ? "Add More to Cart" : "Add to Cart"}
              </button>

              <button
                onClick={() => {
                  toggleWishlist(product);
                  if (!isInWishlist(product.id)) {
                    toast.success("Added to wishlist ❤️");
                  }
                }}
                className="w-14 h-[52px] flex items-center justify-center rounded-xl border transition-all"
                style={{ 
                  borderColor: isInWishlist(product.id) ? "#E53935" : "#D1E8D1",
                  backgroundColor: isInWishlist(product.id) ? "#FFEBEE" : "#FFFFFF" 
                }}
              >
                <Heart size={20} fill={isInWishlist(product.id) ? "#E53935" : "transparent"} color={isInWishlist(product.id) ? "#E53935" : "#607D8B"} />
              </button>
            </div>

            <div className="flex items-center gap-2 text-sm" style={{ color: "#90A4AE" }}>
              <Shield size={14} />
              30-day returns · Free carbon-neutral shipping over ₹2000
            </div>
          </div>
        </div>

        {/* Reviews */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-6" style={{ color: "#263238" }}>Customer Reviews</h2>
          {reviews.length === 0 ? (
            <div className="rounded-2xl p-10 text-center" style={{ backgroundColor: "#FFFFFF", boxShadow: "0 2px 12px rgba(46,125,50,0.07)" }}>
              <p style={{ color: "#90A4AE" }}>No reviews yet. Be the first to review this product!</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {reviews.map((review) => (
                <div key={review.id} className="rounded-2xl p-5" style={{ backgroundColor: "#FFFFFF", boxShadow: "0 2px 12px rgba(46,125,50,0.07)" }}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold" style={{ backgroundColor: "#E8F5E9", color: "#2E7D32" }}>
                        {(review.profiles?.display_name ?? "A")[0].toUpperCase()}
                      </div>
                      <span className="font-medium text-sm" style={{ color: "#263238" }}>
                        {review.profiles?.display_name ?? "Anonymous"}
                      </span>
                    </div>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star key={i} size={12} fill={i <= review.rating ? "#66BB6A" : "transparent"} color={i <= review.rating ? "#66BB6A" : "#D1E8D1"} strokeWidth={2} />
                      ))}
                    </div>
                  </div>
                  {review.body && <p className="text-sm" style={{ color: "#607D8B" }}>{review.body}</p>}
                  <p className="text-xs mt-2" style={{ color: "#B0BEC5" }}>
                    {new Date(review.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Related */}
        {relatedFiltered.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-6" style={{ color: "#263238" }}>You May Also Like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {relatedFiltered.map((p) => (
                <Link key={p.id} to={`/product/${p.id}`} className="no-underline group">
                  <div className="rounded-2xl overflow-hidden transition-all hover:-translate-y-1 hover:shadow-lg" style={{ backgroundColor: "#FFFFFF", boxShadow: "0 2px 16px rgba(46,125,50,0.08)", border: "1px solid #E8F5E9" }}>
                    <div style={{ height: "160px" }} className="overflow-hidden">
                      <ImageWithFallback src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    </div>
                    <div className="p-4">
                      <p className="font-semibold text-sm mb-1" style={{ color: "#263238" }}>{p.name}</p>
                      <p className="text-sm font-bold" style={{ color: "#2E7D32" }}>{formatPrice(p.price)}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
