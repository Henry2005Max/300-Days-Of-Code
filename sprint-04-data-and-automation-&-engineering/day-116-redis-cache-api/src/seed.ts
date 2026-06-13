import { getDb } from './db/connection';

interface SeedCategory {
  name: string;
  slug: string;
  products: { name: string; description: string; price: number; stock: number }[];
}

const SEED_DATA: SeedCategory[] = [
  {
    name: 'Phones & Tablets',
    slug: 'phones-tablets',
    products: [
      { name: 'Tecno Camon 30', description: '6.78-inch AMOLED display, 256GB storage, 50MP camera', price: 285000, stock: 40 },
      { name: 'Infinix Note 40', description: '6.78-inch display, 256GB storage, fast charging', price: 245000, stock: 35 },
      { name: 'Samsung Galaxy A15', description: '6.5-inch Super AMOLED, 128GB storage, 50MP camera', price: 189000, stock: 50 },
      { name: 'iPhone 13 (Refurbished)', description: '128GB storage, A15 Bionic chip, Face ID', price: 520000, stock: 12 },
      { name: 'itel Pad 1', description: '10.1-inch tablet, 64GB storage, Wi-Fi only', price: 98000, stock: 25 },
    ],
  },
  {
    name: 'Fashion & Apparel',
    slug: 'fashion-apparel',
    products: [
      { name: 'Ankara Print Fabric (6 yards)', description: 'Premium wax print fabric, assorted patterns', price: 18500, stock: 100 },
      { name: 'Senator Suit Set', description: 'Two-piece native wear, embroidered detailing', price: 32000, stock: 60 },
      { name: 'Aso-Oke Wrapper', description: 'Hand-woven traditional fabric, 2 yards', price: 45000, stock: 20 },
      { name: 'Adire Tie-Dye Shirt', description: 'Cotton shirt with indigo Adire pattern', price: 15000, stock: 80 },
      { name: 'Leather Sandals (Men)', description: 'Genuine leather sandals, sizes 40-45', price: 12000, stock: 70 },
    ],
  },
  {
    name: 'Electronics & Appliances',
    slug: 'electronics-appliances',
    products: [
      { name: 'Binatone Blender BL-2151MX', description: '1.5L jar, 2-speed setting with pulse', price: 14500, stock: 45 },
      { name: 'LG 32-inch LED TV', description: 'HD Ready resolution, 2x HDMI, USB playback', price: 110000, stock: 18 },
      { name: 'Sokany Standing Fan', description: '18-inch fan, 3-speed, remote control included', price: 22000, stock: 30 },
      { name: 'Hisense 150L Fridge', description: 'Single door, energy-efficient compressor', price: 175000, stock: 10 },
      { name: 'Oraimo Bluetooth Speaker', description: 'Portable 10W speaker, 12-hour battery life', price: 16500, stock: 55 },
    ],
  },
  {
    name: 'Groceries',
    slug: 'groceries',
    products: [
      { name: 'Golden Penny Spaghetti (Carton)', description: '20 packs x 500g per carton', price: 13500, stock: 120 },
      { name: 'Indomie Noodles (Carton)', description: '40 packs, chicken flavor', price: 9800, stock: 150 },
      { name: 'Peak Milk Tin (Carton)', description: '24 tins x 400g evaporated milk', price: 32000, stock: 60 },
      { name: 'Honeywell Semovita (10kg)', description: 'Finely milled wheat meal', price: 11500, stock: 70 },
      { name: 'Kings Vegetable Oil (5L)', description: 'Pure vegetable cooking oil', price: 14000, stock: 90 },
    ],
  },
  {
    name: 'Home & Living',
    slug: 'home-living',
    products: [
      { name: 'Vono Foam Mattress (6x6)', description: 'High-density foam, 6 inches thick', price: 65000, stock: 20 },
      { name: 'Plastic Chairs (Set of 4)', description: 'Stackable, weather-resistant outdoor chairs', price: 18000, stock: 40 },
      { name: 'Window Curtains (Pair)', description: 'Blackout fabric, 2.5m drop', price: 9500, stock: 65 },
      { name: 'Non-Stick Cooking Pot Set', description: '5-piece set with matching lids', price: 27000, stock: 35 },
      { name: 'LED Bulbs (Pack of 4)', description: '9W cool white bulbs, screw base', price: 4200, stock: 200 },
    ],
  },
];

/**
 * Seeds categories and products if the database is empty. Safe to run
 * multiple times - exits early if categories already exist.
 */
export function seedDatabase(): void {
  const db = getDb();

  const existing = db.prepare('SELECT COUNT(*) AS count FROM categories').get() as { count: number };
  if (existing.count > 0) {
    console.log('Database already seeded - skipping.');
    return;
  }

  const insertCategory = db.prepare('INSERT INTO categories (name, slug) VALUES (?, ?)');
  const insertProduct = db.prepare(`
    INSERT INTO products (category_id, name, description, price, stock)
    VALUES (?, ?, ?, ?, ?)
  `);

  const seedTx = db.transaction(() => {
    for (const category of SEED_DATA) {
      const info = insertCategory.run(category.name, category.slug);
      const categoryId = info.lastInsertRowid as number;

      for (const product of category.products) {
        insertProduct.run(categoryId, product.name, product.description, product.price, product.stock);
      }
    }
  });

  seedTx();

  const totalProducts = SEED_DATA.reduce((sum, c) => sum + c.products.length, 0);
  console.log(`Seeded ${SEED_DATA.length} categories and ${totalProducts} products.`);
}

if (require.main === module) {
  seedDatabase();
}
