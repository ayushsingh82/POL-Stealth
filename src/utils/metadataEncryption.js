"use strict";
/**
 * Metadata Encryption Utilities
 * Implements ECIES (Elliptic Curve Integrated Encryption Scheme) for encrypting transaction metadata
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
exports.encryptMetadata = encryptMetadata;
exports.decryptMetadata = decryptMetadata;
exports.createEncryptedMemo = createEncryptedMemo;
exports.decryptMemo = decryptMemo;
const secp = __importStar(require("@noble/secp256k1"));
const viem_1 = require("viem");
/**
 * Encrypt transaction metadata using ECIES
 * @param message The message to encrypt
 * @param recipientViewingPublicKey The recipient's viewing public key
 * @returns Encrypted metadata with ephemeral public key
 */
function encryptMetadata(message, recipientViewingPublicKey) {
    try {
        // 1. Generate ephemeral key pair for this encryption
        const ephemeralPrivateKey = secp.utils.randomPrivateKey();
        const ephemeralPublicKey = secp.getPublicKey(ephemeralPrivateKey);
        // 2. Compute shared secret: S = e * V (ephemeral private key * recipient viewing public key)
        const sharedSecret = secp.getSharedSecret(ephemeralPrivateKey, (0, viem_1.hexToBytes)(recipientViewingPublicKey), false);
        // 3. Derive encryption key from shared secret using HKDF-like approach
        const hashedSecret = (0, viem_1.keccak256)((0, viem_1.toHex)(sharedSecret.slice(1)));
        const encryptionKey = `0x${hashedSecret.slice(2, 66)}`; // Use first 32 bytes (64 hex chars) as key
        // 4. Convert message to bytes
        const messageBytes = new TextEncoder().encode(message);
        // 5. Simple XOR encryption (in production, use AES-GCM)
        const encryptedBytes = new Uint8Array(messageBytes.length);
        const keyBytes = (0, viem_1.hexToBytes)(encryptionKey);
        for (let i = 0; i < messageBytes.length; i++) {
            encryptedBytes[i] = messageBytes[i] ^ keyBytes[i % keyBytes.length];
        }
        // 6. Return encrypted data with ephemeral public key
        return {
            encryptedData: (0, viem_1.bytesToHex)(encryptedBytes),
            ephemeralPublicKey: (0, viem_1.bytesToHex)(ephemeralPublicKey)
        };
    }
    catch (error) {
        throw new Error(`Failed to encrypt metadata: ${error}`);
    }
}
/**
 * Decrypt transaction metadata using ECIES
 * @param encryptedMetadata The encrypted metadata
 * @param recipientViewingPrivateKey The recipient's viewing private key
 * @returns Decrypted message
 */
function decryptMetadata(encryptedMetadata, recipientViewingPrivateKey) {
    try {
        // 1. Compute shared secret: S = v * E (viewing private key * ephemeral public key)
        const sharedSecret = secp.getSharedSecret((0, viem_1.hexToBytes)(recipientViewingPrivateKey), (0, viem_1.hexToBytes)(encryptedMetadata.ephemeralPublicKey), false);
        // 2. Derive decryption key (same as encryption key)
        const hashedSecret = (0, viem_1.keccak256)((0, viem_1.toHex)(sharedSecret.slice(1)));
        const decryptionKey = `0x${hashedSecret.slice(2, 66)}`; // Use first 32 bytes (64 hex chars) as key
        // 3. Decrypt using XOR (same operation as encryption)
        const encryptedBytes = (0, viem_1.hexToBytes)(encryptedMetadata.encryptedData);
        const keyBytes = (0, viem_1.hexToBytes)(decryptionKey);
        const decryptedBytes = new Uint8Array(encryptedBytes.length);
        for (let i = 0; i < encryptedBytes.length; i++) {
            decryptedBytes[i] = encryptedBytes[i] ^ keyBytes[i % keyBytes.length];
        }
        // 4. Convert back to string
        return new TextDecoder().decode(decryptedBytes);
    }
    catch (error) {
        throw new Error(`Failed to decrypt metadata: ${error}`);
    }
}
/**
 * Create encrypted transaction memo
 * @param memo The transaction memo object
 * @param recipientViewingPublicKey The recipient's viewing public key
 * @returns Encrypted metadata
 */
function createEncryptedMemo(memo, recipientViewingPublicKey) {
    const memoJson = JSON.stringify(memo);
    return encryptMetadata(memoJson, recipientViewingPublicKey);
}
/**
 * Decrypt and parse transaction memo
 * @param encryptedMetadata The encrypted metadata
 * @param recipientViewingPrivateKey The recipient's viewing private key
 * @returns Parsed transaction memo
 */
function decryptMemo(encryptedMetadata, recipientViewingPrivateKey) {
    const decryptedJson = decryptMetadata(encryptedMetadata, recipientViewingPrivateKey);
    return JSON.parse(decryptedJson);
}
