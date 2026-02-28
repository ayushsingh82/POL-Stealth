"use strict";
/**
 * Team Stealth Address Pool Manager
 * Generates and manages stealth addresses for team members
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeamStealthAddressPool = void 0;
const StealthAddressGenerator_1 = require("../erc5564/StealthAddressGenerator");
class TeamStealthAddressPool {
    constructor(config) {
        this.teamMembers = new Map();
        this.addressPool = new Map(); // memberId -> addresses
        this.config = {
            preGenerateCount: 10,
            ...config
        };
        this.generator = new StealthAddressGenerator_1.ERC5564StealthAddressGenerator();
    }
    /**
     * Add team member with their stealth keys
     */
    addTeamMember(member) {
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
    removeTeamMember(memberId) {
        this.teamMembers.delete(memberId);
        this.addressPool.delete(memberId);
    }
    /**
     * Generate a stealth address for a team member
     */
    generateStealthAddress(memberId) {
        const member = this.teamMembers.get(memberId);
        if (!member) {
            throw new Error(`Team member ${memberId} not found`);
        }
        const stealthMetaAddress = {
            spendingPubKey: member.spendingPublicKey,
            viewingPubKey: member.viewingPublicKey
        };
        const result = this.generator.generateStealthAddress(stealthMetaAddress);
        const stealthAddress = {
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
    preGenerateAddresses(memberId, count) {
        const addresses = [];
        for (let i = 0; i < count; i++) {
            addresses.push(this.generateStealthAddress(memberId));
        }
        return addresses;
    }
    /**
     * Get an unused stealth address from the pool
     */
    getUnusedAddress(memberId) {
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
    markAddressAsUsed(addressId, transactionHash) {
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
    getAddressesForMember(memberId) {
        return this.addressPool.get(memberId) || [];
    }
    /**
     * Get unused addresses for a team member
     */
    getUnusedAddressesForMember(memberId) {
        const pool = this.addressPool.get(memberId) || [];
        return pool.filter(addr => !addr.used);
    }
    /**
     * Get address by stealth address string
     */
    getAddressByStealthAddress(stealthAddress) {
        for (const pool of this.addressPool.values()) {
            const address = pool.find(addr => addr.stealthAddress.toLowerCase() === stealthAddress.toLowerCase());
            if (address) {
                return address;
            }
        }
        return null;
    }
    /**
     * Get pool statistics
     */
    getPoolStats() {
        let totalAddresses = 0;
        let usedAddresses = 0;
        const addressesPerMember = new Map();
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
    clearPoolForMember(memberId) {
        this.addressPool.set(memberId, []);
    }
    /**
     * Clear all address pools
     */
    clearAllPools() {
        this.addressPool.clear();
    }
    /**
     * Export pool data
     */
    exportPool() {
        return {
            config: this.config,
            members: Array.from(this.teamMembers.values()),
            addresses: new Map(this.addressPool)
        };
    }
    /**
     * Import pool data
     */
    importPool(data) {
        this.config = data.config;
        for (const member of data.members) {
            this.teamMembers.set(member.memberId, member);
        }
        for (const [memberId, addresses] of data.addresses.entries()) {
            this.addressPool.set(memberId, addresses);
        }
    }
}
exports.TeamStealthAddressPool = TeamStealthAddressPool;
