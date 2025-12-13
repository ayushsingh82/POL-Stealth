/**
 * Team Stealth Address Pool Manager
 * Generates and manages stealth addresses for team members
 */

import { ERC5564StealthAddressGenerator } from '../erc5564/StealthAddressGenerator';
import type { StealthMetaAddress, StealthAddressResult } from '../erc5564/StealthAddressGenerator';

export interface TeamMemberStealthKeys {
  memberId: string;
  memberAddress: string;
  spendingPublicKey: `0x${string}`;
  viewingPublicKey: `0x${string}`;
  spendingPrivateKey?: `0x${string}`; // Optional, only if member provides it
  viewingPrivateKey?: `0x${string}`; // Optional, only if member provides it
}

export interface TeamStealthAddress {
  id: string;
  memberId: string;
  stealthAddress: `0x${string}`;
  ephemeralPubKey: `0x${string}`;
  viewTag: `0x${string}`;
  generatedAt: number;
  used: boolean;
  transactionHash?: `0x${string}`;
}

export interface TeamStealthAddressPoolConfig {
  teamId: string;
  preGenerateCount?: number; // Number of addresses to pre-generate per member
}

export class TeamStealthAddressPool {
  private generator: ERC5564StealthAddressGenerator;
  private teamMembers: Map<string, TeamMemberStealthKeys> = new Map();
  private addressPool: Map<string, TeamStealthAddress[]> = new Map(); // memberId -> addresses
  private config: TeamStealthAddressPoolConfig;

  constructor(config: TeamStealthAddressPoolConfig) {
    this.config = {
      preGenerateCount: 10,
      ...config
    };
    this.generator = new ERC5564StealthAddressGenerator();
  }

  /**
   * Add team member with their stealth keys
   */
  addTeamMember(member: TeamMemberStealthKeys): void {
    this.teamMembers.set(member.memberId, member);
    
    // Initialize address pool for this member
    if (!this.addressPool.has(member.memberId)) {
      this.addressPool.set(member.memberId, []);
    }

    // Pre-generate addresses if configured
    if (this.config.preGenerateCount && this.config.preGenerateCount > 0) {
      this.preGenerateAddresses(member.memberId, this.config.preGenerateCount);
    }
  }

  /**
   * Remove team member and their address pool
   */
  removeTeamMember(memberId: string): void {
    this.teamMembers.delete(memberId);
    this.addressPool.delete(memberId);
  }

  /**
   * Generate a stealth address for a team member
   */
  generateStealthAddress(memberId: string): TeamStealthAddress {
    const member = this.teamMembers.get(memberId);
    if (!member) {
      throw new Error(`Team member ${memberId} not found`);
    }

    const stealthMetaAddress: StealthMetaAddress = {
      spendingPubKey: member.spendingPublicKey,
      viewingPubKey: member.viewingPublicKey
    };

    const result: StealthAddressResult = this.generator.generateStealthAddress(stealthMetaAddress);

    const stealthAddress: TeamStealthAddress = {
      id: `${memberId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      memberId,
      stealthAddress: result.stealthAddress,
      ephemeralPubKey: result.ephemeralPubKey,
      viewTag: result.viewTag,
      generatedAt: Date.now(),
      used: false
    };

    // Add to pool
    const pool = this.addressPool.get(memberId) || [];
    pool.push(stealthAddress);
    this.addressPool.set(memberId, pool);

    return stealthAddress;
  }

  /**
   * Pre-generate multiple stealth addresses for a member
   */
  preGenerateAddresses(memberId: string, count: number): TeamStealthAddress[] {
    const addresses: TeamStealthAddress[] = [];

    for (let i = 0; i < count; i++) {
      addresses.push(this.generateStealthAddress(memberId));
    }

    return addresses;
  }

  /**
   * Get an unused stealth address from the pool
   */
  getUnusedAddress(memberId: string): TeamStealthAddress | null {
    const pool = this.addressPool.get(memberId) || [];
    const unused = pool.find(addr => !addr.used);

    if (unused) {
      return unused;
    }

    // If no unused address, generate a new one
    return this.generateStealthAddress(memberId);
  }

  /**
   * Mark an address as used
   */
  markAddressAsUsed(addressId: string, transactionHash?: `0x${string}`): boolean {
    for (const pool of this.addressPool.values()) {
      const address = pool.find(addr => addr.id === addressId);
      if (address) {
        address.used = true;
        if (transactionHash) {
          address.transactionHash = transactionHash;
        }
        return true;
      }
    }
    return false;
  }

  /**
   * Get all addresses for a team member
   */
  getAddressesForMember(memberId: string): TeamStealthAddress[] {
    return this.addressPool.get(memberId) || [];
  }

  /**
   * Get unused addresses for a team member
   */
  getUnusedAddressesForMember(memberId: string): TeamStealthAddress[] {
    const pool = this.addressPool.get(memberId) || [];
    return pool.filter(addr => !addr.used);
  }

  /**
   * Get address by stealth address string
   */
  getAddressByStealthAddress(stealthAddress: `0x${string}`): TeamStealthAddress | null {
    for (const pool of this.addressPool.values()) {
      const address = pool.find(
        addr => addr.stealthAddress.toLowerCase() === stealthAddress.toLowerCase()
      );
      if (address) {
        return address;
      }
    }
    return null;
  }

  /**
   * Get pool statistics
   */
  getPoolStats(): {
    totalMembers: number;
    totalAddresses: number;
    usedAddresses: number;
    unusedAddresses: number;
    addressesPerMember: Map<string, { total: number; used: number; unused: number }>;
  } {
    let totalAddresses = 0;
    let usedAddresses = 0;
    const addressesPerMember = new Map<string, { total: number; used: number; unused: number }>();

    for (const [memberId, pool] of this.addressPool.entries()) {
      const total = pool.length;
      const used = pool.filter(addr => addr.used).length;
      const unused = total - used;

      totalAddresses += total;
      usedAddresses += used;

      addressesPerMember.set(memberId, { total, used, unused });
    }

    return {
      totalMembers: this.teamMembers.size,
      totalAddresses,
      usedAddresses,
      unusedAddresses: totalAddresses - usedAddresses,
      addressesPerMember
    };
  }

  /**
   * Clear address pool for a member
   */
  clearPoolForMember(memberId: string): void {
    this.addressPool.set(memberId, []);
  }

  /**
   * Clear all address pools
   */
  clearAllPools(): void {
    this.addressPool.clear();
  }

  /**
   * Export pool data
   */
  exportPool(): {
    config: TeamStealthAddressPoolConfig;
    members: TeamMemberStealthKeys[];
    addresses: Map<string, TeamStealthAddress[]>;
  } {
    return {
      config: this.config,
      members: Array.from(this.teamMembers.values()),
      addresses: new Map(this.addressPool)
    };
  }

  /**
   * Import pool data
   */
  importPool(data: {
    config: TeamStealthAddressPoolConfig;
    members: TeamMemberStealthKeys[];
    addresses: Map<string, TeamStealthAddress[]>;
  }): void {
    this.config = data.config;
    
    for (const member of data.members) {
      this.teamMembers.set(member.memberId, member);
    }

    for (const [memberId, addresses] of data.addresses.entries()) {
      this.addressPool.set(memberId, addresses);
    }
  }
}

