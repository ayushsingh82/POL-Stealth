/**
 * Address utility functions
 */

/**
 * Validate Ethereum address format
 */
export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Format address for display (truncate)
 */
export function formatAddress(address: string, startLength: number = 6, endLength: number = 4): string {
  if (!isValidAddress(address)) {
    return address;
  }
  return `${address.slice(0, startLength)}...${address.slice(-endLength)}`;
}

/**
 * Get PolygonScan URL for address
 */
export function getPolygonScanUrl(address: string, network: 'mainnet' | 'amoy' = 'amoy'): string {
  const baseUrl = network === 'mainnet' 
    ? 'https://polygonscan.com' 
    : 'https://amoy.polygonscan.com';
  return `${baseUrl}/address/${address}`;
}

/**
 * Get PolygonScan URL for transaction
 */
export function getPolygonScanTxUrl(txHash: string, network: 'mainnet' | 'amoy' = 'amoy'): string {
  const baseUrl = network === 'mainnet' 
    ? 'https://polygonscan.com' 
    : 'https://amoy.polygonscan.com';
  return `${baseUrl}/tx/${txHash}`;
}

