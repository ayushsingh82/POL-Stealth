declare function createStealthAddress(signer: any, recipientPublicKeys?: `0x${string}`[]): Promise<`0x${string}`>;
declare function predictStealthSafeAddress(stealthAddresses: `0x${string}`[]): Promise<{
    stealthSafeAddress: `0x${string}`;
    stealthSafeAddresses: `0x${string}`[];
}>;
declare function claimFromStealthAddress(signer: any, stealthAddress: `0x${string}`): Promise<{
    isMatch: boolean;
    stealthAddresses: `0x${string}`[];
    canClaim: boolean;
}>;
export { createStealthAddress, predictStealthSafeAddress, claimFromStealthAddress };
