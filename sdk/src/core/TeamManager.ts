/**
 * Team Management Module
 * Handles team member operations and role management
 */

import { TeamMember, TeamMemberRole } from '../types';

export class TeamManager {
  private teamMembers: TeamMember[] = [];

  /**
   * Add a new team member
   */
  addMember(member: Omit<TeamMember, 'id'>): TeamMember {
    // Validate address format
    if (!this.isValidAddress(member.address)) {
      throw new Error('Invalid wallet address format');
    }

    // Check for duplicates
    if (this.teamMembers.some(m => m.address.toLowerCase() === member.address.toLowerCase())) {
      throw new Error('Team member with this address already exists');
    }

    const newMember: TeamMember = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      ...member
    };

    this.teamMembers.push(newMember);
    return newMember;
  }

  /**
   * Remove a team member
   */
  removeMember(memberId: string): boolean {
    const member = this.teamMembers.find(m => m.id === memberId);
    
    // Prevent removing the last admin
    if (member?.role === 'admin' && this.getAdmins().length === 1) {
      throw new Error('Cannot remove the last admin');
    }

    const initialLength = this.teamMembers.length;
    this.teamMembers = this.teamMembers.filter(m => m.id !== memberId);
    return this.teamMembers.length < initialLength;
  }

  /**
   * Update member role
   */
  updateMemberRole(memberId: string, newRole: TeamMemberRole): TeamMember {
    const member = this.teamMembers.find(m => m.id === memberId);
    
    if (!member) {
      throw new Error('Team member not found');
    }

    // Prevent removing the last admin
    if (member.role === 'admin' && newRole !== 'admin' && this.getAdmins().length === 1) {
      throw new Error('Cannot remove the last admin');
    }

    member.role = newRole;
    return member;
  }

  /**
   * Get all team members
   */
  getMembers(): TeamMember[] {
    return [...this.teamMembers];
  }

  /**
   * Get members by role
   */
  getMembersByRole(role: TeamMemberRole): TeamMember[] {
    return this.teamMembers.filter(m => m.role === role);
  }

  /**
   * Get all admins
   */
  getAdmins(): TeamMember[] {
    return this.getMembersByRole('admin');
  }

  /**
   * Get member by ID
   */
  getMember(memberId: string): TeamMember | undefined {
    return this.teamMembers.find(m => m.id === memberId);
  }

  /**
   * Get member by address
   */
  getMemberByAddress(address: string): TeamMember | undefined {
    return this.teamMembers.find(m => m.address.toLowerCase() === address.toLowerCase());
  }

  /**
   * Check if address is a valid Ethereum address
   */
  private isValidAddress(address: string): boolean {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  }

  /**
   * Initialize with existing members
   */
  initialize(members: TeamMember[]): void {
    this.teamMembers = [...members];
  }

  /**
   * Clear all members
   */
  clear(): void {
    this.teamMembers = [];
  }
}

