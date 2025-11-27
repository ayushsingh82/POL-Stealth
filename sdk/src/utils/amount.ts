/**
 * Amount utility functions
 */

import { parseEther, formatEther } from 'viem';

/**
 * Convert amount string/number to wei (BigInt)
 */
export function toWei(amount: string | number): bigint {
  return parseEther(amount.toString());
}

/**
 * Convert wei (BigInt) to ether string
 */
export function fromWei(amount: bigint): string {
  return formatEther(amount);
}

/**
 * Format amount with decimals
 */
export function formatAmount(amount: bigint, decimals: number = 18, precision: number = 4): string {
  const divisor = BigInt(10 ** decimals);
  const wholePart = amount / divisor;
  const fractionalPart = amount % divisor;
  
  if (fractionalPart === 0n) {
    return wholePart.toString();
  }
  
  const fractionalStr = fractionalPart.toString().padStart(decimals, '0');
  const trimmed = fractionalStr.slice(0, precision).replace(/0+$/, '');
  
  return trimmed ? `${wholePart}.${trimmed}` : wholePart.toString();
}

/**
 * Calculate total for batch transactions
 */
export function calculateBatchTotal(amountPerRecipient: bigint, recipientCount: number): bigint {
  return amountPerRecipient * BigInt(recipientCount);
}

