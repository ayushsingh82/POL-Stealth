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

export class PaymentHistoryManager {
  private history: Map<string, PaymentHistoryEntry> = new Map();
  private stealthToWallet: Map<string, string> = new Map(); // stealth address -> wallet address
  private walletToStealth: Map<string, Set<string>> = new Map(); // wallet address -> set of stealth addresses

  /**
   * Add a payment to history
   */
  addPayment(
    payment: StealthPayment,
    userWalletAddress: `0x${string}`,
    decryptedMemo?: string
  ): PaymentHistoryEntry {
    const id = `${payment.transactionHash}-${payment.stealthAddress}`;
    
    const entry: PaymentHistoryEntry = {
      id,
      stealthAddress: payment.stealthAddress,
      userWalletAddress,
      ephemeralPubKey: payment.ephemeralPubKey,
      viewTag: payment.viewTag,
      amount: payment.amount || 0n,
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
    this.walletToStealth.get(userWalletAddress.toLowerCase())!.add(payment.stealthAddress.toLowerCase());

    return entry;
  }

  /**
   * Update payment status
   */
  updatePaymentStatus(id: string, status: PaymentHistoryEntry['status']): boolean {
    const entry = this.history.get(id);
    if (!entry) return false;

    entry.status = status;
    this.history.set(id, entry);
    return true;
  }

  /**
   * Get payment by ID
   */
  getPayment(id: string): PaymentHistoryEntry | undefined {
    return this.history.get(id);
  }

  /**
   * Get payment by stealth address
   */
  getPaymentByStealthAddress(stealthAddress: `0x${string}`): PaymentHistoryEntry | undefined {
    const walletAddress = this.stealthToWallet.get(stealthAddress.toLowerCase());
    if (!walletAddress) return undefined;

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
  getPaymentsForWallet(
    walletAddress: `0x${string}`,
    filter?: PaymentHistoryFilter
  ): PaymentHistoryEntry[] {
    const stealthAddresses = this.walletToStealth.get(walletAddress.toLowerCase());
    if (!stealthAddresses) return [];

    const payments: PaymentHistoryEntry[] = [];

    for (const entry of this.history.values()) {
      if (entry.userWalletAddress.toLowerCase() === walletAddress.toLowerCase()) {
        // Apply filters
        if (filter) {
          if (filter.status && entry.status !== filter.status) continue;
          if (filter.fromTimestamp && entry.timestamp < filter.fromTimestamp) continue;
          if (filter.toTimestamp && entry.timestamp > filter.toTimestamp) continue;
          if (filter.minAmount && entry.amount < filter.minAmount) continue;
          if (filter.maxAmount && entry.amount > filter.maxAmount) continue;
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
  getStealthAddressesForWallet(walletAddress: `0x${string}`): `0x${string}`[] {
    const stealthSet = this.walletToStealth.get(walletAddress.toLowerCase());
    if (!stealthSet) return [];

    return Array.from(stealthSet).map(addr => addr as `0x${string}`);
  }

  /**
   * Get wallet address for a stealth address
   */
  getWalletForStealthAddress(stealthAddress: `0x${string}`): `0x${string}` | undefined {
    const wallet = this.stealthToWallet.get(stealthAddress.toLowerCase());
    return wallet ? (wallet as `0x${string}`) : undefined;
  }

  /**
   * Get payment statistics for a wallet
   */
  getPaymentStats(walletAddress: `0x${string}`): {
    totalPayments: number;
    totalAmount: bigint;
    pendingCount: number;
    claimedCount: number;
    failedCount: number;
  } {
    const payments = this.getPaymentsForWallet(walletAddress);

    let totalAmount = 0n;
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
  clear(): void {
    this.history.clear();
    this.stealthToWallet.clear();
    this.walletToStealth.clear();
  }

  /**
   * Export history to JSON
   */
  exportHistory(): PaymentHistoryEntry[] {
    return Array.from(this.history.values());
  }

  /**
   * Import history from JSON
   */
  importHistory(entries: PaymentHistoryEntry[]): void {
    for (const entry of entries) {
      this.history.set(entry.id, entry);
      
      this.stealthToWallet.set(
        entry.stealthAddress.toLowerCase(),
        entry.userWalletAddress.toLowerCase()
      );

      if (!this.walletToStealth.has(entry.userWalletAddress.toLowerCase())) {
        this.walletToStealth.set(entry.userWalletAddress.toLowerCase(), new Set());
      }
      this.walletToStealth.get(entry.userWalletAddress.toLowerCase())!.add(
        entry.stealthAddress.toLowerCase()
      );
    }
  }
}

