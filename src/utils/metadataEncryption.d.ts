/**
 * Metadata Encryption Utilities
 * Implements ECIES (Elliptic Curve Integrated Encryption Scheme) for encrypting transaction metadata
 */
export interface EncryptedMetadata {
    encryptedData: string;
    ephemeralPublicKey: string;
    iv?: string;
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
export declare function encryptMetadata(message: string, recipientViewingPublicKey: `0x${string}`): EncryptedMetadata;
/**
 * Decrypt transaction metadata using ECIES
 * @param encryptedMetadata The encrypted metadata
 * @param recipientViewingPrivateKey The recipient's viewing private key
 * @returns Decrypted message
 */
export declare function decryptMetadata(encryptedMetadata: EncryptedMetadata, recipientViewingPrivateKey: `0x${string}`): string;
/**
 * Create encrypted transaction memo
 * @param memo The transaction memo object
 * @param recipientViewingPublicKey The recipient's viewing public key
 * @returns Encrypted metadata
 */
export declare function createEncryptedMemo(memo: TransactionMemo, recipientViewingPublicKey: `0x${string}`): EncryptedMetadata;
/**
 * Decrypt and parse transaction memo
 * @param encryptedMetadata The encrypted metadata
 * @param recipientViewingPrivateKey The recipient's viewing private key
 * @returns Parsed transaction memo
 */
export declare function decryptMemo(encryptedMetadata: EncryptedMetadata, recipientViewingPrivateKey: `0x${string}`): TransactionMemo;
