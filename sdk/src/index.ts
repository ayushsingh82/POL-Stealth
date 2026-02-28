/**
 * POL-Stealth SDK
 * Main entry point for the SDK
 */

export { TeamManager } from './core/TeamManager';
export { TransactionManager } from './core/TransactionManager';
export { buildPaymentRequest, buildPaymentLink, parsePaymentRequestUrl } from './core/PaymentRequest';
export { claimFromStealthAddress } from './core/ClaimManager';
export { saveSentMemo, getSentMemos, getSentMemoByTxHash, clearSentMemos, DEFAULT_STORAGE_KEY } from './core/MemoStorage';

export type { PaymentRequestOptions, PaymentRequestResult } from './core/PaymentRequest';
export type { ClaimSigner, ClaimResult, ClaimImplementation } from './core/ClaimManager';
export type { SentMemoEntry, MemoStorageAdapter } from './core/MemoStorage';

export * from './types';
export * from './utils/address';
export * from './utils/amount';

// Types for StealthPaymentScanner, PaymentHistoryManager, WebhookNotifier,
// TeamStealthAddressPool, metadataEncryption, qrCodeGenerator: import from the main app when needed.

import { TeamManager } from './core/TeamManager';
import { TransactionManager } from './core/TransactionManager';
import { buildPaymentRequest, buildPaymentLink, parsePaymentRequestUrl } from './core/PaymentRequest';
import { claimFromStealthAddress as claimFromStealthAddressFn } from './core/ClaimManager';
import { saveSentMemo, getSentMemos, getSentMemoByTxHash, clearSentMemos } from './core/MemoStorage';
import { SDKConfig } from './types';

/**
 * Main SDK class
 */
export class POLStealthSDK {
  public teamManager: TeamManager;
  public transactionManager: TransactionManager;
  private config: SDKConfig;

  constructor(config: SDKConfig = {}) {
    this.config = {
      chainId: 80002, // Polygon Amoy testnet by default
      ...config
    };
    
    this.teamManager = new TeamManager();
    this.transactionManager = new TransactionManager();
  }

  /**
   * Get current configuration
   */
  getConfig(): SDKConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<SDKConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Request payment (receiver-initiated): build shareable link and QR for a stealth address.
   * Requires baseUrl in config or passed in options.
   */
  buildPaymentRequest(options: {
    stealthAddress: `0x${string}`;
    amount?: string;
    baseUrl?: string;
    payPath?: string;
  }) {
    const baseUrl = options.baseUrl ?? this.config.baseUrl ?? '';
    return buildPaymentRequest({
      stealthAddress: options.stealthAddress,
      amount: options.amount,
      baseUrl,
      payPath: options.payPath,
    });
  }

  /**
   * Parse /pay page query params (to, amount) from URL or search string.
   */
  parsePaymentRequestUrl(searchOrUrl: string) {
    return parsePaymentRequestUrl(searchOrUrl);
  }

  /**
   * Claim POL from a stealth address to the user's wallet (requires signer with signMessage).
   */
  async claimFromStealthAddress(signer: { signMessage: (msg: string) => Promise<string> }, stealthAddress: `0x${string}`) {
    return claimFromStealthAddressFn(signer, stealthAddress);
  }

  /**
   * Save a sent memo (private memo flow). Uses default localStorage key.
   */
  saveSentMemo(entry: { txHash: string; to: string; amount: string; memo: string }) {
    return saveSentMemo(entry);
  }

  /**
   * Get all sent memos (optional limit for newest N).
   */
  getSentMemos(limit?: number) {
    return getSentMemos(undefined, undefined, limit);
  }

  /**
   * Get sent memo for a specific tx hash.
   */
  getSentMemoByTxHash(txHash: string) {
    return getSentMemoByTxHash(txHash);
  }

  /**
   * Clear all stored sent memos.
   */
  clearSentMemos() {
    return clearSentMemos();
  }
}

// Default export
export default POLStealthSDK;

