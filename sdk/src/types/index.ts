/**
 * Type definitions for POL-Stealth SDK
 */

export type TeamMemberRole = 'admin' | 'member' | 'viewer';

export interface TeamMember {
  id: string;
  address: string;
  role: TeamMemberRole;
  name: string;
}

export interface TransactionConfig {
  to: string;
  value: bigint;
  account?: string;
}

export interface BatchTransactionConfig {
  recipients: string[];
  amountPerRecipient: bigint;
  account?: string;
}

export interface StealthAddressConfig {
  chainId?: number;
  generateQR?: boolean;
}

export interface TransactionResult {
  hash: string;
  status: 'pending' | 'success' | 'failed';
  error?: string;
}

export interface BatchTransactionResult {
  transactions: TransactionResult[];
  totalSent: bigint;
  successCount: number;
  failedCount: number;
}

export interface SDKConfig {
  chainId?: number;
  rpcUrl?: string;
}

