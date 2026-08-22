import { Suspense } from "react";
import { Outlet } from "react-router";
import { Toaster } from "sonner";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { PageLoader } from "./components/PageLoader";

export function Root() {
  return (
    <AuthProvider>
      <CartProvider>
        <div style={{ backgroundColor: "#F5F7F5", fontFamily: "'Inter', sans-serif" }} className="min-h-screen">
          {/* Every route component is React.lazy, so a boundary is required here. */}
          <Suspense fallback={<PageLoader />}>
            <Outlet />
          </Suspense>
        </div>
        <Toaster
          position="top-right"
          expand={false}
          richColors
          toastOptions={{
            style: {
              borderRadius: "12px",
              fontFamily: "'Inter', sans-serif",
            },
          }}
        />
      </CartProvider>
    </AuthProvider>
  );
}
