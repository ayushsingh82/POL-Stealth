/**
 * Stealth Payment Scanner Service
 * Scans blockchain for incoming stealth payments using view tags and announcement events
 */

import { PublicClient, createPublicClient, http, parseAbiItem } from 'viem';
import { polygonAmoy } from 'viem/chains';
import { ERC5564StealthAddressGenerator } from '../erc5564/StealthAddressGenerator';
import type { StealthMetaAddress } from '../erc5564/StealthAddressGenerator';

export interface StealthPayment {
  stealthAddress: `0x${string}`;
  ephemeralPubKey: `0x${string}`;
  viewTag: `0x${string}`;
  blockNumber: bigint;
  transactionHash: `0x${string}`;
  amount?: bigint;
  tokenAddress?: `0x${string}`;
  metadata?: string;
}

export interface ScanningConfig {
  viewingPrivateKey: `0x${string}`;
  spendingPublicKey: `0x${string}`;
  spendingPrivateKey: `0x${string}`;
  rpcUrl?: string;
  chainId?: number;
  startBlock?: bigint;
  batchSize?: number; // Number of blocks to scan at once
}

export interface ScanResult {
  payments: StealthPayment[];
  lastScannedBlock: bigint;
  scannedBlocks: number;
}

export class StealthPaymentScanner {
  private client: PublicClient;
  private generator: ERC5564StealthAddressGenerator;
  private config: ScanningConfig;
  private viewTagCache: Map<string, boolean> = new Map(); // Cache for view tag checks
  private lastScannedBlock: bigint;

  constructor(config: ScanningConfig) {
    this.config = {
      batchSize: 1000,
      chainId: 80002, // Polygon Amoy default
      ...config
    };

    // Initialize public client
    this.client = createPublicClient({
      chain: polygonAmoy,
      transport: http(this.config.rpcUrl)
    });

    this.generator = new ERC5564StealthAddressGenerator();
    this.lastScannedBlock = config.startBlock || 0n;
  }

  /**
   * Fast view tag check - filters transactions before full verification
   * @param viewTag The view tag to check
   * @param viewingPrivateKey The viewing private key
   * @param ephemeralPubKey The ephemeral public key
   * @returns True if view tag matches
   */
  private fastViewTagCheck(
    viewTag: `0x${string}`,
    viewingPrivateKey: `0x${string}`,
    ephemeralPubKey: `0x${string}`
  ): boolean {
    try {
      // Compute shared secret
      const sharedSecret = this.generator['computeSharedSecret']?.(
        viewingPrivateKey,
        ephemeralPubKey
      );

      if (!sharedSecret) {
        // Fallback to full check
        return true; // Let full check decide
      }

      // Hash and extract view tag
      const { keccak256, toHex } = require('viem');
      const hashedSecret = keccak256(toHex(sharedSecret.slice(1)));
      const computedViewTag = `0x${hashedSecret.slice(2, 4)}` as `0x${string}`;

      return computedViewTag.toLowerCase() === viewTag.toLowerCase();
    } catch {
      return true; // Let full check decide if fast check fails
    }
  }

  /**
   * Scan blocks for stealth payments
   * @param fromBlock Starting block number
   * @param toBlock Ending block number (optional, defaults to latest)
   * @returns Array of detected stealth payments
   */
  async scanBlocks(
    fromBlock?: bigint,
    toBlock?: bigint
  ): Promise<ScanResult> {
    try {
      const startBlock = fromBlock || this.lastScannedBlock;
      const endBlock = toBlock || await this.client.getBlockNumber();
      
      // Limit batch size
      const actualEndBlock = endBlock > startBlock + BigInt(this.config.batchSize || 1000)
        ? startBlock + BigInt(this.config.batchSize || 1000)
        : endBlock;

      console.log(`Scanning blocks ${startBlock} to ${actualEndBlock}...`);

      // Get ERC-5564 announcement events
      const announcementEvent = parseAbiItem(
        'event Announcement(uint256 indexed schemeId, address indexed stealthAddress, address indexed caller, bytes ephemeralPubKey, bytes metadata)'
      );

      // Fetch announcement events
      const logs = await this.client.getLogs({
        address: undefined, // Scan all contracts (in production, use ERC-5564 registry)
        event: announcementEvent,
        fromBlock: startBlock,
        toBlock: actualEndBlock
      });

      const payments: StealthPayment[] = [];

      // Process each announcement
      for (const log of logs) {
        try {
          const stealthAddress = log.args.stealthAddress as `0x${string}`;
          const ephemeralPubKey = log.args.ephemeralPubKey as `0x${string}`;
          const metadata = log.args.metadata as string;

          // Extract view tag from metadata (first byte)
          const viewTag = `0x${metadata.slice(2, 4)}` as `0x${string}`;

          // Fast view tag check (cache result)
          const cacheKey = `${viewTag}-${ephemeralPubKey}`;
          if (this.viewTagCache.has(cacheKey) && !this.viewTagCache.get(cacheKey)) {
            continue; // Skip if view tag doesn't match
          }

          // Full stealth address verification
          const isValid = this.generator.checkStealthAddress(
            stealthAddress,
            ephemeralPubKey,
            this.config.viewingPrivateKey,
            this.config.spendingPublicKey
          );

          if (isValid) {
            // Check balance of stealth address
            const balance = await this.client.getBalance({ address: stealthAddress });

            if (balance > 0n) {
              payments.push({
                stealthAddress,
                ephemeralPubKey,
                viewTag,
                blockNumber: log.blockNumber || 0n,
                transactionHash: log.transactionHash || '0x',
                amount: balance,
                metadata
              });

              // Cache positive result
              this.viewTagCache.set(cacheKey, true);
            }
          } else {
            // Cache negative result
            this.viewTagCache.set(cacheKey, false);
          }
        } catch (error) {
          console.error('Error processing announcement:', error);
          continue;
        }
      }

      this.lastScannedBlock = actualEndBlock;

      return {
        payments,
        lastScannedBlock: actualEndBlock,
        scannedBlocks: Number(actualEndBlock - startBlock)
      };
    } catch (error) {
      throw new Error(`Failed to scan blocks: ${error}`);
    }
  }

  /**
   * Scan for new payments since last scan
   */
  async scanNewPayments(): Promise<ScanResult> {
    return this.scanBlocks();
  }

  /**
   * Get stealth private key for a detected payment
   * @param payment The detected stealth payment
   * @returns Stealth private key
   */
  getStealthPrivateKey(payment: StealthPayment): `0x${string}` {
    return this.generator.computeStealthKey(
      payment.stealthAddress,
      payment.ephemeralPubKey,
      this.config.viewingPrivateKey,
      this.config.spendingPrivateKey
    );
  }

  /**
   * Clear view tag cache
   */
  clearCache(): void {
    this.viewTagCache.clear();
  }

  /**
   * Get last scanned block number
   */
  getLastScannedBlock(): bigint {
    return this.lastScannedBlock;
  }
}

