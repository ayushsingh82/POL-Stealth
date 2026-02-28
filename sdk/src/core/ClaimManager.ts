/**
 * Claim flow: move POL from a stealth address to the user's wallet.
 * Use with the app's claimFromStealthAddress (fluid helper) by passing it as the implementation.
 */

export interface ClaimSigner {
  signMessage: (message: string) => Promise<string>;
}

export interface ClaimResult {
  success: boolean;
  canClaim: boolean;
  stealthAddresses?: string[];
  error?: string;
}

export type ClaimImplementation = (signer: ClaimSigner, stealthAddress: `0x${string}`) => Promise<{ canClaim?: boolean; stealthAddresses?: string[] }>;

/**
 * Run the claim flow for a stealth address.
 * Pass your app's claim implementation (e.g. from helper/fluid) as the third argument.
 * If not provided, returns a result indicating the app should call the claim helper directly.
 */
export async function claimFromStealthAddress(
  signer: ClaimSigner,
  stealthAddress: `0x${string}`,
  impl?: ClaimImplementation
): Promise<ClaimResult> {
  if (!impl) {
    return {
      success: false,
      canClaim: false,
      error: 'Claim implementation required. Use claimFromStealthAddress from app helper/fluid and pass as third argument, or call it directly.',
    };
  }
  try {
    const result = await impl(signer, stealthAddress);
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
