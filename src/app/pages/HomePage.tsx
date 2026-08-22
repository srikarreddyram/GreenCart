import { Link } from "react-router";
import { Leaf, ArrowRight, Star, Award, Wind, Truck, Recycle, Loader2 } from "lucide-react";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { useProducts } from "@/hooks/useProducts";
import { useCartContext } from "@/contexts/CartContext";
import { toast } from "sonner";
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

const FEATURES = [
  { icon: Award, title: "Eco Certified Products", desc: "Every product meets our strict environmental standards and certifications." },
  { icon: Wind, title: "Carbon Footprint Transparency", desc: "See the exact CO₂ impact of every product before you buy." },
  { icon: Truck, title: "Green Delivery Options", desc: "Choose electric vehicle or carbon-neutral shipping at checkout." },
  { icon: Recycle, title: "Sustainability Rewards", desc: "Earn Eco Points on every green purchase and redeem for discounts." },
];

export function HomePage() {
  const { products, loading } = useProducts({ limit: 4 });
  const { addItem } = useCartContext();

  return (
    <div style={{ backgroundColor: "#F5F7F5" }}>
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden" style={{ backgroundColor: "#2E7D32", minHeight: "520px" }}>
        <div className="absolute inset-0 opacity-15">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1673044625980-7fa420a5207e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1440"
            alt="Green forest"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute top-[-80px] right-[-80px] w-[360px] h-[360px] rounded-full opacity-10" style={{ backgroundColor: "#66BB6A" }} />
        <div className="absolute bottom-[-60px] left-[-60px] w-[280px] h-[280px] rounded-full opacity-10" style={{ backgroundColor: "#A5D6A7" }} />

        <div className="relative z-10 max-w-[1440px] mx-auto px-8 py-24 flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6" style={{ backgroundColor: "rgba(255,255,255,0.15)", color: "#FFFFFF" }}>
              <Leaf size={14} />
              Sustainable Shopping Platform
            </div>
            <h1 className="text-5xl font-bold text-white mb-5 leading-tight">
              Shop Sustainably.<br />Live Responsibly.
            </h1>
            <p className="text-white/80 text-xl mb-10 max-w-lg">
              Discover eco-friendly products that reduce environmental impact and support a healthier planet.
            </p>
            <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
              <Link to="/shop" className="px-8 py-4 rounded-xl font-semibold text-base no-underline transition-all hover:opacity-90 active:scale-[0.98]" style={{ backgroundColor: "#FFFFFF", color: "#2E7D32" }}>
                Explore Products
              </Link>
              <Link to="/dashboard" className="px-8 py-4 rounded-xl font-semibold text-base no-underline transition-all hover:bg-white/10" style={{ backgroundColor: "rgba(255,255,255,0.12)", color: "#FFFFFF", border: "1px solid rgba(255,255,255,0.3)" }}>
                My Impact Dashboard
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 lg:w-[320px]">
            {[
              { val: `${loading ? "…" : products.length}+`, label: "Eco Products" },
              { val: "50K+", label: "Green Shoppers" },
              { val: "12 tons", label: "CO₂ Saved" },
            ].map((s) => (
              <div key={s.label} className="rounded-2xl p-4 text-center" style={{ backgroundColor: "rgba(255,255,255,0.12)" }}>
                <p className="text-2xl font-bold text-white">{s.val}</p>
                <p className="text-white/70 text-xs mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-[1440px] mx-auto px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3" style={{ color: "#263238" }}>Why GreenCart?</h2>
          <p className="text-base" style={{ color: "#607D8B" }}>Everything you need to shop with purpose and impact.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map((f) => (
            <div key={f.title} className="rounded-2xl p-6 flex flex-col items-start gap-4 transition-all hover:-translate-y-1" style={{ backgroundColor: "#FFFFFF", boxShadow: "0 2px 16px rgba(46,125,50,0.08)" }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#E8F5E9" }}>
                <f.icon size={24} color="#2E7D32" strokeWidth={1.8} />
              </div>
              <div>
                <h3 className="font-semibold mb-1.5" style={{ color: "#263238" }}>{f.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "#607D8B" }}>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20" style={{ backgroundColor: "#FFFFFF" }}>
        <div className="max-w-[1440px] mx-auto px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold mb-2" style={{ color: "#263238" }}>Featured Sustainable Products</h2>
              <p className="text-base" style={{ color: "#607D8B" }}>Hand-picked eco-friendly products with verified sustainability credentials.</p>
            </div>
            <Link to="/shop" className="flex items-center gap-2 font-semibold no-underline hover:gap-3 transition-all" style={{ color: "#2E7D32" }}>
              View All <ArrowRight size={16} />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="rounded-2xl overflow-hidden animate-pulse" style={{ backgroundColor: "#F5F7F5", boxShadow: "0 2px 16px rgba(46,125,50,0.08)" }}>
                  <div style={{ height: "200px", backgroundColor: "#E8F5E9" }} />
                  <div className="p-4 space-y-2">
                    <div className="h-4 rounded" style={{ backgroundColor: "#E8F5E9", width: "75%" }} />
                    <div className="h-3 rounded" style={{ backgroundColor: "#E8F5E9", width: "55%" }} />
                    <div className="h-3 rounded" style={{ backgroundColor: "#E8F5E9", width: "45%" }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <Link key={product.id} to={`/product/${product.id}`} className="no-underline group">
                  <div className="rounded-2xl overflow-hidden transition-all hover:-translate-y-1 hover:shadow-lg" style={{ backgroundColor: "#FFFFFF", boxShadow: "0 2px 16px rgba(46,125,50,0.08)", border: "1px solid #E8F5E9" }}>
                    <div className="relative overflow-hidden" style={{ height: "200px" }}>
                      <ImageWithFallback
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: "#E8F5E9", color: "#2E7D32" }}>
                        🌿 {product.badge}
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold mb-2 text-sm" style={{ color: "#263238" }}>{product.name}</h3>
                      <EcoScoreStars score={product.ecoScore} />
                      <div className="flex items-center justify-between mt-3">
                        <div>
                          <p className="font-bold text-lg" style={{ color: "#263238" }}>{formatPrice(product.price)}</p>
                          <p className="text-xs" style={{ color: "#66BB6A" }}>🍃 {product.carbonFootprint}</p>
                        </div>
                        <button
                          onClick={(e) => { e.preventDefault(); addItem(product, 1); toast.success(`${product.name} added! 🛒`); }}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-all hover:opacity-90"
                          style={{ backgroundColor: "#2E7D32" }}
                        >
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-[1440px] mx-auto px-8 py-16">
        <div className="rounded-3xl px-10 py-14 flex flex-col lg:flex-row items-center justify-between gap-8" style={{ backgroundColor: "#2E7D32" }}>
          <div>
            <h2 className="text-3xl font-bold text-white mb-3">Ready to Make a Difference?</h2>
            <p className="text-white/75 text-lg">Join 50,000+ eco-conscious shoppers already using GreenCart.</p>
          </div>
          <Link to="/shop" className="px-10 py-4 rounded-xl font-bold text-base no-underline transition-all hover:opacity-90 whitespace-nowrap" style={{ backgroundColor: "#FFFFFF", color: "#2E7D32" }}>
            Start Shopping Green →
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
