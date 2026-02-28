/**
 * ERC-5564 / ERC-6538 deployment addresses (stealthaddress.dev).
 * Use these in production so scanning targets a real deployment, not "all contracts".
 * @see https://stealthaddress.dev/contracts/deployments
 */
export declare const ERC5564_ANNOUNCER: "0x55649E01B5Df198D18D95b5cc5051630cfD45564";
export declare const ERC6538_REGISTRY: "0x6538E6bf4B0eBd30A8Ea093027Ac2422ce5d6538";
/** Chain IDs where ERC-5564 Announcer is deployed (stealthaddress.dev). Polygon Amoy may use same address if announced there. */
export declare const ERC5564_ANNOUNCER_CHAINS: number[];
/**
 * Get ERC-5564 Announcer address for a chain, or undefined if not deployed.
 */
export declare function getERC5564AnnouncerAddress(chainId: number): `0x${string}` | undefined;
