import nodemailer, { Transporter } from "nodemailer";

let transporter: Transporter;

export async function initMailer(): Promise<void> {
    const { SMTP_USER, SMTP_PASS, SMTP_HOST, SMTP_PORT } = process.env;

    if (SMTP_USER && SMTP_PASS) {
        transporter = nodemailer.createTransport({
            host: SMTP_HOST || "smtp.ethereal.email",
            port: Number(SMTP_PORT) || 587,
            auth: { user: SMTP_USER, pass: SMTP_PASS },
        });
        console.log("[mailer] Using SMTP credentials from .env");
    } else {
        const account = await nodemailer.createTestAccount();
        transporter = nodemailer.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            auth: { user: account.user, pass: account.pass },
        });
        console.log("\n[mailer] No SMTP credentials — created Ethereal test account:");
        console.log(`  SMTP_USER=${account.user}`);
        console.log(`  SMTP_PASS=${account.pass}`);
        console.log("  Copy into .env to reuse across restarts.\n");
    }
}

export async function sendEmail(opts: {
    to: string;
    subject: string;
    html: string;
    text: string;
}): Promise<{ messageId: string; previewUrl: string | false }> {
    const from = `"${process.env.FROM_NAME || "NaijaNotify"}" <${process.env.FROM_EMAIL || "noreply@example.ng"}>`;
    const info  = await transporter.sendMail({ from, ...opts });
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) console.log(`[mailer] Preview: ${previewUrl}`);
    return { messageId: info.messageId, previewUrl };
}