import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function run() {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'pass123@example.com',
    password: 'pass123'
  });
  console.log("LOGIN TEST:", error ? JSON.stringify(error) : "SUCCESS " + data.user.id);
  
  const { error: e2 } = await supabase.auth.signInWithPassword({
    email: 'marudham@greencart.com',
    password: 'pass123'
  });
  console.log("MARUDHAM TEST:", e2 ? JSON.stringify(e2) : "SUCCESS");
}
run();
