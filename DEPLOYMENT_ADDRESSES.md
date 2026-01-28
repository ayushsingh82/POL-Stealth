# Deployment addresses

This project uses and targets the following contract addresses. Using real deployments (not “scan all contracts”) is required for production.

---

## 1. POL-Stealth app contracts

| Contract      | Network         | Chain ID | Address     | Explorer |
|--------------|------------------|----------|-------------|----------|
| TokenTransfer| Polygon Testnet | 845320009| `0xf12F7584143D17169905D7954D3DEab8942a310d` | [View](https://Polygon-explorer-testnet.appchain.base.org/address/0xf12F7584143D17169905D7954D3DEab8942a310d) |

- **Config:** `src/config/contract.ts`  
- **Deploy:** `contract/scripts/deployTransfer.ts`  
- **Docs:** `contract/DEPLOYMENT.md`

---

## 2. ERC-5564 / ERC-6538 (stealth standard)

Stealth announcement and registry contracts from [stealthaddress.dev](https://stealthaddress.dev/contracts/deployments).  
The **StealthPaymentScanner** uses the **ERC-5564 Announcer** so scanning is tied to a real deployment, not “all contracts”.

| Contract           | Address     | Networks (examples) |
|-------------------|-------------|----------------------|
| **ERC-5564 Announcer** | `0x55649E01B5Df198D18D95b5cc5051630cfD45564` | Ethereum, Polygon, Arbitrum, Base, Gnosis, Optimism, Scroll, Sepolia, Holesky, Arbitrum Sepolia, Base Sepolia, Optimism Sepolia |
| **ERC-6538 Registry**  | `0x6538E6bf4B0eBd30A8Ea093027Ac2422ce5d6538` | Same as above |

- **Config:** `src/config/stealthContracts.ts`  
- **Usage:** `StealthPaymentScanner` calls `getERC5564AnnouncerAddress(chainId)` and uses that address in `getLogs()` when the chain is supported.

### Polygon

| Contract           | Address     | Explorer |
|-------------------|-------------|----------|
| ERC-5564 Announcer| `0x55649E01B5Df198D18D95b5cc5051630cfD45564` | [PolygonScan](https://polygonscan.com/address/0x55649E01B5Df198D18D95b5cc5051630cfD45564) |
| ERC-6538 Registry | `0x6538E6bf4B0eBd30A8Ea093027Ac2422ce5d6538` | [PolygonScan](https://polygonscan.com/address/0x6538E6bf4B0eBd30A8Ea093027Ac2422ce5d6538) |

### Polygon Amoy (testnet, 80002)

- Announcer/Registry on Amoy are **not** listed on stealthaddress.dev.  
- The codebase includes chain ID **80002** in `ERC5564_ANNOUNCER_CHAINS` so the **same** announcer address is used when configured for Amoy.  
- If that contract is not deployed on Amoy, the scanner can be run with a chain that has a known deployment (e.g. Sepolia or Polygon mainnet), or you can deploy/announce an announcer on Amoy and point the config there.

---

## 3. Summary

- **TokenTransfer:** deployed at `0xf12F7584143D17169905D7954D3DEab8942a310d` on Polygon testnet (chain 845320009).  
- **ERC-5564 Announcer:** `0x55649E01B5Df198D18D95b5cc5051630cfD45564` — used by `StealthPaymentScanner` on supported chains.  
- **ERC-6538 Registry:** `0x6538E6bf4B0eBd30A8Ea093027Ac2422ce5d6538` — available for stealth meta-address lookup where supported.

All of the above are real, on-chain deployments; scanning is no longer “zero contract addresses.”
