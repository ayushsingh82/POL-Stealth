"use strict";
/**
 * Stealth Payment Scanner Service
 * Scans blockchain for incoming stealth payments using view tags and announcement events
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.StealthPaymentScanner = void 0;
const viem_1 = require("viem");
const chains_1 = require("viem/chains");
const secp = __importStar(require("@noble/secp256k1"));
const StealthAddressGenerator_1 = require("../erc5564/StealthAddressGenerator");
const stealthContracts_1 = require("../config/stealthContracts");
class StealthPaymentScanner {
    constructor(config) {
        this.viewTagCache = new Map(); // Cache for view tag checks
        this.config = {
            batchSize: 1000,
            chainId: 80002, // Polygon Amoy default
            ...config
        };
        // Initialize public client
        this.client = (0, viem_1.createPublicClient)({
            chain: chains_1.polygonAmoy,
            transport: (0, viem_1.http)(this.config.rpcUrl)
        });
        this.generator = new StealthAddressGenerator_1.ERC5564StealthAddressGenerator();
        this.lastScannedBlock = config.startBlock || BigInt(0);
    }
    /**
     * Fast view tag check - filters transactions before full verification
     * @param viewTag The view tag to check
     * @param viewingPrivateKey The viewing private key
     * @param ephemeralPubKey The ephemeral public key
     * @returns True if view tag matches
     */
    fastViewTagCheck(viewTag, viewingPrivateKey, ephemeralPubKey) {
        try {
            // Compute shared secret using secp256k1
            const sharedSecret = secp.getSharedSecret(viewingPrivateKey.slice(2), ephemeralPubKey.slice(2), false);
            // Hash and extract view tag
            const hashedSecret = (0, viem_1.keccak256)((0, viem_1.toHex)(sharedSecret.slice(1)));
            const computedViewTag = `0x${hashedSecret.slice(2, 4)}`;
            return computedViewTag.toLowerCase() === viewTag.toLowerCase();
        }
        catch {
            return true; // Let full check decide if fast check fails
        }
    }
    /**
     * Scan blocks for stealth payments
     * @param fromBlock Starting block number
     * @param toBlock Ending block number (optional, defaults to latest)
     * @returns Array of detected stealth payments
     */
    async scanBlocks(fromBlock, toBlock) {
        try {
            const startBlock = fromBlock || this.lastScannedBlock;
            const endBlock = toBlock || await this.client.getBlockNumber();
            // Limit batch size
            const actualEndBlock = endBlock > startBlock + BigInt(this.config.batchSize || 1000)
                ? startBlock + BigInt(this.config.batchSize || 1000)
                : endBlock;
            console.log(`Scanning blocks ${startBlock} to ${actualEndBlock}...`);
            // Get ERC-5564 announcement events from deployed announcer when available
            const announcerAddress = (0, stealthContracts_1.getERC5564AnnouncerAddress)(this.config.chainId ?? 80002);
            const announcementEvent = (0, viem_1.parseAbiItem)('event Announcement(uint256 indexed schemeId, address indexed stealthAddress, address indexed caller, bytes ephemeralPubKey, bytes metadata)');
            // Fetch announcement events (use ERC-5564 Announcer contract when deployed on this chain)
            const logs = await this.client.getLogs({
                address: announcerAddress, // Deployed ERC-5564 Announcer; undefined falls back to scanning all contracts
                event: announcementEvent,
                fromBlock: startBlock,
                toBlock: actualEndBlock
            });
            const payments = [];
            // Process each announcement
            for (const log of logs) {
                try {
                    const stealthAddress = log.args.stealthAddress;
                    const ephemeralPubKey = log.args.ephemeralPubKey;
                    const metadata = log.args.metadata;
                    // Extract view tag from metadata (first byte)
                    const viewTag = `0x${metadata.slice(2, 4)}`;
                    // Fast view tag check (cache result)
                    const cacheKey = `${viewTag}-${ephemeralPubKey}`;
                    if (this.viewTagCache.has(cacheKey) && !this.viewTagCache.get(cacheKey)) {
                        continue; // Skip if view tag doesn't match
                    }
                    // Full stealth address verification
                    const isValid = this.generator.checkStealthAddress(stealthAddress, ephemeralPubKey, this.config.viewingPrivateKey, this.config.spendingPublicKey);
                    if (isValid) {
                        // Check balance of stealth address
                        const balance = await this.client.getBalance({ address: stealthAddress });
                        if (balance > BigInt(0)) {
                            payments.push({
                                stealthAddress,
                                ephemeralPubKey,
                                viewTag,
                                blockNumber: log.blockNumber || BigInt(0),
                                transactionHash: log.transactionHash || '0x',
                                amount: balance,
                                metadata
                            });
                            // Cache positive result
                            this.viewTagCache.set(cacheKey, true);
                        }
                    }
                    else {
                        // Cache negative result
                        this.viewTagCache.set(cacheKey, false);
                    }
                }
                catch (error) {
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
        }
        catch (error) {
            throw new Error(`Failed to scan blocks: ${error}`);
        }
    }
    /**
     * Scan for new payments since last scan
     */
    async scanNewPayments() {
        return this.scanBlocks();
    }
    /**
     * Get stealth private key for a detected payment
     * @param payment The detected stealth payment
     * @returns Stealth private key
     */
    getStealthPrivateKey(payment) {
        return this.generator.computeStealthKey(payment.stealthAddress, payment.ephemeralPubKey, this.config.viewingPrivateKey, this.config.spendingPrivateKey);
    }
    /**
     * Clear view tag cache
     */
    clearCache() {
        this.viewTagCache.clear();
    }
    /**
     * Get last scanned block number
     */
    getLastScannedBlock() {
        return this.lastScannedBlock;
    }
}
exports.StealthPaymentScanner = StealthPaymentScanner;
