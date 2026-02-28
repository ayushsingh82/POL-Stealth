/**
 * Webhook Notifier Service
 * Sends webhook notifications when stealth payments are detected
 */
import type { StealthPayment } from './StealthPaymentScanner';
import type { PaymentHistoryEntry } from './PaymentHistoryManager';
export interface WebhookConfig {
    url: string;
    secret?: string;
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
export declare class WebhookNotifier {
    private config;
    private retryQueue;
    constructor(config: WebhookConfig);
    /**
     * Send webhook notification
     */
    sendWebhook(payload: WebhookPayload): Promise<boolean>;
    /**
     * Notify about detected payment
     */
    notifyPaymentDetected(payment: StealthPayment, userWalletAddress: `0x${string}`, decryptedMemo?: string): Promise<boolean>;
    /**
     * Notify about claimed payment
     */
    notifyPaymentClaimed(entry: PaymentHistoryEntry): Promise<boolean>;
    /**
     * Notify about failed payment
     */
    notifyPaymentFailed(entry: PaymentHistoryEntry, reason: string): Promise<boolean>;
    /**
     * Process retry queue
     */
    processRetryQueue(): Promise<void>;
    /**
     * Generate HMAC signature for webhook authentication
     */
    private generateSignature;
    /**
     * Verify webhook signature
     */
    static verifySignature(payload: string, signature: string, secret: string): Promise<boolean>;
}
