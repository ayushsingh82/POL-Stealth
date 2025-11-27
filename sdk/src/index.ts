/**
 * POL-Stealth SDK
 * Main entry point for the SDK
 */

export { TeamManager } from './core/TeamManager';
export { TransactionManager } from './core/TransactionManager';

export * from './types';
export * from './utils/address';
export * from './utils/amount';

import { TeamManager } from './core/TeamManager';
import { TransactionManager } from './core/TransactionManager';
import { SDKConfig } from './types';

/**
 * Main SDK class
 */
export class POLStealthSDK {
  public teamManager: TeamManager;
  public transactionManager: TransactionManager;
  private config: SDKConfig;

  constructor(config: SDKConfig = {}) {
    this.config = {
      chainId: 80002, // Polygon Amoy testnet by default
      ...config
    };
    
    this.teamManager = new TeamManager();
    this.transactionManager = new TransactionManager();
  }

  /**
   * Get current configuration
   */
  getConfig(): SDKConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<SDKConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

// Default export
export default POLStealthSDK;

