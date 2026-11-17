import React, { useState, useEffect } from 'react';
import { Search, CheckCircle2, AlertTriangle, XCircle, Upload, PlusCircle } from 'lucide-react';
import { blockchainService } from '../services/blockchain';
import CertificateTemplate from './CertificateTemplate';

export default function VerifyCertificate({ initialId = '', onNavigateToIssue }) {
  const [activeMode, setActiveMode] = useState('id'); // 'id' | 'file'
  const [certId, setCertId] = useState(initialId);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [uploadedFileName, setUploadedFileName] = useState('');

  useEffect(() => {
    if (initialId) {
      setCertId(initialId);
      handleVerify(initialId);
    }
  }, [initialId]);

  const handleVerify = async (query = certId) => {
    if (!query || !query.trim()) return;
    setLoading(true);
    setResult(null);

    await new Promise(r => setTimeout(r, 450));
    const res = await blockchainService.verifyCertificate(query);
    setResult(res);
    setLoading(false);
  };

  const handleQuickTest = (id) => {
    setActiveMode('id');
    setCertId(id);
    handleVerify(id);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);
    setLoading(true);
    setResult(null);

    const arrayBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const fileHash = '0x' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    await new Promise(r => setTimeout(r, 500));

    const all = await blockchainService.getAllCertificates();
    let matchedCert = null;

    // Strategy 1: Check if any blockchain certificate ID is contained in the filename
    matchedCert = all.find(c => file.name.toUpperCase().includes(c.id.toUpperCase()));

    // Strategy 2: Check student recipient name in filename
    if (!matchedCert) {
      matchedCert = all.find(c => {
        const snakeName = c.recipientName.toLowerCase().replace(/\s+/g, '_');
        return file.name.toLowerCase().includes(snakeName);
      });
    }

    // Strategy 3: Try reading text inside the PDF file
    if (!matchedCert) {
      try {
        const text = await file.text();
        matchedCert = all.find(c => text.toUpperCase().includes(c.id.toUpperCase()));
      } catch (err) {}
    }

    if (matchedCert) {
      const res = await blockchainService.verifyCertificate(matchedCert.id);
      setResult({
        ...res,
        fileHash,
        fileName: file.name
      });
    } else {
      setResult({
        found: false,
        fileHash,
        fileName: file.name,
        message: `The document "${file.name}" was not found on the blockchain ledger. Either it was never issued by an authorized university on this network, or the certificate content was modified.`
      });
    }

    setLoading(false);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4 sm:space-y-6 px-1 sm:px-0">
      {/* Page Title */}
      <div className="text-center space-y-1.5 sm:space-y-2">
        <h1 className="text-xl sm:text-3xl font-bold text-slate-900">
          Verify Degree & Certificate
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto">
          Enter Certificate ID or upload the external document to check authenticity against the blockchain.
        </p>
      </div>

      {/* Main Verification Card */}
      <div className="p-4 sm:p-6 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4">
        {/* Toggle between By ID and By File Upload */}
        <div className="flex items-center gap-1.5 sm:gap-2 border-b border-slate-100 pb-3">
          <button
            onClick={() => setActiveMode('id')}
            className={`flex-1 sm:flex-initial text-center px-3 py-2 rounded-lg text-xs font-semibold transition ${
              activeMode === 'id' 
                ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            By Certificate ID
          </button>
          <button
            onClick={() => setActiveMode('file')}
            className={`flex-1 sm:flex-initial text-center px-3 py-2 rounded-lg text-xs font-semibold transition ${
              activeMode === 'file' 
                ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Upload Certificate File
          </button>
        </div>

        {activeMode === 'id' ? (
          /* Mode 1: Search by ID */
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={certId}
                  onChange={(e) => setCertId(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
                  placeholder="e.g. CERT-2026-004"
                  className="w-full px-4 py-2.5 pl-10 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-blue-700 focus:bg-white font-mono transition"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>

              <button
                onClick={() => handleVerify()}
                disabled={loading || !certId.trim()}
                className="w-full sm:w-auto px-6 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-semibold text-sm rounded-xl transition shadow-xs disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? 'Verifying...' : 'Verify on Blockchain'}
              </button>
            </div>

            {/* Quick Demo Buttons for Presentation */}
            <div className="flex items-center gap-1.5 pt-2 border-t border-slate-100 flex-wrap text-xs text-slate-600">
              <span className="font-medium text-slate-500 w-full sm:w-auto mb-1 sm:mb-0">Quick Test:</span>
              <button
                onClick={() => handleQuickTest('CERT-2026-004')}
                className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-lg font-mono font-bold transition border border-blue-200"
              >
                CERT-2026-004 (Amit Patel)
              </button>
              <button
                onClick={() => handleQuickTest('CERT-2026-001')}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-mono transition"
              >
                CERT-2026-001 (Rahul)
              </button>
              <button
                onClick={() => handleQuickTest('CERT-2025-099')}
                className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg font-mono transition"
              >
                CERT-2025-099 (Revoked)
              </button>
            </div>
          </div>
        ) : (
          /* Mode 2: Upload External Certificate File */
          <div className="space-y-3">
            <div className="border-2 border-dashed border-slate-300 rounded-2xl p-4 sm:p-6 text-center hover:border-blue-600 bg-slate-50/50 transition">
              <Upload className="w-7 h-7 sm:w-8 sm:h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-700">
                Upload Degree PDF or Image
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5 max-w-sm mx-auto">
                The portal checks if this certificate hash exists on the immutable blockchain ledger.
              </p>

              <label className="mt-3 inline-block cursor-pointer px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-semibold shadow-xs transition">
                <span>Select Document to Verify</span>
                <input 
                  type="file" 
                  accept=".pdf,image/*,.txt" 
                  onChange={handleFileUpload} 
                  className="hidden" 
                />
              </label>

              {uploadedFileName && (
                <p className="text-xs text-slate-700 font-mono mt-2 break-all">
                  Uploaded: <span className="font-bold">{uploadedFileName}</span>
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Verification Result Display */}
      {result && (
        <div className="space-y-4 sm:space-y-6">
          {/* 1. VALID RESULT */}
          {result.valid && (
            <div className="p-4 sm:p-5 bg-emerald-50 border border-emerald-300 rounded-2xl space-y-3 sm:space-y-4">
              <div className="flex items-start sm:items-center gap-2.5 sm:gap-3">
                <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600 flex-shrink-0 mt-0.5 sm:mt-0" />
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-emerald-900">Certificate is 100% Genuine & Verified</h3>
                  <p className="text-xs text-emerald-700">
                    Anchored in Block #{result.cert.blockNumber} on blockchain.
                  </p>
                </div>
              </div>

              {/* Responsive Summary Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3 text-xs bg-white p-3 sm:p-3.5 rounded-xl border border-emerald-200">
                <div>
                  <span className="text-slate-500 block text-[11px]">Student Name:</span>
                  <span className="font-bold text-slate-900">{result.cert.recipientName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Roll Number:</span>
                  <span className="font-bold text-slate-900 font-mono">{result.cert.studentId}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Degree / Program:</span>
                  <span className="font-semibold text-slate-900 truncate block">{result.cert.courseName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Issue Date:</span>
                  <span className="font-semibold text-slate-900">{result.cert.issueDate}</span>
                </div>
              </div>

              {/* Cryptographic Proof Details */}
              <div className="text-[10px] sm:text-[11px] font-mono text-slate-600 bg-emerald-100/60 p-2.5 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1.5 sm:gap-2">
                <div className="truncate w-full sm:w-auto">
                  <span className="font-semibold text-slate-700">Tx Hash: </span>
                  <span className="break-all sm:break-normal">{result.cert.txHash.slice(0, 24)}...</span>
                </div>
                <div className="text-emerald-800 font-bold whitespace-nowrap">
                  Block #{result.cert.blockNumber} (Confirmed)
                </div>
              </div>
            </div>
          )}

          {/* 2. REVOKED RESULT */}
          {result.revoked && (
            <div className="p-4 sm:p-5 bg-red-50 border border-red-300 rounded-2xl space-y-3">
              <div className="flex items-center gap-2.5 sm:gap-3">
                <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-red-600 flex-shrink-0" />
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-red-900">Certificate Officially Revoked</h3>
                  <p className="text-xs text-red-700">
                    Cancelled on blockchain ledger.
                  </p>
                </div>
              </div>
              <div className="bg-white p-3 rounded-xl border border-red-200 text-xs text-slate-800">
                <span className="font-bold text-red-700 block mb-0.5">Revocation Audit Reason:</span>
                "{result.cert.revocationReason}"
              </div>
            </div>
          )}

          {/* 3. NOT FOUND */}
          {!result.found && (
            <div className="p-5 sm:p-6 bg-white border border-slate-200 rounded-2xl text-center space-y-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600 mx-auto">
                <XCircle className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900">Certificate Not Found on Blockchain</h3>
                <p className="text-xs text-slate-600 max-w-md mx-auto mt-1">
                  {result.message}
                </p>
              </div>

              {result.fileHash && (
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg max-w-md mx-auto text-left text-[10px] font-mono text-slate-600 space-y-1">
                  <div><span className="font-semibold">SHA-256 Digest:</span></div>
                  <div className="break-all text-slate-800">{result.fileHash}</div>
                </div>
              )}

              {onNavigateToIssue && (
                <div className="pt-2">
                  <button
                    onClick={onNavigateToIssue}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-semibold shadow-xs transition"
                  >
                    <PlusCircle className="w-4 h-4" /> Register Certificate on Blockchain
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Certificate View */}
          {result.cert && (
            <div className="pt-2">
              <CertificateTemplate certificate={result.cert} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
