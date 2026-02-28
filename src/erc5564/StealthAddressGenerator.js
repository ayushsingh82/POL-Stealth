"use strict";
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
exports.ERC5564StealthAddressGenerator = void 0;
const secp = __importStar(require("@noble/secp256k1"));
const viem_1 = require("viem");
class ERC5564StealthAddressGenerator {
    constructor() {
        this.schemeId = 1; // SECP256k1 with View Tags
    }
    /**
     * Generate a stealth address from a stealth meta-address
     * @param stealthMetaAddress The recipient's stealth meta-address
     * @returns stealthAddress, ephemeralPubKey, and viewTag
     */
    generateStealthAddress(stealthMetaAddress) {
        try {
            // 1. Generate a random 32-byte entropy ephemeral private key
            const ephemeralPrivateKey = secp.utils.randomPrivateKey();
            const ephemeralPubKey = secp.getPublicKey(ephemeralPrivateKey);
            // 2. Parse the spending and viewing public keys
            const spendingPubKey = (0, viem_1.toBytes)(stealthMetaAddress.spendingPubKey);
            const viewingPubKey = (0, viem_1.toBytes)(stealthMetaAddress.viewingPubKey);
            // 3. Compute shared secret: S = e * V
            const sharedSecret = secp.getSharedSecret(ephemeralPrivateKey, viewingPubKey, false);
            // 4. Hash the shared secret: h = H(S)
            const hashedSecret = (0, viem_1.keccak256)((0, viem_1.toHex)(sharedSecret.slice(1)));
            // 5. Extract view tag: t = h[0] (most significant byte)
            const viewTag = `0x${hashedSecret.slice(2, 4)}`;
            // 6. Multiply hashed secret with generator point: G * h
            const hashedSecretPoint = secp.Point.fromPrivateKey(BigInt(hashedSecret));
            // 7. Compute stealth public key: P = G * h + S
            const spendingPubKeyPoint = secp.Point.fromHex(stealthMetaAddress.spendingPubKey.slice(2));
            const stealthPubKey = spendingPubKeyPoint.add(hashedSecretPoint);
            // 8. Compute stealth address: A = H(P)
            const stealthAddress = `0x${(0, viem_1.keccak256)(Buffer.from(stealthPubKey.toHex(), 'hex').subarray(1)).slice(-40)}`;
            return {
                stealthAddress,
                ephemeralPubKey: `0x${Buffer.from(ephemeralPubKey).toString('hex')}`,
                viewTag
            };
        }
        catch (error) {
            throw new Error(`Failed to generate stealth address: ${error}`);
        }
    }
    /**
     * Check if a stealth address belongs to the recipient
     * @param stealthAddress The stealth address to check
     * @param ephemeralPubKey The ephemeral public key
     * @param viewingKey The recipient's viewing private key
     * @param spendingPubKey The recipient's spending public key
     * @returns True if the stealth address belongs to the recipient
     */
    checkStealthAddress(stealthAddress, ephemeralPubKey, viewingKey, spendingPubKey) {
        try {
            // 1. Compute shared secret: S = v * E
            const sharedSecret = secp.getSharedSecret(viewingKey.slice(2), ephemeralPubKey.slice(2), false);
            // 2. Hash the shared secret: h = H(S)
            const hashedSecret = (0, viem_1.keccak256)((0, viem_1.toHex)(sharedSecret.slice(1)));
            // 3. Extract view tag: t = h[0]
            const viewTag = `0x${hashedSecret.slice(2, 4)}`;
            // 4. Multiply hashed secret with generator point: G * h
            const hashedSecretPoint = secp.Point.fromPrivateKey(BigInt(hashedSecret));
            // 5. Compute stealth public key: P = G * h + S
            const spendingPubKeyPoint = secp.Point.fromHex(spendingPubKey.slice(2));
            const stealthPubKey = spendingPubKeyPoint.add(hashedSecretPoint);
            // 6. Compute stealth address: A = H(P)
            const derivedStealthAddress = `0x${(0, viem_1.keccak256)(Buffer.from(stealthPubKey.toHex(), 'hex').subarray(1)).slice(-40)}`;
            // 7. Compare addresses
            return derivedStealthAddress.toLowerCase() === stealthAddress.toLowerCase();
        }
        catch (error) {
            console.error('Error checking stealth address:', error);
            return false;
        }
    }
    /**
     * Compute the stealth private key for a stealth address
     * @param stealthAddress The stealth address
     * @param ephemeralPubKey The ephemeral public key
     * @param viewingKey The recipient's viewing private key
     * @param spendingKey The recipient's spending private key
     * @returns The stealth private key
     */
    computeStealthKey(stealthAddress, ephemeralPubKey, viewingKey, spendingKey) {
        try {
            // 1. Compute shared secret: S = v * E
            const sharedSecret = secp.getSharedSecret(viewingKey.slice(2), ephemeralPubKey.slice(2), false);
            // 2. Hash the shared secret: h = H(S)
            const hashedSecret = (0, viem_1.keccak256)((0, viem_1.toHex)(sharedSecret.slice(1)));
            // 3. Compute stealth private key: s = (s + h) mod n
            const spendingKeyBigInt = BigInt(spendingKey);
            const hashedSecretBigInt = BigInt(hashedSecret);
            const stealthPrivateKey = (spendingKeyBigInt + hashedSecretBigInt) % secp.CURVE.n;
            return `0x${stealthPrivateKey.toString(16).padStart(64, '0')}`;
        }
        catch (error) {
            throw new Error(`Failed to compute stealth key: ${error}`);
        }
    }
    /**
     * Create announcement metadata for ERC-5564
     * @param viewTag The view tag
     * @param tokenAddress The token contract address (optional)
     * @param amount The amount being sent
     * @returns The metadata bytes
     */
    createAnnouncementMetadata(viewTag, tokenAddress, amount) {
        if (!tokenAddress) {
            // Native token (ETH) metadata
            const nativeTokenAddress = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';
            const amountBytes = amount ? amount.toString(16).padStart(64, '0') : '0'.repeat(64);
            return `${viewTag}eeeeeeee${nativeTokenAddress.slice(2)}${amountBytes}`;
        }
        else {
            // ERC-20/ERC-721 token metadata
            const functionSelector = '0xa9059cbb'; // transfer(address,uint256)
            const amountBytes = amount ? amount.toString(16).padStart(64, '0') : '0'.repeat(64);
            return `${viewTag}${functionSelector.slice(2)}${tokenAddress.slice(2)}${amountBytes}`;
        }
    }
    /**
     * Parse stealth meta-address from the st:eth: format
     * @param stealthMetaAddress The stealth meta-address string
     * @returns Parsed stealth meta-address
     */
    parseStealthMetaAddress(stealthMetaAddress) {
        if (!stealthMetaAddress.startsWith('st:eth:')) {
            throw new Error('Invalid stealth meta-address format. Expected st:eth: prefix.');
        }
        const addressPart = stealthMetaAddress.slice(7); // Remove 'st:eth:'
        if (addressPart.length !== 128) { // 64 bytes for each public key
            throw new Error('Invalid stealth meta-address length.');
        }
        const spendingPubKey = `0x${addressPart.slice(0, 64)}`;
        const viewingPubKey = `0x${addressPart.slice(64)}`;
        return { spendingPubKey, viewingPubKey };
    }
    /**
     * Format stealth meta-address to st:eth: format
     * @param spendingPubKey The spending public key
     * @param viewingPubKey The viewing public key
     * @returns Formatted stealth meta-address
     */
    formatStealthMetaAddress(spendingPubKey, viewingPubKey) {
        return `st:eth:${spendingPubKey.slice(2)}${viewingPubKey.slice(2)}`;
    }
}
exports.ERC5564StealthAddressGenerator = ERC5564StealthAddressGenerator;
