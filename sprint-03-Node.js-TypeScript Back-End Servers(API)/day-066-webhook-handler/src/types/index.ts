 /*── GitHub webhook event shapes ── */
export interface GitHubPushEvent {
  ref: string;           /* e.g. "refs/heads/main" */
  repository: {
    name: string;
    full_name: string;
  };
  pusher: {
    name: string;
    email: string;
  };
  commits: {
    id: string;
    message: string;
    author: { name: string; email: string };
  }[];
}

export interface GitHubPREvent {
  action: string;        /* "opened", "closed", "merged" */
  pull_request: {
    number: number;
    title: string;
    user: { login: string };
    merged: boolean;
  };
  repository: {
    name: string;
    full_name: string;
  };
}

/* ── Paystack webhook event shapes ── */
export interface PaystackEvent {
  event: string;         /* "charge.success", "charge.failed" etc */
  data: {
    id: number;
    reference: string;
    amount: number;      /* in kobo — divide by 100 for Naira */
    currency: string;
    status: string;
    customer: {
      email: string;
      first_name: string;
      last_name: string;
    };
    paid_at?: string;
  };
}

/* ── Webhook log entry — stored in memory ── */
export interface WebhookLog {
  id: string;
  source: "github" | "paystack" | "unknown";
  event: string;
  receivedAt: string;
  verified: boolean;
  summary: string;
  payload: unknown;
}