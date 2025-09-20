# 🕵️‍♂️ ZEN-Stealth – Private Transactions on Horizen

Experience the next evolution of blockchain privacy on the Horizen Testnet with stealth addresses and cutting-edge zero-knowledge technology.

ZEN-Stealth enables private fund reception on-chain, with unlinkable payment addresses, one-time use keys, and cryptographic guarantees — paving the way for true privacy in decentralized finance.

---

## 🔐 What Are Stealth Addresses?

Stealth addresses are special cryptographic addresses that allow users to receive funds privately.  
They hide the receiver's identity on public block explorers while maintaining compatibility with the blockchain's rules.

### Benefits

- 🚫 **No direct link** between your public wallet and payments you receive
- 🛡️ **Resistant to address clustering** and analysis  
- 📬 **Anonymous fund reception** without sacrificing security

---

## ⚙️ How ZEN-Stealth Works

1. **Generate a Stealth Address** — A unique address is derived from your public key, only usable for one transaction
2. **Sender Encrypts Transaction Data** — Using elliptic curve Diffie-Hellman (ECDH), the sender generates a one-time address for you
3. **Funds Sent Privately** — The payment appears on-chain, but your real wallet address remains hidden
4. **Receiver Scans for Payments** — Using a view tag and ephemeral keys, the receiver can detect and claim incoming funds

> **Note**: Currently, stealth addresses provide privacy only for the receiver. Sender addresses still appear on-chain when sending funds. See Future Scope below for planned improvements.

---

## ✨ Features

- ✅ **Stealth Address Generation** — Instantly create unlinkable addresses
- 🔒 **One-time Use Addresses** — Maximum unlinkability per transaction
- 🏷️ **View Tags** — Efficient fund scanning for receivers
- 🧠 **Ephemeral Keys** — Temporary cryptographic keys for every payment
- 🧮 **SECP256k1 Cryptography** — Proven, secure, and widely adopted standard
- 🧪 **Horizen Testnet Integration** — Full EVM compatibility on chain ID 845320009

---

## 🧪 Network Info

- **Chain**: Horizen Testnet
- **Chain ID**: `845320009`
- **Standard**: ERC-5564 Stealth Addresses
- **Tech Stack**: FluidKey Account Kit + Zero-Knowledge Infrastructure

---

## 🚀 Future Scope

We're just getting started — upcoming milestones will push privacy even further:

- 🔁 **Full Sender & Receiver Privacy**  
  Both sending and receiving addresses will be shielded from public view using zk-SNARKs or ring signatures

- 🪙 **Private Token Standard on Horizen**  
  Launching a privacy-enabled ZEN token that can be transferred without revealing balances or participant addresses

- 💱 **Private DEX Trades**  
  Enable swap transactions where trade details and wallet addresses remain confidential

- 📜 **Encrypted Metadata Support**  
  Allow private transaction notes and memos viewable only by the intended recipient

- 🔗 **Cross-Chain Private Transfers**  
  Integrate with privacy-friendly bridges to move assets across chains without compromising anonymity

---

## 🛠️ Built With

- **FluidKey Account Kit** — ERC-5564 stealth address generation
- **Horizen EVM** — Privacy-friendly smart contract execution  
- **SECP256k1 Cryptography** — Secure elliptic curve encryption
- **Zero-Knowledge Proof Systems** — Future upgrade path for full transactional privacy

---

## 📜 License

This project is licensed under the MIT License — free to use, modify, and distribute.

---

> 💡 **ZEN-Stealth is a stepping stone toward complete transactional privacy on Horizen** — ensuring confidentiality, unlinkability, and censorship resistance in the decentralized era.
