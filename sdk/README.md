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
- **Request Payment**: Build shareable payment links and QR (receiver-initiated flow)
- **Claim**: Claim POL from a stealth address to your wallet (with signer)
- **Private Memo**: Save/retrieve sent memos; encrypt/decrypt with `encryptMetadata` / `decryptMetadata`
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

### Request Payment (receiver-initiated)

- `buildPaymentRequest({ stealthAddress, amount?, baseUrl, payPath? })`: Returns `{ stealthAddress, paymentLink, qrDataUrl }` for sharing.
- `buildPaymentLink(stealthAddress, amount?, baseUrl, payPath?)`: Build only the pay page URL.
- `parsePaymentRequestUrl(searchOrUrl)`: Parse `to` and `amount` from a /pay URL or query string.
- **POLStealthSDK**: `sdk.buildPaymentRequest(options)`, `sdk.parsePaymentRequestUrl(searchOrUrl)`.

### Claim

- `claimFromStealthAddress(signer, stealthAddress)`: Run claim flow (signer must have `signMessage`). Returns `{ success, canClaim, error? }`.
- **POLStealthSDK**: `sdk.claimFromStealthAddress(signer, stealthAddress)`.

### Private Memo

- `saveSentMemo(entry, storageKey?, storage?)`: Save a sent memo (txHash, to, amount, memo).
- `getSentMemos(storageKey?, storage?, limit?)`: Get all sent memos (optional limit for newest N).
- `getSentMemoByTxHash(txHash, storageKey?, storage?)`: Get memo for one tx.
- `clearSentMemos(storageKey?, storage?)`: Clear stored memos.
- `encryptMetadata(message, recipientViewingPublicKey)` / `decryptMetadata(encrypted, recipientViewingPrivateKey)`: ECIES encrypt/decrypt (from app utils).
- **POLStealthSDK**: `sdk.saveSentMemo(entry)`, `sdk.getSentMemos(limit?)`, `sdk.getSentMemoByTxHash(txHash)`, `sdk.clearSentMemos()`.

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

