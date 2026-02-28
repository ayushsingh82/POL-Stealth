/**
 * ERC-5564 Stealth Address Generator
 * Implements the SECP256k1 with View Tags scheme
 */
export interface StealthMetaAddress {
    spendingPubKey: `0x${string}`;
    viewingPubKey: `0x${string}`;
}
export interface StealthAddressResult {
    stealthAddress: `0x${string}`;
    ephemeralPubKey: `0x${string}`;
    viewTag: `0x${string}`;
}
export interface AnnouncementEvent {
    schemeId: number;
    stealthAddress: `0x${string}`;
    caller: `0x${string}`;
    ephemeralPubKey: `0x${string}`;
    metadata: `0x${string}`;
}
export declare class ERC5564StealthAddressGenerator {
    private readonly schemeId;
    /**
     * Generate a stealth address from a stealth meta-address
     * @param stealthMetaAddress The recipient's stealth meta-address
     * @returns stealthAddress, ephemeralPubKey, and viewTag
     */
    generateStealthAddress(stealthMetaAddress: StealthMetaAddress): StealthAddressResult;
    /**
     * Check if a stealth address belongs to the recipient
     * @param stealthAddress The stealth address to check
     * @param ephemeralPubKey The ephemeral public key
     * @param viewingKey The recipient's viewing private key
     * @param spendingPubKey The recipient's spending public key
     * @returns True if the stealth address belongs to the recipient
     */
    checkStealthAddress(stealthAddress: `0x${string}`, ephemeralPubKey: `0x${string}`, viewingKey: `0x${string}`, spendingPubKey: `0x${string}`): boolean;
    /**
     * Compute the stealth private key for a stealth address
     * @param stealthAddress The stealth address
     * @param ephemeralPubKey The ephemeral public key
     * @param viewingKey The recipient's viewing private key
     * @param spendingKey The recipient's spending private key
     * @returns The stealth private key
     */
    computeStealthKey(stealthAddress: `0x${string}`, ephemeralPubKey: `0x${string}`, viewingKey: `0x${string}`, spendingKey: `0x${string}`): `0x${string}`;
    /**
     * Create announcement metadata for ERC-5564
     * @param viewTag The view tag
     * @param tokenAddress The token contract address (optional)
     * @param amount The amount being sent
     * @returns The metadata bytes
     */
    createAnnouncementMetadata(viewTag: `0x${string}`, tokenAddress?: `0x${string}`, amount?: bigint): `0x${string}`;
    /**
     * Parse stealth meta-address from the st:eth: format
     * @param stealthMetaAddress The stealth meta-address string
     * @returns Parsed stealth meta-address
     */
    parseStealthMetaAddress(stealthMetaAddress: string): StealthMetaAddress;
    /**
     * Format stealth meta-address to st:eth: format
     * @param spendingPubKey The spending public key
     * @param viewingPubKey The viewing public key
     * @returns Formatted stealth meta-address
     */
    formatStealthMetaAddress(spendingPubKey: `0x${string}`, viewingPubKey: `0x${string}`): string;
}
