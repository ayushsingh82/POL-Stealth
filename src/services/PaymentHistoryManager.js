"use strict";
/**
 * Payment History Manager
 * Maps stealth addresses to user wallets and maintains transaction history
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentHistoryManager = void 0;
class PaymentHistoryManager {
    constructor() {
        this.history = new Map();
        this.stealthToWallet = new Map(); // stealth address -> wallet address
        this.walletToStealth = new Map(); // wallet address -> set of stealth addresses
    }
    /**
     * Add a payment to history
     */
    addPayment(payment, userWalletAddress, decryptedMemo) {
        const id = `${payment.transactionHash}-${payment.stealthAddress}`;
        const entry = {
            id,
            stealthAddress: payment.stealthAddress,
            userWalletAddress,
            ephemeralPubKey: payment.ephemeralPubKey,
            viewTag: payment.viewTag,
            amount: payment.amount || BigInt(0),
            tokenAddress: payment.tokenAddress,
            transactionHash: payment.transactionHash,
            blockNumber: payment.blockNumber,
            timestamp: Date.now(),
            status: 'pending',
            metadata: payment.metadata,
            decryptedMemo
        };
        this.history.set(id, entry);
        // Update mappings
        this.stealthToWallet.set(payment.stealthAddress.toLowerCase(), userWalletAddress.toLowerCase());
        if (!this.walletToStealth.has(userWalletAddress.toLowerCase())) {
            this.walletToStealth.set(userWalletAddress.toLowerCase(), new Set());
        }
        this.walletToStealth.get(userWalletAddress.toLowerCase()).add(payment.stealthAddress.toLowerCase());
        return entry;
    }
    /**
     * Update payment status
     */
    updatePaymentStatus(id, status) {
        const entry = this.history.get(id);
        if (!entry)
            return false;
        entry.status = status;
        this.history.set(id, entry);
        return true;
    }
    /**
     * Get payment by ID
     */
    getPayment(id) {
        return this.history.get(id);
    }
    /**
     * Get payment by stealth address
     */
    getPaymentByStealthAddress(stealthAddress) {
        const walletAddress = this.stealthToWallet.get(stealthAddress.toLowerCase());
        if (!walletAddress)
            return undefined;
        // Find entry with this stealth address
        for (const entry of this.history.values()) {
            if (entry.stealthAddress.toLowerCase() === stealthAddress.toLowerCase()) {
                return entry;
            }
        }
        return undefined;
    }
    /**
     * Get all payments for a wallet
     */
    getPaymentsForWallet(walletAddress, filter) {
        const stealthAddresses = this.walletToStealth.get(walletAddress.toLowerCase());
        if (!stealthAddresses)
            return [];
        const payments = [];
        for (const entry of this.history.values()) {
            if (entry.userWalletAddress.toLowerCase() === walletAddress.toLowerCase()) {
                // Apply filters
                if (filter) {
                    if (filter.status && entry.status !== filter.status)
                        continue;
                    if (filter.fromTimestamp && entry.timestamp < filter.fromTimestamp)
                        continue;
                    if (filter.toTimestamp && entry.timestamp > filter.toTimestamp)
                        continue;
                    if (filter.minAmount && entry.amount < filter.minAmount)
                        continue;
                    if (filter.maxAmount && entry.amount > filter.maxAmount)
                        continue;
                }
                payments.push(entry);
            }
        }
        // Sort by timestamp (newest first)
        return payments.sort((a, b) => b.timestamp - a.timestamp);
    }
    /**
     * Get all stealth addresses for a wallet
     */
    getStealthAddressesForWallet(walletAddress) {
        const stealthSet = this.walletToStealth.get(walletAddress.toLowerCase());
        if (!stealthSet)
            return [];
        return Array.from(stealthSet).map(addr => addr);
    }
    /**
     * Get wallet address for a stealth address
     */
    getWalletForStealthAddress(stealthAddress) {
        const wallet = this.stealthToWallet.get(stealthAddress.toLowerCase());
        return wallet ? wallet : undefined;
    }
    /**
     * Get payment statistics for a wallet
     */
    getPaymentStats(walletAddress) {
        const payments = this.getPaymentsForWallet(walletAddress);
        let totalAmount = BigInt(0);
        let pendingCount = 0;
        let claimedCount = 0;
        let failedCount = 0;
        for (const payment of payments) {
            totalAmount += payment.amount;
            switch (payment.status) {
                case 'pending':
                    pendingCount++;
                    break;
                case 'claimed':
                    claimedCount++;
                    break;
                case 'failed':
                    failedCount++;
                    break;
            }
        }
        return {
            totalPayments: payments.length,
            totalAmount,
            pendingCount,
            claimedCount,
            failedCount
        };
    }
    /**
     * Clear all history (for testing/reset)
     */
    clear() {
        this.history.clear();
        this.stealthToWallet.clear();
        this.walletToStealth.clear();
    }
    /**
     * Export history to JSON
     */
    exportHistory() {
        return Array.from(this.history.values());
    }
    /**
     * Import history from JSON
     */
    importHistory(entries) {
        for (const entry of entries) {
            this.history.set(entry.id, entry);
            this.stealthToWallet.set(entry.stealthAddress.toLowerCase(), entry.userWalletAddress.toLowerCase());
            if (!this.walletToStealth.has(entry.userWalletAddress.toLowerCase())) {
                this.walletToStealth.set(entry.userWalletAddress.toLowerCase(), new Set());
            }
            this.walletToStealth.get(entry.userWalletAddress.toLowerCase()).add(entry.stealthAddress.toLowerCase());
        }
    }
}
exports.PaymentHistoryManager = PaymentHistoryManager;
