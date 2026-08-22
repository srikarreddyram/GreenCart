import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function test() {
  const { data: storeInfo } = await supabase.from('stores').select('id, name').eq('owner_id', '50714049-0bae-4b66-85e4-89fb147f8f94').single();

  const { data, error } = await supabase
    .from("order_items")
    .select(`
      id, quantity, unit_price, item_status,
      products!inner(id, title, rating_avg, product_images(storage_path, is_primary)),
      orders!inner(id, shipping_name, created_at)
    `)
    .eq("store_id", storeInfo.id)
    .order("created_at", { referencedTable: "orders", ascending: false });

  if (error) {
    console.error("Query Error:", error);
  } else {
    console.log("Success with referencedTable! Data length:", data?.length);
  }
}
test();
