/**
 * Payment History Manager
 * Maps stealth addresses to user wallets and maintains transaction history
 */
import type { StealthPayment } from './StealthPaymentScanner';
export interface PaymentHistoryEntry {
    id: string;
    stealthAddress: `0x${string}`;
    userWalletAddress: `0x${string}`;
    ephemeralPubKey: `0x${string}`;
    viewTag: `0x${string}`;
    amount: bigint;
    tokenAddress?: `0x${string}`;
    transactionHash: `0x${string}`;
    blockNumber: bigint;
    timestamp: number;
    status: 'pending' | 'claimed' | 'failed';
    metadata?: string;
    decryptedMemo?: string;
}
export interface PaymentHistoryFilter {
    userWalletAddress?: `0x${string}`;
    stealthAddress?: `0x${string}`;
    status?: PaymentHistoryEntry['status'];
    fromTimestamp?: number;
    toTimestamp?: number;
    minAmount?: bigint;
    maxAmount?: bigint;
}
export declare class PaymentHistoryManager {
    private history;
    private stealthToWallet;
    private walletToStealth;
    /**
     * Add a payment to history
     */
    addPayment(payment: StealthPayment, userWalletAddress: `0x${string}`, decryptedMemo?: string): PaymentHistoryEntry;
    /**
     * Update payment status
     */
    updatePaymentStatus(id: string, status: PaymentHistoryEntry['status']): boolean;
    /**
     * Get payment by ID
     */
    getPayment(id: string): PaymentHistoryEntry | undefined;
    /**
     * Get payment by stealth address
     */
    getPaymentByStealthAddress(stealthAddress: `0x${string}`): PaymentHistoryEntry | undefined;
    /**
     * Get all payments for a wallet
     */
    getPaymentsForWallet(walletAddress: `0x${string}`, filter?: PaymentHistoryFilter): PaymentHistoryEntry[];
    /**
     * Get all stealth addresses for a wallet
     */
    getStealthAddressesForWallet(walletAddress: `0x${string}`): `0x${string}`[];
    /**
     * Get wallet address for a stealth address
     */
    getWalletForStealthAddress(stealthAddress: `0x${string}`): `0x${string}` | undefined;
    /**
     * Get payment statistics for a wallet
     */
    getPaymentStats(walletAddress: `0x${string}`): {
        totalPayments: number;
        totalAmount: bigint;
        pendingCount: number;
        claimedCount: number;
        failedCount: number;
    };
    /**
     * Clear all history (for testing/reset)
     */
    clear(): void;
    /**
     * Export history to JSON
     */
    exportHistory(): PaymentHistoryEntry[];
    /**
     * Import history from JSON
     */
    importHistory(entries: PaymentHistoryEntry[]): void;
}
