# TokenTransfer Contract Deployment Guide

This guide explains how to deploy the TokenTransfer contract to the Horizen testnet.

## Prerequisites

1. **Node.js and npm** installed
2. **Private key** for deployment (with testnet ETH)
3. **Hardhat** configured for Horizen testnet

## Setup

1. **Install dependencies:**
   ```bash
   cd contract
   npm install
   ```

2. **Set your private key:**
   ```bash
   export PRIVATE_KEY="your_private_key_here"
   ```
   
   **⚠️ Security Note:** Never commit your private key to version control!

## Deployment

### Deploy to Horizen Testnet

```bash
npx hardhat run scripts/deployTransfer.ts --network horizenTestnet
```

### Deploy to Local Network (for testing)

```bash
# Start local node
npx hardhat node

# In another terminal, deploy to local network
npx hardhat run scripts/deployTransfer.ts --network localhost
```

## Contract Functions

The TokenTransfer contract provides the following functions:

### `transferToken(address tokenAddress, address recipient, uint256 amount)`
- **Purpose:** Transfer ERC20 tokens from the contract to a recipient
- **Access:** Only contract owner
- **Parameters:**
  - `tokenAddress`: The ERC20 token contract address
  - `recipient`: The address to receive the tokens
  - `amount`: The amount of tokens to transfer

### `withdrawETH()`
- **Purpose:** Withdraw accidentally sent ETH from the contract
- **Access:** Only contract owner

### `owner()`
- **Purpose:** Get the contract owner address
- **Access:** Public view function

## Post-Deployment

1. **Update contract address:**
   After successful deployment, update the contract address in:
   ```
   my-app/src/config/contract.ts
   ```

2. **Verify deployment:**
   Check the contract on the Horizen explorer:
   ```
   https://horizen-explorer-testnet.appchain.base.org/address/[CONTRACT_ADDRESS]
   ```

## Usage Example

```typescript
import { ethers } from 'ethers';
import { contractConfig } from './src/config/contract';

// Connect to contract
const provider = new ethers.JsonRpcProvider('https://horizen-rpc-testnet.appchain.base.org');
const signer = new ethers.Wallet(PRIVATE_KEY, provider);
const contract = new ethers.Contract(contractConfig.address, contractConfig.abi, signer);

// Transfer tokens
const tokenAddress = "0x..."; // ERC20 token address
const recipient = "0x...";    // Recipient address
const amount = ethers.parseUnits("100", 18); // 100 tokens

await contract.transferToken(tokenAddress, recipient, amount);
```

## Network Configuration

The contract is configured for:
- **Network:** Horizen Testnet
- **Chain ID:** 845320009
- **RPC URL:** https://horizen-rpc-testnet.appchain.base.org
- **Explorer:** https://horizen-explorer-testnet.appchain.base.org

## Troubleshooting

### Common Issues

1. **Insufficient gas:**
   - Ensure you have enough ETH for gas fees
   - Check gas price settings in hardhat.config.ts

2. **Private key not set:**
   - Verify PRIVATE_KEY environment variable is set
   - Check hardhat.config.ts for account configuration

3. **Network connection issues:**
   - Verify RPC URL is accessible
   - Check network configuration in hardhat.config.ts

### Getting Testnet ETH

To get testnet ETH for deployment, you may need to:
1. Check Horizen documentation for faucet information
2. Contact the Horizen team for testnet tokens
3. Use the official Horizen testnet faucet if available 