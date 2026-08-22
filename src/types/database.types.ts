// Auto-generated types mirroring the DB schema from Architecture.md
// In production, regenerate with: npx supabase gen types typescript --linked > src/types/database.types.ts

export type UserRole = "buyer" | "seller" | "admin";

export type ProductStatus = "draft" | "active" | "out_of_stock" | "archived";

export type OrderStatus = "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";

export type ItemStatus = "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";

export type Profile = {
  id: string;
  role: UserRole;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

export type Store = {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  banner_url: string | null;
  is_active: boolean;
  created_at: string;
}

export type Category = {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  icon_url: string | null;
}

export type Product = {
  id: string;
  store_id: string;
  category_id: string | null;
  title: string;
  description: string | null;
  price: number;
  compare_price: number | null;
  sku: string | null;
  stock_qty: number;
  status: ProductStatus;
  tags: string[] | null;
  rating_avg: number;
  rating_count: number;
  created_at: string;
  updated_at: string;
}

export type ProductImage = {
  id: string;
  product_id: string;
  storage_path: string;
  position: number;
  is_primary: boolean;
}

export type ProductVariant = {
  id: string;
  product_id: string;
  name: string;
  value: string;
  price_delta: number;
  stock_qty: number;
}

export type CartItem = {
  id: string;
  buyer_id: string;
  product_id: string;
  variant_id: string | null;
  quantity: number;
  added_at: string;
}

export type Order = {
  id: string;
  buyer_id: string;
  status: OrderStatus;
  total_amount: number;
  shipping_name: string;
  shipping_address: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string;
  store_id: string;
  variant_id: string | null;
  quantity: number;
  unit_price: number;
  item_status: ItemStatus;
}

export type Review = {
  id: string;
  product_id: string;
  buyer_id: string;
  rating: number;
  body: string | null;
  created_at: string;
}

export type AuditLog = {
  id: string;
  actor_id: string | null;
  action: string;
  target_type: string | null;
  target_id: string | null;
  payload: Record<string, unknown> | null;
  created_at: string;
}

// Supabase Database type wrapper.
//
// supabase-js's `GenericSchema` constraint requires `Views`, `Functions` and a
// `Relationships` entry on every table. Omitting them makes each table silently
// resolve to `never`, which strips the types off every query in the app — so the
// foreign keys below mirror supabase_structure.sql exactly. Regenerate with:
//   npx supabase gen types typescript --linked > src/types/database.types.ts
type FK<Name extends string, Col extends string, Rel extends string> = {
  foreignKeyName: Name;
  columns: [Col];
  isOneToOne: false;
  referencedRelation: Rel;
  referencedColumns: ["id"];
};

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Profile>;
        Update: Partial<Profile>;
        Relationships: [];
      };
      categories: {
        Row: Category;
        Insert: Partial<Category>;
        Update: Partial<Category>;
        Relationships: [FK<"categories_parent_id_fkey", "parent_id", "categories">];
      };
      stores: {
        Row: Store;
        Insert: Partial<Store>;
        Update: Partial<Store>;
        Relationships: [FK<"stores_owner_id_fkey", "owner_id", "profiles">];
      };
      products: {
        Row: Product;
        Insert: Partial<Product>;
        Update: Partial<Product>;
        Relationships: [
          FK<"products_store_id_fkey", "store_id", "stores">,
          FK<"products_category_id_fkey", "category_id", "categories">,
        ];
      };
      product_images: {
        Row: ProductImage;
        Insert: Partial<ProductImage>;
        Update: Partial<ProductImage>;
        Relationships: [FK<"product_images_product_id_fkey", "product_id", "products">];
      };
      product_variants: {
        Row: ProductVariant;
        Insert: Partial<ProductVariant>;
        Update: Partial<ProductVariant>;
        Relationships: [FK<"product_variants_product_id_fkey", "product_id", "products">];
      };
      cart_items: {
        Row: CartItem;
        Insert: Partial<CartItem>;
        Update: Partial<CartItem>;
        Relationships: [
          FK<"cart_items_buyer_id_fkey", "buyer_id", "profiles">,
          FK<"cart_items_product_id_fkey", "product_id", "products">,
          FK<"cart_items_variant_id_fkey", "variant_id", "product_variants">,
        ];
      };
      orders: {
        Row: Order;
        Insert: Partial<Order>;
        Update: Partial<Order>;
        Relationships: [FK<"orders_buyer_id_fkey", "buyer_id", "profiles">];
      };
      order_items: {
        Row: OrderItem;
        Insert: Partial<OrderItem>;
        Update: Partial<OrderItem>;
        Relationships: [
          FK<"order_items_order_id_fkey", "order_id", "orders">,
          FK<"order_items_product_id_fkey", "product_id", "products">,
          FK<"order_items_store_id_fkey", "store_id", "stores">,
          FK<"order_items_variant_id_fkey", "variant_id", "product_variants">,
        ];
      };
      reviews: {
        Row: Review;
        Insert: Partial<Review>;
        Update: Partial<Review>;
        Relationships: [
          FK<"reviews_product_id_fkey", "product_id", "products">,
          FK<"reviews_buyer_id_fkey", "buyer_id", "profiles">,
        ];
      };
      audit_logs: {
        Row: AuditLog;
        Insert: Partial<AuditLog>;
        Update: Partial<AuditLog>;
        Relationships: [FK<"audit_logs_actor_id_fkey", "actor_id", "profiles">];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_role: UserRole;
      product_status: ProductStatus;
      order_status: OrderStatus;
      item_status: ItemStatus;
    };
    CompositeTypes: Record<string, never>;
  };
}
