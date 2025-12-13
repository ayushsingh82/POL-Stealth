/**
 * Background Scanner Service
 * Continuously scans for stealth payments in the background
 */

import { StealthPaymentScanner, type ScanningConfig, type StealthPayment } from './StealthPaymentScanner';
import { PaymentHistoryManager, type PaymentHistoryEntry } from './PaymentHistoryManager';
import { WebhookNotifier, type WebhookConfig } from './WebhookNotifier';
import { decryptMemo, type EncryptedMetadata } from '../utils/metadataEncryption';

export interface BackgroundScannerConfig extends ScanningConfig {
  scanInterval?: number; // Milliseconds between scans (default: 60000 = 1 minute)
  webhookConfig?: WebhookConfig;
  autoStart?: boolean;
  onPaymentDetected?: (payment: StealthPayment, entry: PaymentHistoryEntry) => void;
  onError?: (error: Error) => void;
}

export class BackgroundScanner {
  private scanner: StealthPaymentScanner;
  private historyManager: PaymentHistoryManager;
  private webhookNotifier?: WebhookNotifier;
  private config: BackgroundScannerConfig;
  private scanIntervalId?: NodeJS.Timeout;
  private isRunning: boolean = false;
  private userWalletAddress?: `0x${string}`;

  constructor(config: BackgroundScannerConfig) {
    this.config = {
      scanInterval: 60000, // 1 minute default
      autoStart: false,
      ...config
    };

    this.scanner = new StealthPaymentScanner(this.config);
    this.historyManager = new PaymentHistoryManager();

    if (this.config.webhookConfig) {
      this.webhookNotifier = new WebhookNotifier(this.config.webhookConfig);
    }

    if (this.config.autoStart) {
      this.start();
    }
  }

  /**
   * Set the user wallet address for payment history mapping
   */
  setUserWalletAddress(address: `0x${string}`): void {
    this.userWalletAddress = address;
  }

  /**
   * Start background scanning
   */
  start(): void {
    if (this.isRunning) {
      console.warn('Background scanner is already running');
      return;
    }

    if (!this.userWalletAddress) {
      throw new Error('User wallet address must be set before starting scanner');
    }

    this.isRunning = true;
    console.log('Starting background scanner...');

    // Perform initial scan
    this.performScan();

    // Set up interval for periodic scans
    this.scanIntervalId = setInterval(() => {
      this.performScan();
    }, this.config.scanInterval);
  }

  /**
   * Stop background scanning
   */
  stop(): void {
    if (!this.isRunning) {
      return;
    }

    this.isRunning = false;
    
    if (this.scanIntervalId) {
      clearInterval(this.scanIntervalId);
      this.scanIntervalId = undefined;
    }

    console.log('Background scanner stopped');
  }

  /**
   * Perform a single scan
   */
  async performScan(): Promise<void> {
    try {
      if (!this.userWalletAddress) {
        throw new Error('User wallet address not set');
      }

      const result = await this.scanner.scanNewPayments();
      
      console.log(`Scanned ${result.scannedBlocks} blocks, found ${result.payments.length} payments`);

      for (const payment of result.payments) {
        await this.processPayment(payment);
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('Error during background scan:', err);
      
      if (this.config.onError) {
        this.config.onError(err);
      }
    }
  }

  /**
   * Process a detected payment
   */
  private async processPayment(payment: StealthPayment): Promise<void> {
    if (!this.userWalletAddress) {
      return;
    }

    // Check if payment already exists in history
    const existing = this.historyManager.getPaymentByStealthAddress(payment.stealthAddress);
    if (existing) {
      return; // Already processed
    }

    // Try to decrypt metadata if present
    let decryptedMemo: string | undefined;
    if (payment.metadata) {
      try {
        // Note: This requires the viewing private key from config
        // In a real implementation, you'd decrypt the metadata here
        // const encryptedMetadata: EncryptedMetadata = { ... };
        // decryptedMemo = decryptMemo(encryptedMetadata, this.config.viewingPrivateKey);
      } catch (error) {
        console.warn('Failed to decrypt metadata:', error);
      }
    }

    // Add to payment history
    const entry = this.historyManager.addPayment(
      payment,
      this.userWalletAddress,
      decryptedMemo
    );

    // Send webhook notification
    if (this.webhookNotifier) {
      await this.webhookNotifier.notifyPaymentDetected(
        payment,
        this.userWalletAddress,
        decryptedMemo
      );
    }

    // Call custom callback
    if (this.config.onPaymentDetected) {
      this.config.onPaymentDetected(payment, entry);
    }

    console.log(`Payment detected: ${payment.stealthAddress} (${payment.amount} wei)`);
  }

  /**
   * Get payment history
   */
  getPaymentHistory(filter?: Parameters<PaymentHistoryManager['getPaymentsForWallet']>[1]) {
    if (!this.userWalletAddress) {
      return [];
    }
    return this.historyManager.getPaymentsForWallet(this.userWalletAddress, filter);
  }

  /**
   * Get payment statistics
   */
  getPaymentStats() {
    if (!this.userWalletAddress) {
      return null;
    }
    return this.historyManager.getPaymentStats(this.userWalletAddress);
  }

  /**
   * Check if scanner is running
   */
  isActive(): boolean {
    return this.isRunning;
  }

  /**
   * Get last scanned block
   */
  getLastScannedBlock(): bigint {
    return this.scanner.getLastScannedBlock();
  }

  /**
   * Manually trigger a scan
   */
  async scanNow(): Promise<void> {
    await this.performScan();
  }
}

