import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import type { ProductStatus } from "@/types/database.types";

// Unified product shape used throughout the UI
export interface Product {
  id: string;
  name: string;
  price: number;
  comparePrice: number | null;
  ecoScore: number;
  carbonFootprint: string;
  image: string;
  badge: string;
  category: string;
  categoryId: string | null;
  material: string;
  waterUsage: string;
  certification: string;
  description: string;
  tags: string[];
  stockQty: number;
  status: ProductStatus;
  sku: string | null;
  ratingAvg: number;
  ratingCount: number;
  storeId: string;
  storeName?: string;
}

// Map eco score to carbon footprint estimate
function estimateCarbon(score: number): string {
  if (score >= 9.5) return "0.3kg CO₂";
  if (score >= 9.0) return "1.0kg CO₂";
  if (score >= 8.5) return "2kg CO₂";
  if (score >= 8.0) return "3kg CO₂";
  return "5kg CO₂";
}

// Map eco score to badge
function getBadge(tags: string[]): string {
  if (tags.includes("Certified Green")) return "Certified Green";
  if (tags.includes("Plastic Free")) return "Plastic Free";
  if (tags.includes("Recycled Materials")) return "Recycled Materials";
  if (tags.includes("Eco Friendly Manufacturing")) return "Eco Certified";
  return "Eco Friendly";
}

// Map category UUID to material/water/certification info
const CATEGORY_META: Record<string, { material: string; waterUsage: string; certification: string }> = {
  // UUIDs match seed SQL fixed values
  "aaaaaaaa-0001-0001-0001-000000000001": { material: "Organic Cotton",           waterUsage: "Low",      certification: "GOTS Certified" },
  "aaaaaaaa-0001-0001-0001-000000000002": { material: "Natural Ingredients",      waterUsage: "Very Low", certification: "Certified Green" },
  "aaaaaaaa-0001-0001-0001-000000000003": { material: "Recycled Materials",       waterUsage: "Low",      certification: "Eco-Friendly Mfg" },
  "aaaaaaaa-0001-0001-0001-000000000004": { material: "Recycled Plastics & Silicon", waterUsage: "None",  certification: "Energy Star" },
  "aaaaaaaa-0001-0001-0001-000000000005": { material: "Organic Cotton",           waterUsage: "Low",      certification: "GOTS Certified" },
  "aaaaaaaa-0001-0001-0001-000000000006": { material: "Mixed Natural Materials",  waterUsage: "Low",      certification: "Zero Waste Certified" },
};

function mapRow(row: Record<string, unknown>, primaryImage: string, categoryName: string): Product {
  const tags = (row.tags as string[]) ?? [];
  const categoryId = (row.category_id as string) ?? null;
  const ratingAvg = Number(row.rating_avg ?? 0);
  const meta = CATEGORY_META[categoryId ?? ""] ?? {
    material: "Sustainable Materials",
    waterUsage: "Low",
    certification: "Eco Certified",
  };

  return {
    id: row.id as string,
    name: row.title as string,
    price: Number(row.price),
    comparePrice: row.compare_price ? Number(row.compare_price) : null,
    ecoScore: ratingAvg > 0 ? ratingAvg : 9.0,
    carbonFootprint: estimateCarbon(ratingAvg),
    image: primaryImage,
    badge: getBadge(tags),
    category: categoryName,
    categoryId,
    material: meta.material,
    waterUsage: meta.waterUsage,
    certification: meta.certification,
    description: (row.description as string) ?? "",
    tags,
    stockQty: Number(row.stock_qty ?? 0),
    status: (row.status as ProductStatus) ?? "active",
    sku: (row.sku as string) ?? null,
    ratingAvg,
    ratingCount: Number(row.rating_count ?? 0),
    storeId: (row.store_id as string) ?? "",
    storeName: ((row.stores as Record<string, unknown>)?.name as string) ?? "Unknown Store"
  };
}

// ─── HOOKS ──────────────────────────────────────────────────

export function useProducts(options?: { categoryId?: string; limit?: number; storeId?: string; adminMode?: boolean }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetch() {
      setLoading(true);
      setError(null);
      try {
        let query = supabase
          .from("products")
          .select(`
            *,
            categories(id, name, slug),
            stores(name),
            product_images(storage_path, is_primary, position)
          `)
          .order("rating_count", { ascending: false });

        // Normal public requests only show active products. If requesting by storeId (seller), show all statuses.
        if (!options?.storeId && !options?.adminMode) {
          query = query.eq("status", "active");
        } else if (options?.storeId) {
          query = query.eq("store_id", options.storeId);
        }

        if (options?.categoryId) {
          query = query.eq("category_id", options.categoryId);
        }
        if (options?.limit) {
          query = query.limit(options.limit);
        }

        const { data, error: err } = await query;
        if (err) throw err;
        if (cancelled) return;

        const mapped: Product[] = (data ?? []).map((row: Record<string, unknown>) => {
          const images = ((row.product_images as Record<string, unknown>[]) ?? []).sort(
            (a, b) => Number(a.position) - Number(b.position)
          );
          const primary = images.find((i) => i.is_primary) ?? images[0];
          const imgUrl = (primary?.storage_path as string) ?? "";
          const cat = row.categories as Record<string, unknown> | null;
          const catName = (cat?.name as string) ?? "Other";
          return mapRow(row, imgUrl, catName);
        });

        setProducts(mapped);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load products");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetch();
    return () => { cancelled = true; };
  }, [options?.categoryId, options?.limit, options?.storeId, options?.adminMode]);

  return { products, loading, error, setProducts };
}

export function useProduct(id: string) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    async function fetch() {
      setLoading(true);
      try {
        const { data, error: err } = await supabase
          .from("products")
          .select(`
            *,
            categories(id, name, slug),
            product_images(storage_path, is_primary, position)
          `)
          .eq("id", id)
          .single();

        if (err) throw err;
        if (cancelled || !data) return;

        const record = data as any;
        const images = ((record.product_images as Record<string, unknown>[]) ?? []).sort(
          (a, b) => Number(a.position) - Number(b.position)
        );
        const primary = images.find((i) => i.is_primary) ?? images[0];
        const imgUrl = (primary?.storage_path as string) ?? "";
        const cat = record.categories as Record<string, unknown> | null;
        setProduct(mapRow(data as Record<string, unknown>, imgUrl, (cat?.name as string) ?? "Other"));
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load product");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetch();
    return () => { cancelled = true; };
  }, [id]);

  return { product, loading, error };
}

export function useCategories() {
  const [categories, setCategories] = useState<Array<{ id: string; name: string; slug: string }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("categories")
      .select("id, name, slug")
      .is("parent_id", null)
      .then(({ data }) => {
        setCategories(data ?? []);
        setLoading(false);
      });
  }, []);

  return { categories, loading };
}

export function useReviews(productId: string) {
  const [reviews, setReviews] = useState<Array<{
    id: string; rating: number; body: string | null; created_at: string;
    profiles: { display_name: string | null } | null;
  }>>([]);

  useEffect(() => {
    if (!productId) return;
    supabase
      .from("reviews")
      .select("id, rating, body, created_at, profiles(display_name)")
      .eq("product_id", productId)
      .order("created_at", { ascending: false })
      .limit(10)
      .then(({ data }) => setReviews((data as typeof reviews) ?? []));
  }, [productId]);

  return reviews;
}

export async function addProduct(params: {
  storeId: string;
  title: string;
  price: number;
  sku: string;
  stockQty: number;
  description: string;
}) {
  const { data: newProduct, error } = await supabase
    .from("products")
    .insert({
      store_id: params.storeId,
      title: params.title,
      description: params.description,
      price: params.price,
      sku: params.sku,
      stock_qty: params.stockQty,
      status: "active",
      tags: [],
    })
    .select()
    .single();

  if (error || !newProduct) throw error ?? new Error("Failed to create product");

  // insert placeholder image
  const { error: imgErr } = await supabase.from("product_images").insert({
    product_id: newProduct.id,
    storage_path: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&h=800&fit=crop",
    is_primary: true,
    position: 0,
  });
  
  if (imgErr) throw imgErr;
  return newProduct;
}

export async function updateProductStatus(productIds: string[], status: ProductStatus) {
  const { error } = await supabase
    .from("products")
    .update({ status })
    .in("id", productIds);
  if (error) throw error;
}

export async function deleteProductRecord(productId: string) {
  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", productId);
  if (error) throw error;
}

export async function updateProduct(productId: string, updates: {
  title?: string;
  price?: number;
  stock_qty?: number;
  description?: string;
  sku?: string;
  status?: ProductStatus;
}) {
  const { error } = await supabase
    .from("products")
    .update(updates)
    .eq("id", productId);
  if (error) throw error;
}

export async function updateProductImage(productId: string, imageUrl: string) {
  // Delete existing primary images for this product
  await supabase
    .from("product_images")
    .delete()
    .eq("product_id", productId)
    .eq("is_primary", true);
  
  // Insert new primary image
  const { error } = await supabase
    .from("product_images")
    .insert({
      product_id: productId,
      storage_path: imageUrl,
      is_primary: true,
      position: 0,
    });
  if (error) throw error;
}
