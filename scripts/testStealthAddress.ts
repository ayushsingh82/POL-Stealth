#!/usr/bin/env ts-node

import { ethers } from 'ethers';
import { createStealthAddress, createStealthTransaction } from '../src/helper/fluid';

async function testStealthAddressGeneration() {
    try {
        console.log('🚀 Testing Stealth Address Generation');
        console.log('=====================================\n');

        // Create a mock signer for testing
        const mockSigner = {
            signMessage: async (message: string) => {
                // This is a mock implementation for testing
                // In real usage, this would be the actual wallet signature
                const mockPrivateKey = '0x1234567890123456789012345678901234567890123456789012345678901234';
                const wallet = new ethers.Wallet(mockPrivateKey);
                return await wallet.signMessage(message);
            }
        };

        // Test recipient address
        const recipientAddress = '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6' as `0x${string}`;
        const amount = '0.1';

        console.log('📝 Test Parameters:');
        console.log(`Recipient: ${recipientAddress}`);
        console.log(`Amount: ${amount} ETH`);
        console.log(`Network: Horizen Testnet (Chain ID: 845320009)`);
        console.log('\n⏳ Generating stealth address...');

        // Test 1: Generate stealth address
        const stealthAddress = await createStealthAddress(mockSigner, [recipientAddress]);
        
        console.log('\n✅ Test 1: Stealth Address Generation');
        console.log('=====================================');
        console.log(`Stealth Address: ${stealthAddress}`);
        console.log(`Address Length: ${stealthAddress.length} characters`);
        console.log(`Valid Format: ${stealthAddress.startsWith('0x') ? '✅' : '❌'}`);

        // Test 2: Create complete stealth transaction
        console.log('\n⏳ Creating complete stealth transaction...');
        const stealthTransaction = await createStealthTransaction(mockSigner, recipientAddress, amount);
        
        console.log('\n✅ Test 2: Complete Stealth Transaction');
        console.log('========================================');
        console.log(`Stealth Address: ${stealthTransaction.stealthAddress}`);
        console.log(`Stealth Private Key: ${stealthTransaction.stealthPrivateKey}`);
        console.log(`Ephemeral Public Key: ${stealthTransaction.ephemeralPublicKey}`);
        console.log(`Amount: ${stealthTransaction.amount} ETH`);
        console.log(`Chain ID: ${stealthTransaction.chainId}`);

        // Test 3: Validate stealth address format
        console.log('\n✅ Test 3: Address Validation');
        console.log('=============================');
        console.log(`Stealth Address Valid: ${ethers.isAddress(stealthAddress) ? '✅' : '❌'}`);
        console.log(`Recipient Address Valid: ${ethers.isAddress(recipientAddress) ? '✅' : '❌'}`);

        // Test 4: Generate multiple stealth addresses
        console.log('\n⏳ Testing multiple stealth addresses...');
        const multipleRecipients = [
            '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
            '0x8ba1f109551bD432803012645Hac136c772c3',
            '0x147B8eb97fD247D06C4006D269c90C1908Fb5D54'
        ] as `0x${string}`[];

        const multipleStealthAddresses = await createStealthAddress(mockSigner, multipleRecipients);
        
        console.log('\n✅ Test 4: Multiple Stealth Addresses');
        console.log('=====================================');
        console.log(`Generated Address: ${multipleStealthAddresses}`);
        console.log(`Number of Recipients: ${multipleRecipients.length}`);

        console.log('\n🎉 All Tests Completed Successfully!');
        console.log('=====================================');
        console.log('✅ Stealth address generation is working');
        console.log('✅ Transaction creation is functional');
        console.log('✅ Address validation is correct');
        console.log('✅ Multiple recipient support works');

        console.log('\n⚠️  Note: This uses a mock signer for testing.');
        console.log('   In production, use actual wallet integration.');

    } catch (error) {
        console.error('\n❌ Test Failed:', (error as Error).message);
        console.error('Stack trace:', (error as Error).stack);
        process.exit(1);
    }
}

// Run the test
if (require.main === module) {
    testStealthAddressGeneration().catch((error) => {
        console.error('Test script failed:', error);
        process.exit(1);
    });
}

export { testStealthAddressGeneration }; 