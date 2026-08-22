import { useState } from "react";
import { Link } from "react-router";
import { Heart, ShoppingCart, Trash2, Leaf, Star } from "lucide-react";
import { Navbar } from "../components/Navbar";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { useWishlist } from "@/hooks/useWishlist";
import { formatPrice } from "@/lib/currency";

export function WishlistPage() {
  const { wishlist, removeFromWishlist } = useWishlist();
  const [addedToCart, setAddedToCart] = useState<Set<string>>(new Set());
  const [notification, setNotification] = useState<string | null>(null);

  const handleAddToCart = (id: string, name: string) => {
    setAddedToCart((prev) => new Set(prev).add(id));
    setNotification(`${name} added to cart!`);
    setTimeout(() => setNotification(null), 2500);
  };

  const totalCo2 = wishlist
    .reduce((sum, p) => sum + parseFloat(p.carbonFootprint), 0)
    .toFixed(1);

  return (
    <div style={{ backgroundColor: "#F5F7F5", minHeight: "100vh" }}>
      <Navbar />

      {/* Toast notification */}
      {notification && (
        <div
          className="fixed top-20 right-6 z-50 px-5 py-3 rounded-xl shadow-lg flex items-center gap-2 transition-all"
          style={{ backgroundColor: "#2E7D32", color: "#FFFFFF" }}
        >
          <ShoppingCart size={16} />
          {notification}
        </div>
      )}

      <div className="max-w-[1440px] mx-auto px-8 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-1" style={{ color: "#263238" }}>
              My Wishlist
            </h1>
            <p style={{ color: "#607D8B" }}>
              {wishlist.length} saved items · {totalCo2}kg CO₂ if you bought them all sustainably
            </p>
          </div>
          {wishlist.length > 0 && (
            <Link
              to="/checkout"
              className="px-5 py-2.5 rounded-xl font-semibold text-sm no-underline transition-all hover:opacity-90 flex items-center gap-2"
              style={{ backgroundColor: "#2E7D32", color: "#FFFFFF" }}
            >
              <ShoppingCart size={16} />
              Add All to Cart
            </Link>
          )}
        </div>

        {/* Summary Bar */}
        {wishlist.length > 0 && (
          <div
            className="rounded-2xl p-5 mb-8 flex items-center justify-between flex-wrap gap-4"
            style={{
              backgroundColor: "#FFFFFF",
              boxShadow: "0 2px 16px rgba(46,125,50,0.08)",
              border: "1px solid #E8F5E9",
            }}
          >
            {[
              { label: "Saved Items", value: String(wishlist.length), icon: "❤️" },
              {
                label: "Total Value",
                value: formatPrice(wishlist.reduce((s, p) => s + p.price, 0)),
                icon: "💰",
              },
              { label: "Avg Eco Score", value: `${(wishlist.reduce((s, p) => s + p.ecoScore, 0) / wishlist.length).toFixed(1)} / 10`, icon: "🍃" },
              { label: "CO₂ Footprint (all)", value: `${totalCo2}kg`, icon: "🌍" },
            ].map((stat) => (
              <div key={stat.label} className="flex items-center gap-3">
                <span className="text-2xl">{stat.icon}</span>
                <div>
                  <p className="text-xs" style={{ color: "#90A4AE" }}>
                    {stat.label}
                  </p>
                  <p className="font-bold" style={{ color: "#263238" }}>
                    {stat.value}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {wishlist.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center mb-6"
              style={{ backgroundColor: "#E8F5E9" }}
            >
              <Heart size={40} style={{ color: "#2E7D32" }} />
            </div>
            <h2 className="text-xl font-bold mb-2" style={{ color: "#263238" }}>
              Your wishlist is empty
            </h2>
            <p className="mb-6" style={{ color: "#90A4AE" }}>
              Start saving eco-friendly products you love!
            </p>
            <Link
              to="/shop"
              className="px-6 py-3 rounded-xl font-semibold no-underline transition-all hover:opacity-90"
              style={{ backgroundColor: "#2E7D32", color: "#FFFFFF" }}
            >
              Browse Shop
            </Link>
          </div>
        )}

        {/* Product Grid */}
        {wishlist.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlist.map((product) => {
              const inCart = addedToCart.has(product.id);
              return (
                <div
                  key={product.id}
                  className="rounded-2xl overflow-hidden group"
                  style={{
                    backgroundColor: "#FFFFFF",
                    boxShadow: "0 2px 16px rgba(46,125,50,0.08)",
                    border: "1px solid #E8F5E9",
                  }}
                >
                  {/* Image */}
                  <div className="relative overflow-hidden" style={{ height: 220 }}>
                    <Link to={`/product/${product.id}`}>
                      <ImageWithFallback
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        style={{ height: 220 }}
                      />
                    </Link>
                    {/* Remove button */}
                    <button
                      onClick={() => removeFromWishlist(product.id)}
                      className="absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110 shadow-md"
                      style={{ backgroundColor: "#FFFFFF" }}
                      title="Remove from wishlist"
                    >
                      <Heart size={16} fill="#EF5350" color="#EF5350" />
                    </button>
                    {/* Badge */}
                    <span
                      className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-semibold"
                      style={{ backgroundColor: "#E8F5E9", color: "#2E7D32" }}
                    >
                      🍃 {product.badge}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="p-5">
                    <Link
                      to={`/product/${product.id}`}
                      className="no-underline"
                    >
                      <h3
                        className="font-bold mb-1 hover:underline"
                        style={{ color: "#263238" }}
                      >
                        {product.name}
                      </h3>
                    </Link>
                    <p className="text-sm mb-3" style={{ color: "#90A4AE" }}>
                      {product.category}
                    </p>

                    {/* Eco Score & Carbon */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex items-center gap-1">
                        <Star size={13} fill="#66BB6A" color="#66BB6A" />
                        <span className="text-xs font-semibold" style={{ color: "#2E7D32" }}>
                          {product.ecoScore}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Leaf size={13} style={{ color: "#66BB6A" }} />
                        <span className="text-xs" style={{ color: "#607D8B" }}>
                          {product.carbonFootprint}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold" style={{ color: "#2E7D32" }}>
                        {formatPrice(product.price)}
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => removeFromWishlist(product.id)}
                          className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:scale-110"
                          style={{ backgroundColor: "#FFF3F3" }}
                          title="Remove"
                        >
                          <Trash2 size={15} color="#EF5350" />
                        </button>
                        <button
                          onClick={() => handleAddToCart(product.id, product.name)}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
                          style={{
                            backgroundColor: inCart ? "#E8F5E9" : "#2E7D32",
                            color: inCart ? "#2E7D32" : "#FFFFFF",
                          }}
                        >
                          <ShoppingCart size={14} />
                          {inCart ? "Added!" : "Add to Cart"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Keep Shopping */}
        {wishlist.length > 0 && (
          <div className="text-center mt-10">
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold no-underline transition-all hover:opacity-80"
              style={{ backgroundColor: "#E8F5E9", color: "#2E7D32" }}
            >
              <Leaf size={16} />
              Continue Shopping
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
