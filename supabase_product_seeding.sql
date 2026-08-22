BEGIN;

-- ================================================================
-- 🌾 MARUDHAM FARMS
-- ================================================================

INSERT INTO products (store_id, title, description, price, stock_qty, status, tags, sku)
SELECT s.id, v.title, v.description, v.price, v.stock, 'active', v.tags, v.sku
FROM stores s,
LATERAL (
VALUES
('Organic Turmeric Powder (500g)','Stone-ground turmeric.',180,120,ARRAY['organic','spices'],'MF-TUR-500'),
('Unpolished Little Millet (1kg)','High fiber millet.',140,80,ARRAY['millet'],'MF-MIL-1KG'),
('Raw Honey (500g)','Unprocessed honey.',280,45,ARRAY['honey'],'MF-HON-500'),
('Foxtail Millet (1kg)','Healthy millet.',155,70,ARRAY['millet'],'MF-FOX-1KG'),
('Kodo Millet (1kg)','Low GI millet.',150,60,ARRAY['millet'],'MF-KODO-1KG'),
('Palm Jaggery (500g)','Natural sweetener.',190,50,ARRAY['jaggery'],'MF-JAG-500'),
('Red Rice (1kg)','Traditional rice.',160,65,ARRAY['rice'],'MF-RICE-1KG'),
('Curry Leaf Powder (100g)','Dry spice powder.',90,100,ARRAY['spice'],'MF-CUR-100'),
('Idli Rice (2kg)','Perfect for batter.',220,55,ARRAY['rice'],'MF-IDLI-2KG'),
('Groundnut (1kg)','Raw peanuts.',130,75,ARRAY['nuts'],'MF-GN-1KG')
) AS v(title,description,price,stock,tags,sku)
WHERE s.slug='marudham-farms';

INSERT INTO product_images (product_id, storage_path, is_primary)
SELECT id, 'products/marudham/' || sku || '.jpg', true
FROM products WHERE sku LIKE 'MF-%';


-- ================================================================
-- 🛢️ CHEKKU NATURALS
-- ================================================================

INSERT INTO products (store_id, title, description, price, stock_qty, status, tags, sku)
SELECT s.id, v.title, v.description, v.price, v.stock, 'active', v.tags, v.sku
FROM stores s,
LATERAL (
VALUES
('Groundnut Oil (1L)','Cold pressed.',320,60,ARRAY['oil'],'CN-GNO-1L'),
('Sesame Oil (1L)','Aromatic oil.',350,50,ARRAY['oil'],'CN-SES-1L'),
('Coconut Oil (1L)','Pure oil.',360,55,ARRAY['oil'],'CN-COC-1L'),
('Castor Oil (500ml)','Hair care.',210,50,ARRAY['oil'],'CN-CAS-500'),
('Mustard Oil (1L)','Cooking oil.',300,45,ARRAY['oil'],'CN-MUS-1L'),
('Groundnut Oil (500ml)','Smaller pack.',180,70,ARRAY['oil'],'CN-GNO-500'),
('Sesame Oil (500ml)','Small pack.',200,65,ARRAY['oil'],'CN-SES-500'),
('Coconut Oil (500ml)','Daily use.',190,80,ARRAY['oil'],'CN-COC-500'),
('Cold Pressed Combo Pack','Mixed oils.',850,25,ARRAY['oil'],'CN-COMB-1'),
('Lamp Oil (500ml)','Traditional use.',150,40,ARRAY['oil'],'CN-LAMP-500')
) AS v(title,description,price,stock,tags,sku)
WHERE s.slug='chekku-naturals';

INSERT INTO product_images (product_id, storage_path, is_primary)
SELECT id, 'products/chekku/' || sku || '.jpg', true
FROM products WHERE sku LIKE 'CN-%';


-- ================================================================
-- 🏠 COASTAL CRAFTS
-- ================================================================

INSERT INTO products (store_id, title, description, price, stock_qty, status, tags, sku)
SELECT s.id, v.title, v.description, v.price, v.stock, 'active', v.tags, v.sku
FROM stores s,
LATERAL (
VALUES
('Coconut Bowls (2)','Eco bowls.',250,40,ARRAY['home'],'CC-BOWL-2'),
('Palm Basket','Storage.',300,35,ARRAY['home'],'CC-BASK-01'),
('Coir Mat','Doormat.',350,30,ARRAY['home'],'CC-MAT-01'),
('Coconut Spoon Set','Kitchen.',180,60,ARRAY['kitchen'],'CC-SPN-01'),
('Palm Fan','Hand fan.',120,70,ARRAY['home'],'CC-FAN-01'),
('Leaf Plates (10)','Disposable plates.',220,100,ARRAY['eco'],'CC-PLATE-10'),
('Tea Cups (2)','Shell cups.',200,45,ARRAY['home'],'CC-CUP-2'),
('Storage Box','Palm storage.',280,30,ARRAY['home'],'CC-BOX-01'),
('Table Mat Set','Dining mats.',320,25,ARRAY['home'],'CC-MATSET'),
('Coir Rope','Utility rope.',150,40,ARRAY['utility'],'CC-ROPE-01')
) AS v(title,description,price,stock,tags,sku)
WHERE s.slug='coastal-crafts';

INSERT INTO product_images (product_id, storage_path, is_primary)
SELECT id, 'products/coastal/' || sku || '.jpg', true
FROM products WHERE sku LIKE 'CC-%';


-- ================================================================
-- 🌿 NILGIRI HERBALS
-- ================================================================

INSERT INTO products (store_id, title, description, price, stock_qty, status, tags, sku)
SELECT s.id, v.title, v.description, v.price, v.stock, 'active', v.tags, v.sku
FROM stores s,
LATERAL (
VALUES
('Neem Soap','Herbal soap.',120,90,ARRAY['soap'],'NH-SOAP-01'),
('Hair Oil (200ml)','Herbal oil.',220,70,ARRAY['hair'],'NH-OIL-200'),
('Rose Toner','Skin toner.',180,65,ARRAY['skin'],'NH-TONER'),
('Face Pack','Herbal powder.',150,60,ARRAY['skin'],'NH-FACE-01'),
('Aloe Gel','Skin gel.',180,75,ARRAY['skin'],'NH-ALOE'),
('Body Scrub','Exfoliator.',210,55,ARRAY['skin'],'NH-SCRUB'),
('Lip Balm','Beeswax balm.',90,80,ARRAY['care'],'NH-BALM'),
('Shampoo Powder','Hair cleanser.',200,50,ARRAY['hair'],'NH-SHAMPOO'),
('Face Cream','Moisturizer.',240,45,ARRAY['skin'],'NH-CREAM'),
('Herbal Combo','Starter pack.',500,30,ARRAY['combo'],'NH-COMB')
) AS v(title,description,price,stock,tags,sku)
WHERE s.slug='nilgiri-herbals';

INSERT INTO product_images (product_id, storage_path, is_primary)
SELECT id, 'products/nilgiri/' || sku || '.jpg', true
FROM products WHERE sku LIKE 'NH-%';


-- ================================================================
-- 🧵 WEAVESOUTH
-- ================================================================

INSERT INTO products (store_id, title, description, price, stock_qty, status, tags, sku)
SELECT s.id, v.title, v.description, v.price, v.stock, 'active', v.tags, v.sku
FROM stores s,
LATERAL (
VALUES
('Tote Bag','Reusable bag.',350,75,ARRAY['bag'],'WS-TOTE'),
('Table Runner','Decor.',420,45,ARRAY['decor'],'WS-RUN'),
('Bedsheet','Cotton sheet.',900,25,ARRAY['home'],'WS-BED'),
('Cushion Covers','Set of 2.',500,40,ARRAY['decor'],'WS-CUSH'),
('Kitchen Towels','Set of 3.',280,60,ARRAY['home'],'WS-TOWEL'),
('Scarf','Cotton scarf.',300,55,ARRAY['fashion'],'WS-SCARF'),
('Napkins','Set of 6.',350,50,ARRAY['home'],'WS-NAPK'),
('Laptop Sleeve','Padded sleeve.',550,35,ARRAY['bag'],'WS-LAP'),
('Curtains','Cotton curtains.',1200,20,ARRAY['home'],'WS-CURT'),
('Table Cloth','Dining cloth.',600,30,ARRAY['home'],'WS-TCLOTH')
) AS v(title,description,price,stock,tags,sku)
WHERE s.slug='weave-south';

INSERT INTO product_images (product_id, storage_path, is_primary)
SELECT id, 'products/weavesouth/' || sku || '.jpg', true
FROM products WHERE sku LIKE 'WS-%';

COMMIT;