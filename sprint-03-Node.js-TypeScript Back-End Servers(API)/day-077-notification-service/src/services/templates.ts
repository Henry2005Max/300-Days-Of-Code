// Email templates.
// Each function takes a data object and returns { subject, html, text }.
// HTML emails use inline styles because many email clients strip <style> blocks.
// The plain-text version is sent alongside HTML for clients that prefer it.

import { NotificationType } from "../types";

interface TemplateResult {
    subject: string;
    html: string;
    text: string;
}

const appName = () => process.env.APP_NAME || "NaijaNotify";

// Shared wrapper so all emails have a consistent header/footer
function wrap(title: string, bodyHtml: string, bodyText: string): TemplateResult {
    const year = new Date().getFullYear();

    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>${title}</title></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding:24px 0;">
        <table width="600" cellpadding="0" cellspacing="0"
               style="background:#ffffff;border-radius:8px;overflow:hidden;">
          <!-- Header -->
          <tr>
            <td style="background:#1a73e8;padding:24px 32px;">
              <span style="color:#ffffff;font-size:20px;font-weight:bold;">
                ${appName()}
              </span>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              ${bodyHtml}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#f4f4f4;padding:16px 32px;text-align:center;">
              <span style="color:#888;font-size:12px;">
                &copy; ${year} ${appName()}. Lagos, Nigeria.
              </span>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    const text = `${title}\n\n${bodyText}\n\n---\n${appName()} | Lagos, Nigeria`;
    return { subject: title, html, text };
}

// ── Individual templates ─────────────────────────────────────────────────────

function welcomeTemplate(data: Record<string, unknown>): TemplateResult {
    const name = String(data.name || "there");
    return wrap(
        `Welcome to ${appName()}, ${name}!`,
        `<h2 style="color:#1a73e8;">Welcome, ${name}! 🎉</h2>
     <p style="color:#333;line-height:1.6;">
       Your account has been created successfully. We are excited to have you on board.
     </p>
     <p style="color:#333;line-height:1.6;">
       If you have any questions, reply to this email and our team in Lagos will be happy to help.
     </p>`,
        `Welcome, ${name}!\n\nYour account has been created successfully.\nWe are excited to have you on board.`
    );
}

function passwordResetTemplate(data: Record<string, unknown>): TemplateResult {
    const name  = String(data.name  || "User");
    const token = String(data.token || "NO_TOKEN");
    const link  = String(data.resetLink || `https://example.ng/reset?token=${token}`);
    return wrap(
        "Reset your password",
        `<h2 style="color:#1a73e8;">Password Reset Request</h2>
     <p style="color:#333;line-height:1.6;">Hello ${name},</p>
     <p style="color:#333;line-height:1.6;">
       We received a request to reset your password. Click the button below.
       This link expires in <strong>30 minutes</strong>.
     </p>
     <p style="text-align:center;margin:32px 0;">
       <a href="${link}"
          style="background:#1a73e8;color:#fff;padding:12px 28px;
                 border-radius:4px;text-decoration:none;font-weight:bold;">
         Reset Password
       </a>
     </p>
     <p style="color:#888;font-size:13px;">
       If you did not request this, please ignore this email.
     </p>`,
        `Password Reset\n\nHello ${name},\n\nReset your password here: ${link}\n\nThis link expires in 30 minutes.`
    );
}

function orderConfirmationTemplate(data: Record<string, unknown>): TemplateResult {
    const name    = String(data.name    || "Customer");
    const orderId = String(data.orderId || "N/A");
    const amount  = String(data.amount  || "0");
    const items   = Array.isArray(data.items)
        ? (data.items as { name: string; qty: number; price: string }[])
        : [];

    const itemRows = items.map(
        (i) => `<tr>
      <td style="padding:8px;border-bottom:1px solid #eee;">${i.name}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;text-align:center;">${i.qty}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;text-align:right;">${i.price}</td>
    </tr>`
    ).join("");

    return wrap(
        `Order Confirmation — #${orderId}`,
        `<h2 style="color:#1a73e8;">Order Confirmed!</h2>
     <p style="color:#333;line-height:1.6;">Hello ${name}, thank you for your order.</p>
     ${items.length > 0 ? `
     <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:16px 0;">
       <thead>
         <tr style="background:#f4f4f4;">
           <th style="padding:8px;text-align:left;">Item</th>
           <th style="padding:8px;text-align:center;">Qty</th>
           <th style="padding:8px;text-align:right;">Price</th>
         </tr>
       </thead>
       <tbody>${itemRows}</tbody>
     </table>` : ""}
     <p style="color:#333;font-size:16px;font-weight:bold;">
       Total: <span style="color:#1a73e8;">&#8358;${amount}</span>
     </p>`,
        `Order Confirmed — #${orderId}\n\nHello ${name}, your order has been placed.\nTotal: ₦${amount}`
    );
}

function lowStockAlertTemplate(data: Record<string, unknown>): TemplateResult {
    const product   = String(data.product  || "Unknown Product");
    const remaining = String(data.remaining || "0");
    return wrap(
        `Low Stock Alert: ${product}`,
        `<h2 style="color:#e53935;">Low Stock Alert</h2>
     <p style="color:#333;line-height:1.6;">
       <strong>${product}</strong> is running low.
       Only <strong style="color:#e53935;">${remaining} units</strong> remaining.
     </p>
     <p style="color:#333;line-height:1.6;">
       Please restock soon to avoid disruptions.
     </p>`,
        `Low Stock Alert: ${product}\n\nOnly ${remaining} units remaining. Please restock soon.`
    );
}

function customTemplate(data: Record<string, unknown>): TemplateResult {
    const subject = String(data.subject || "Notification");
    const message = String(data.message || "You have a new notification.");
    return wrap(
        subject,
        `<p style="color:#333;line-height:1.6;">${message}</p>`,
        message
    );
}

// ── Template router ──────────────────────────────────────────────────────────

const TEMPLATES: Record<NotificationType, (data: Record<string, unknown>) => TemplateResult> = {
    welcome:            welcomeTemplate,
    password_reset:     passwordResetTemplate,
    order_confirmation: orderConfirmationTemplate,
    low_stock_alert:    lowStockAlertTemplate,
    custom:             customTemplate,
};

export function buildTemplate(type: NotificationType, data: Record<string, unknown>): TemplateResult {
    const builder = TEMPLATES[type];
    if (!builder) throw new Error(`Unknown notification type: ${type}`);
    return builder(data);
}