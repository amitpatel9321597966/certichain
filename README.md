# 🎓 CertiChain | Blockchain-Based Certificate Verification System

An enterprise-grade, decentralized academic and professional credential verification dApp built with modern cryptography (SHA-256), Solidity Smart Contracts, and React. 

Designed specifically for university final year projects, academic defense, and hackathons with a focus on an **exquisite user interface** and **royal, print-ready certificate formats**.

---

## 🌟 Key Features

### 1. 🛡️ True Cryptographic Verification & Tamper Resistance
- **SHA-256 Canonical Hashing**: Generates an immutable 64-character hexadecimal cryptographic digest of student data.
- **Avalanche Effect Demonstration**: If even a single byte or character is modified (e.g. changing CGPA or student name), the hash completely changes and the blockchain consensus rejects the document.
- **O(1) Verification Speed**: Instant validation by Certificate ID or cryptographic hash.

### 2. 🎨 3 Premium, Royal Certificate Templates
- **Classic Royal Academic (Default)**: Ornate navy and gold foiled guilloche borders, official institutional seal, watermark crest, dual Dean/Registrar signatures, and dynamic scannable QR code.
- **Cyber Web3 Holographic**: Dark futuristic obsidian background with glowing neon cyan/violet cyber borders and smart contract block metrics.
- **Executive Minimalist Gold**: Clean corporate luxury layout with 24k gold corner flourishes and official gold seal.

### 3. 📱 Dynamic Live QR Code & PDF Export
- Generates a real-time scannable QR code on each certificate that encodes direct verification links.
- **One-Click Export**: High-resolution, print-ready landscape **A4 PDF** (`jsPDF` + `html2canvas`) and native browser print styles.

### 4. 🏛️ Institution / University Admin Portal
- **Single Certificate Minting**: Full form with validation, auto-generated unique ID, customizable degree programs, and real-time SHA-256 preview.
- **Bulk CSV Issuance**: Simulate batch minting of multiple certificates in a single transaction.
- **Certificate Revocation with Audit Reason**: Authorized issuers can permanently revoke certificates on-chain in case of fraud or clerical error.

### 5. ⛓️ Blockchain Block Explorer
- Interactive visual block chain inspection (Genesis Block #0 through latest blocks).
- View Block Height, Block Hash, Previous Hash, Nonce, Timestamp, Validator, and Transaction Payloads.

### 6. 🧪 Interactive Tamper Demonstration Lab ("Examiner Pleaser")
- A dedicated live experimentation lab to demonstrate *why* blockchain is tamper-proof to professors and examiners.
- Modify name/grade in real time and watch the blockchain immediately flag and reject the altered document!

---

## 🚀 Quick Start Guide

### 1. Run the Development Server
```bash
npm run dev
```
The application will launch at `http://localhost:3000`.

### 2. Build for Production
```bash
npm run build
```
Creates an optimized, minified production build in the `dist/` directory.

### 3. Preview Production Build
```bash
npm run preview
```

---

## 🔍 Pre-Loaded Demo Certificates for Presentation

Use these IDs to instantly demonstrate the system to evaluators:

| Certificate ID | Student Name | Institution | Status |
| :--- | :--- | :--- | :--- |
| `CERT-2026-CS-8921` | **Aarav Sharma** | Indian Institute of Technology, Delhi | ✅ **Valid & Authentic** |
| `CERT-2026-AI-4402` | **Priya Patel** | Stanford Center for AI & Decentralized Systems | ✅ **Valid & Authentic** |
| `CERT-2026-CY-1190` | **Rohan Verma** | National Blockchain Council of India | ✅ **Valid & Authentic** |
| `CERT-2025-EE-9012` | **Vikram Singh** | Indian Institute of Technology, Kanpur | ❌ **Revoked (Misconduct)** |

---

## 📜 Smart Contract Architecture

The Solidity smart contract is located at `src/contracts/CertificateRegistry.sol`:

```solidity
contract CertificateRegistry {
    struct Certificate {
        string id;
        bytes32 certHash;
        string recipientName;
        string studentId;
        string courseName;
        string grade;
        uint256 issueDate;
        address issuerAddress;
        string issuerName;
        bool isRevoked;
        string revocationReason;
        string ipfsHash;
        uint256 blockNumber;
    }

    function issueCertificate(...) external onlyAuthorizedIssuer;
    function revokeCertificate(...) external onlyAuthorizedIssuer;
    function verifyCertificate(string calldata _id) external view returns (Certificate memory);
    function verifyByHash(bytes32 _certHash) external view returns (Certificate memory);
}
```

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons, Canvas Confetti
- **Document Export**: jsPDF, html2canvas, QRCode
- **Blockchain / Cryptography**: Web Crypto API (Native SHA-256), Solidity ^0.8.20, Ethers.js ABI
- **State Management**: LocalStorage persistent distributed ledger engine with PoA mining simulation
