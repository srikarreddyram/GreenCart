BEGIN;

-- ================= SELLERS =================
DO $$
DECLARE
  u1 UUID := 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1';
  u2 UUID := 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2';
  u3 UUID := 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3';
  u4 UUID := 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4';
  u5 UUID := 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa5';
BEGIN

INSERT INTO auth.users (
  id, instance_id, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_user_meta_data, raw_app_meta_data,
  role, aud
)
VALUES
(u1,'00000000-0000-0000-0000-000000000000','marudham@greencart.com',crypt('pass123', gen_salt('bf')),now(),now(),now(),
 '{"display_name":"Arun Kumar","role":"seller"}','{}','authenticated','authenticated'),

(u2,'00000000-0000-0000-0000-000000000000','chekku@greencart.com',crypt('pass123', gen_salt('bf')),now(),now(),now(),
 '{"display_name":"Meena Lakshmi","role":"seller"}','{}','authenticated','authenticated'),

(u3,'00000000-0000-0000-0000-000000000000','coastal@greencart.com',crypt('pass123', gen_salt('bf')),now(),now(),now(),
 '{"display_name":"Ravi Subramanian","role":"seller"}','{}','authenticated','authenticated'),

(u4,'00000000-0000-0000-0000-000000000000','nilgiri@greencart.com',crypt('pass123', gen_salt('bf')),now(),now(),now(),
 '{"display_name":"Divya Narayanan","role":"seller"}','{}','authenticated','authenticated'),

(u5,'00000000-0000-0000-0000-000000000000','weavesouth@greencart.com',crypt('pass123', gen_salt('bf')),now(),now(),now(),
 '{"display_name":"Karthik Iyer","role":"seller"}','{}','authenticated','authenticated')

ON CONFLICT (id) DO NOTHING;

END $$;

-- ================= STORES =================
INSERT INTO public.stores (owner_id, name, slug, description)
SELECT p.id, 'Marudham Farms', 'marudham-farms',
'Organic farm in Erode producing turmeric, millets, and traditional produce.'
FROM public.profiles p
JOIN auth.users u ON u.id = p.id
WHERE u.email = 'marudham@greencart.com'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.stores (owner_id, name, slug, description)
SELECT p.id, 'Chekku Naturals', 'chekku-naturals',
'Wood-pressed oil producers using traditional extraction methods.'
FROM public.profiles p
JOIN auth.users u ON u.id = p.id
WHERE u.email = 'chekku@greencart.com'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.stores (owner_id, name, slug, description)
SELECT p.id, 'Coastal Craft Collective', 'coastal-crafts',
'Handcrafted home products using coconut shells and palm materials.'
FROM public.profiles p
JOIN auth.users u ON u.id = p.id
WHERE u.email = 'coastal@greencart.com'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.stores (owner_id, name, slug, description)
SELECT p.id, 'Nilgiri Herbals', 'nilgiri-herbals',
'Small-batch herbal skincare products from the Nilgiris.'
FROM public.profiles p
JOIN auth.users u ON u.id = p.id
WHERE u.email = 'nilgiri@greencart.com'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.stores (owner_id, name, slug, description)
SELECT p.id, 'WeaveSouth', 'weave-south',
'Handloom textile products crafted by local weavers.'
FROM public.profiles p
JOIN auth.users u ON u.id = p.id
WHERE u.email = 'weavesouth@greencart.com'
ON CONFLICT (slug) DO NOTHING;

COMMIT;