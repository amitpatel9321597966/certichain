import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import VerifyCertificate from './components/VerifyCertificate';
import IssueCertificate from './components/IssueCertificate';
import CertificateList from './components/CertificateList';
import { blockchainService } from './services/blockchain';

export default function App() {
  const [activeTab, setActiveTab] = useState('verify');
  const [targetVerifyId, setTargetVerifyId] = useState('');
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    blockchainService.init().then(() => setInitialized(true));

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
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Responsive Navbar */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-3 sm:px-6 py-4 sm:py-8">
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

      {/* Responsive Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 sm:py-6 text-center text-xs text-slate-500">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-1.5 sm:gap-2">
          <p className="font-medium text-slate-700 text-xs">
            CertiChain — Blockchain Certificate Verification System
          </p>
          <p className="text-slate-400 text-[10px] sm:text-[11px]">
            SHA-256 Cryptographic Hashing • Decentralized Immutable Ledger
          </p>
        </div>
      </footer>
    </div>
  );
}
