# Production rail: sender/receiver tooling & wallet adoption

This document describes how POL-Stealth is built as a **payment rail** with explicit **sender** and **receiver** tooling, and what is needed from wallets (e.g. MetaMask, Rabby) for stealth addresses to work in production.

---

## 1. Sender and receiver tooling (not “isolated R&D”)

We provide both **sender** and **receiver** flows so the system can function as an end-to-end payment rail.

### Sender tooling

- **New Workflow** (`/workflow`): 
  - Step 1: Enter receiver address → **Generate Stealth Address** (one-time address for this payment).
  - Step 2: **Transfer Funds** (amount in POL) to that stealth address.
- **Widget** (`/widget`): 
  - Pay flow: recipient address + amount; optional batch sends to multiple recipients.
  - Generate-and-share stealth address for receiving (+ QR).
- **Launch** (`/launch`): 
  - Stealth Safe / stealth address generation and transfer.

Senders always use a **derived stealth address** for the recipient and send POL (or token) to that address.

### Receiver tooling

- **Scan** (in `/workflow` → Scan): 
  - “Who is sending POL to you” — lists incoming **POL** transfers to the connected wallet (POL-only in this UI).
  - Backed by the same logic as the background scanner (view-tag scanning, ERC-5564 events).
- **Background scanner** (`BackgroundScanner` + `StealthPaymentScanner`): 
  - Batch block scanning, view-tag filtering, view-tag caching.
  - Uses the **deployed ERC-5564 Announcer** when the chain is supported (see `DEPLOYMENT_ADDRESSES.md`).
  - Feeds payment history and optional webhooks.
- **Payment history** (`PaymentHistoryManager`): 
  - Maps stealth addresses → user wallet; status (pending/claimed/failed); filters and export.

So: **senders** get “generate stealth address → send”; **receivers** get “scan → see who sent POL → history.” That is the minimal sender/receiver tooling for a production-style rail.

---

## 2. Wallet ecosystem adoption (MetaMask, Rabby, etc.)

Stealth address **privacy** and **usability** depend on wallets implementing **ephemeral key derivation** and key handling for ERC-5564.

### What wallets must do

- **Spending / viewing keys**:  
  Derive and store viewing and spending keys (e.g. from BIP-32/BIP-44 or wallet-specific scheme) and expose them in a standard way (e.g. via an ERC-5564 / EIP-7712-style API or secure enclave).
- **Ephemeral key derivation**:  
  When the user “receives” via a stealth address, the wallet must derive the **ephemeral private key** for that one-time address from the viewing key (and announcement data).  
  Without this, users cannot sign from the stealth address to claim or move funds.
- **Announcement / view-tag handling**:  
  Wallets (or dapps with wallet integration) should be able to:
  - Subscribe to or fetch ERC-5564 announcements (from the announcer contract).
  - Filter by view tag.
  - Map announcements to “incoming payment to one of my stealth addresses.”
  - Trigger UI (“You received 0.5 POL”) and optionally auto-suggest “Claim” or “Sweep.”

Today, **MetaMask and Rabby do not yet support ephemeral key derivation or ERC-5564-aware UX**. So in practice:

- **Sending** to a stealth address works with any wallet (it’s just sending to an address).
- **Receiving and claiming** is either:
  - Done via our **Scan + in-app flows** (and keys managed inside the app or via external key provider), or
  - Implemented by wallets once they add ERC-5564 + ephemeral key derivation.

We treat “wallet support for ephemeral key derivation” as the **main missing piece** for full production adoption, not a flaw of this codebase.

---

## 3. What this repo demonstrates

- **Privacy engineering**:  
  ERC-5564 stealth addresses, view-tag scanning, ECIES encrypted memos, batch block scanning, view-tag caching.
- **Technical implementation**:  
  ~6.7K Solidity LOC (see `contract/`), scanner and key-derivation logic, deployment scripts and configs.
- **Deployment and addresses**:  
  TokenTransfer + use of the **deployed** ERC-5564 Announcer (and optional ERC-6538 Registry) — see `DEPLOYMENT_ADDRESSES.md`. No “zero contract addresses” in production config.
- **Sender/receiver rail**:  
  Explicit sender flows (New Workflow, Widget, Launch) and receiver flows (Scan, background scanner, payment history).

With **wallet adoption** (MetaMask, Rabby, etc.) for ephemeral key derivation and ERC-5564, this rail can function as a **production** stealth payment system; without it, it remains a **production-capable rail** used via our own sender/receiver tooling and key management.
