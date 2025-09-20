#!/usr/bin/env ts-node

import { ethers } from 'ethers';
import { createStealthAddress, predictStealthSafeAddress } from '../src/helper/fluid';

async function runFluidWithInput() {
    try {
        console.log('🚀 Running Fluid Stealth Address Generation');
        console.log('==========================================\n');

        // Constant input address
        const RECIPIENT_ADDRESS = '0x4f5c97463dA952533373933cF5776284fF2EFB72' as `0x${string}`;
        const AMOUNT = '0.1';

        console.log('📝 Input Parameters:');
        console.log(`Recipient Address: ${RECIPIENT_ADDRESS}`);
        console.log(`Amount: ${AMOUNT} ETH`);
        console.log(`Network: Horizen Testnet (Chain ID: 845320009)`);

        // Create a mock signer for demonstration
        const mockSigner = {
            signMessage: async (message: string) => {
                // Mock implementation - in real usage this would be actual wallet signature
                const mockPrivateKey = '0x1234567890123456789012345678901234567890123456789012345678901234';
                const wallet = new ethers.Wallet(mockPrivateKey);
                return await wallet.signMessage(message);
            }
        };

        console.log('\n⏳ Generating stealth address...');

        // Generate stealth address using fluid.ts helper
        const stealthAddress = await createStealthAddress(mockSigner, [RECIPIENT_ADDRESS]);
        
        console.log('\n✅ Stealth Address Generated!');
        console.log('============================');
        console.log(`Stealth Address: ${stealthAddress}`);
        
        // Predict Safe address
        const safeAddress = await predictStealthSafeAddress([stealthAddress]);
        console.log(`Safe Address: ${safeAddress}`);

        console.log('\n📋 Transaction Summary:');
        console.log('=======================');
        console.log(`From: Your Wallet`);
        console.log(`To: ${stealthAddress}`);
        console.log(`Original Recipient: ${RECIPIENT_ADDRESS}`);
        console.log(`Amount: ${AMOUNT} ETH`);
        console.log(`Network: Horizen Testnet (Chain ID: 845320009)`);

        console.log('\n🔍 Address Validation:');
        console.log('=====================');
        console.log(`Recipient Address Valid: ${ethers.isAddress(RECIPIENT_ADDRESS) ? '✅' : '❌'}`);
        console.log(`Stealth Address Valid: ${ethers.isAddress(stealthAddress) ? '✅' : '❌'}`);
        console.log(`Safe Address Valid: ${ethers.isAddress(safeAddress) ? '✅' : '❌'}`);

        console.log('\n🎉 Success! Stealth address generation completed.');
        console.log('\n⚠️  Note: This uses a mock signer for demonstration.');
        console.log('   In production, use actual wallet integration.');

    } catch (error) {
        console.error('\n❌ Error:', (error as Error).message);
        console.error('Stack trace:', (error as Error).stack);
        process.exit(1);
    }
}

// Run the script
if (require.main === module) {
    runFluidWithInput().catch((error) => {
        console.error('Script failed:', error);
        process.exit(1);
    });
}

export { runFluidWithInput }; 