import { getPool } from '../db/pool';
import { runMigrations } from '../db/migrations';

const PRODUCTS = [
  { name: 'Tecno Camon 30',           category: 'Phones & Tablets',         price: 285000, description: 'AMOLED display 256GB storage flagship camera smartphone', stock: 40 },
  { name: 'Infinix Note 40',          category: 'Phones & Tablets',         price: 245000, description: 'Large battery fast charging Android smartphone 256GB', stock: 35 },
  { name: 'Samsung Galaxy A15',       category: 'Phones & Tablets',         price: 189000, description: 'Super AMOLED display 128GB budget Samsung smartphone', stock: 50 },
  { name: 'itel Pad 1',               category: 'Phones & Tablets',         price: 98000,  description: 'Affordable Android tablet WiFi display large screen', stock: 25 },
  { name: 'Oraimo Earbuds Pro',       category: 'Phones & Tablets',         price: 18500,  description: 'Wireless bluetooth earbuds noise cancelling TWS', stock: 80 },
  { name: 'LG 32-inch LED TV',        category: 'Electronics',              price: 110000, description: 'HD Ready LED television HDMI USB smart display', stock: 18 },
  { name: 'Hisense 150L Fridge',      category: 'Electronics',              price: 175000, description: 'Single door energy efficient refrigerator compressor cooling', stock: 10 },
  { name: 'Binatone Blender',         category: 'Electronics',              price: 14500,  description: 'Kitchen blender 1.5L jar two speed pulse settings', stock: 45 },
  { name: 'Sokany Standing Fan',      category: 'Electronics',              price: 22000,  description: 'Remote control 18 inch standing fan three speed', stock: 30 },
  { name: 'Solar Panel 200W',         category: 'Electronics',              price: 95000,  description: 'Monocrystalline solar panel renewable energy efficient', stock: 20 },
  { name: 'Ankara Print Fabric 6yds', category: 'Fashion & Apparel',        price: 18500,  description: 'Premium wax print Ankara fabric assorted patterns traditional', stock: 100 },
  { name: 'Senator Suit Set',         category: 'Fashion & Apparel',        price: 32000,  description: 'Two piece native senator suit embroidered detailing formal', stock: 60 },
  { name: 'Adire Tie-Dye Shirt',      category: 'Fashion & Apparel',        price: 15000,  description: 'Cotton Adire indigo tie-dye traditional Nigerian shirt', stock: 80 },
  { name: 'Leather Sandals Men',      category: 'Fashion & Apparel',        price: 12000,  description: 'Genuine leather handmade sandals men footwear durable', stock: 70 },
  { name: 'Aso-Oke Wrapper',          category: 'Fashion & Apparel',        price: 45000,  description: 'Hand woven traditional Aso-Oke fabric ceremony wedding', stock: 20 },
  { name: 'Golden Penny Spaghetti',   category: 'Groceries',                price: 13500,  description: 'Spaghetti pasta carton 20 packs wheat flour Nigerian brand', stock: 120 },
  { name: 'Indomie Noodles Carton',   category: 'Groceries',                price: 9800,   description: 'Instant noodles chicken flavour 40 pack carton', stock: 150 },
  { name: 'Kings Vegetable Oil 5L',   category: 'Groceries',                price: 14000,  description: 'Pure vegetable cooking oil 5 litre bottle kitchen', stock: 90 },
  { name: 'Honeywell Semovita 10kg',  category: 'Groceries',                price: 11500,  description: 'Finely milled semolina wheat meal swallow food Nigerian', stock: 70 },
  { name: 'Peak Milk Tin Carton',     category: 'Groceries',                price: 32000,  description: 'Evaporated milk 24 tins carton peak dairy Nigeria', stock: 60 },
  { name: 'Vono Foam Mattress 6x6',   category: 'Home & Living',            price: 65000,  description: 'High density foam mattress six by six inches sleeping', stock: 20 },
  { name: 'Non-Stick Pot Set',        category: 'Home & Living',            price: 27000,  description: 'Five piece non-stick cooking pot set kitchen matching lids', stock: 35 },
  { name: 'Window Curtains Pair',     category: 'Home & Living',            price: 9500,   description: 'Blackout curtains pair 2.5 metre drop home decor', stock: 65 },
  { name: 'LED Bulbs Pack of 4',      category: 'Home & Living',            price: 4200,   description: '9 watt cool white LED bulbs screw base energy saving', stock: 200 },
  { name: 'Plastic Chairs Set of 4',  category: 'Home & Living',            price: 18000,  description: 'Stackable plastic outdoor garden chairs set weather resistant', stock: 40 },
];

const CUSTOMERS = [
  { name: 'Emeka Okonkwo',   email: 'emeka.okonkwo@email.com',   city: 'Enugu',        state: 'Enugu' },
  { name: 'Fatima Yusuf',    email: 'fatima.yusuf@email.com',    city: 'Kano',         state: 'Kano' },
  { name: 'Tunde Adeyemi',   email: 'tunde.adeyemi@email.com',   city: 'Lagos',        state: 'Lagos' },
  { name: 'Ngozi Eze',       email: 'ngozi.eze@email.com',       city: 'Port Harcourt',state: 'Rivers' },
  { name: 'Musa Garba',      email: 'musa.garba@email.com',      city: 'Abuja',        state: 'FCT' },
  { name: 'Amaka Obi',       email: 'amaka.obi@email.com',       city: 'Onitsha',      state: 'Anambra' },
  { name: 'Biodun Afolabi',  email: 'biodun.afolabi@email.com',  city: 'Ibadan',       state: 'Oyo' },
  { name: 'Halima Suleiman', email: 'halima.suleiman@email.com', city: 'Kaduna',       state: 'Kaduna' },
  { name: 'Chukwudi Nweke',  email: 'chukwudi.nweke@email.com',  city: 'Owerri',       state: 'Imo' },
  { name: 'Aisha Bello',     email: 'aisha.bello@email.com',     city: 'Kano',         state: 'Kano' },
  { name: 'Seun Akande',     email: 'seun.akande@email.com',     city: 'Lagos',        state: 'Lagos' },
  { name: 'Chidinma Okafor', email: 'chidinma.okafor@email.com', city: 'Abuja',        state: 'FCT' },
  { name: 'Yakubu Danjuma',  email: 'yakubu.danjuma@email.com',  city: 'Jos',          state: 'Plateau' },
  { name: 'Blessing Effiong',email: 'blessing.effiong@email.com',city: 'Calabar',      state: 'Cross River' },
  { name: 'Wale Ogunleye',   email: 'wale.ogunleye@email.com',   city: 'Lagos',        state: 'Lagos' },
];

const STATUSES: Order['status'][] = ['confirmed', 'shipped', 'delivered', 'delivered', 'delivered'];
type Order = { status: 'confirmed' | 'shipped' | 'delivered' };

function randInt(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function randDate(from: Date, to: Date): Date {
  return new Date(from.getTime() + Math.random() * (to.getTime() - from.getTime()));
}
function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }

export async function seedCapstone(): Promise<void> {
  await runMigrations();
  const pool = getPool();

  const existing = await pool.query('SELECT COUNT(*)::int AS c FROM products');
  if (existing.rows[0].c > 0) { console.log('Already seeded — skipping.'); return; }

  // Insert products
  const prodIds: number[] = [];
  for (const p of PRODUCTS) {
    const r = await pool.query(
      'INSERT INTO products (name, description, category, price, stock) VALUES ($1,$2,$3,$4,$5) RETURNING id',
      [p.name, p.description, p.category, p.price, p.stock]
    );
    prodIds.push(r.rows[0].id);
  }

  // Insert customers
  const custIds: number[] = [];
  for (const c of CUSTOMERS) {
    const r = await pool.query(
      'INSERT INTO customers (name, email, city, state) VALUES ($1,$2,$3,$4) RETURNING id',
      [c.name, c.email, c.city, c.state]
    );
    custIds.push(r.rows[0].id);
  }

  // Insert 400 orders over 6 months
  const from = new Date('2025-01-01');
  const to   = new Date('2025-06-14');

  const vals: string[] = [];
  const params: (string | number | Date)[] = [];
  let idx = 1;

  for (let i = 0; i < 400; i++) {
    const custId = pick(custIds);
    const prodIdx = randInt(0, PRODUCTS.length - 1);
    const prodId  = prodIds[prodIdx];
    const qty     = randInt(1, 5);
    const price   = PRODUCTS[prodIdx].price;
    const status  = pick(STATUSES);
    const date    = randDate(from, to);

    vals.push(`($${idx++},$${idx++},$${idx++},$${idx++},$${idx++},$${idx++})`);
    params.push(custId, prodId, qty, price, status, date);

    if (vals.length >= 50) {
      await pool.query(
        `INSERT INTO orders (customer_id, product_id, quantity, unit_price, status, ordered_at)
         VALUES ${vals.join(',')}`,
        params
      );
      vals.length = 0; params.length = 0; idx = 1;
    }
  }

  if (vals.length) {
    await pool.query(
      `INSERT INTO orders (customer_id, product_id, quantity, unit_price, status, ordered_at)
       VALUES ${vals.join(',')}`,
      params
    );
  }

  console.log(`Seeded ${PRODUCTS.length} products, ${CUSTOMERS.length} customers, 400 orders.`);
}

if (require.main === module) {
  seedCapstone()
    .then(() => process.exit(0))
    .catch((err) => { console.error(err); process.exit(1); });
}
