import nodemailer from 'nodemailer';
import { loadSmtpConfig } from '../config/config';

let transporter: nodemailer.Transporter | null = null;

export function getTransporter(): nodemailer.Transporter {
    if (!transporter) {
        const config = loadSmtpConfig();

        transporter = nodemailer.createTransport({
            host:   config.host,
            port:   config.port,
            secure: config.secure,
            auth: {
                user: config.user,
                pass: config.pass,
            },
        });
    }

    return transporter;
}

export async function verifyConnection(): Promise<void> {
    const transport = getTransporter();
    await transport.verify();
    console.log('[Mailer] SMTP connection verified.');
}