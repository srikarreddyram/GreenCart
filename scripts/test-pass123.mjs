import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function test() {
  const { data: storeInfo } = await supabase.from('stores').select('*').eq('owner_id', '10632f9f-d380-4a80-9417-967d1b28c8fa').single();
  console.log("pass123 Store info:", storeInfo);
  if (storeInfo) {
      const { count } = await supabase.from('order_items').select('*', { count: 'exact', head: true }).eq('store_id', storeInfo.id);
      console.log("Order items:", count);
  }
}
test();
