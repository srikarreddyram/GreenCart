import { Link } from "react-router";
import { Leaf, ArrowLeft, Search } from "lucide-react";

export function NotFoundPage() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
      style={{ backgroundColor: "#F5F7F5" }}
    >
      {/* Logo */}
      <Link to="/home" className="flex items-center gap-2 no-underline mb-12">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: "#2E7D32" }}
        >
          <Leaf size={19} color="#FFFFFF" strokeWidth={2.5} />
        </div>
        <span className="text-xl font-bold" style={{ color: "#2E7D32" }}>
          GreenCart
        </span>
      </Link>

      {/* 404 visual */}
      <div
        className="w-32 h-32 rounded-3xl flex items-center justify-center mb-8"
        style={{ backgroundColor: "#E8F5E9" }}
      >
        <Search size={56} color="#A5D6A7" strokeWidth={1.5} />
      </div>

      <h1 className="text-7xl font-bold mb-4" style={{ color: "#2E7D32" }}>
        404
      </h1>
      <h2 className="text-2xl font-bold mb-3" style={{ color: "#263238" }}>
        Page Not Found
      </h2>
      <p className="text-base max-w-md mb-10" style={{ color: "#607D8B" }}>
        Looks like this page composted itself. The URL you're looking for
        doesn't exist, or may have been moved.
      </p>

      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          to="/home"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white no-underline transition-all hover:opacity-90"
          style={{ backgroundColor: "#2E7D32" }}
        >
          <ArrowLeft size={16} /> Go Home
        </Link>
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold no-underline transition-all hover:opacity-90"
          style={{ backgroundColor: "#E8F5E9", color: "#2E7D32" }}
        >
          🌿 Browse Products
        </Link>
      </div>

      <p className="mt-12 text-sm" style={{ color: "#B0BEC5" }}>
        🌍 Carbon-neutral · Every product eco-verified
      </p>
    </div>
  );
}
