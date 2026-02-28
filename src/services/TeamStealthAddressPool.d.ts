/**
 * Team Stealth Address Pool Manager
 * Generates and manages stealth addresses for team members
 */
export interface TeamMemberStealthKeys {
    memberId: string;
    memberAddress: string;
    spendingPublicKey: `0x${string}`;
    viewingPublicKey: `0x${string}`;
    spendingPrivateKey?: `0x${string}`;
    viewingPrivateKey?: `0x${string}`;
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
    preGenerateCount?: number;
}
export declare class TeamStealthAddressPool {
    private generator;
    private teamMembers;
    private addressPool;
    private config;
    constructor(config: TeamStealthAddressPoolConfig);
    /**
     * Add team member with their stealth keys
     */
    addTeamMember(member: TeamMemberStealthKeys): void;
    /**
     * Remove team member and their address pool
     */
    removeTeamMember(memberId: string): void;
    /**
     * Generate a stealth address for a team member
     */
    generateStealthAddress(memberId: string): TeamStealthAddress;
    /**
     * Pre-generate multiple stealth addresses for a member
     */
    preGenerateAddresses(memberId: string, count: number): TeamStealthAddress[];
    /**
     * Get an unused stealth address from the pool
     */
    getUnusedAddress(memberId: string): TeamStealthAddress | null;
    /**
     * Mark an address as used
     */
    markAddressAsUsed(addressId: string, transactionHash?: `0x${string}`): boolean;
    /**
     * Get all addresses for a team member
     */
    getAddressesForMember(memberId: string): TeamStealthAddress[];
    /**
     * Get unused addresses for a team member
     */
    getUnusedAddressesForMember(memberId: string): TeamStealthAddress[];
    /**
     * Get address by stealth address string
     */
    getAddressByStealthAddress(stealthAddress: `0x${string}`): TeamStealthAddress | null;
    /**
     * Get pool statistics
     */
    getPoolStats(): {
        totalMembers: number;
        totalAddresses: number;
        usedAddresses: number;
        unusedAddresses: number;
        addressesPerMember: Map<string, {
            total: number;
            used: number;
            unused: number;
        }>;
    };
    /**
     * Clear address pool for a member
     */
    clearPoolForMember(memberId: string): void;
    /**
     * Clear all address pools
     */
    clearAllPools(): void;
    /**
     * Export pool data
     */
    exportPool(): {
        config: TeamStealthAddressPoolConfig;
        members: TeamMemberStealthKeys[];
        addresses: Map<string, TeamStealthAddress[]>;
    };
    /**
     * Import pool data
     */
    importPool(data: {
        config: TeamStealthAddressPoolConfig;
        members: TeamMemberStealthKeys[];
        addresses: Map<string, TeamStealthAddress[]>;
    }): void;
}
