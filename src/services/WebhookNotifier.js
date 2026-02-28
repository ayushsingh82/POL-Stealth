"use strict";
/**
 * Webhook Notifier Service
 * Sends webhook notifications when stealth payments are detected
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookNotifier = void 0;
class WebhookNotifier {
    constructor(config) {
        this.retryQueue = [];
        this.config = {
            retries: 3,
            timeout: 5000,
            ...config
        };
    }
    /**
     * Send webhook notification
     */
    async sendWebhook(payload) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);
            const headers = {
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
        }
        catch (error) {
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
    async notifyPaymentDetected(payment, userWalletAddress, decryptedMemo) {
        const payload = {
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
    async notifyPaymentClaimed(entry) {
        const payload = {
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
    async notifyPaymentFailed(entry, reason) {
        const payload = {
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
        payload.error = reason;
        return this.sendWebhook(payload);
    }
    /**
     * Process retry queue
     */
    async processRetryQueue() {
        const remaining = [];
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
    async generateSignature(payload, secret) {
        const encoder = new TextEncoder();
        const keyData = encoder.encode(secret);
        const messageData = encoder.encode(payload);
        const cryptoKey = await crypto.subtle.importKey('raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
        const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageData);
        const hashArray = Array.from(new Uint8Array(signature));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        return hashHex;
    }
    /**
     * Verify webhook signature
     */
    static async verifySignature(payload, signature, secret) {
        const notifier = new WebhookNotifier({ url: '', secret });
        const computedSignature = await notifier.generateSignature(payload, secret);
        return computedSignature === signature;
    }
}
exports.WebhookNotifier = WebhookNotifier;
