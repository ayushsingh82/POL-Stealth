# POL-Stealth SDK

A TypeScript SDK for building private transactions on Polygon using POL-Stealth protocol.

## Installation

```bash
npm install @pol-stealth/sdk
# or
yarn add @pol-stealth/sdk
```

## Quick Start

```typescript
import { POLStealthSDK } from '@pol-stealth/sdk';
import { createWalletClient } from 'viem';
import { polygonAmoy } from 'viem/chains';

// Initialize SDK
const sdk = new POLStealthSDK({
  chainId: 80002 // Polygon Amoy testnet
});

// Set up wallet client
const walletClient = createWalletClient({
  chain: polygonAmoy,
  transport: http()
});

sdk.transactionManager.setWalletClient(walletClient);

// Add team members
const member = sdk.teamManager.addMember({
  address: '0x...',
  role: 'member',
  name: 'Team Member 1'
});

// Send transaction
const result = await sdk.transactionManager.sendTransaction({
  to: '0x...',
  value: parseEther('0.1'),
  account: '0x...'
});

// Batch transactions
const batchResult = await sdk.transactionManager.sendBatchTransactions({
  recipients: ['0x...', '0x...'],
  amountPerRecipient: parseEther('0.1'),
  account: '0x...'
});
```

## Features

- **Team Management**: Add, remove, and manage team members with role-based access
- **Transaction Handling**: Send single or batch transactions
- **Address Utilities**: Format and validate Ethereum addresses
- **Amount Utilities**: Convert between wei and ether, format amounts

## API Reference

### TeamManager

- `addMember(member)`: Add a new team member
- `removeMember(memberId)`: Remove a team member
- `updateMemberRole(memberId, role)`: Update member role
- `getMembers()`: Get all team members
- `getMembersByRole(role)`: Get members by role
- `getAdmins()`: Get all admin members

### TransactionManager

- `setWalletClient(client)`: Set wallet client for transactions
- `sendTransaction(config)`: Send a single transaction
- `sendBatchTransactions(config)`: Send batch transactions
- `calculateBatchTotal(amount, count)`: Calculate total for batch

### Utilities

- `isValidAddress(address)`: Validate address format
- `formatAddress(address)`: Format address for display
- `toWei(amount)`: Convert to wei
- `fromWei(amount)`: Convert from wei
- `getPolygonScanUrl(address)`: Get PolygonScan URL

## Development

```bash
# Build
npm run build

# Watch mode
npm run dev
```

## License

MIT

