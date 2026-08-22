import { lazy, createElement } from "react";
import { createBrowserRouter } from "react-router";
import { RouteObject } from "react-router";
import { Root } from "./Root";
import { AuthGuard } from "./components/AuthGuard";

// Buyer Pages
const LoginPage = lazy(() => import("./pages/LoginPage").then((m) => ({ default: m.LoginPage })));
const SignUpPage = lazy(() => import("./pages/SignUpPage").then((m) => ({ default: m.SignUpPage })));
const HomePage = lazy(() => import("./pages/HomePage").then((m) => ({ default: m.HomePage })));
const ShopPage = lazy(() => import("./pages/ShopPage").then((m) => ({ default: m.ShopPage })));
const ProductDetailPage = lazy(() => import("./pages/ProductDetailPage").then((m) => ({ default: m.ProductDetailPage })));
const CheckoutPage = lazy(() => import("./pages/CheckoutPage").then((m) => ({ default: m.CheckoutPage })));
const PaymentPage = lazy(() => import("./pages/PaymentPage").then((m) => ({ default: m.PaymentPage })));
const OrdersPage = lazy(() => import("./pages/OrdersPage").then((m) => ({ default: m.OrdersPage })));
const DashboardPage = lazy(() => import("./pages/DashboardPage").then((m) => ({ default: m.DashboardPage })));
const WishlistPage = lazy(() => import("./pages/WishlistPage").then((m) => ({ default: m.WishlistPage })));
const AboutPage = lazy(() => import("./pages/AboutPage").then((m) => ({ default: m.AboutPage })));
const ForbiddenPage = lazy(() => import("./pages/ForbiddenPage").then((m) => ({ default: m.ForbiddenPage })));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage").then((m) => ({ default: m.NotFoundPage })));

// Seller Pages
const SellerOnboardingPage = lazy(() => import("./pages/seller/SellerOnboardingPage").then((m) => ({ default: m.SellerOnboardingPage })));
const SellerDashboardPage = lazy(() => import("./pages/seller/SellerDashboardPage").then((m) => ({ default: m.SellerDashboardPage })));
const SellerProductsPage = lazy(() => import("./pages/seller/SellerProductsPage").then((m) => ({ default: m.SellerProductsPage })));
const SellerOrdersPage = lazy(() => import("./pages/seller/SellerOrdersPage").then((m) => ({ default: m.SellerOrdersPage })));
const SellerStorePage = lazy(() => import("./pages/seller/SellerStorePage").then((m) => ({ default: m.SellerStorePage })));

// Admin Pages
const AdminUsersPage = lazy(() => import("./pages/admin/AdminUsersPage").then((m) => ({ default: m.AdminUsersPage })));
const AdminListingsPage = lazy(() => import("./pages/admin/AdminListingsPage").then((m) => ({ default: m.AdminListingsPage })));
const AdminAnalyticsPage = lazy(() => import("./pages/admin/AdminAnalyticsPage").then((m) => ({ default: m.AdminAnalyticsPage })));
const AdminCategoriesPage = lazy(() => import("./pages/admin/AdminCategoriesPage").then((m) => ({ default: m.AdminCategoriesPage })));

// Helper to create AuthGuard with allowedRoles without JSX in .ts file
function SellerGuard() {
  return createElement(AuthGuard, { allowedRoles: ["seller", "admin"] });
}
function AdminGuardComponent() {
  return createElement(AuthGuard, { allowedRoles: ["admin"] });
}

export const routes: RouteObject[] = [
  {
    Component: Root,
    children: [
      // Public routes
      { index: true, Component: LoginPage },
      { path: "/signup", Component: SignUpPage },
      { path: "/forbidden", Component: ForbiddenPage },

      // Generic authenticated routes (any role)
      {
        Component: AuthGuard,
        children: [
          { path: "/home", Component: HomePage },
          { path: "/shop", Component: ShopPage },
          { path: "/product/:id", Component: ProductDetailPage },
          { path: "/checkout", Component: CheckoutPage },
          { path: "/payment", Component: PaymentPage },
          { path: "/orders", Component: OrdersPage },
          { path: "/dashboard", Component: DashboardPage },
          { path: "/wishlist", Component: WishlistPage },
          { path: "/about", Component: AboutPage },
        ],
      },

      // Seller + Admin routes
      {
        path: "/seller",
        Component: SellerGuard,
        children: [
          { path: "onboarding", Component: SellerOnboardingPage },
          { path: "dashboard", Component: SellerDashboardPage },
          { path: "products", Component: SellerProductsPage },
          { path: "orders", Component: SellerOrdersPage },
          { path: "store", Component: SellerStorePage },
        ],
      },

      // Admin-only routes
      {
        path: "/admin",
        Component: AdminGuardComponent,
        children: [
          { path: "users", Component: AdminUsersPage },
          { path: "listings", Component: AdminListingsPage },
          { path: "analytics", Component: AdminAnalyticsPage },
          { path: "categories", Component: AdminCategoriesPage },
        ],
      },

      // Catch-all 404
      { path: "*", Component: NotFoundPage },
    ],
  },
];

export const router = createBrowserRouter(routes);
