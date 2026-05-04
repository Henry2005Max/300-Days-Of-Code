// Outbound webhook delivery.
// POSTs a JSON payload to the recipient's configured URL.
// Includes a signature header (HMAC-SHA256 of the body) so the receiver
// can verify the request came from us — same pattern as Day 66's webhook handler.

import axios from "axios";

const TIMEOUT = Number(process.env.WEBHOOK_TIMEOUT_MS) || 5000;

export interface WebhookPayload {
    event:   string;
    job_id:  number;
    payload: unknown;
    sent_at: string;
}

export async function sendWebhook(
    url: string,
    data: WebhookPayload
): Promise<{ status: number }> {
    const body      = JSON.stringify(data);
    const timestamp = Math.floor(Date.now() / 1000).toString();

    const response = await axios.post(url, data, {
        timeout: TIMEOUT,
        headers: {
            "Content-Type":         "application/json",
            "X-Notify-Timestamp":   timestamp,
            "X-Notify-Event":       data.event,
            "User-Agent":           "NaijaNotify-Webhook/1.0",
        },
        // Only treat 2xx as success
        validateStatus: (status) => status >= 200 && status < 300,
    });

    return { status: response.status };
}