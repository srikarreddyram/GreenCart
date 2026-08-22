import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuthContext } from "@/contexts/AuthContext";
import type { ItemStatus } from "@/types/database.types";

export interface TopProduct {
  name: string;
  sold: number;
  revenue: number;
  status: string;
}

export interface RevenueData {
  month: string;
  revenue: number;
  orders: number;
}

export interface NewOrder {
  id: string;
  product: string;
  buyer: string;
  amount: number;
  time: string;
  status: string;
}

export function useSellerData() {
  const { user } = useAuthContext();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [activeProducts, setActiveProducts] = useState(0);
  const [activeStoreName, setActiveStoreName] = useState<string>("My Store");
  const [storeId, setStoreId] = useState<string | null>(null);
  
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [newOrders, setNewOrders] = useState<NewOrder[]>([]);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function loadData() {
      setLoading(true);
      try {
        // 1. Get the store owned by this user
        const { data: storeData, error: storeErr } = await supabase
          .from("stores")
          .select("id, name")
          .eq("owner_id", user!.id)
          .single();

        if (storeErr || !storeData) {
          throw new Error("Could not find a store for this seller.");
        }
        
        if (cancelled) return;
        setActiveStoreName(storeData.name);
        setStoreId(storeData.id);

        const storeIdValue = storeData.id;

        // 2. Get active products count
        const { count: productCount, error: countErr } = await supabase
          .from("products")
          .select("*", { count: "exact", head: true })
          .eq("store_id", storeIdValue)
          .eq("status", "active");
        
        if (!countErr) setActiveProducts(productCount ?? 0);

        // 3. Get all order items mapped to this store, joined with products & orders
        const { data: itemsData, error: itemsErr } = await supabase
          .from("order_items")
          .select(`
            id, quantity, unit_price, item_status,
            products!inner(title, status),
            orders!inner(id, shipping_name, created_at)
          `)
          .eq("store_id", storeIdValue)
          .eq("store_id", storeIdValue);

        if (itemsErr) {
          console.error("DEBUG itemsErr:", itemsErr);
          throw itemsErr;
        }
        if (cancelled) return;
        
        let items = itemsData as any[];
        items.sort((a, b) => new Date(b.orders.created_at).getTime() - new Date(a.orders.created_at).getTime());

        // Calculate basic metrics
        let totalRev = 0;
        const uniqueOrderIds = new Set<string>();
        
        // Month grouping for revenue data
        const monthsMap = new Map<string, RevenueData>();
        
        // Product grouping for top products
        const productsMap = new Map<string, TopProduct>();

        // Recent orders
        const recent: NewOrder[] = [];

        items.forEach((item, index) => {
          const qty = Number(item.quantity) || 0;
          const price = Number(item.unit_price) || 0;
          const revenue = qty * price;
          
          const orderId = item.orders.id;
          const prodTitle = item.products.title;
          
          totalRev += revenue;
          uniqueOrderIds.add(orderId);

          // Build revenue data by month
          const itemDate = new Date(item.orders.created_at);
          const monthKey = itemDate.toLocaleString('default', { month: 'short', year: 'numeric' });
          const shortMonth = itemDate.toLocaleString('default', { month: 'short' });

          if (!monthsMap.has(monthKey)) {
            monthsMap.set(monthKey, { month: shortMonth, revenue: 0, orders: 0, _rawDate: itemDate } as any);
          }
          const monthStats = monthsMap.get(monthKey) as any;
          monthStats.revenue += revenue;
          // Note: an order might have multiple items, to accurately count orders per month we should count unique order IDs per month.
          // For simplicity we'll just track total revenue per month, and calculate unique orders.
          
          // Build top products
          if (!productsMap.has(prodTitle)) {
            productsMap.set(prodTitle, {
              name: prodTitle,
              sold: 0,
              revenue: 0,
              status: item.products.status
            });
          }
          const pStat = productsMap.get(prodTitle)!;
          pStat.sold += qty;
          pStat.revenue += revenue;

          // Recent orders (just take the first 5 unique order items since they are sorted desending)
          if (recent.length < 5) {
            recent.push({
              id: orderId,
              product: `${prodTitle}${qty > 1 ? ` ×${qty}` : ''}`,
              buyer: item.orders.shipping_name,
              amount: revenue,
              time: itemDate.toLocaleDateString(),
              status: item.item_status
            });
          }
        });

        // Compute unique orders per month
        const uniqueOrdersPerMonth = new Map<string, Set<string>>();
        items.forEach(item => {
          const itemDate = new Date(item.orders.created_at);
          const monthKey = itemDate.toLocaleString('default', { month: 'short', year: 'numeric' });
          if (!uniqueOrdersPerMonth.has(monthKey)) {
            uniqueOrdersPerMonth.set(monthKey, new Set());
          }
          uniqueOrdersPerMonth.get(monthKey)!.add(item.orders.id);
        });

        const revData = Array.from(monthsMap.values()).map((val: any) => {
          const monthKey = new Date(val._rawDate).toLocaleString('default', { month: 'short', year: 'numeric' });
          return {
            month: val.month,
            revenue: val.revenue,
            orders: uniqueOrdersPerMonth.get(monthKey)?.size || 0,
            _rawDate: val._rawDate
          };
        }).sort((a, b) => a._rawDate.getTime() - b._rawDate.getTime());

        // Fill in missing recent 6 months if data is empty or sparse (using dummy data for empty months to keep charts looking nice)
        if (revData.length < 6) {
           const finalRevData = [];
           for (let i = 5; i >= 0; i--) {
             const d = new Date();
             d.setMonth(d.getMonth() - i);
             const mName = d.toLocaleString('default', { month: 'short' });
             const existing = revData.find(r => r.month === mName && r._rawDate.getFullYear() === d.getFullYear());
             if (existing) {
               finalRevData.push({ month: existing.month, revenue: existing.revenue, orders: existing.orders });
             } else {
               finalRevData.push({ month: mName, revenue: 0, orders: 0 });
             }
           }
           setRevenueData(finalRevData);
        } else {
           setRevenueData(revData.map(r => ({ month: r.month, revenue: r.revenue, orders: r.orders })));
        }

        setTotalRevenue(totalRev);
        setTotalOrders(uniqueOrderIds.size);
        
        const sortedTop = Array.from(productsMap.values()).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
        setTopProducts(sortedTop);
        setNewOrders(recent);

      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load seller data");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadData();

    return () => {
      cancelled = true;
    };
  }, [user]);

  return {
    loading,
    error,
    totalRevenue,
    totalOrders,
    activeProducts,
    activeStoreName,
    storeId,
    revenueData,
    topProducts,
    newOrders,
  };
}

export interface SellerOrder {
  /** Parent order id, shown to the seller. Status updates target `itemId`. */
  id: string;
  itemId: string;
  buyer: string;
  product: { name: string; image: string };
  qty: number;
  amount: number;
  status: ItemStatus;
  date: string;
  co2: string;
}

export function useSellerOrders(storeId: string | null) {
  const [orders, setOrders] = useState<SellerOrder[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchOrders() {
    if (!storeId) return;
    setLoading(true);
    const { data } = await supabase
      .from("order_items")
      .select(`
        id, quantity, unit_price, item_status,
        products!inner(id, title, rating_avg, product_images(storage_path, is_primary)),
        orders!inner(id, shipping_name, created_at)
      `)
      .eq("store_id", storeId);
    
    if (data) {
      let sortedData = [...data];
      sortedData.sort((a, b) => new Date(b.orders.created_at).getTime() - new Date(a.orders.created_at).getTime());
      
      const formatted: SellerOrder[] = sortedData.map((item: any) => {
        const primImg = item.products.product_images?.find((img: any) => img.is_primary)?.storage_path || item.products.product_images?.[0]?.storage_path || "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&h=800&fit=crop";
        return {
          id: item.orders.id, // using order's ID for display, although we update item.id
          itemId: item.id,
          buyer: item.orders.shipping_name,
          product: { name: item.products.title, image: primImg },
          qty: item.quantity,
          amount: item.quantity * item.unit_price,
          status: item.item_status,
          date: new Date(item.orders.created_at).toLocaleDateString(),
          co2: "2.0kg CO₂" // Dummy for now since ecoScore mapping is in useProducts
        };
      });
      setOrders(formatted);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchOrders();
  }, [storeId]);

  const updateStatus = async (itemId: string, newStatus: ItemStatus) => {
    const { error } = await supabase
      .from("order_items")
      .update({ item_status: newStatus })
      .eq("id", itemId);
    if (!error) {
      setOrders(prev => prev.map(o => o.itemId === itemId ? { ...o, status: newStatus } : o));
    }
    return error;
  };

  return { orders, loading, updateStatus, refetch: fetchOrders };
}

export function useSellerStore(storeId: string | null) {
  const [store, setStore] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!storeId) return;
    supabase
      .from("stores")
      .select("*")
      .eq("id", storeId)
      .single()
      .then(({ data }) => {
        setStore(data);
        setLoading(false);
      });
  }, [storeId]);

  const updateStore = async (updates: any) => {
    if (!storeId) return;
    const { error } = await supabase
      .from("stores")
      .update(updates)
      .eq("id", storeId);
    if (!error) {
      setStore((prev: any) => ({ ...prev, ...updates }));
    }
    return error;
  };

  return { store, loading, updateStore };
}
