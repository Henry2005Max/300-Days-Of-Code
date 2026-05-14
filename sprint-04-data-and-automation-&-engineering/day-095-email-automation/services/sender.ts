import fs from 'fs';
import path from 'path';
import { getTransporter } from './mailer';
import { loadSmtpConfig } from '../config/config';
import { EmailPayload, SendResult } from '../types';

const OUTPUT_DIR = process.env.OUTPUT_DIR || './output';

function toArray(val: string | string[]): string[] {
    return Array.isArray(val) ? val : [val];
}

function safeFilename(subject: string): string {
    return subject.replace(/[^a-z0-9]/gi, '-').toLowerCase().slice(0, 60);
}

export async function sendEmail(payload: EmailPayload, dryRun: boolean): Promise<SendResult[]> {
    const recipients = toArray(payload.to);
    const results: SendResult[] = [];

    for (const recipient of recipients) {
        if (dryRun) {
            const result = writeToDisk(payload, recipient);
            results.push(result);
        } else {
            const result = await sendLive(payload, recipient);
            results.push(result);
        }
    }

    return results;
}

function writeToDisk(payload: EmailPayload, recipient: string): SendResult {
    const dir = path.resolve(OUTPUT_DIR);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const filename  = `${safeFilename(payload.subject)}.html`;
    const filePath  = path.join(dir, filename);
    fs.writeFileSync(filePath, payload.html, 'utf-8');

    console.log(`[DRY RUN] Email written to: ${filePath}`);
    console.log(`[DRY RUN] To      : ${recipient}`);
    console.log(`[DRY RUN] Subject : ${payload.subject}\n`);

    return {
        success:    true,
        dryRun:     true,
        recipient,
        subject:    payload.subject,
        outputFile: filePath,
    };
}

async function sendLive(payload: EmailPayload, recipient: string): Promise<SendResult> {
    const config      = loadSmtpConfig();
    const transporter = getTransporter();

    try {
        const info = await transporter.sendMail({
            from:    `"${config.fromName}" <${config.fromEmail}>`,
            to:      recipient,
            subject: payload.subject,
            text:    payload.text,
            html:    payload.html,
            attachments: payload.attachments?.map((a) => ({
                filename:    a.filename,
                content:     a.content,
                contentType: a.contentType,
            })),
        });

        console.log(`[Mailer] Sent to ${recipient} — Message ID: ${info.messageId}`);

        return {
            success:   true,
            dryRun:    false,
            recipient,
            subject:   payload.subject,
            messageId: info.messageId,
        };
    } catch (err) {
        const error = (err as Error).message;
        console.error(`[Mailer] Failed to send to ${recipient}: ${error}`);

        return {
            success:   false,
            dryRun:    false,
            recipient,
            subject:   payload.subject,
            error,
        };
    }
}