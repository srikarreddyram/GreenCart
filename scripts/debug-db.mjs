import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function debug() {
  const { data: stores } = await supabase.from('stores').select('id, name, owner_id');
  console.log("All Stores:");
  for (const s of stores || []) {
      const { count } = await supabase.from('order_items').select('*', { count: 'exact', head: true }).eq('store_id', s.id);
      console.log(`- ${s.name} (owner: ${s.owner_id}) -> ${count} order items`);
  }
}
debug();
