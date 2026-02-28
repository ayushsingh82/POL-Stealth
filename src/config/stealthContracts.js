"use strict";
/**
 * ERC-5564 / ERC-6538 deployment addresses (stealthaddress.dev).
 * Use these in production so scanning targets a real deployment, not "all contracts".
 * @see https://stealthaddress.dev/contracts/deployments
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ERC5564_ANNOUNCER_CHAINS = exports.ERC6538_REGISTRY = exports.ERC5564_ANNOUNCER = void 0;
exports.getERC5564AnnouncerAddress = getERC5564AnnouncerAddress;
exports.ERC5564_ANNOUNCER = '0x55649E01B5Df198D18D95b5cc5051630cfD45564';
exports.ERC6538_REGISTRY = '0x6538E6bf4B0eBd30A8Ea093027Ac2422ce5d6538';
/** Chain IDs where ERC-5564 Announcer is deployed (stealthaddress.dev). Polygon Amoy may use same address if announced there. */
exports.ERC5564_ANNOUNCER_CHAINS = [
    1, // Ethereum Mainnet
    137, // Polygon
    80002, // Polygon Amoy (testnet; use announcer if deployed, else scan falls back to all contracts)
    42161, // Arbitrum
    8453, // Base
    100, // Gnosis Chain
    10, // Optimism
    534352, // Scroll
    11155111, // Sepolia
    17000, // Holešky
    421614, // Arbitrum Sepolia
    84532, // Base Sepolia
    11155420, // Optimism Sepolia
];
/**
 * Get ERC-5564 Announcer address for a chain, or undefined if not deployed.
 */
function getERC5564AnnouncerAddress(chainId) {
    return exports.ERC5564_ANNOUNCER_CHAINS.includes(chainId)
        ? exports.ERC5564_ANNOUNCER
        : undefined;
}
