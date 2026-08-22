import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function test() {
  const { data: loginData } = await supabase.auth.signInWithPassword({
    email: 'marudham@greencart.com',
    password: 'Password123!'
  });
  console.log("Logged in as Marudham", loginData.user.id);
  
  const { data: storeInfo } = await supabase.from('stores').select('id, name').eq('owner_id', loginData.user.id).single();
  console.log("Store info:", storeInfo);

  const { data, error } = await supabase
    .from("order_items")
    .select(`
      id, quantity, unit_price, item_status,
      products!inner(title, status),
      orders!inner(id, shipping_name, created_at)
    `)
    .eq("store_id", storeInfo.id);

  if (error) {
    console.error("Query Error:", error);
  } else {
    console.log("Total order_items found:", data?.length);
    if(data?.length > 0) console.log("First item:", data[0]);
  }
}
test();
