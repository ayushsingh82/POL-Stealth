/**
 * Claim flow: move POL from a stealth address to the user's wallet.
 * Wraps the app's claim helper (sign + derive keys + claim).
 */

import { claimFromStealthAddress as claimFromStealthAddressImpl } from '../../../src/helper/fluid';

export interface ClaimSigner {
  signMessage: (message: string) => Promise<string>;
}

export interface ClaimResult {
  success: boolean;
  canClaim: boolean;
  stealthAddresses?: string[];
  error?: string;
}

/**
 * Run the claim flow for a stealth address.
 * Requires a signer (e.g. wallet with signMessage). In production this would
 * derive the stealth private key and send a transaction to move funds.
 */
export async function claimFromStealthAddress(
  signer: ClaimSigner,
  stealthAddress: `0x${string}`
): Promise<ClaimResult> {
  try {
    const result = await claimFromStealthAddressImpl(signer, stealthAddress);
    return {
      success: true,
      canClaim: result.canClaim ?? false,
      stealthAddresses: result.stealthAddresses,
    };
  } catch (error) {
    return {
      success: false,
      canClaim: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
