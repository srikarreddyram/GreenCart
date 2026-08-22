import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

// We define our 5 sellers mapped to their respective products
const MOCK_SELLERS = [
  {
    email: 'marudham@greencart.com',
    password: 'Password123!',
    displayName: 'Arun Kumar',
    storeName: 'Marudham Farms',
    storeSlug: 'marudham-farms',
    storeDesc: 'Organic farm in Erode producing turmeric, millets, and traditional produce.',
    imagePrefix: 'marudham',
    products: [
      { t: 'Organic Turmeric Powder (500g)', d: 'Stone-ground turmeric.', p: 180, s: 120, tags: ['organic','spices'], sku: 'MF-TUR-500' },
      { t: 'Unpolished Little Millet (1kg)', d: 'High fiber millet.', p: 140, s: 80, tags: ['millet'], sku: 'MF-MIL-1KG' },
      { t: 'Raw Honey (500g)', d: 'Unprocessed honey.', p: 280, s: 45, tags: ['honey'], sku: 'MF-HON-500' },
      { t: 'Foxtail Millet (1kg)', d: 'Healthy millet.', p: 155, s: 70, tags: ['millet'], sku: 'MF-FOX-1KG' },
      { t: 'Kodo Millet (1kg)', d: 'Low GI millet.', p: 150, s: 60, tags: ['millet'], sku: 'MF-KODO-1KG' },
      { t: 'Palm Jaggery (500g)', d: 'Natural sweetener.', p: 190, s: 50, tags: ['jaggery'], sku: 'MF-JAG-500' },
      { t: 'Red Rice (1kg)', d: 'Traditional rice.', p: 160, s: 65, tags: ['rice'], sku: 'MF-RICE-1KG' },
      { t: 'Curry Leaf Powder (100g)', d: 'Dry spice powder.', p: 90, s: 100, tags: ['spice'], sku: 'MF-CUR-100' },
      { t: 'Idli Rice (2kg)', d: 'Perfect for batter.', p: 220, s: 55, tags: ['rice'], sku: 'MF-IDLI-2KG' },
      { t: 'Groundnut (1kg)', d: 'Raw peanuts.', p: 130, s: 75, tags: ['nuts'], sku: 'MF-GN-1KG' },
    ]
  },
  {
    email: 'chekku@greencart.com',
    password: 'Password123!',
    displayName: 'Meena Lakshmi',
    storeName: 'Chekku Naturals',
    storeSlug: 'chekku-naturals',
    storeDesc: 'Wood-pressed oil producers using traditional extraction methods.',
    imagePrefix: 'chekku',
    products: [
      { t: 'Groundnut Oil (1L)', d: 'Cold pressed.', p: 320, s: 60, tags: ['oil'], sku: 'CN-GNO-1L' },
      { t: 'Sesame Oil (1L)', d: 'Aromatic oil.', p: 350, s: 50, tags: ['oil'], sku: 'CN-SES-1L' },
      { t: 'Coconut Oil (1L)', d: 'Pure oil.', p: 360, s: 55, tags: ['oil'], sku: 'CN-COC-1L' },
      { t: 'Castor Oil (500ml)', d: 'Hair care.', p: 210, s: 50, tags: ['oil'], sku: 'CN-CAS-500' },
      { t: 'Mustard Oil (1L)', d: 'Cooking oil.', p: 300, s: 45, tags: ['oil'], sku: 'CN-MUS-1L' },
      { t: 'Groundnut Oil (500ml)', d: 'Smaller pack.', p: 180, s: 70, tags: ['oil'], sku: 'CN-GNO-500' },
      { t: 'Sesame Oil (500ml)', d: 'Small pack.', p: 200, s: 65, tags: ['oil'], sku: 'CN-SES-500' },
      { t: 'Coconut Oil (500ml)', d: 'Daily use.', p: 190, s: 80, tags: ['oil'], sku: 'CN-COC-500' },
      { t: 'Cold Pressed Combo Pack', d: 'Mixed oils.', p: 850, s: 25, tags: ['oil'], sku: 'CN-COMB-1' },
      { t: 'Lamp Oil (500ml)', d: 'Traditional use.', p: 150, s: 40, tags: ['oil'], sku: 'CN-LAMP-500' },
    ]
  },
  {
    email: 'coastal@greencart.com',
    password: 'Password123!',
    displayName: 'Ravi Subramanian',
    storeName: 'Coastal Craft Collective',
    storeSlug: 'coastal-crafts',
    storeDesc: 'Handcrafted home products using coconut shells and palm materials.',
    imagePrefix: 'coastal',
    products: [
      { t: 'Coconut Bowls (2)', d: 'Eco bowls.', p: 250, s: 40, tags: ['home'], sku: 'CC-BOWL-2' },
      { t: 'Palm Basket', d: 'Storage.', p: 300, s: 35, tags: ['home'], sku: 'CC-BASK-01' },
      { t: 'Coir Mat', d: 'Doormat.', p: 350, s: 30, tags: ['home'], sku: 'CC-MAT-01' },
      { t: 'Coconut Spoon Set', d: 'Kitchen.', p: 180, s: 60, tags: ['kitchen'], sku: 'CC-SPN-01' },
      { t: 'Palm Fan', d: 'Hand fan.', p: 120, s: 70, tags: ['home'], sku: 'CC-FAN-01' },
      { t: 'Leaf Plates (10)', d: 'Disposable plates.', p: 220, s: 100, tags: ['eco'], sku: 'CC-PLATE-10' },
      { t: 'Tea Cups (2)', d: 'Shell cups.', p: 200, s: 45, tags: ['home'], sku: 'CC-CUP-2' },
      { t: 'Storage Box', d: 'Palm storage.', p: 280, s: 30, tags: ['home'], sku: 'CC-BOX-01' },
      { t: 'Table Mat Set', d: 'Dining mats.', p: 320, s: 25, tags: ['home'], sku: 'CC-MATSET' },
      { t: 'Coir Rope', d: 'Utility rope.', p: 150, s: 40, tags: ['utility'], sku: 'CC-ROPE-01' },
    ]
  },
  {
    email: 'nilgiri@greencart.com',
    password: 'Password123!',
    displayName: 'Divya Narayanan',
    storeName: 'Nilgiri Herbals',
    storeSlug: 'nilgiri-herbals',
    storeDesc: 'Small-batch herbal skincare products from the Nilgiris.',
    imagePrefix: 'nilgiri',
    products: [
      { t: 'Neem Soap', d: 'Herbal soap.', p: 120, s: 90, tags: ['soap'], sku: 'NH-SOAP-01' },
      { t: 'Hair Oil (200ml)', d: 'Herbal oil.', p: 220, s: 70, tags: ['hair'], sku: 'NH-OIL-200' },
      { t: 'Rose Toner', d: 'Skin toner.', p: 180, s: 65, tags: ['skin'], sku: 'NH-TONER' },
      { t: 'Face Pack', d: 'Herbal powder.', p: 150, s: 60, tags: ['skin'], sku: 'NH-FACE-01' },
      { t: 'Aloe Gel', d: 'Skin gel.', p: 180, s: 75, tags: ['skin'], sku: 'NH-ALOE' },
      { t: 'Body Scrub', d: 'Exfoliator.', p: 210, s: 55, tags: ['skin'], sku: 'NH-SCRUB' },
      { t: 'Lip Balm', d: 'Beeswax balm.', p: 90, s: 80, tags: ['care'], sku: 'NH-BALM' },
      { t: 'Shampoo Powder', d: 'Hair cleanser.', p: 200, s: 50, tags: ['hair'], sku: 'NH-SHAMPOO' },
      { t: 'Face Cream', d: 'Moisturizer.', p: 240, s: 45, tags: ['skin'], sku: 'NH-CREAM' },
      { t: 'Herbal Combo', d: 'Starter pack.', p: 500, s: 30, tags: ['combo'], sku: 'NH-COMB' },
    ]
  },
  {
    email: 'weavesouth@greencart.com',
    password: 'Password123!',
    displayName: 'Karthik Iyer',
    storeName: 'WeaveSouth',
    storeSlug: 'weave-south',
    storeDesc: 'Handloom textile products crafted by local weavers.',
    imagePrefix: 'weavesouth',
    products: [
      { t: 'Tote Bag', d: 'Reusable bag.', p: 350, s: 75, tags: ['bag'], sku: 'WS-TOTE' },
      { t: 'Table Runner', d: 'Decor.', p: 420, s: 45, tags: ['decor'], sku: 'WS-RUN' },
      { t: 'Bedsheet', d: 'Cotton sheet.', p: 900, s: 25, tags: ['home'], sku: 'WS-BED' },
      { t: 'Cushion Covers', d: 'Set of 2.', p: 500, s: 40, tags: ['decor'], sku: 'WS-CUSH' },
      { t: 'Kitchen Towels', d: 'Set of 3.', p: 280, s: 60, tags: ['home'], sku: 'WS-TOWEL' },
      { t: 'Scarf', d: 'Cotton scarf.', p: 300, s: 55, tags: ['fashion'], sku: 'WS-SCARF' },
      { t: 'Napkins', d: 'Set of 6.', p: 350, s: 50, tags: ['home'], sku: 'WS-NAPK' },
      { t: 'Laptop Sleeve', d: 'Padded sleeve.', p: 550, s: 35, tags: ['bag'], sku: 'WS-LAP' },
      { t: 'Curtains', d: 'Cotton curtains.', p: 1200, s: 20, tags: ['home'], sku: 'WS-CURT' },
      { t: 'Table Cloth', d: 'Dining cloth.', p: 600, s: 30, tags: ['home'], sku: 'WS-TCLOTH' },
    ]
  }
];

// Curated real product images (Unsplash) mapped by SKU
const PRODUCT_IMAGES = {
  // ── Marudham Farms (Organic farm produce) ──
  'MF-TUR-500': 'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=800&h=800&fit=crop',   // Turmeric powder
  'MF-MIL-1KG': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&h=800&fit=crop',   // Millet grains
  'MF-HON-500': 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=800&h=800&fit=crop',   // Honey jar
  'MF-FOX-1KG': 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800&h=800&fit=crop',   // Foxtail millet
  'MF-KODO-1KG': 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=800&h=800&fit=crop',  // Kodo millet grains
  'MF-JAG-500': 'https://images.unsplash.com/photo-1604514628550-37477afdf4e3?w=800&h=800&fit=crop',   // Palm jaggery
  'MF-RICE-1KG': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&h=800&fit=crop',  // Red rice
  'MF-CUR-100': 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&h=800&fit=crop',   // Curry leaf powder / spice
  'MF-IDLI-2KG': 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=800&h=800&fit=crop',  // Rice grains
  'MF-GN-1KG': 'https://images.unsplash.com/photo-1567892320421-1c657571ea4a?w=800&h=800&fit=crop',    // Peanuts / groundnuts

  // ── Chekku Naturals (Wood-pressed oils) ──
  'CN-GNO-1L': 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800&h=800&fit=crop',   // Groundnut oil bottle
  'CN-SES-1L': 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=800&h=800&fit=crop',    // Sesame oil
  'CN-COC-1L': 'https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=800&h=800&fit=crop',    // Coconut oil
  'CN-CAS-500': 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&h=800&fit=crop',   // Castor oil
  'CN-MUS-1L': 'https://images.unsplash.com/photo-1612358405970-e1aeba2d6097?w=800&h=800&fit=crop',    // Mustard oil
  'CN-GNO-500': 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800&h=800&fit=crop',   // Groundnut oil smaller
  'CN-SES-500': 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=800&h=800&fit=crop',   // Sesame oil smaller
  'CN-COC-500': 'https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=800&h=800&fit=crop',   // Coconut oil smaller
  'CN-COMB-1': 'https://images.unsplash.com/photo-1610393385964-6b0cf1e89cd1?w=800&h=800&fit=crop',    // Oil combo pack
  'CN-LAMP-500': 'https://images.unsplash.com/photo-1602178506388-268c02024dbb?w=800&h=800&fit=crop',  // Traditional lamp oil

  // ── Coastal Craft Collective (Eco handcrafts) ──
  'CC-BOWL-2': 'https://images.unsplash.com/photo-1604422520512-f1da0e7c6200?w=800&h=800&fit=crop',    // Coconut bowls
  'CC-BASK-01': 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&h=800&fit=crop',   // Woven basket
  'CC-MAT-01': 'https://images.unsplash.com/photo-1589802829985-817e51171b92?w=800&h=800&fit=crop',    // Coir doormat
  'CC-SPN-01': 'https://images.unsplash.com/photo-1593618998160-e34014e67546?w=800&h=800&fit=crop',    // Wooden spoon set
  'CC-FAN-01': 'https://images.unsplash.com/photo-1617277553692-70cce0a6fc37?w=800&h=800&fit=crop',    // Palm hand fan
  'CC-PLATE-10': 'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=800&h=800&fit=crop',  // Leaf plates
  'CC-CUP-2': 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=800&h=800&fit=crop',    // Eco cups
  'CC-BOX-01': 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&h=800&fit=crop',    // Woven storage box
  'CC-MATSET': 'https://images.unsplash.com/photo-1582131503261-fca1d1c0589f?w=800&h=800&fit=crop',    // Table mat set
  'CC-ROPE-01': 'https://images.unsplash.com/photo-1615486003773-13a1fc31db49?w=800&h=800&fit=crop',   // Coir rope

  // ── Nilgiri Herbals (Skincare & herbal products) ──
  'NH-SOAP-01': 'https://images.unsplash.com/photo-1600857062241-98e5dba7f214?w=800&h=800&fit=crop',   // Neem herbal soap
  'NH-OIL-200': 'https://images.unsplash.com/photo-1608181831688-ba943e2fb627?w=800&h=800&fit=crop',   // Herbal hair oil
  'NH-TONER': 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&h=800&fit=crop',        // Rose toner bottle
  'NH-FACE-01': 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=800&h=800&fit=crop',   // Face pack powder
  'NH-ALOE': 'https://images.unsplash.com/photo-1596755094514-2c5bbf574645?w=800&h=800&fit=crop',      // Aloe gel jar
  'NH-SCRUB': 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=800&h=800&fit=crop',     // Body scrub
  'NH-BALM': 'https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?w=800&h=800&fit=crop',      // Lip balm tin
  'NH-SHAMPOO': 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=800&h=800&fit=crop',   // Herbal shampoo
  'NH-CREAM': 'https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=800&h=800&fit=crop',     // Face cream jar
  'NH-COMB': 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800&h=800&fit=crop',         // Herbal combo set

  // ── WeaveSouth (Handloom textiles) ──
  'WS-TOTE': 'https://images.unsplash.com/photo-1597633425046-08f5110420b5?w=800&h=800&fit=crop',      // Cotton tote bag
  'WS-RUN': 'https://images.unsplash.com/photo-1615529162924-f8605388461d?w=800&h=800&fit=crop',       // Table runner textile
  'WS-BED': 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&h=800&fit=crop',       // Cotton bedsheet
  'WS-CUSH': 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=800&h=800&fit=crop',      // Cushion covers
  'WS-TOWEL': 'https://images.unsplash.com/photo-1583845112203-29329902332e?w=800&h=800&fit=crop',     // Kitchen towels
  'WS-SCARF': 'https://images.unsplash.com/photo-1601924921557-45e1c5945ae3?w=800&h=800&fit=crop',     // Cotton scarf
  'WS-NAPK': 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=800&h=800&fit=crop',         // Cloth napkins
  'WS-LAP': 'https://images.unsplash.com/photo-1580477667995-2b94f01c9516?w=800&h=800&fit=crop',       // Laptop sleeve
  'WS-CURT': 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&h=800&fit=crop',      // Cotton curtains
  'WS-TCLOTH': 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=800&h=800&fit=crop',    // Table cloth
};

async function seed() {
  console.log("🌱 Beginning intelligent data seed...");

  for (const seller of MOCK_SELLERS) {
    console.log(`\n===========================================`);
    console.log(`👤 Processing Seller: ${seller.displayName}`);
    
    // 1. Authenticate / Sign Up through official GoTrue engine
    let userId;
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: seller.email,
      password: seller.password,
      options: { data: { role: 'seller', display_name: seller.displayName } }
    });

    if (signUpError && signUpError.message.includes("already registered")) {
        console.log(`   -> Auth user exists. Attempting login to grab session...`);
        const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
            email: seller.email,
            password: seller.password
        });
        if (loginError) {
             console.error(`   ❌ Failed to login existing user:`, loginError.message);
             continue;
        }
        userId = loginData.user.id;
    } else if (signUpError) {
        console.error(`   ❌ Failed to sign up:`, signUpError.message);
        continue;
    } else {
        userId = signUpData.user.id;
        // Upsert profile in case Postgres trigger missed it (fallback)
        await supabase.from('profiles').upsert({ id: userId, display_name: seller.displayName, role: 'seller' });
    }

    console.log(`   ✅ Auth verified. User ID: ${userId}`);

    // 2. Ensure STORE exists 
    let storeId;
    const { data: testStore } = await supabase.from('stores').select('id').eq('slug', seller.storeSlug).maybeSingle();
    
    if (testStore) {
        storeId = testStore.id;
        console.log(`   -> Store '${seller.storeName}' already exists.`);
        // Update ownership safely in case it belonged to a corrupted test account
        await supabase.from('stores').update({ owner_id: userId }).eq('id', storeId);
    } else {
        console.log(`   -> Creating Store '${seller.storeName}'...`);
        const { data: newStore, error: storeErr } = await supabase.from('stores').insert({
            owner_id: userId,
            name: seller.storeName,
            slug: seller.storeSlug,
            description: seller.storeDesc
        }).select('id').single();
        if (storeErr) {
            console.error(`   ❌ Failed to create store:`, storeErr.message);
            continue;
        }
        storeId = newStore.id;
    }

    // 3. Clear existing products to prevent duplicates upon re-running
    // First get all product IDs for this store
    const { data: existingProducts } = await supabase.from('products').select('id').eq('store_id', storeId);
    if (existingProducts && existingProducts.length > 0) {
      const prodIds = existingProducts.map(p => p.id);
      // Delete product_images first (child table)
      for (let i = 0; i < prodIds.length; i += 20) {
        const batch = prodIds.slice(i, i + 20);
        await supabase.from('product_images').delete().in('product_id', batch);
      }
      // Detach order_items from these products (set product_id null or delete)
      for (let i = 0; i < prodIds.length; i += 20) {
        const batch = prodIds.slice(i, i + 20);
        await supabase.from('order_items').delete().in('product_id', batch);
      }
      // Now safely delete the products
      await supabase.from('products').delete().eq('store_id', storeId);
      console.log(`   -> Cleaned ${existingProducts.length} old products + images`);
    }

    // 4. Insert Products + Images
    console.log(`   -> Seeding ${seller.products.length} products...`);
    for (const p of seller.products) {
        const { data: prodData, error: prodErr } = await supabase.from('products').insert({
            store_id: storeId,
            title: p.t,
            description: p.d,
            price: p.p,
            stock_qty: p.s,
            status: 'active',
            tags: p.tags,
            sku: p.sku
        }).select('id').single();

        if (prodErr) {
            console.error(`      ❌ Error inserting ${p.t}:`, prodErr.message);
            continue;
        }

        const imagePath = PRODUCT_IMAGES[p.sku] || `https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&h=800&fit=crop`;
        await supabase.from('product_images').insert({
            product_id: prodData.id,
            storage_path: imagePath,
            is_primary: true
        });
    }
    console.log(`   ✅ Successfully seeded ${seller.displayName}'s store!`);
  }

  console.log(`\n===========================================`);
  console.log(`👥 Seeding Artificial Buyers...`);
  
  const MOCK_BUYERS = Array.from({ length: 8 }).map((_, i) => ({
    email: `buyer${i+1}@greencart.com`,
    password: 'Password123!',
    displayName: `Valued Customer ${i+1}`
  }));

  const buyerIds = [];
  for (const buyer of MOCK_BUYERS) {
    let bId;
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: buyer.email,
      password: buyer.password,
      options: { data: { role: 'buyer', display_name: buyer.displayName } }
    });

    if (signUpError && signUpError.message.includes("already registered")) {
        const { data: loginData } = await supabase.auth.signInWithPassword({
            email: buyer.email,
            password: buyer.password
        });
        bId = loginData?.user?.id;
    } else if (!signUpError) {
        bId = signUpData.user.id;
        await supabase.from('profiles').upsert({ id: bId, display_name: buyer.displayName, role: 'buyer' });
    }
    if (bId) buyerIds.push({ id: bId, name: buyer.displayName, email: buyer.email, password: buyer.password });
  }
  console.log(`   ✅ Seeded ${buyerIds.length} buyers.`);

  console.log(`\n===========================================`);
  console.log(`🛒 Generating Historical Orders...`);

  // Clear existing orders mapping to these mocked buyers
  for (const b of buyerIds) {
      await supabase.from('orders').delete().eq('buyer_id', b.id);
  }

  // Fetch all active products
  const { data: allProducts } = await supabase.from('products').select('id, store_id, price, title');
  if (!allProducts || allProducts.length === 0) {
      console.log("   ❌ No products found, skipping orders.");
      return;
  }

  let totalOrdersGenerated = 0;
  
  for (const buyer of buyerIds) {
    // Authenticate as this buyer to satisfy RLS for orders
    await supabase.auth.signInWithPassword({ email: buyer.email, password: buyer.password });

    // Generate orders for the last 6 months
    for (let monthOffset = 0; monthOffset < 6; monthOffset++) {
        // Randomly 1 to 4 orders per month for this buyer
        const orderCount = Math.floor(Math.random() * 4) + 1;
        
        for (let i = 0; i < orderCount; i++) {
            // Select random products (1 to 3 items per order)
            const numItems = Math.floor(Math.random() * 3) + 1;
            const selectedProducts = [];
            for (let j = 0; j < numItems; j++) {
                const p = allProducts[Math.floor(Math.random() * allProducts.length)];
                selectedProducts.push(p);
            }

            // Create a backdated created_at date
            const date = new Date();
            date.setMonth(date.getMonth() - monthOffset);
            date.setDate(Math.floor(Math.random() * 28) + 1); // Random day 1-28
            const backdated = date.toISOString();

            let total_amount = 0;
            const itemsToInsert = [];
            
            // We need the order ID first.
            // Insert order:
            const { data: orderData, error: orderErr } = await supabase.from('orders').insert({
                buyer_id: buyer.id,
                total_amount: 0, // Placeholder, update later
                shipping_name: buyer.name,
                shipping_address: { city: 'Chennai', state: 'Tamil Nadu' },
                created_at: backdated,
                status: monthOffset === 0 && Math.random() > 0.5 ? 'pending' : 'delivered' // Pending if recent
            }).select('id').single();

            if (orderErr) {
                console.error(`   ❌ Failed to create order:`, orderErr.message);
                continue;
            }

            for (const p of selectedProducts) {
                const qty = Math.floor(Math.random() * 3) + 1; // 1 to 3 units
                const amount = p.price * qty;
                total_amount += amount;

                itemsToInsert.push({
                    order_id: orderData.id,
                    product_id: p.id,
                    store_id: p.store_id,
                    quantity: qty,
                    unit_price: p.price,
                    item_status: monthOffset === 0 && Math.random() > 0.5 ? 'pending' : 'delivered'
                });
            }

            // Update total amount on order
            await supabase.from('orders').update({ total_amount }).eq('id', orderData.id);

            // Insert items
            // But wait, order_items RLS dictates buyers insert items (which we are authenticated as)
            // But wait, we need to explicitly pass 'created_at' to order_items? 
            // In schema, 'order_items' DOES NOT have 'created_at' column!? 
            // Oh right, it doesn't! The dashboard joins with orders!
            const { error: itemErr } = await supabase.from('order_items').insert(itemsToInsert);
            if (itemErr) {
                 console.error(`   ❌ Failed to insert items:`, itemErr.message);
            } else {
                 totalOrdersGenerated++;
            }
        }
    }
  }

  console.log(`   ✅ Successfully generated ${totalOrdersGenerated} historical orders.`);
  console.log(`\n🌿 Seeding Complete!`);
}

seed();
