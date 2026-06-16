import { getPool } from '../db/pool';
import { runMigrations } from '../db/migrations';

const REPS = [
  { name: 'Emeka Okonkwo',   region: 'South East' },
  { name: 'Fatima Yusuf',    region: 'North West' },
  { name: 'Tunde Adeyemi',   region: 'South West' },
  { name: 'Ngozi Eze',       region: 'South East' },
  { name: 'Musa Garba',      region: 'North Central' },
  { name: 'Amaka Obi',       region: 'South South' },
  { name: 'Biodun Afolabi',  region: 'South West' },
  { name: 'Halima Suleiman', region: 'North East' },
  { name: 'Chukwudi Nweke',  region: 'South East' },
  { name: 'Aisha Bello',     region: 'North West' },
];

const PRODUCTS: { name: string; category: string; unitPrice: number }[] = [
  { name: 'Tecno Camon 30',            category: 'Phones & Tablets',         unitPrice: 285000 },
  { name: 'Infinix Note 40',           category: 'Phones & Tablets',         unitPrice: 245000 },
  { name: 'Samsung Galaxy A15',        category: 'Phones & Tablets',         unitPrice: 189000 },
  { name: 'itel Pad 1',                category: 'Phones & Tablets',         unitPrice: 98000  },
  { name: 'Ankara Print Fabric',       category: 'Fashion & Apparel',        unitPrice: 18500  },
  { name: 'Senator Suit Set',          category: 'Fashion & Apparel',        unitPrice: 32000  },
  { name: 'Adire Tie-Dye Shirt',       category: 'Fashion & Apparel',        unitPrice: 15000  },
  { name: 'LG 32-inch LED TV',         category: 'Electronics & Appliances', unitPrice: 110000 },
  { name: 'Hisense 150L Fridge',       category: 'Electronics & Appliances', unitPrice: 175000 },
  { name: 'Oraimo Bluetooth Speaker',  category: 'Electronics & Appliances', unitPrice: 16500  },
  { name: 'Sokany Standing Fan',       category: 'Electronics & Appliances', unitPrice: 22000  },
  { name: 'Golden Penny Spaghetti',    category: 'Groceries',                unitPrice: 13500  },
  { name: 'Indomie Noodles (Carton)',  category: 'Groceries',                unitPrice: 9800   },
  { name: 'Kings Vegetable Oil (5L)',  category: 'Groceries',                unitPrice: 14000  },
  { name: 'Vono Foam Mattress (6x6)', category: 'Home & Living',            unitPrice: 65000  },
  { name: 'Non-Stick Cooking Pot Set', category: 'Home & Living',            unitPrice: 27000  },
  { name: 'LED Bulbs (Pack of 4)',     category: 'Home & Living',            unitPrice: 4200   },
];

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDate(from: Date, to: Date): string {
  const d = new Date(from.getTime() + Math.random() * (to.getTime() - from.getTime()));
  return d.toISOString().split('T')[0];
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export async function seedSales(): Promise<void> {
  await runMigrations();
  const pool = getPool();

  const existing = await pool.query('SELECT COUNT(*)::int AS count FROM sales');
  if (existing.rows[0].count > 0) {
    console.log(`Already seeded (${existing.rows[0].count} rows) — skipping.`);
    return;
  }

  const from = new Date('2025-01-01');
  const to   = new Date('2025-06-13');

  const values: string[] = [];
  const params: (string | number)[] = [];
  let idx = 1;

  // ~200 rows across 6 months
  for (let i = 0; i < 200; i++) {
    const rep     = pick(REPS);
    const product = pick(PRODUCTS);
    const units   = randomInt(1, 20);
    const date    = randomDate(from, to);

    values.push(`($${idx++}, $${idx++}, $${idx++}, $${idx++}, $${idx++}, $${idx++})`);
    params.push(rep.name, rep.region, product.name, product.category, units, product.unitPrice);
  }

  await pool.query(
    `INSERT INTO sales (rep_name, region, product, category, units, unit_price) VALUES ${values.join(', ')}`,
    params
  );

  console.log('Seeded 200 sales rows across 10 reps, 5 categories, 6 months.');
}

if (require.main === module) {
  seedSales()
    .then(() => process.exit(0))
    .catch((err) => { console.error(err); process.exit(1); });
}
