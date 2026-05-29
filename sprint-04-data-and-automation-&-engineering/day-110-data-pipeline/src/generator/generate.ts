import fs   from 'fs';
import path from 'path';

const PRODUCTS = [
    ['Samsung Galaxy A54',    'Electronics', 195000],
    ['Tecno Camon 20',        'Electronics', 185000],
    ['iPhone 15',             'Electronics', 950000],
    ['HP Laptop 15',          'Electronics', 480000],
    ['JBL Speaker',           'Electronics', 35000],
    ['Ankara Print Fabric',   'Fashion',     8500],
    ['Aso-Oke Fabric',        'Fashion',     25000],
    ['George Wrapper',        'Fashion',     32000],
    ['Native Agbada Set',     'Fashion',     95000],
    ['Rice 50kg',             'Food',        42000],
    ['Groundnut Oil 5L',      'Food',        7200],
    ['Indomie Carton',        'Food',        5400],
    ['Palm Oil 5L',           'Food',        6500],
    ['Nivea Lotion Pack',     'Beauty',      4500],
    ['MAC Makeup Set',        'Beauty',      85000],
    ['Shea Butter 1kg',       'Beauty',      3500],
    ['Office Chair',          'Furniture',   85000],
    ['Standing Desk',         'Furniture',   145000],
    ['Sofa Set 3-Seater',     'Furniture',   280000],
    ['Football Size 5',       'Sports',      12000],
    ['Gym Dumbbell Set',      'Sports',      45000],
    ['Yoga Mat',              'Sports',      9500],
] as [string, string, number][];

const CITIES = [
    ['Lagos', 'Lagos'], ['Abuja', 'FCT'], ['Kano', 'Kano'],
    ['Port Harcourt', 'Rivers'], ['Ibadan', 'Oyo'], ['Enugu', 'Enugu'],
    ['Kaduna', 'Kaduna'], ['Benin City', 'Edo'], ['Onitsha', 'Anambra'],
    ['Warri', 'Delta'], ['Owerri', 'Imo'], ['Zaria', 'Kaduna'],
];

const CUSTOMERS = [
    'Adebayo Okafor', 'Chidinma Nwosu', 'Musa Aliyu', 'Fatima Bello',
    'Emeka Eze', 'Ngozi Obi', 'Ibrahim Sule', 'Aisha Mohammed',
    'Tunde Adewale', 'Blessing Okoro', 'Yusuf Garba', 'Adaeze Okonkwo',
    'Oluwaseun Adeyemi', 'Kemi Afolabi', 'Chukwudi Oha',
];

function randInt(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randDate(start: Date, end: Date): string {
    const d = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    return d.toISOString().slice(0, 10);
}

function generate(): void {
    const outPath = path.resolve('./data/input/sales.csv');
    fs.mkdirSync(path.dirname(outPath), { recursive: true });

    const ROWS   = 50_000;
    const start  = new Date('2024-01-01');
    const end    = new Date('2024-12-31');

    const header = 'order_id,customer_name,product,category,quantity,unit_price,total_amount,city,state,order_date\n';
    const ws     = fs.createWriteStream(outPath);
    ws.write(header);

    for (let i = 1; i <= ROWS; i++) {
        const [product, category, price] = PRODUCTS[randInt(0, PRODUCTS.length - 1)];
        const [city, state]              = CITIES[randInt(0, CITIES.length - 1)];
        const customer                   = CUSTOMERS[randInt(0, CUSTOMERS.length - 1)];
        const qty                        = randInt(1, 5);
        // Introduce ~3% dirty rows for the pipeline to handle
        const isDirty = Math.random() < 0.03;
        const total   = isDirty ? -1 : price * qty;
        const unitP   = isDirty ? 0  : price;

        ws.write(
            `ORD-${String(i).padStart(6, '0')},` +
            `"${customer}",` +
            `"${product}",` +
            `${category},` +
            `${qty},` +
            `${unitP},` +
            `${total},` +
            `"${city}",` +
            `${state},` +
            `${randDate(start, end)}\n`
        );
    }

    ws.end(() => {
        console.log(`[Generator] Wrote ${ROWS.toLocaleString()} rows → ${outPath}`);
    });
}

generate();