import dotenv from 'dotenv';
dotenv.config();

import { getClient, disconnectClient } from '../db/client';

const categories = [
    'Electronics',
    'Fashion',
    'Food & Grocery',
    'Beauty',
    'Furniture',
    'Sports',
];

const products = [
    { name: 'Samsung Galaxy A54', price: 195000, stock: 42, category: 'Electronics', description: '6.4-inch AMOLED, 128GB storage' },
    { name: 'Tecno Camon 20', price: 185000, stock: 30, category: 'Electronics', description: '6.67-inch display, 64MP camera' },
    { name: 'iPhone 15', price: 950000, stock: 8, category: 'Electronics', description: 'A16 Bionic chip, 128GB' },
    { name: 'HP Laptop 15', price: 480000, stock: 15, category: 'Electronics', description: 'Intel Core i5, 8GB RAM, 512GB SSD' },
    { name: 'JBL Bluetooth Speaker', price: 35000, stock: 60, category: 'Electronics', description: 'Waterproof, 12hr battery' },
    { name: 'Ankara Print Fabric', price: 8500, stock: 200, category: 'Fashion', description: '6 yards, assorted prints' },
    { name: 'Aso-Oke Fabric', price: 25000, stock: 80, category: 'Fashion', description: 'Handwoven, premium quality' },
    { name: 'George Wrapper', price: 32000, stock: 55, category: 'Fashion', description: 'Indian George, 5 yards' },
    { name: 'Native Agbada Set', price: 95000, stock: 20, category: 'Fashion', description: 'Embroidered, 3-piece set' },
    { name: 'Kampala Fabric', price: 28000, stock: 90, category: 'Fashion', description: '6 yards, wax print' },
    { name: 'Rice 50kg Bag', price: 42000, stock: 150, category: 'Food & Grocery', description: 'Ofada/local long grain' },
    { name: 'Groundnut Oil 5L', price: 7200, stock: 200, category: 'Food & Grocery', description: 'Pure groundnut, no additives' },
    { name: 'Indomie Noodles Carton', price: 5400, stock: 300, category: 'Food & Grocery', description: '40 packs per carton' },
    { name: 'Palm Oil 5L', price: 6500, stock: 180, category: 'Food & Grocery', description: 'Fresh red palm oil' },
    { name: 'Beans 50kg Bag', price: 35000, stock: 100, category: 'Food & Grocery', description: 'Brown honey beans' },
    { name: 'Nivea Body Lotion Pack', price: 4500, stock: 250, category: 'Beauty', description: '400ml, sensitive skin' },
    { name: 'MAC Makeup Set', price: 85000, stock: 12, category: 'Beauty', description: 'Foundation, concealer, lipstick bundle' },
    { name: 'Shea Butter 1kg', price: 3500, stock: 400, category: 'Beauty', description: 'Raw, unrefined, organic' },
    { name: 'OAN Skincare Kit', price: 18500, stock: 45, category: 'Beauty', description: 'Cleanser, toner, moisturiser' },
    { name: 'Zaron Foundation', price: 7500, stock: 70, category: 'Beauty', description: 'SPF 15, 8 shades' },
    { name: 'Office Chair', price: 85000, stock: 25, category: 'Furniture', description: 'Ergonomic, lumbar support' },
    { name: 'Standing Desk', price: 145000, stock: 10, category: 'Furniture', description: 'Height-adjustable, 120cm width' },
    { name: 'Sofa Set 3-Seater', price: 280000, stock: 6, category: 'Furniture', description: 'Leather finish, includes throw pillows' },
    { name: 'Dining Table Set', price: 195000, stock: 8, category: 'Furniture', description: '6-seater, solid mahogany' },
    { name: 'Mattress 6x6 Orthopedic', price: 185000, stock: 14, category: 'Furniture', description: 'Bonnell spring, 10-inch depth' },
    { name: 'Football (Size 5)', price: 12000, stock: 80, category: 'Sports', description: 'FIFA approved, hand-stitched' },
    { name: 'Gym Dumbbell Set', price: 45000, stock: 30, category: 'Sports', description: '5kg–20kg pairs, rubber coated' },
    { name: 'Running Shoes', price: 28000, stock: 50, category: 'Sports', description: 'Lightweight mesh, sizes 39–46' },
    { name: 'Yoga Mat', price: 9500, stock: 60, category: 'Sports', description: 'Non-slip, 6mm thickness' },
    { name: 'Swimming Goggles', price: 6800, stock: 40, category: 'Sports', description: 'Anti-fog, UV protection' },
];

const users = [
    { name: 'Adebayo Okafor', email: 'adebayo.okafor@gmail.com', phone: '08012345678', city: 'Lagos', state: 'Lagos' },
    { name: 'Chidinma Nwosu', email: 'chidinma.nwosu@yahoo.com', phone: '08023456789', city: 'Enugu', state: 'Enugu' },
    { name: 'Musa Aliyu', email: 'musa.aliyu@gmail.com', phone: '08034567890', city: 'Kano', state: 'Kano' },
    { name: 'Fatima Bello', email: 'fatima.bello@outlook.com', phone: '08045678901', city: 'Abuja', state: 'FCT' },
    { name: 'Emeka Eze', email: 'emeka.eze@gmail.com', phone: '08056789012', city: 'Onitsha', state: 'Anambra' },
    { name: 'Ngozi Obi', email: 'ngozi.obi@gmail.com', phone: '08067890123', city: 'Ibadan', state: 'Oyo' },
    { name: 'Ibrahim Sule', email: 'ibrahim.sule@gmail.com', phone: '08078901234', city: 'Kaduna', state: 'Kaduna' },
    { name: 'Aisha Mohammed', email: 'aisha.mohammed@yahoo.com', phone: '08089012345', city: 'Port Harcourt', state: 'Rivers' },
    { name: 'Tunde Adewale', email: 'tunde.adewale@gmail.com', phone: '08090123456', city: 'Lagos', state: 'Lagos' },
    { name: 'Blessing Okoro', email: 'blessing.okoro@gmail.com', phone: '08001234567', city: 'Benin City', state: 'Edo' },
    { name: 'Yusuf Garba', email: 'yusuf.garba@gmail.com', phone: '07012345678', city: 'Kano', state: 'Kano' },
    { name: 'Adaeze Okonkwo', email: 'adaeze.okonkwo@gmail.com', phone: '07023456789', city: 'Lagos', state: 'Lagos' },
    { name: 'Oluwaseun Adeyemi', email: 'oluwaseun.adeyemi@gmail.com', phone: '07034567890', city: 'Ibadan', state: 'Oyo' },
    { name: 'Kemi Afolabi', email: 'kemi.afolabi@yahoo.com', phone: '07045678901', city: 'Lagos', state: 'Lagos' },
    { name: 'Chukwudi Oha', email: 'chukwudi.oha@gmail.com', phone: '07056789012', city: 'Abuja', state: 'FCT' },
];

const orderTemplates = [
    { userId: 1, items: [{ product: 'Samsung Galaxy A54', qty: 2 }, { product: 'JBL Bluetooth Speaker', qty: 1 }], status: 'DELIVERED' },
    { userId: 2, items: [{ product: 'Ankara Print Fabric', qty: 5 }], status: 'DELIVERED' },
    { userId: 3, items: [{ product: 'Groundnut Oil 5L', qty: 10 }, { product: 'Indomie Noodles Carton', qty: 4 }], status: 'DELIVERED' },
    { userId: 4, items: [{ product: 'HP Laptop 15', qty: 1 }], status: 'SHIPPED' },
    { userId: 5, items: [{ product: 'Rice 50kg Bag', qty: 2 }, { product: 'Palm Oil 5L', qty: 6 }], status: 'DELIVERED' },
    { userId: 6, items: [{ product: 'Aso-Oke Fabric', qty: 3 }, { product: 'George Wrapper', qty: 2 }], status: 'CONFIRMED' },
    { userId: 7, items: [{ product: 'Football (Size 5)', qty: 3 }, { product: 'Running Shoes', qty: 2 }], status: 'DELIVERED' },
    { userId: 8, items: [{ product: 'Nivea Body Lotion Pack', qty: 6 }, { product: 'Shea Butter 1kg', qty: 10 }], status: 'DELIVERED' },
    { userId: 9, items: [{ product: 'Office Chair', qty: 1 }, { product: 'Standing Desk', qty: 1 }], status: 'DELIVERED' },
    { userId: 10, items: [{ product: 'Groundnut Oil 5L', qty: 8 }, { product: 'Beans 50kg Bag', qty: 3 }], status: 'SHIPPED' },
    { userId: 11, items: [{ product: 'Tecno Camon 20', qty: 3 }], status: 'DELIVERED' },
    { userId: 12, items: [{ product: 'Ankara Print Fabric', qty: 4 }, { product: 'Kampala Fabric', qty: 3 }], status: 'CONFIRMED' },
    { userId: 13, items: [{ product: 'Rice 50kg Bag', qty: 2 }], status: 'DELIVERED' },
    { userId: 14, items: [{ product: 'MAC Makeup Set', qty: 1 }, { product: 'Zaron Foundation', qty: 3 }], status: 'DELIVERED' },
    { userId: 15, items: [{ product: 'Dining Table Set', qty: 1 }, { product: 'Sofa Set 3-Seater', qty: 1 }], status: 'PENDING' },
    { userId: 1, items: [{ product: 'iPhone 15', qty: 1 }], status: 'DELIVERED' },
    { userId: 3, items: [{ product: 'Native Agbada Set', qty: 1 }, { product: 'Running Shoes', qty: 1 }], status: 'DELIVERED' },
    { userId: 5, items: [{ product: 'Gym Dumbbell Set', qty: 1 }, { product: 'Yoga Mat', qty: 2 }], status: 'DELIVERED' },
    { userId: 9, items: [{ product: 'Mattress 6x6 Orthopedic', qty: 1 }], status: 'DELIVERED' },
    { userId: 14, items: [{ product: 'OAN Skincare Kit', qty: 2 }, { product: 'Nivea Body Lotion Pack', qty: 4 }], status: 'SHIPPED' },
];

async function seed() {
    const prisma = getClient();

    console.log('[Seeder] Clearing existing data...');
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.product.deleteMany();
    await prisma.category.deleteMany();
    await prisma.user.deleteMany();

    console.log('[Seeder] Seeding categories...');
    for (const name of categories) {
        await prisma.category.create({ data: { name } });
    }

    console.log('[Seeder] Seeding products...');
    for (const p of products) {
        const category = await prisma.category.findUnique({ where: { name: p.category } });
        if (!category) continue;
        await prisma.product.create({
            data: {
                name: p.name,
                price: p.price,
                stock: p.stock,
                description: p.description,
                categoryId: category.id,
            },
        });
    }

    console.log('[Seeder] Seeding users...');
    for (const u of users) {
        await prisma.user.create({ data: u });
    }

    console.log('[Seeder] Seeding orders...');
    for (const template of orderTemplates) {
        let total = 0;
        const lineItems: { productId: number; quantity: number; unitPrice: number; subtotal: number }[] = [];

        for (const item of template.items) {
            const product = await prisma.product.findFirst({ where: { name: item.product } });
            if (!product) continue;
            const unitPrice = Number(product.price);
            const subtotal = unitPrice * item.qty;
            total += subtotal;
            lineItems.push({ productId: product.id, quantity: item.qty, unitPrice, subtotal });
        }

        const order = await prisma.order.create({
            data: {
                userId: template.userId,
                status: template.status as any,
                totalAmount: total,
            },
        });

        for (const line of lineItems) {
            await prisma.orderItem.create({
                data: {
                    orderId: order.id,
                    productId: line.productId,
                    quantity: line.quantity,
                    unitPrice: line.unitPrice,
                    subtotal: line.subtotal,
                },
            });
        }
    }

    console.log('[Seeder] Done. Database seeded successfully.');
    await disconnectClient();
}

seed().catch((err) => {
    console.error('[Seeder] Error:', err.message);
    process.exit(1);
});