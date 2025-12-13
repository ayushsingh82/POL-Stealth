/**
 * Webhook Notifier Service
 * Sends webhook notifications when stealth payments are detected
 */

import type { StealthPayment } from './StealthPaymentScanner';
import type { PaymentHistoryEntry } from './PaymentHistoryManager';

export interface WebhookConfig {
  url: string;
  secret?: string; // Optional secret for webhook authentication
  retries?: number;
  timeout?: number;
}

export interface WebhookPayload {
  event: 'payment.detected' | 'payment.claimed' | 'payment.failed';
  timestamp: number;
  payment: {
    stealthAddress: string;
    userWalletAddress: string;
    amount: string;
    tokenAddress?: string;
    transactionHash: string;
    blockNumber: string;
    viewTag: string;
    metadata?: string;
    decryptedMemo?: string;
  };
}

export class WebhookNotifier {
  private config: WebhookConfig;
  private retryQueue: Array<{ payload: WebhookPayload; retries: number }> = [];

  constructor(config: WebhookConfig) {
    this.config = {
      retries: 3,
      timeout: 5000,
      ...config
    };
  }

  /**
   * Send webhook notification
   */
  async sendWebhook(payload: WebhookPayload): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'User-Agent': 'POL-Stealth-Webhook/1.0'
      };

      // Add secret if provided
      if (this.config.secret) {
        const signature = await this.generateSignature(JSON.stringify(payload), this.config.secret);
        headers['X-POL-Stealth-Signature'] = signature;
      }

      const response = await fetch(this.config.url, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Webhook failed with status ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error('Webhook notification failed:', error);
      
      // Add to retry queue
      this.retryQueue.push({
        payload,
        retries: this.config.retries || 3
      });

      return false;
    }
  }

  /**
   * Notify about detected payment
   */
  async notifyPaymentDetected(
    payment: StealthPayment,
    userWalletAddress: `0x${string}`,
    decryptedMemo?: string
  ): Promise<boolean> {
    const payload: WebhookPayload = {
      event: 'payment.detected',
      timestamp: Date.now(),
      payment: {
        stealthAddress: payment.stealthAddress,
        userWalletAddress,
        amount: payment.amount?.toString() || '0',
        tokenAddress: payment.tokenAddress,
        transactionHash: payment.transactionHash,
        blockNumber: payment.blockNumber.toString(),
        viewTag: payment.viewTag,
        metadata: payment.metadata,
        decryptedMemo
      }
    };

    return this.sendWebhook(payload);
  }

  /**
   * Notify about claimed payment
   */
  async notifyPaymentClaimed(entry: PaymentHistoryEntry): Promise<boolean> {
    const payload: WebhookPayload = {
      event: 'payment.claimed',
      timestamp: Date.now(),
      payment: {
        stealthAddress: entry.stealthAddress,
        userWalletAddress: entry.userWalletAddress,
        amount: entry.amount.toString(),
        tokenAddress: entry.tokenAddress,
        transactionHash: entry.transactionHash,
        blockNumber: entry.blockNumber.toString(),
        viewTag: entry.viewTag,
        metadata: entry.metadata,
        decryptedMemo: entry.decryptedMemo
      }
    };

    return this.sendWebhook(payload);
  }

  /**
   * Notify about failed payment
   */
  async notifyPaymentFailed(entry: PaymentHistoryEntry, reason: string): Promise<boolean> {
    const payload: WebhookPayload = {
      event: 'payment.failed',
      timestamp: Date.now(),
      payment: {
        stealthAddress: entry.stealthAddress,
        userWalletAddress: entry.userWalletAddress,
        amount: entry.amount.toString(),
        tokenAddress: entry.tokenAddress,
        transactionHash: entry.transactionHash,
        blockNumber: entry.blockNumber.toString(),
        viewTag: entry.viewTag,
        metadata: entry.metadata,
        decryptedMemo: entry.decryptedMemo
      }
    };

    // Add error reason to payload
    (payload as any).error = reason;

    return this.sendWebhook(payload);
  }

  /**
   * Process retry queue
   */
  async processRetryQueue(): Promise<void> {
    const remaining: typeof this.retryQueue = [];

    for (const item of this.retryQueue) {
      if (item.retries > 0) {
        const success = await this.sendWebhook(item.payload);
        
        if (!success) {
          remaining.push({
            payload: item.payload,
            retries: item.retries - 1
          });
        }
      }
    }

    this.retryQueue = remaining;
  }

  /**
   * Generate HMAC signature for webhook authentication
   */
  private async generateSignature(payload: string, secret: string): Promise<string> {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const messageData = encoder.encode(payload);

    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageData);
    const hashArray = Array.from(new Uint8Array(signature));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    return hashHex;
  }

  /**
   * Verify webhook signature
   */
  static async verifySignature(
    payload: string,
    signature: string,
    secret: string
  ): Promise<boolean> {
    const notifier = new WebhookNotifier({ url: '', secret });
    const computedSignature = await notifier.generateSignature(payload, secret);
    return computedSignature === signature;
  }
}

