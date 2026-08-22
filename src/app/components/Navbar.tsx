import { Link, useLocation, useNavigate } from "react-router";
import { ShoppingCart, Leaf, User, LogOut, ChevronDown, Store, LayoutDashboard, Package, Menu, X, Heart } from "lucide-react";
import { useState } from "react";
import { useCartContext } from "@/contexts/CartContext";
import { useAuthContext } from "@/contexts/AuthContext";
import { useWishlist } from "@/hooks/useWishlist";
import { toast } from "sonner";

export function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [hovered, setHovered] = useState<string | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const { totalItems } = useCartContext();
  const { profile, role, isAuthenticated, signOut } = useAuthContext();
  const { wishlist } = useWishlist();

  const links = [
    { label: "Home", path: "/home" },
    { label: "Shop", path: "/shop" },
    { label: "Wishlist", path: "/wishlist" },
    { label: "Orders", path: "/orders" },
    { label: "About", path: "/about" },
  ];

  const isActive = (path: string) => location.pathname === path;

  const handleSignOut = async () => {
    await signOut();
    setUserMenuOpen(false);
    toast.success("Signed out successfully");
    navigate("/");
  };

  const roleColor = role === "seller" ? "#1565C0" : role === "admin" ? "#6A1B9A" : "#2E7D32";
  const roleBg = role === "seller" ? "#E3F2FD" : role === "admin" ? "#F3E5F5" : "#E8F5E9";

  return (
    <nav
      style={{
        backgroundColor: "#FFFFFF",
        borderBottom: "1px solid #E8F0E8",
        boxShadow: "0 1px 4px rgba(46,125,50,0.06)",
      }}
      className="sticky top-0 z-50"
    >
      <div className="max-w-[1440px] mx-auto px-6 flex items-center justify-between h-16">
        {/* Logo */}
        <Link to="/home" className="flex items-center gap-2 no-underline flex-shrink-0">
          <div
            style={{ backgroundColor: "#2E7D32" }}
            className="w-8 h-8 rounded-lg flex items-center justify-center"
          >
            <Leaf size={17} color="#FFFFFF" strokeWidth={2.5} />
          </div>
          <span style={{ color: "#2E7D32" }} className="text-xl font-bold tracking-tight">
            GreenCart
          </span>
          {role && role !== "buyer" && (
            <span
              className="text-xs font-semibold px-2 py-0.5 rounded-full"
              style={{ backgroundColor: roleBg, color: roleColor }}
            >
              {role === "seller" ? "Seller" : "Admin"}
            </span>
          )}
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden lg:flex items-center gap-1">
          {links.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onMouseEnter={() => setHovered(link.path)}
              onMouseLeave={() => setHovered(null)}
              style={{
                color: isActive(link.path) ? "#2E7D32" : hovered === link.path ? "#2E7D32" : "#263238",
                backgroundColor: isActive(link.path) ? "#E8F5E9" : hovered === link.path ? "#F1F8F1" : "transparent",
                textDecoration: "none",
                transition: "all 0.15s",
              }}
              className="px-4 py-2 rounded-lg text-sm font-medium"
            >
              {link.label}
            </Link>
          ))}

          {/* Role-specific quick links */}
          {role === "seller" && (
            <Link
              to="/seller/dashboard"
              className="px-4 py-2 rounded-lg text-sm font-medium no-underline transition-all"
              style={{ color: "#1565C0", backgroundColor: isActive("/seller/dashboard") ? "#E3F2FD" : "transparent" }}
            >
              Seller Portal
            </Link>
          )}
          {role === "admin" && (
            <Link
              to="/admin/users"
              className="px-4 py-2 rounded-lg text-sm font-medium no-underline transition-all"
              style={{ color: "#6A1B9A", backgroundColor: isActive("/admin/users") ? "#F3E5F5" : "transparent" }}
            >
              Admin Panel
            </Link>
          )}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Wishlist */}
          <Link to="/wishlist" className="relative no-underline">
            <div
              style={{ color: "#263238" }}
              className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors relative"
            >
              <Heart size={21} />
              {wishlist.length > 0 && (
                <span
                  style={{ backgroundColor: "#E53935", color: "#FFFFFF" }}
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs flex items-center justify-center font-bold"
                >
                  {wishlist.length > 9 ? "9+" : wishlist.length}
                </span>
              )}
            </div>
          </Link>

          {/* Cart */}
          <Link to="/checkout" className="relative no-underline">
            <div
              style={{ color: "#263238" }}
              className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors relative"
            >
              <ShoppingCart size={21} />
              {totalItems > 0 && (
                <span
                  style={{ backgroundColor: "#2E7D32", color: "#FFFFFF" }}
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs flex items-center justify-center font-bold"
                >
                  {totalItems > 9 ? "9+" : totalItems}
                </span>
              )}
            </div>
          </Link>

          {/* User menu */}
          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl transition-all hover:bg-gray-50 outline-none"
                style={{ color: "#263238" }}
              >
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ backgroundColor: roleBg, color: roleColor }}
                >
                  {profile?.display_name?.charAt(0).toUpperCase() ?? "U"}
                </div>
                <span className="text-sm font-medium hidden sm:block max-w-[100px] truncate">
                  {profile?.display_name ?? "Account"}
                </span>
                <ChevronDown size={14} className={`transition-transform ${userMenuOpen ? "rotate-180" : ""}`} />
              </button>

              {userMenuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                  <div
                    className="absolute right-0 top-full mt-2 w-52 rounded-2xl py-2 z-20 shadow-xl"
                    style={{
                      backgroundColor: "#FFFFFF",
                      border: "1px solid #E8F5E9",
                      boxShadow: "0 8px 32px rgba(46,125,50,0.12)",
                    }}
                  >
                    <div className="px-4 py-3 border-b" style={{ borderColor: "#E8F5E9" }}>
                      <p className="font-semibold text-sm" style={{ color: "#263238" }}>
                        {profile?.display_name}
                      </p>
                      <p className="text-xs" style={{ color: "#90A4AE" }}>
                        {role} account
                      </p>
                    </div>

                    {[
                      { icon: LayoutDashboard, label: "Dashboard", to: "/dashboard" },
                      { icon: Package, label: "My Orders", to: "/orders" },
                      ...(role === "seller"
                        ? [{ icon: Store, label: "Seller Portal", to: "/seller/dashboard" }]
                        : []),
                      ...(role === "admin"
                        ? [{ icon: User, label: "Admin Panel", to: "/admin/users" }]
                        : []),
                    ].map((item) => (
                      <Link
                        key={item.label}
                        to={item.to}
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm no-underline transition-colors hover:bg-gray-50"
                        style={{ color: "#263238" }}
                      >
                        <item.icon size={15} style={{ color: "#607D8B" }} />
                        {item.label}
                      </Link>
                    ))}

                    <div className="border-t mt-1 pt-1" style={{ borderColor: "#E8F5E9" }}>
                      <button
                        onClick={handleSignOut}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm w-full text-left transition-colors hover:bg-red-50"
                        style={{ color: "#D32F2F" }}
                      >
                        <LogOut size={15} />
                        Sign Out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Link
              to="/"
              className="px-4 py-2 rounded-xl text-sm font-semibold no-underline transition-all hover:opacity-90"
              style={{ backgroundColor: "#2E7D32", color: "#FFFFFF" }}
            >
              Sign In
            </Link>
          )}

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden w-10 h-10 flex items-center justify-center rounded-lg"
            style={{ color: "#263238" }}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div
          className="lg:hidden border-t px-6 py-4 flex flex-col gap-1"
          style={{ borderColor: "#E8F0E8", backgroundColor: "#FFFFFF" }}
        >
          {links.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileOpen(false)}
              className="px-4 py-3 rounded-xl text-sm font-medium no-underline"
              style={{
                color: isActive(link.path) ? "#2E7D32" : "#263238",
                backgroundColor: isActive(link.path) ? "#E8F5E9" : "transparent",
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}