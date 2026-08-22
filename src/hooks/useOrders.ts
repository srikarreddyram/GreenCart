import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuthContext } from "@/contexts/AuthContext";
import type { ItemStatus, OrderStatus, Order as OrderRow } from "@/types/database.types";

export interface OrderItem {
  id: string;
  productId: string;
  name: string;
  image: string;
  quantity: number;
  unitPrice: number;
  itemStatus: ItemStatus;
}

export interface Order {
  id: string;
  status: OrderStatus;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
  shippingName: string;
  shippingAddress: Partial<OrderRow["shipping_address"]>;
  notes: string | null;
  items: OrderItem[];
}

export function useOrders() {
  const { user } = useAuthContext();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    let cancelled = false;

    async function fetchOrders() {
      setLoading(true);
      try {
        const { data, error: err } = await supabase
          .from("orders")
          .select(`
            *,
            order_items(
              id, quantity, unit_price, item_status, product_id,
              products(title, product_images(storage_path, is_primary))
            )
          `)
          .eq("buyer_id", user!.id)
          .order("created_at", { ascending: false });

        if (err) throw err;
        if (cancelled) return;

        const mapped: Order[] = (data ?? []).map((o: Record<string, unknown>) => ({
          id: o.id as string,
          status: o.status as OrderStatus,
          totalAmount: Number(o.total_amount),
          createdAt: o.created_at as string,
          updatedAt: o.updated_at as string,
          shippingName: (o.shipping_name as string) ?? "",
          shippingAddress: (o.shipping_address as OrderRow["shipping_address"]) ?? {},
          notes: (o.notes as string) ?? null,
          items: ((o.order_items as Record<string, unknown>[]) ?? []).map((item) => {
            const prod = item.products as Record<string, unknown> | null;
            const imgs = ((prod?.product_images as Record<string, unknown>[]) ?? []);
            const img = imgs.find((i) => i.is_primary) ?? imgs[0];
            return {
              id: item.id as string,
              productId: item.product_id as string,
              name: (prod?.title as string) ?? "Product",
              image: (img?.storage_path as string) ?? "",
              quantity: Number(item.quantity),
              unitPrice: Number(item.unit_price),
              itemStatus: (item.item_status as ItemStatus) ?? "pending",
            };
          }),
        }));

        setOrders(mapped);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load orders");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchOrders();

    // Realtime subscription
    const channel = supabase
      .channel(`orders:buyer:${user.id}`)
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "orders",
        filter: `buyer_id=eq.${user.id}`,
      }, () => { fetchOrders(); })
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  return { orders, loading, error };
}

export async function placeOrder(params: {
  buyerId: string;
  items: Array<{ productId: string; storeId: string; quantity: number; unitPrice: number }>;
  totalAmount: number;
  shippingName: string;
  shippingAddress: OrderRow["shipping_address"];
}): Promise<OrderRow> {
  const { data: order, error: orderErr } = await supabase
    .from("orders")
    .insert({
      buyer_id: params.buyerId,
      status: "pending",
      total_amount: params.totalAmount,
      shipping_name: params.shippingName,
      shipping_address: params.shippingAddress,
    })
    .select()
    .single();

  if (orderErr || !order) throw orderErr ?? new Error("Failed to create order");

  const orderItems = params.items.map((i) => ({
    order_id: order.id,
    product_id: i.productId,
    store_id: i.storeId,
    quantity: i.quantity,
    unit_price: i.unitPrice,
    item_status: "pending",
  }));

  const { error: itemsErr } = await supabase.from("order_items").insert(orderItems);
  if (itemsErr) throw itemsErr;

  return order;
}
