/**
 * Transaction Management Module
 * Handles single and batch transactions
 */

import { TransactionConfig, BatchTransactionConfig, TransactionResult, BatchTransactionResult } from '../types';
import type { WalletClient } from 'viem';

export class TransactionManager {
  private walletClient: WalletClient | null = null;

  /**
   * Set wallet client for transactions
   */
  setWalletClient(client: WalletClient): void {
    this.walletClient = client;
  }

  /**
   * Send a single transaction
   */
  async sendTransaction(config: TransactionConfig): Promise<TransactionResult> {
    if (!this.walletClient) {
      throw new Error('Wallet client not set. Call setWalletClient() first.');
    }

    if (!this.isValidAddress(config.to)) {
      throw new Error('Invalid recipient address');
    }

    try {
      const hash = await this.walletClient.sendTransaction({
        account: config.account as `0x${string}`,
        to: config.to as `0x${string}`,
        value: config.value
      });

      return {
        hash,
        status: 'pending'
      };
    } catch (error) {
      return {
        hash: '',
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Send batch transactions to multiple recipients
   */
  async sendBatchTransactions(config: BatchTransactionConfig): Promise<BatchTransactionResult> {
    if (!this.walletClient) {
      throw new Error('Wallet client not set. Call setWalletClient() first.');
    }

    if (config.recipients.length === 0) {
      throw new Error('No recipients provided');
    }

    // Validate all addresses
    for (const recipient of config.recipients) {
      if (!this.isValidAddress(recipient)) {
        throw new Error(`Invalid recipient address: ${recipient}`);
      }
    }

    const transactions: TransactionResult[] = [];
    let successCount = 0;
    let failedCount = 0;

    // Send transactions sequentially
    for (const recipient of config.recipients) {
      const result = await this.sendTransaction({
        to: recipient,
        value: config.amountPerRecipient,
        account: config.account
      });

      transactions.push(result);
      
      if (result.status === 'success' || result.status === 'pending') {
        successCount++;
      } else {
        failedCount++;
      }
    }

    const totalSent = config.amountPerRecipient * BigInt(config.recipients.length);

    return {
      transactions,
      totalSent,
      successCount,
      failedCount
    };
  }

  /**
   * Check if address is valid
   */
  private isValidAddress(address: string): boolean {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  }

  /**
   * Calculate total amount for batch transaction
   */
  calculateBatchTotal(amountPerRecipient: bigint, recipientCount: number): bigint {
    return amountPerRecipient * BigInt(recipientCount);
  }
}

