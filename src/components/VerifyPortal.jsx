import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  ShieldCheck, 
  Search, 
  FileCheck, 
  AlertTriangle, 
  XCircle, 
  CheckCircle2, 
  Copy, 
  ExternalLink, 
  Sparkles, 
  Upload, 
  FileText,
  Clock,
  Building,
  KeyRound,
  Hash
} from 'lucide-react';
import { blockchainService } from '../services/blockchain';
import CertificateView from './CertificateView';
import { truncateHash } from '../utils/crypto';

export default function VerifyPortal({ initialCertId = '', onNavigateToIssue }) {
  const [searchQuery, setSearchQuery] = useState(initialCertId);
  const [searchType, setSearchType] = useState('id'); // 'id' | 'hash'
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [copiedTx, setCopiedTx] = useState(false);

  useEffect(() => {
    if (initialCertId) {
      setSearchQuery(initialCertId);
      handleVerify(initialCertId, 'id');
    }
  }, [initialCertId]);

  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6']
    });
  };

  const handleVerify = async (query = searchQuery, type = searchType) => {
    if (!query || !query.trim()) return;
    setLoading(true);
    setResult(null);

    await new Promise(r => setTimeout(r, 600));

    let res;
    if (type === 'id') {
      res = await blockchainService.verifyById(query);
    } else {
      res = await blockchainService.verifyByHash(query);
    }

    setResult(res);
    setLoading(false);

    if (res.success && res.isAuthentic) {
      triggerConfetti();
    }
  };

  const handleSampleClick = (id) => {
    setSearchQuery(id);
    setSearchType('id');
    handleVerify(id, 'id');
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedTx(true);
    setTimeout(() => setCopiedTx(false), 2000);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const match = file.name.match(/CERT-\d{4}-[A-Z0-9]+-\d+/i);
    if (match) {
      setSearchQuery(match[0].toUpperCase());
      setSearchType('id');
      handleVerify(match[0].toUpperCase(), 'id');
    } else {
      setSearchQuery('CERT-2026-CS-8921');
      setSearchType('id');
      handleVerify('CERT-2026-CS-8921', 'id');
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 animate-fadeIn">
      {/* Hero Search Section */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold">
          <ShieldCheck className="w-4 h-4 text-indigo-600" />
          Decentralized Trust Protocol • 100% Tamper Proof
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
          Verify Academic & Professional Credentials
        </h1>
        <p className="text-slate-600 text-sm max-w-2xl mx-auto">
          Instantly validate any degree, diploma, or certificate against an immutable decentralized blockchain ledger.
        </p>
      </div>

      {/* Verification Card & Input */}
      <div className="p-6 sm:p-8 bg-white border border-slate-200 rounded-3xl shadow-xl shadow-slate-200/60">
        {/* Verification Type Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-100 pb-4 mb-6">
          <button
            onClick={() => setSearchType('id')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
              searchType === 'id'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Search className="w-3.5 h-3.5" /> By Certificate ID
          </button>
          <button
            onClick={() => setSearchType('hash')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
              searchType === 'hash'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Hash className="w-3.5 h-3.5" /> By SHA-256 Hash
          </button>
        </div>

        {/* Input Form */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
              placeholder={searchType === 'id' ? 'Enter Certificate ID (e.g., CERT-2026-CS-8921)' : 'Enter 64-char Hex Hash (e.g., 0x9b41c6...)'}
              className="w-full px-4 py-3.5 pl-11 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white font-mono-code transition"
            />
            <div className="absolute left-3.5 top-3.5 text-slate-400">
              {searchType === 'id' ? <Search className="w-4 h-4" /> : <Hash className="w-4 h-4" />}
            </div>
          </div>

          <button
            onClick={() => handleVerify()}
            disabled={loading || !searchQuery.trim()}
            className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl transition shadow-lg shadow-indigo-100 disabled:opacity-50 flex items-center justify-center gap-2 whitespace-nowrap"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Querying Blockchain...
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" /> Verify Now
              </>
            )}
          </button>
        </div>

        {/* Drag & Drop File Upload Alternative */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="text-slate-500">Or upload certificate document:</span>
            <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium border border-slate-200 transition">
              <Upload className="w-3.5 h-3.5 text-indigo-600" /> Choose PDF / Image
              <input type="file" accept=".pdf,image/*" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>

          {/* Quick Click Demo Chips */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-slate-500 font-medium">Quick test:</span>
            <button
              onClick={() => handleSampleClick('CERT-2026-CS-8921')}
              className="px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-300 text-emerald-800 hover:bg-emerald-100 font-mono-code text-[11px] font-semibold transition"
            >
              ✓ Valid (IIT Delhi)
            </button>
            <button
              onClick={() => handleSampleClick('CERT-2026-AI-4402')}
              className="px-2.5 py-1 rounded-md bg-cyan-50 border border-cyan-300 text-cyan-800 hover:bg-cyan-100 font-mono-code text-[11px] font-semibold transition"
            >
              ✓ Valid (Stanford)
            </button>
            <button
              onClick={() => handleSampleClick('CERT-2025-EE-9012')}
              className="px-2.5 py-1 rounded-md bg-red-50 border border-red-300 text-red-800 hover:bg-red-100 font-mono-code text-[11px] font-semibold transition"
            >
              ✗ Revoked Sample
            </button>
            <button
              onClick={() => handleSampleClick('CERT-FAKE-9999')}
              className="px-2.5 py-1 rounded-md bg-amber-50 border border-amber-300 text-amber-800 hover:bg-amber-100 font-mono-code text-[11px] font-semibold transition"
            >
              ✗ Unregistered
            </button>
          </div>
        </div>
      </div>

      {/* Verification Result Display */}
      {result && (
        <div className="space-y-6 animate-slideUp">
          {/* CASE 1: 100% AUTHENTIC & VALID */}
          {result.success && result.isAuthentic && (
            <div className="p-6 sm:p-8 bg-emerald-50/90 border border-emerald-300 rounded-3xl shadow-xl shadow-emerald-50 relative overflow-hidden">
              {/* Status Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-emerald-200">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-md">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-extrabold text-slate-900">Authentic Credential Verified</h2>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-xs font-bold uppercase tracking-wider">
                        100% VALID
                      </span>
                    </div>
                    <p className="text-xs text-emerald-900 font-medium mt-0.5">
                      Cryptographic signature confirmed • Permanent state anchored on blockchain
                    </p>
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-[10px] uppercase tracking-wider text-slate-500 font-mono-code block font-semibold">Verified At</span>
                  <span className="text-xs font-mono-code text-slate-700 font-medium">{new Date().toLocaleString()}</span>
                </div>
              </div>

              {/* Proof Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                <div className="p-4 bg-white rounded-2xl border border-emerald-200/80 shadow-xs">
                  <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5 mb-1">
                    <Building className="w-3.5 h-3.5 text-indigo-600" /> Issuing Authority
                  </span>
                  <p className="text-sm font-bold text-slate-900 truncate" title={result.cert.issuerName}>
                    {result.cert.issuerName}
                  </p>
                  <p className="text-[10px] font-mono-code text-indigo-700 font-medium mt-1">
                    Issuer: {truncateHash(result.cert.issuerAddress, 8, 6)}
                  </p>
                </div>

                <div className="p-4 bg-white rounded-2xl border border-emerald-200/80 shadow-xs">
                  <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5 mb-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Block Height
                  </span>
                  <p className="text-sm font-bold text-emerald-700 font-mono-code">
                    Block #{result.cert.blockNumber}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Consensus Confirmed (Polygon / ETH)
                  </p>
                </div>

                <div className="p-4 bg-white rounded-2xl border border-emerald-200/80 shadow-xs">
                  <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5 mb-1">
                    <Clock className="w-3.5 h-3.5 text-amber-600" /> Issued On
                  </span>
                  <p className="text-sm font-bold text-slate-900">
                    {result.cert.issueDate}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Validity: {result.cert.expiryDate || 'Lifetime'}
                  </p>
                </div>

                <div className="p-4 bg-white rounded-2xl border border-emerald-200/80 shadow-xs">
                  <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5 mb-1">
                    <KeyRound className="w-3.5 h-3.5 text-cyan-600" /> Data Integrity
                  </span>
                  <p className="text-sm font-bold text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Untampered
                  </p>
                  <p className="text-[10px] text-slate-500 mt-1">
                    SHA-256 match confirmed
                  </p>
                </div>
              </div>

              {/* Hashes Row */}
              <div className="mt-4 p-3.5 bg-white rounded-xl border border-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-mono-code">
                <div className="flex items-center gap-2 max-w-full truncate">
                  <span className="text-slate-500 font-medium">Tx Hash:</span>
                  <span className="text-indigo-700 font-bold truncate">{result.cert.txHash}</span>
                </div>
                <button
                  onClick={() => copyToClipboard(result.cert.txHash)}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold transition whitespace-nowrap"
                >
                  <Copy className="w-3 h-3" />
                  {copiedTx ? 'Copied Tx!' : 'Copy Tx Hash'}
                </button>
              </div>
            </div>
          )}

          {/* CASE 2: REVOKED */}
          {result.isRevoked && (
            <div className="p-6 sm:p-8 bg-red-50 border border-red-300 rounded-3xl shadow-xl shadow-red-50">
              <div className="flex items-center gap-3 pb-4 border-b border-red-200">
                <div className="w-12 h-12 rounded-2xl bg-red-600 flex items-center justify-center text-white">
                  <AlertTriangle className="w-7 h-7" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-slate-900">Certificate Permanently Revoked</h2>
                    <span className="px-2.5 py-0.5 rounded-full bg-red-600 text-white text-xs font-bold uppercase tracking-wider">
                      REVOKED
                    </span>
                  </div>
                  <p className="text-xs text-red-800 font-medium mt-0.5">
                    This credential was officially invalidated and cancelled on the blockchain ledger.
                  </p>
                </div>
              </div>

              <div className="mt-4 p-4 bg-white rounded-2xl border border-red-200 space-y-2">
                <p className="text-xs font-bold text-red-700 uppercase tracking-wider">Official Revocation Reason:</p>
                <p className="text-sm text-slate-800 font-semibold">"{result.cert.revocationReason || 'No reason specified'}"</p>
                <div className="pt-2 text-xs font-mono-code text-slate-500 flex items-center justify-between">
                  <span>Revoking Authority: {result.cert.issuerName}</span>
                  <span>Certificate ID: {result.cert.id}</span>
                </div>
              </div>
            </div>
          )}

          {/* CASE 3: TAMPERED / HASH MISMATCH */}
          {result.isTampered && (
            <div className="p-6 sm:p-8 bg-amber-50 border border-amber-300 rounded-3xl shadow-xl shadow-amber-50">
              <div className="flex items-center gap-3 pb-4 border-b border-amber-200">
                <div className="w-12 h-12 rounded-2xl bg-amber-500 flex items-center justify-center text-white">
                  <AlertTriangle className="w-7 h-7" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">CRITICAL: Data Tampering Detected!</h2>
                  <p className="text-xs text-amber-900 font-medium mt-0.5">
                    The certificate content has been altered after issuance. The SHA-256 fingerprint does not match the blockchain block!
                  </p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono-code">
                <div className="p-3.5 bg-white rounded-xl border border-slate-200">
                  <span className="text-slate-500 block mb-1 font-semibold">Expected On-Chain Hash:</span>
                  <span className="text-emerald-700 font-bold break-all">{result.storedHash}</span>
                </div>
                <div className="p-3.5 bg-white rounded-xl border border-red-300">
                  <span className="text-red-600 block mb-1 font-semibold">Computed Hash from Altered Document:</span>
                  <span className="text-red-600 font-bold break-all">{result.recomputedHash}</span>
                </div>
              </div>
            </div>
          )}

          {/* CASE 4: NOT FOUND / INVALID ID */}
          {!result.success && !result.isRevoked && !result.isTampered && (
            <div className="p-8 bg-white border border-slate-200 rounded-3xl text-center space-y-4 shadow-xl">
              <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center text-red-600 mx-auto">
                <XCircle className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">No Matching Record on Blockchain</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                  {result.message}
                </p>
              </div>
              {onNavigateToIssue && (
                <button
                  onClick={onNavigateToIssue}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition inline-flex items-center gap-1.5 shadow-md shadow-indigo-100"
                >
                  <FileText className="w-3.5 h-3.5" /> Issue This Certificate Now
                </button>
              )}
            </div>
          )}

          {/* Certificate Visual Preview If Found */}
          {result.cert && (
            <div className="mt-8 pt-6 border-t border-slate-200">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-slate-900">Official Rendered Certificate</h3>
                <p className="text-xs text-slate-500">Document authenticated with permanent smart contract cryptographic seal</p>
              </div>
              <CertificateView certificate={result.cert} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
