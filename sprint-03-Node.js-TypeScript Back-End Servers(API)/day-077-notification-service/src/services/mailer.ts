// This file owns the Nodemailer transporter.
// On startup it checks whether SMTP credentials are set in .env.
// If they are NOT set (typical first run), it auto-creates a free Ethereal
// test account and prints the credentials to the console so you can copy them.
//
// Ethereal (https://ethereal.email) is a fake SMTP server that CATCHES emails
// without actually delivering them. Every sent email gets a preview URL you can
// open in the browser — perfect for development.

import nodemailer, { Transporter } from "nodemailer";

let transporter: Transporter;

export async function initMailer(): Promise<void> {
    const { SMTP_HOST, SMTP_USER, SMTP_PASS, SMTP_PORT } = process.env;

    if (SMTP_USER && SMTP_PASS) {
        // Use whatever SMTP credentials are in .env (Ethereal, Gmail, SendGrid, etc.)
        transporter = nodemailer.createTransport({
            host: SMTP_HOST || "smtp.ethereal.email",
            port: Number(SMTP_PORT) || 587,
            auth: { user: SMTP_USER, pass: SMTP_PASS },
        });
        console.log("[mailer] Using SMTP credentials from .env");
    } else {
        // Auto-create an Ethereal test account — no sign-up needed
        const testAccount = await nodemailer.createTestAccount();

        transporter = nodemailer.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            auth: { user: testAccount.user, pass: testAccount.pass },
        });

        // Print credentials so the developer can paste them into .env
        console.log("\n[mailer] No SMTP credentials found. Created Ethereal test account:");
        console.log(`  SMTP_USER=${testAccount.user}`);
        console.log(`  SMTP_PASS=${testAccount.pass}`);
        console.log("  Copy the above into your .env to reuse this account across restarts.\n");
    }
}

// Send an email and return Nodemailer's info object (includes messageId and previewUrl)
export async function sendMail(options: {
    to: string;
    subject: string;
    html: string;
    text: string;
}): Promise<{ messageId: string; previewUrl: string | false }> {
    const fromName  = process.env.FROM_NAME  || "NaijaNotify";
    const fromEmail = process.env.FROM_EMAIL || "noreply@example.ng";

    const info = await transporter.sendMail({
        from: `"${fromName}" <${fromEmail}>`,
        ...options,
    });

    // nodemailer.getTestMessageUrl() returns the Ethereal preview URL (or false for real SMTP)
    const previewUrl = nodemailer.getTestMessageUrl(info);
    console.log(`[mailer] Message sent: ${info.messageId}`);
    if (previewUrl) console.log(`[mailer] Preview URL: ${previewUrl}`);

    return { messageId: info.messageId, previewUrl };
}