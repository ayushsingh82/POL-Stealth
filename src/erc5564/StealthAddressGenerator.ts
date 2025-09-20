import * as secp from '@noble/secp256k1';
import { keccak256, toHex, toBytes } from 'viem';

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

export class ERC5564StealthAddressGenerator {
  private readonly schemeId = 1; // SECP256k1 with View Tags

  /**
   * Generate a stealth address from a stealth meta-address
   * @param stealthMetaAddress The recipient's stealth meta-address
   * @returns stealthAddress, ephemeralPubKey, and viewTag
   */
  generateStealthAddress(stealthMetaAddress: StealthMetaAddress): StealthAddressResult {
    try {
      // 1. Generate a random 32-byte entropy ephemeral private key
      const ephemeralPrivateKey = secp.utils.randomPrivateKey();
      const ephemeralPubKey = secp.getPublicKey(ephemeralPrivateKey);

      // 2. Parse the spending and viewing public keys
      const spendingPubKey = toBytes(stealthMetaAddress.spendingPubKey);
      const viewingPubKey = toBytes(stealthMetaAddress.viewingPubKey);

      // 3. Compute shared secret: S = e * V
      const sharedSecret = secp.getSharedSecret(
        ephemeralPrivateKey,
        viewingPubKey,
        false
      );

      // 4. Hash the shared secret: h = H(S)
      const hashedSecret = keccak256(toHex(sharedSecret.slice(1)));

      // 5. Extract view tag: t = h[0] (most significant byte)
      const viewTag = `0x${hashedSecret.slice(2, 4)}` as `0x${string}`;

      // 6. Multiply hashed secret with generator point: G * h
      const hashedSecretPoint = secp.Point.fromPrivateKey(BigInt(hashedSecret));

      // 7. Compute stealth public key: P = G * h + S
      const spendingPubKeyPoint = secp.Point.fromHex(stealthMetaAddress.spendingPubKey.slice(2));
      const stealthPubKey = spendingPubKeyPoint.add(hashedSecretPoint);

      // 8. Compute stealth address: A = H(P)
      const stealthAddress = `0x${keccak256(Buffer.from(stealthPubKey.toHex(), 'hex').subarray(1)).slice(-40)}` as `0x${string}`;

      return {
        stealthAddress,
        ephemeralPubKey: `0x${Buffer.from(ephemeralPubKey).toString('hex')}` as `0x${string}`,
        viewTag
      };

    } catch (error) {
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
  checkStealthAddress(
    stealthAddress: `0x${string}`,
    ephemeralPubKey: `0x${string}`,
    viewingKey: `0x${string}`,
    spendingPubKey: `0x${string}`
  ): boolean {
    try {
      // 1. Compute shared secret: S = v * E
      const sharedSecret = secp.getSharedSecret(
        viewingKey.slice(2),
        ephemeralPubKey.slice(2),
        false
      );

      // 2. Hash the shared secret: h = H(S)
      const hashedSecret = keccak256(toHex(sharedSecret.slice(1)));

      // 3. Extract view tag: t = h[0]
      const viewTag = `0x${hashedSecret.slice(2, 4)}`;

      // 4. Multiply hashed secret with generator point: G * h
      const hashedSecretPoint = secp.Point.fromPrivateKey(BigInt(hashedSecret));

      // 5. Compute stealth public key: P = G * h + S
      const spendingPubKeyPoint = secp.Point.fromHex(spendingPubKey.slice(2));
      const stealthPubKey = spendingPubKeyPoint.add(hashedSecretPoint);

      // 6. Compute stealth address: A = H(P)
      const derivedStealthAddress = `0x${keccak256(Buffer.from(stealthPubKey.toHex(), 'hex').subarray(1)).slice(-40)}` as `0x${string}`;

      // 7. Compare addresses
      return derivedStealthAddress.toLowerCase() === stealthAddress.toLowerCase();

    } catch (error) {
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
  computeStealthKey(
    stealthAddress: `0x${string}`,
    ephemeralPubKey: `0x${string}`,
    viewingKey: `0x${string}`,
    spendingKey: `0x${string}`
  ): `0x${string}` {
    try {
      // 1. Compute shared secret: S = v * E
      const sharedSecret = secp.getSharedSecret(
        viewingKey.slice(2),
        ephemeralPubKey.slice(2),
        false
      );

      // 2. Hash the shared secret: h = H(S)
      const hashedSecret = keccak256(toHex(sharedSecret.slice(1)));

      // 3. Compute stealth private key: s = (s + h) mod n
      const spendingKeyBigInt = BigInt(spendingKey);
      const hashedSecretBigInt = BigInt(hashedSecret);
      const stealthPrivateKey = (spendingKeyBigInt + hashedSecretBigInt) % secp.CURVE.n;

      return `0x${stealthPrivateKey.toString(16).padStart(64, '0')}` as `0x${string}`;

    } catch (error) {
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
  createAnnouncementMetadata(
    viewTag: `0x${string}`,
    tokenAddress?: `0x${string}`,
    amount?: bigint
  ): `0x${string}` {
    if (!tokenAddress) {
      // Native token (ETH) metadata
      const nativeTokenAddress = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';
      const amountBytes = amount ? amount.toString(16).padStart(64, '0') : '0'.repeat(64);
      return `${viewTag}eeeeeeee${nativeTokenAddress.slice(2)}${amountBytes}` as `0x${string}`;
    } else {
      // ERC-20/ERC-721 token metadata
      const functionSelector = '0xa9059cbb'; // transfer(address,uint256)
      const amountBytes = amount ? amount.toString(16).padStart(64, '0') : '0'.repeat(64);
      return `${viewTag}${functionSelector.slice(2)}${tokenAddress.slice(2)}${amountBytes}` as `0x${string}`;
    }
  }

  /**
   * Parse stealth meta-address from the st:eth: format
   * @param stealthMetaAddress The stealth meta-address string
   * @returns Parsed stealth meta-address
   */
  parseStealthMetaAddress(stealthMetaAddress: string): StealthMetaAddress {
    if (!stealthMetaAddress.startsWith('st:eth:')) {
      throw new Error('Invalid stealth meta-address format. Expected st:eth: prefix.');
    }

    const addressPart = stealthMetaAddress.slice(7); // Remove 'st:eth:'
    
    if (addressPart.length !== 128) { // 64 bytes for each public key
      throw new Error('Invalid stealth meta-address length.');
    }

    const spendingPubKey = `0x${addressPart.slice(0, 64)}` as `0x${string}`;
    const viewingPubKey = `0x${addressPart.slice(64)}` as `0x${string}`;

    return { spendingPubKey, viewingPubKey };
  }

  /**
   * Format stealth meta-address to st:eth: format
   * @param spendingPubKey The spending public key
   * @param viewingPubKey The viewing public key
   * @returns Formatted stealth meta-address
   */
  formatStealthMetaAddress(spendingPubKey: `0x${string}`, viewingPubKey: `0x${string}`): string {
    return `st:eth:${spendingPubKey.slice(2)}${viewingPubKey.slice(2)}`;
  }
} 