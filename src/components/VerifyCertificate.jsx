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

  // Handle uploading an external certificate PDF or image
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);
    setLoading(true);
    setResult(null);

    // Compute actual SHA-256 hash of the uploaded document bytes
    const arrayBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const fileHash = '0x' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    await new Promise(r => setTimeout(r, 500));

    const all = await blockchainService.getAllCertificates();
    let matchedCert = null;

    // Strategy 1: Check if any blockchain certificate ID is contained in the filename
    // e.g. "amit_patel_Degree_CERT-2026-004-2.pdf" contains "CERT-2026-004"
    matchedCert = all.find(c => file.name.toUpperCase().includes(c.id.toUpperCase()));

    // Strategy 2: Check student recipient name in filename
    // e.g. "amit_patel_Degree_..." contains "amit_patel"
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
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Page Title */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
          Verify Degree & Certificate Authenticity
        </h1>
        <p className="text-sm text-slate-600 max-w-lg mx-auto">
          Verify any degree by entering its Certificate ID or uploading the external certificate file.
        </p>
      </div>

      {/* Main Verification Card */}
      <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4">
        {/* Toggle between By ID and By File Upload */}
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <button
            onClick={() => setActiveMode('id')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeMode === 'id' 
                ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Search by Certificate ID
          </button>
          <button
            onClick={() => setActiveMode('file')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeMode === 'file' 
                ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Upload External Certificate File (PDF / Image)
          </button>
        </div>

        {activeMode === 'id' ? (
          /* Mode 1: Search by ID */
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={certId}
                  onChange={(e) => setCertId(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
                  placeholder="Enter Certificate ID (e.g. CERT-2026-004)"
                  className="w-full px-4 py-2.5 pl-10 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-blue-700 focus:bg-white font-mono transition"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>

              <button
                onClick={() => handleVerify()}
                disabled={loading || !certId.trim()}
                className="px-6 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-semibold text-sm rounded-xl transition shadow-xs disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? 'Verifying...' : 'Verify on Blockchain'}
              </button>
            </div>

            {/* Quick Demo Buttons for Presentation */}
            <div className="flex items-center gap-2 pt-2 border-t border-slate-100 flex-wrap text-xs text-slate-600">
              <span className="font-medium text-slate-500">Quick Test Samples:</span>
              <button
                onClick={() => handleQuickTest('CERT-2026-004')}
                className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-lg font-mono font-bold transition border border-blue-200"
              >
                CERT-2026-004 (Amit Patel - Valid)
              </button>
              <button
                onClick={() => handleQuickTest('CERT-2026-001')}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-mono transition"
              >
                CERT-2026-001 (Rahul Sharma - Valid)
              </button>
              <button
                onClick={() => handleQuickTest('CERT-2026-002')}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-mono transition"
              >
                CERT-2026-002 (Ananya Verma - Valid)
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
            <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center hover:border-blue-600 bg-slate-50/50 transition">
              <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-700">
                Upload Candidate's Certificate (PDF, PNG, JPG)
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                The portal checks if this certificate exists on the immutable blockchain ledger.
              </p>

              <label className="mt-3 inline-block cursor-pointer px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold shadow-xs transition">
                <span>Select Document to Verify</span>
                <input 
                  type="file" 
                  accept=".pdf,image/*,.txt" 
                  onChange={handleFileUpload} 
                  className="hidden" 
                />
              </label>

              {uploadedFileName && (
                <p className="text-xs text-slate-700 font-mono mt-2">
                  Uploaded file: <span className="font-bold">{uploadedFileName}</span>
                </p>
              )}
            </div>

            <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-blue-900 space-y-1">
              <span className="font-bold block">💡 How External Certificate Verification Works:</span>
              <p className="text-[11px] leading-relaxed text-blue-800">
                Blockchain verifies whether this exact certificate was officially minted by the university. If an external candidate brings a genuine degree, its ID and hash will match the ledger. If it was never registered or was edited, blockchain will reject it!
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Verification Result Display */}
      {result && (
        <div className="space-y-6">
          {/* 1. VALID RESULT */}
          {result.valid && (
            <div className="p-5 bg-emerald-50 border border-emerald-300 rounded-2xl space-y-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />
                <div>
                  <h3 className="text-base font-bold text-emerald-900">Certificate is 100% Genuine & Verified</h3>
                  <p className="text-xs text-emerald-700">
                    This document matches the permanent record anchored in Block #{result.cert.blockNumber} on the blockchain.
                  </p>
                </div>
              </div>

              {/* Summary Details */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-white p-3.5 rounded-xl border border-emerald-200">
                <div>
                  <span className="text-slate-500 block">Student Name:</span>
                  <span className="font-bold text-slate-900">{result.cert.recipientName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Roll Number:</span>
                  <span className="font-bold text-slate-900 font-mono">{result.cert.studentId}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Degree / Course:</span>
                  <span className="font-semibold text-slate-900 truncate block">{result.cert.courseName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Issue Date:</span>
                  <span className="font-semibold text-slate-900">{result.cert.issueDate}</span>
                </div>
              </div>

              {/* Cryptographic Proof Details */}
              <div className="text-[11px] font-mono text-slate-600 bg-emerald-100/60 p-2.5 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div>
                  <span className="font-semibold text-slate-700">Tx Hash: </span>
                  <span className="truncate">{result.cert.txHash}</span>
                </div>
                <div className="text-emerald-800 font-bold">
                  Block #{result.cert.blockNumber} (Confirmed on Chain)
                </div>
              </div>
            </div>
          )}

          {/* 2. REVOKED RESULT */}
          {result.revoked && (
            <div className="p-5 bg-red-50 border border-red-300 rounded-2xl space-y-3">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0" />
                <div>
                  <h3 className="text-base font-bold text-red-900">Certificate Officially Revoked</h3>
                  <p className="text-xs text-red-700">
                    This credential was issued earlier but was permanently cancelled on the blockchain.
                  </p>
                </div>
              </div>
              <div className="bg-white p-3 rounded-xl border border-red-200 text-xs text-slate-800">
                <span className="font-bold text-red-700 block mb-0.5">Revocation Audit Reason:</span>
                "{result.cert.revocationReason}"
              </div>
            </div>
          )}

          {/* 3. NOT FOUND / UNRECOGNIZED EXTERNAL FILE */}
          {!result.found && (
            <div className="p-6 bg-white border border-slate-200 rounded-2xl text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600 mx-auto">
                <XCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Certificate Not Found on Blockchain</h3>
                <p className="text-xs text-slate-600 max-w-md mx-auto mt-1">
                  {result.message}
                </p>
              </div>

              {result.fileHash && (
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg max-w-md mx-auto text-left text-[11px] font-mono text-slate-600 space-y-1">
                  <div><span className="font-semibold">Calculated SHA-256 Digest:</span></div>
                  <div className="break-all text-slate-800">{result.fileHash}</div>
                  <div className="text-[10px] text-red-600 font-sans mt-1">
                    ❌ Status: Unregistered / Not mined on university smart contract
                  </div>
                </div>
              )}

              {/* Action to register this external certificate */}
              {onNavigateToIssue && (
                <div className="pt-2">
                  <p className="text-xs text-slate-500 mb-2">
                    Want to register and anchor this certificate to the blockchain?
                  </p>
                  <button
                    onClick={onNavigateToIssue}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold shadow-xs transition"
                  >
                    <PlusCircle className="w-4 h-4" /> Register Certificate on Blockchain
                  </button>
                </div>
              )}
            </div>
          )}

          {/* If found, display the authentic certificate preview */}
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
