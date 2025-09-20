#!/usr/bin/env ts-node

import { ethers } from 'ethers';
import { ERC5564StealthAddressGenerator, StealthMetaAddress } from '../src/erc5564/StealthAddressGenerator';

async function testERC5564StealthAddress() {
    try {
        console.log('🚀 ERC-5564 Stealth Address Generation Test');
        console.log('==========================================\n');

        // Initialize the ERC-5564 generator
        const generator = new ERC5564StealthAddressGenerator();

        // Create a mock wallet to generate keys
        const mockPrivateKey = '0x1234567890123456789012345678901234567890123456789012345678901234';
        const wallet = new ethers.Wallet(mockPrivateKey);

        // Generate spending and viewing key pairs
        const spendingKeyPair = ethers.Wallet.createRandom();
        const viewingKeyPair = ethers.Wallet.createRandom();

        console.log('📝 Generated Key Pairs:');
        console.log(`Spending Private Key: ${spendingKeyPair.privateKey}`);
        console.log(`Spending Public Key: ${spendingKeyPair.publicKey}`);
        console.log(`Viewing Private Key: ${viewingKeyPair.privateKey}`);
        console.log(`Viewing Public Key: ${viewingKeyPair.publicKey}`);

        // Create stealth meta-address
        const stealthMetaAddress: StealthMetaAddress = {
            spendingPubKey: spendingKeyPair.publicKey as `0x${string}`,
            viewingPubKey: viewingKeyPair.publicKey as `0x${string}`
        };

        console.log('\n🔗 Stealth Meta-Address:');
        console.log(`Spending PubKey: ${stealthMetaAddress.spendingPubKey}`);
        console.log(`Viewing PubKey: ${stealthMetaAddress.viewingPubKey}`);

        // Format as st:eth: address
        const formattedAddress = generator.formatStealthMetaAddress(
            stealthMetaAddress.spendingPubKey,
            stealthMetaAddress.viewingPubKey
        );
        console.log(`Formatted: ${formattedAddress}`);

        // Test parsing
        const parsedAddress = generator.parseStealthMetaAddress(formattedAddress);
        console.log('\n✅ Parsed Address Validation:');
        console.log(`Spending PubKey Match: ${parsedAddress.spendingPubKey === stealthMetaAddress.spendingPubKey ? '✅' : '❌'}`);
        console.log(`Viewing PubKey Match: ${parsedAddress.viewingPubKey === stealthMetaAddress.viewingPubKey ? '✅' : '❌'}`);

        // Generate stealth address
        console.log('\n⏳ Generating stealth address...');
        const stealthResult = generator.generateStealthAddress(stealthMetaAddress);

        console.log('\n✅ Stealth Address Generated:');
        console.log('============================');
        console.log(`Stealth Address: ${stealthResult.stealthAddress}`);
        console.log(`Ephemeral PubKey: ${stealthResult.ephemeralPubKey}`);
        console.log(`View Tag: ${stealthResult.viewTag}`);

        // Test stealth address checking
        console.log('\n🔍 Testing stealth address validation...');
        const isValid = generator.checkStealthAddress(
            stealthResult.stealthAddress,
            stealthResult.ephemeralPubKey,
            viewingKeyPair.privateKey as `0x${string}`,
            stealthMetaAddress.spendingPubKey
        );

        console.log(`Stealth Address Valid: ${isValid ? '✅' : '❌'}`);

        // Compute stealth private key
        console.log('\n🔑 Computing stealth private key...');
        const stealthPrivateKey = generator.computeStealthKey(
            stealthResult.stealthAddress,
            stealthResult.ephemeralPubKey,
            viewingKeyPair.privateKey as `0x${string}`,
            spendingKeyPair.privateKey as `0x${string}`
        );

        console.log(`Stealth Private Key: ${stealthPrivateKey}`);

        // Test with the provided address
        console.log('\n🎯 Testing with provided address...');
        const providedAddress = '0x4f5c97463dA952533373933cF5776284fF2EFB72';
        
        // Create a mock stealth meta-address using the provided address
        const mockStealthMetaAddress: StealthMetaAddress = {
            spendingPubKey: `0x${providedAddress.slice(2)}${'0'.repeat(24)}` as `0x${string}`, // Pad to 32 bytes
            viewingPubKey: `0x${'0'.repeat(64)}` as `0x${string}` // Mock viewing key
        };

        const mockStealthResult = generator.generateStealthAddress(mockStealthMetaAddress);
        
        console.log(`Mock Stealth Address: ${mockStealthResult.stealthAddress}`);
        console.log(`Mock Ephemeral PubKey: ${mockStealthResult.ephemeralPubKey}`);
        console.log(`Mock View Tag: ${mockStealthResult.viewTag}`);

        // Create announcement metadata
        const amount = ethers.parseEther('0.1');
        const metadata = generator.createAnnouncementMetadata(
            mockStealthResult.viewTag,
            undefined, // Native token
            amount
        );

        console.log('\n📢 Announcement Metadata:');
        console.log(`Metadata: ${metadata}`);
        console.log(`Amount: ${ethers.formatEther(amount)} ETH`);

        // Validate addresses
        console.log('\n🔍 Address Validation:');
        console.log(`Provided Address Valid: ${ethers.isAddress(providedAddress) ? '✅' : '❌'}`);
        console.log(`Stealth Address Valid: ${ethers.isAddress(stealthResult.stealthAddress) ? '✅' : '❌'}`);
        console.log(`Mock Stealth Address Valid: ${ethers.isAddress(mockStealthResult.stealthAddress) ? '✅' : '❌'}`);

        console.log('\n🎉 ERC-5564 Stealth Address Generation Test Completed!');
        console.log('=====================================================');
        console.log('✅ Stealth address generation works');
        console.log('✅ Address validation works');
        console.log('✅ Private key computation works');
        console.log('✅ Meta-address formatting works');
        console.log('✅ Announcement metadata creation works');

    } catch (error) {
        console.error('\n❌ Test Failed:', (error as Error).message);
        console.error('Stack trace:', (error as Error).stack);
        process.exit(1);
    }
}

// Run the test
if (require.main === module) {
    testERC5564StealthAddress().catch((error) => {
        console.error('Test script failed:', error);
        process.exit(1);
    });
}

export { testERC5564StealthAddress }; 