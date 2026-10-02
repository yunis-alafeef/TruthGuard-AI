/**
 * TruthGuard AI - Webhook Alert Dispatch Engine
 * Delivers verified rumor notifications and high-risk misinformation alerts to newsrooms.
 * Developed by Yunis Al-Afeef <shoeabvv@gmail.com>
 */

import crypto from 'crypto';

export type WebhookEvent =
  | 'claim.verified'
  | 'claim.high_risk'
  | 'rumor.debunked'
  | 'cluster.surged';

export interface WebhookSubscription {
  id: string;
  targetUrl: string;
  secretKey: string;
  subscribedEvents: WebhookEvent[];
  isActive: boolean;
  failureCount: number;
}

export interface WebhookPayload<T = unknown> {
  eventId: string;
  eventType: WebhookEvent;
  timestamp: string;
  data: T;
  version: '2.0';
}

/**
 * Computes HMAC-SHA256 signature for payload verification
 */
export function signWebhookPayload(payload: string, secretKey: string): string {
  return crypto
    .createHmac('sha256', secretKey)
    .update(payload)
    .digest('hex');
}

/**
 * Verifies inbound webhook signature from sender
 */
export function verifyWebhookSignature(payload: string, secretKey: string, providedSignature: string): boolean {
  const expected = signWebhookPayload(payload, secretKey);
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(providedSignature));
  } catch {
    return false;
  }
}

/**
 * Constructs a signed delivery package
 */
export function prepareWebhookDelivery<T>(
  event: WebhookEvent,
  data: T,
  subscription: WebhookSubscription
): {
  url: string;
  headers: Record<string, string>;
  body: string;
} {
  const payload: WebhookPayload<T> = {
    eventId: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    eventType: event,
    timestamp: new Date().toISOString(),
    data,
    version: '2.0'
  };

  const body = JSON.stringify(payload);
  const signature = signWebhookPayload(body, subscription.secretKey);

  return {
    url: subscription.targetUrl,
    headers: {
      'Content-Type': 'application/json',
      'X-TruthGuard-Event': event,
      'X-TruthGuard-Signature': `sha256=${signature}`,
      'X-TruthGuard-Timestamp': payload.timestamp,
      'User-Agent': 'TruthGuard-Webhook-Dispatcher/2.0'
    },
    body
  };
}
