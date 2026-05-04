import { NotificationType } from "../types";

interface RenderedTemplate {
    subject: string;
    html: string;
    text: string;
}

const APP = () => process.env.APP_NAME || "NaijaNotify";
const YEAR = new Date().getFullYear();

function wrap(title: string, bodyHtml: string, bodyText: string): RenderedTemplate {
    const html = `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px 0;">
<table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:8px;overflow:hidden;">
  <tr><td style="background:#1a73e8;padding:20px 32px;"><span style="color:#fff;font-size:18px;font-weight:bold;">${APP()}</span></td></tr>
  <tr><td style="padding:32px;">${bodyHtml}</td></tr>
  <tr><td style="background:#f4f4f4;padding:14px 32px;text-align:center;"><span style="color:#888;font-size:12px;">&copy; ${YEAR} ${APP()}. Lagos, Nigeria.</span></td></tr>
</table></td></tr></table></body></html>`;
    return { subject: title, html, text: `${title}\n\n${bodyText}` };
}

const BUILDERS: Record<NotificationType, (data: Record<string, unknown>) => RenderedTemplate> = {
    welcome(data) {
        const name = String(data.name || "there");
        return wrap(
            `Welcome to ${APP()}, ${name}!`,
            `<h2 style="color:#1a73e8;">Welcome, ${name}!</h2><p style="color:#333;line-height:1.6;">Your account is ready. We are excited to have you on board.</p>`,
            `Welcome ${name}! Your account is ready.`
        );
    },
    password_reset(data) {
        const name  = String(data.name || "User");
        const link  = String(data.reset_link || "#");
        return wrap(
            "Reset your password",
            `<h2 style="color:#1a73e8;">Password Reset</h2><p style="color:#333;">Hello ${name},</p><p style="color:#333;">Click below to reset your password. This link expires in <strong>30 minutes</strong>.</p><p style="text-align:center;margin:28px 0;"><a href="${link}" style="background:#1a73e8;color:#fff;padding:12px 24px;border-radius:4px;text-decoration:none;">Reset Password</a></p>`,
            `Hello ${name},\n\nReset your password here: ${link}\n\nExpires in 30 minutes.`
        );
    },
    order_confirmation(data) {
        const name    = String(data.name    || "Customer");
        const orderId = String(data.order_id || "N/A");
        const amount  = String(data.amount  || "0");
        return wrap(
            `Order Confirmed — #${orderId}`,
            `<h2 style="color:#1a73e8;">Order Confirmed!</h2><p style="color:#333;">Hello ${name}, thank you for your order.</p><p style="color:#333;font-size:16px;"><strong>Order #${orderId}</strong> — Total: <span style="color:#1a73e8;">&#8358;${amount}</span></p>`,
            `Hello ${name},\n\nOrder #${orderId} confirmed.\nTotal: ₦${amount}`
        );
    },
    low_stock_alert(data) {
        const product   = String(data.product   || "Unknown Product");
        const remaining = String(data.remaining || "0");
        return wrap(
            `Low Stock: ${product}`,
            `<h2 style="color:#e53935;">Low Stock Alert</h2><p style="color:#333;"><strong>${product}</strong> — only <strong style="color:#e53935;">${remaining}</strong> units left. Please restock.</p>`,
            `LOW STOCK: ${product}\nOnly ${remaining} units remaining.`
        );
    },
    payment_received(data) {
        const name   = String(data.name   || "Customer");
        const amount = String(data.amount || "0");
        const ref    = String(data.ref    || "");
        return wrap(
            "Payment Received",
            `<h2 style="color:#43a047;">Payment Received</h2><p style="color:#333;">Hello ${name},</p><p style="color:#333;">We received your payment of <strong style="color:#43a047;">&#8358;${amount}</strong>${ref ? ` (Ref: ${ref})` : ""}. Thank you!</p>`,
            `Hello ${name},\n\nPayment of ₦${amount} received.${ref ? ` Ref: ${ref}` : ""}`
        );
    },
    custom(data) {
        const subject = String(data.subject || "Notification");
        const message = String(data.message || "You have a new notification.");
        return wrap(subject, `<p style="color:#333;line-height:1.6;">${message}</p>`, message);
    },
};

export function renderTemplate(
    type: NotificationType,
    data: Record<string, unknown>
): RenderedTemplate {
    const builder = BUILDERS[type];
    if (!builder) throw new Error(`Unknown notification type: ${type}`);
    return builder(data);
}