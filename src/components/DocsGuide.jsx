import React, { useState } from 'react';
import { 
  BookOpen, 
  Code, 
  GitBranch, 
  ShieldCheck, 
  Cpu, 
  Layers, 
  Copy, 
  CheckCircle2, 
  ExternalLink 
} from 'lucide-react';
import { CONTRACT_ADDRESS } from '../contracts/contractABI';

export default function DocsGuide() {
  const [activeSection, setActiveSection] = useState('arch');
  const [copiedCode, setCopiedCode] = useState(false);

  const solidityCode = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract CertificateRegistry {
    address public owner;
    mapping(address => bool) public authorizedIssuers;
    mapping(address => string) public issuerNames;

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

    mapping(string => Certificate) private certificates;
    mapping(bytes32 => string) private hashToCertId;

    event CertificateIssued(string indexed id, bytes32 indexed certHash, string recipientName, address indexed issuer, uint256 timestamp);
    event CertificateRevoked(string indexed id, string reason, address indexed revokedBy, uint256 timestamp);

    function issueCertificate(
        string calldata _id,
        bytes32 _certHash,
        string calldata _recipientName,
        string calldata _studentId,
        string calldata _courseName,
        string calldata _grade,
        uint256 _issueDate,
        string calldata _ipfsHash
    ) external {
        require(authorizedIssuers[msg.sender] || msg.sender == owner, "Unauthorized issuer");
        require(certificates[_id].certHash == bytes32(0), "Certificate ID already exists");
        
        certificates[_id] = Certificate({
            id: _id,
            certHash: _certHash,
            recipientName: _recipientName,
            studentId: _studentId,
            courseName: _courseName,
            grade: _grade,
            issueDate: _issueDate,
            issuerAddress: msg.sender,
            issuerName: issuerNames[msg.sender],
            isRevoked: false,
            revocationReason: "",
            ipfsHash: _ipfsHash,
            blockNumber: block.number
        });
        hashToCertId[_certHash] = _id;
        emit CertificateIssued(_id, _certHash, _recipientName, msg.sender, block.timestamp);
    }

    function verifyCertificate(string calldata _id) external view returns (Certificate memory) {
        require(certificates[_id].certHash != bytes32(0), "Certificate not found");
        return certificates[_id];
    }
}`;

  const copySolidity = () => {
    navigator.clipboard.writeText(solidityCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-xs font-semibold">
          <BookOpen className="w-4 h-4 text-purple-600" />
          Technical Architecture & Project Presentation Guide
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
          System Design & Defense Notes
        </h1>
        <p className="text-slate-600 text-sm max-w-2xl mx-auto">
          Comprehensive project report guide, workflow diagrams, and smart contract source code for exams & evaluations.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex justify-center">
        <div className="inline-flex p-1 bg-slate-100 border border-slate-200 rounded-xl">
          <button
            onClick={() => setActiveSection('arch')}
            className={`px-5 py-2 rounded-lg text-xs font-bold transition ${
              activeSection === 'arch' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            System Architecture
          </button>
          <button
            onClick={() => setActiveSection('smartcontract')}
            className={`px-5 py-2 rounded-lg text-xs font-bold transition ${
              activeSection === 'smartcontract' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Solidity Smart Contract
          </button>
          <button
            onClick={() => setActiveSection('viva')}
            className={`px-5 py-2 rounded-lg text-xs font-bold transition ${
              activeSection === 'viva' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Viva & Presentation Q&A
          </button>
        </div>
      </div>

      {/* Section 1: Architecture */}
      {activeSection === 'arch' && (
        <div className="space-y-6">
          <div className="p-6 sm:p-8 bg-white border border-slate-200 rounded-3xl space-y-6 shadow-xl shadow-slate-200/50">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-600" /> End-to-End Workflow Pipeline
            </h3>

            {/* Step-by-Step Flow */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center">
                  1
                </span>
                <h4 className="font-bold text-slate-900 text-sm">Data Issuance & Hashing</h4>
                <p className="text-slate-600 leading-relaxed">
                  Authorized University submits student credentials. The payload is deterministically hashed using SHA-256 to generate a unique 64-char fingerprint.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center">
                  2
                </span>
                <h4 className="font-bold text-slate-900 text-sm">Smart Contract Minting</h4>
                <p className="text-slate-600 leading-relaxed">
                  The hash and certificate metadata are committed to the <code>CertificateRegistry.sol</code> smart contract. A new block is mined and distributed across nodes.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 font-bold flex items-center justify-center">
                  3
                </span>
                <h4 className="font-bold text-slate-900 text-sm">Dynamic QR Embedding</h4>
                <p className="text-slate-600 leading-relaxed">
                  The student receives a high-definition certificate with an embedded dynamic QR code encoding direct verification link and on-chain transaction hash.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <span className="w-6 h-6 rounded-full bg-cyan-100 text-cyan-800 font-bold flex items-center justify-center">
                  4
                </span>
                <h4 className="font-bold text-slate-900 text-sm">Zero-Trust Verification</h4>
                <p className="text-slate-600 leading-relaxed">
                  Employers scan the QR code or enter the ID. The portal queries the blockchain in O(1) time and confirms 100% authenticity without contacting the college.
                </p>
              </div>
            </div>

            {/* Architecture Comparison Table */}
            <div className="pt-4 border-t border-slate-100">
              <h4 className="text-sm font-bold text-slate-900 mb-3">Traditional Systems vs. Blockchain-Based Solution</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-slate-200 rounded-2xl overflow-hidden">
                  <thead className="bg-slate-50 text-slate-700 font-mono-code font-bold">
                    <tr>
                      <th className="p-3">Feature Parameter</th>
                      <th className="p-3 text-red-700">Traditional Paper / Database</th>
                      <th className="p-3 text-emerald-700">Our Blockchain Verification System</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    <tr>
                      <td className="p-3 font-semibold text-slate-900">Forgery Resistance</td>
                      <td className="p-3 text-red-600">Easily forged via Photoshop or fake seals</td>
                      <td className="p-3 text-emerald-700 font-bold">Mathematically impossible to forge (SHA-256)</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-slate-900">Verification Speed</td>
                      <td className="p-3 text-red-600">Weeks (emailing registrar, phone calls)</td>
                      <td className="p-3 text-emerald-700 font-bold">Instant (&lt; 1 second QR scan)</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-slate-900">Single Point of Failure</td>
                      <td className="p-3 text-red-600">High (Central database can be wiped or hacked)</td>
                      <td className="p-3 text-emerald-700 font-bold">Zero (Decentralized, immutable nodes)</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-slate-900">Revocation Transparency</td>
                      <td className="p-3 text-red-600">Hard to broadcast revoked degrees</td>
                      <td className="p-3 text-emerald-700 font-bold">Immediate global visibility via smart contract</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Section 2: Smart Contract */}
      {activeSection === 'smartcontract' && (
        <div className="p-6 sm:p-8 bg-white border border-slate-200 rounded-3xl space-y-4 shadow-xl shadow-slate-200/50">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Code className="w-5 h-5 text-indigo-600" />
                Solidity Source Code (CertificateRegistry.sol)
              </h3>
              <p className="text-xs text-slate-500">Target: Solidity ^0.8.20 • Ethereum / Polygon / BSC</p>
            </div>
            <button
              onClick={copySolidity}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition border border-slate-200"
            >
              <Copy className="w-3.5 h-3.5" />
              {copiedCode ? 'Copied Code!' : 'Copy Solidity'}
            </button>
          </div>

          <pre className="p-4 bg-slate-900 rounded-2xl text-[11px] font-mono-code text-cyan-300 overflow-x-auto max-h-[500px] shadow-inner">
            {solidityCode}
          </pre>
        </div>
      )}

      {/* Section 3: Viva & Presentation Q&A */}
      {activeSection === 'viva' && (
        <div className="space-y-4">
          <div className="p-6 bg-white border border-slate-200 rounded-3xl space-y-2 shadow-xs">
            <h4 className="text-sm font-bold text-indigo-700">Q1: Why do we store the hash instead of the whole certificate PDF on the blockchain?</h4>
            <p className="text-xs text-slate-700 leading-relaxed">
              <b>Answer:</b> Blockchain storage is extremely expensive in terms of gas fees. Storing a 500KB PDF directly on-chain would cost hundreds of dollars in gas. By computing the <b>SHA-256 cryptographic hash (32 bytes)</b>, we achieve identical mathematical security at a fraction of the gas cost, while large metadata can optionally live on IPFS.
            </p>
          </div>

          <div className="p-6 bg-white border border-slate-200 rounded-3xl space-y-2 shadow-xs">
            <h4 className="text-sm font-bold text-indigo-700">Q2: What is the Avalanche Effect in hashing?</h4>
            <p className="text-xs text-slate-700 leading-relaxed">
              <b>Answer:</b> The Avalanche Effect is a fundamental property of cryptographic hash functions (like SHA-256). If an input is changed by just a single bit (e.g. changing "Aarav" to "Aarov" or "9.0" to "9.1"), the resulting hash changes drastically and unpredictably. This makes it impossible for fraudsters to tweak values without invalidating the hash.
            </p>
          </div>

          <div className="p-6 bg-white border border-slate-200 rounded-3xl space-y-2 shadow-xs">
            <h4 className="text-sm font-bold text-indigo-700">Q3: How does the system handle certificate revocation?</h4>
            <p className="text-xs text-slate-700 leading-relaxed">
              <b>Answer:</b> The smart contract maintains a <code>isRevoked</code> boolean flag and <code>revocationReason</code> for each certificate ID. Only the authorized issuing institute or the owner can invoke <code>revokeCertificate()</code>. If someone presents a revoked certificate, the verification portal immediately highlights it in red with the official audit reason.
            </p>
          </div>

          <div className="p-6 bg-white border border-slate-200 rounded-3xl space-y-2 shadow-xs">
            <h4 className="text-sm font-bold text-indigo-700">Q4: How does an employer verify the certificate without installing MetaMask?</h4>
            <p className="text-xs text-slate-700 leading-relaxed">
              <b>Answer:</b> The verification portal is completely zero-friction for public employers. Anyone can simply scan the QR code printed on the physical or digital certificate with their phone camera, which directs them to the verification URL and queries the blockchain read-only RPC nodes without needing MetaMask or gas.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
