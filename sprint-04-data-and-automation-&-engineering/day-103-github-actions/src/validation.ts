import { z } from 'zod';

export const OrderSchema = z.object({
    orderId:      z.string().min(1),
    customerName: z.string().min(2),
    product:      z.string().min(1),
    quantity:     z.number().int().positive(),
    unitPrice:    z.number().positive(),
    city:         z.string().min(1),
});

export type Order = z.infer<typeof OrderSchema>;

export function validateOrder(data: unknown): Order {
    return OrderSchema.parse(data);
}

export function isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidNigerianPhone(phone: string): boolean {
    return /^(\+?234|0)(7|8|9)(0|1)\d{8}$/.test(phone.replace(/\s/g, ''));
}

export function sanitizeInput(input: string): string {
    return input.trim().replace(/[<>"'`]/g, '');
}