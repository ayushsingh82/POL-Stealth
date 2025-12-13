/**
 * Metadata Encryption Utilities
 * Implements ECIES (Elliptic Curve Integrated Encryption Scheme) for encrypting transaction metadata
 */

import * as secp from '@noble/secp256k1';
import { keccak256, toHex, hexToBytes, bytesToHex } from 'viem';

export interface EncryptedMetadata {
  encryptedData: string;
  ephemeralPublicKey: string;
  iv?: string; // Initialization vector for additional security
}

export interface TransactionMemo {
  message: string;
  timestamp: number;
  senderAddress?: string;
  recipientAddress?: string;
}

/**
 * Encrypt transaction metadata using ECIES
 * @param message The message to encrypt
 * @param recipientViewingPublicKey The recipient's viewing public key
 * @returns Encrypted metadata with ephemeral public key
 */
export function encryptMetadata(
  message: string,
  recipientViewingPublicKey: `0x${string}`
): EncryptedMetadata {
  try {
    // 1. Generate ephemeral key pair for this encryption
    const ephemeralPrivateKey = secp.utils.randomPrivateKey();
    const ephemeralPublicKey = secp.getPublicKey(ephemeralPrivateKey);

    // 2. Compute shared secret: S = e * V (ephemeral private key * recipient viewing public key)
    const sharedSecret = secp.getSharedSecret(
      ephemeralPrivateKey,
      hexToBytes(recipientViewingPublicKey),
      false
    );

    // 3. Derive encryption key from shared secret using HKDF-like approach
    const hashedSecret = keccak256(toHex(sharedSecret.slice(1)));
    const encryptionKey = `0x${hashedSecret.slice(2, 66)}` as `0x${string}`; // Use first 32 bytes (64 hex chars) as key

    // 4. Convert message to bytes
    const messageBytes = new TextEncoder().encode(message);

    // 5. Simple XOR encryption (in production, use AES-GCM)
    const encryptedBytes = new Uint8Array(messageBytes.length);
    const keyBytes = hexToBytes(encryptionKey);
    
    for (let i = 0; i < messageBytes.length; i++) {
      encryptedBytes[i] = messageBytes[i] ^ keyBytes[i % keyBytes.length];
    }

    // 6. Return encrypted data with ephemeral public key
    return {
      encryptedData: bytesToHex(encryptedBytes),
      ephemeralPublicKey: bytesToHex(ephemeralPublicKey)
    };
  } catch (error) {
    throw new Error(`Failed to encrypt metadata: ${error}`);
  }
}

/**
 * Decrypt transaction metadata using ECIES
 * @param encryptedMetadata The encrypted metadata
 * @param recipientViewingPrivateKey The recipient's viewing private key
 * @returns Decrypted message
 */
export function decryptMetadata(
  encryptedMetadata: EncryptedMetadata,
  recipientViewingPrivateKey: `0x${string}`
): string {
  try {
    // 1. Compute shared secret: S = v * E (viewing private key * ephemeral public key)
    const sharedSecret = secp.getSharedSecret(
      hexToBytes(recipientViewingPrivateKey),
      hexToBytes(encryptedMetadata.ephemeralPublicKey as `0x${string}`),
      false
    );

    // 2. Derive decryption key (same as encryption key)
    const hashedSecret = keccak256(toHex(sharedSecret.slice(1)));
    const decryptionKey = `0x${hashedSecret.slice(2, 66)}` as `0x${string}`; // Use first 32 bytes (64 hex chars) as key

    // 3. Decrypt using XOR (same operation as encryption)
    const encryptedBytes = hexToBytes(encryptedMetadata.encryptedData as `0x${string}`);
    const keyBytes = hexToBytes(decryptionKey);
    const decryptedBytes = new Uint8Array(encryptedBytes.length);

    for (let i = 0; i < encryptedBytes.length; i++) {
      decryptedBytes[i] = encryptedBytes[i] ^ keyBytes[i % keyBytes.length];
    }

    // 4. Convert back to string
    return new TextDecoder().decode(decryptedBytes);
  } catch (error) {
    throw new Error(`Failed to decrypt metadata: ${error}`);
  }
}

/**
 * Create encrypted transaction memo
 * @param memo The transaction memo object
 * @param recipientViewingPublicKey The recipient's viewing public key
 * @returns Encrypted metadata
 */
export function createEncryptedMemo(
  memo: TransactionMemo,
  recipientViewingPublicKey: `0x${string}`
): EncryptedMetadata {
  const memoJson = JSON.stringify(memo);
  return encryptMetadata(memoJson, recipientViewingPublicKey);
}

/**
 * Decrypt and parse transaction memo
 * @param encryptedMetadata The encrypted metadata
 * @param recipientViewingPrivateKey The recipient's viewing private key
 * @returns Parsed transaction memo
 */
export function decryptMemo(
  encryptedMetadata: EncryptedMetadata,
  recipientViewingPrivateKey: `0x${string}`
): TransactionMemo {
  const decryptedJson = decryptMetadata(encryptedMetadata, recipientViewingPrivateKey);
  return JSON.parse(decryptedJson) as TransactionMemo;
}

