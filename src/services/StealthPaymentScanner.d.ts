/**
 * Stealth Payment Scanner Service
 * Scans blockchain for incoming stealth payments using view tags and announcement events
 */
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
    batchSize?: number;
}
export interface ScanResult {
    payments: StealthPayment[];
    lastScannedBlock: bigint;
    scannedBlocks: number;
}
export declare class StealthPaymentScanner {
    private client;
    private generator;
    private config;
    private viewTagCache;
    private lastScannedBlock;
    constructor(config: ScanningConfig);
    /**
     * Fast view tag check - filters transactions before full verification
     * @param viewTag The view tag to check
     * @param viewingPrivateKey The viewing private key
     * @param ephemeralPubKey The ephemeral public key
     * @returns True if view tag matches
     */
    private fastViewTagCheck;
    /**
     * Scan blocks for stealth payments
     * @param fromBlock Starting block number
     * @param toBlock Ending block number (optional, defaults to latest)
     * @returns Array of detected stealth payments
     */
    scanBlocks(fromBlock?: bigint, toBlock?: bigint): Promise<ScanResult>;
    /**
     * Scan for new payments since last scan
     */
    scanNewPayments(): Promise<ScanResult>;
    /**
     * Get stealth private key for a detected payment
     * @param payment The detected stealth payment
     * @returns Stealth private key
     */
    getStealthPrivateKey(payment: StealthPayment): `0x${string}`;
    /**
     * Clear view tag cache
     */
    clearCache(): void;
    /**
     * Get last scanned block number
     */
    getLastScannedBlock(): bigint;
}
