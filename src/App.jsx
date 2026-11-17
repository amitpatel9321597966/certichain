import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import VerifyCertificate from './components/VerifyCertificate';
import IssueCertificate from './components/IssueCertificate';
import CertificateList from './components/CertificateList';
import { blockchainService } from './services/blockchain';

export default function App() {
  const [activeTab, setActiveTab] = useState('verify'); // 'verify' | 'issue' | 'list'
  const [targetVerifyId, setTargetVerifyId] = useState('');
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    blockchainService.init().then(() => setInitialized(true));

    // Handle URL parameter ?id=CERT-2026-001 (e.g. from QR code scan)
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id') || params.get('verifyId');
    if (id) {
      setTargetVerifyId(id);
      setActiveTab('verify');
    }
  }, []);

  const handleSelectVerify = (id) => {
    setTargetVerifyId(id);
    setActiveTab('verify');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!initialized) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-slate-800">
        <div className="w-8 h-8 border-3 border-blue-200 border-t-blue-700 rounded-full animate-spin mb-3" />
        <p className="text-xs text-slate-500 font-medium">Connecting to Blockchain Ledger...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col">
      {/* Simple Clean Header */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8">
        {activeTab === 'verify' && (
          <VerifyCertificate 
            initialId={targetVerifyId} 
            onNavigateToIssue={() => setActiveTab('issue')}
          />
        )}

        {activeTab === 'issue' && (
          <IssueCertificate 
            onCertificateIssued={() => {}} 
          />
        )}

        {activeTab === 'list' && (
          <CertificateList onSelectVerify={handleSelectVerify} />
        )}
      </main>

      {/* Clean University Project Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="font-medium text-slate-700">
            Blockchain-Based Certificate Verification System
          </p>
          <p className="text-slate-400 text-[11px]">
            SHA-256 Cryptographic Hashing • Decentralized Immutable Ledger
          </p>
        </div>
      </footer>
    </div>
  );
}
