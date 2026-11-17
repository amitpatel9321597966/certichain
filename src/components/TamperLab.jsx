import React, { useState, useEffect } from 'react';
import { 
  FlaskConical, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  ShieldAlert, 
  ArrowRight, 
  RefreshCw, 
  Layers, 
  FileWarning, 
  Sparkles 
} from 'lucide-react';
import { blockchainService } from '../services/blockchain';
import { computeCertificateHash, truncateHash } from '../utils/crypto';

export default function TamperLab() {
  const [certificates, setCertificates] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [originalCert, setOriginalCert] = useState(null);

  const [tamperedName, setTamperedName] = useState('');
  const [tamperedGrade, setTamperedGrade] = useState('');
  const [tamperedCourse, setTamperedCourse] = useState('');

  const [originalHash, setOriginalHash] = useState('');
  const [recomputedHash, setRecomputedHash] = useState('');
  const [verificationOutcome, setVerificationOutcome] = useState(null);

  useEffect(() => {
    blockchainService.getAllCertificates().then(list => {
      const validOnes = list.filter(c => c.status === 'VALID');
      setCertificates(validOnes);
      if (validOnes.length > 0) {
        handleSelectCert(validOnes[0].id, validOnes);
      }
    });
  }, []);

  const handleSelectCert = (id, list = certificates) => {
    setSelectedId(id);
    const cert = list.find(c => c.id === id);
    if (cert) {
      setOriginalCert(cert);
      setTamperedName(cert.recipientName);
      setTamperedGrade(cert.grade);
      setTamperedCourse(cert.courseName);
      setOriginalHash(cert.certHash);
      setVerificationOutcome(null);

      computeCertificateHash(cert).then(h => setRecomputedHash(h));
    }
  };

  useEffect(() => {
    if (originalCert) {
      const simulated = {
        ...originalCert,
        recipientName: tamperedName,
        grade: tamperedGrade,
        courseName: tamperedCourse
      };

      computeCertificateHash(simulated).then(h => {
        setRecomputedHash(h);
        setVerificationOutcome(null);
      });
    }
  }, [tamperedName, tamperedGrade, tamperedCourse, originalCert]);

  const handleTestVerification = () => {
    if (originalHash === recomputedHash) {
      setVerificationOutcome({
        status: 'AUTHENTIC',
        message: 'No alterations detected. The recomputed hash perfectly matches the block transaction hash.',
        color: 'emerald'
      });
    } else {
      setVerificationOutcome({
        status: 'TAMPER_DETECTED',
        message: 'CRITICAL TAMPER REJECTION! The SHA-256 fingerprint differs from the immutable block record. Blockchain rejects the document.',
        color: 'red'
      });
    }
  };

  const handleReset = () => {
    if (originalCert) {
      setTamperedName(originalCert.recipientName);
      setTamperedGrade(originalCert.grade);
      setTamperedCourse(originalCert.courseName);
      setVerificationOutcome(null);
    }
  };

  const isAltered = originalHash !== recomputedHash;

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-300 text-amber-800 text-xs font-semibold">
          <FlaskConical className="w-4 h-4 text-amber-600" />
          Interactive Cryptographic Tamper Demonstration Lab
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
          Why Blockchain Makes Certificates Unforgeable
        </h1>
        <p className="text-slate-600 text-sm max-w-2xl mx-auto">
          Experience the <b>Avalanche Effect</b> in real time. Alter even a single character in the student's name or grade, and see the cryptographic ledger instantly reject it!
        </p>
      </div>

      {/* Control Box */}
      <div className="p-6 sm:p-8 bg-white border border-slate-200 rounded-3xl space-y-6 shadow-xl shadow-slate-200/50">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
              Select An Authentic Certificate To Test
            </label>
            <select
              value={selectedId}
              onChange={(e) => handleSelectCert(e.target.value)}
              className="px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white font-mono-code"
            >
              {certificates.map(c => (
                <option key={c.id} value={c.id}>
                  {c.id} — {c.recipientName} ({c.courseName.slice(0, 30)}...)
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition border border-slate-200"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Reset to Original Values
          </button>
        </div>

        {/* Live Editing Experiment Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left: Original Certificate on Chain */}
          <div className="p-5 bg-emerald-50/60 rounded-2xl border border-emerald-300 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Immutable Record in Block #{originalCert?.blockNumber || 1042}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-600 text-white font-mono-code font-bold">
                ORIGINAL
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-500 block text-[11px] font-medium">Original Recipient Name:</span>
                <p className="font-bold text-slate-900 text-sm mt-0.5">{originalCert?.recipientName}</p>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px] font-medium">Original Program:</span>
                <p className="font-medium text-slate-800 mt-0.5">{originalCert?.courseName}</p>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px] font-medium">Original Grade / Distinction:</span>
                <p className="font-bold text-emerald-800 mt-0.5">{originalCert?.grade}</p>
              </div>
            </div>

            <div className="pt-3 border-t border-emerald-200">
              <span className="text-[10px] uppercase tracking-wider font-mono-code text-slate-500 font-semibold block mb-1">
                Anchored SHA-256 Digest (On Blockchain):
              </span>
              <p className="font-mono-code text-[11px] text-emerald-900 font-bold bg-white p-2.5 rounded-xl border border-emerald-300 break-all">
                {originalHash}
              </p>
            </div>
          </div>

          {/* Right: Tampered Playground */}
          <div className={`p-5 rounded-2xl border transition-all space-y-4 ${
            isAltered
              ? 'bg-red-50/70 border-red-300 shadow-lg shadow-red-50'
              : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="flex items-center justify-between">
              <span className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                isAltered ? 'text-red-700' : 'text-slate-700'
              }`}>
                {isAltered ? <AlertTriangle className="w-4 h-4 text-red-600" /> : <FlaskConical className="w-4 h-4 text-amber-600" />}
                {isAltered ? 'Tampered Document (Modified)' : 'Try Changing Any Value Below:'}
              </span>
              {isAltered && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-600 text-white font-mono-code font-bold animate-pulse">
                  ALTERED!
                </span>
              )}
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] text-slate-700 font-medium block mb-1">
                  Change Student Name (e.g. add a letter):
                </label>
                <input
                  type="text"
                  value={tamperedName}
                  onChange={(e) => setTamperedName(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-red-500 font-mono-code"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-700 font-medium block mb-1">
                  Change Grade / CGPA:
                </label>
                <input
                  type="text"
                  value={tamperedGrade}
                  onChange={(e) => setTamperedGrade(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-red-500 font-mono-code"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-700 font-medium block mb-1">
                  Change Program / Degree:
                </label>
                <input
                  type="text"
                  value={tamperedCourse}
                  onChange={(e) => setTamperedCourse(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-red-500 font-mono-code"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200">
              <span className="text-[10px] uppercase tracking-wider font-mono-code text-slate-500 font-semibold block mb-1">
                Dynamically Recomputed Hash:
              </span>
              <p className={`font-mono-code text-[11px] p-2.5 rounded-xl border break-all transition-all ${
                isAltered
                  ? 'bg-white border-red-300 text-red-700 font-bold'
                  : 'bg-white border-slate-200 text-slate-700'
              }`}>
                {recomputedHash}
              </p>
            </div>
          </div>
        </div>

        {/* Action Button: Test Verification */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-600">
            {isAltered ? (
              <span className="text-red-700 font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-red-600" /> Hashes DO NOT match! Blockchain consensus will reject this document.
              </span>
            ) : (
              <span className="text-emerald-700 font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Hashes are identical. Document is in original pristine state.
              </span>
            )}
          </div>

          <button
            onClick={handleTestVerification}
            className={`px-6 py-3 rounded-xl font-bold text-xs transition shadow-md flex items-center gap-2 ${
              isAltered
                ? 'bg-red-600 hover:bg-red-700 text-white shadow-red-100'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-100'
            }`}
          >
            <ShieldAlert className="w-4 h-4" /> Test Verification On Blockchain
          </button>
        </div>

        {/* Verification Outcome Banner */}
        {verificationOutcome && (
          <div className={`p-5 rounded-2xl border animate-slideUp ${
            verificationOutcome.status === 'AUTHENTIC'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
              : 'bg-red-50 border-red-300 text-red-900'
          }`}>
            <div className="flex items-center gap-3">
              {verificationOutcome.status === 'AUTHENTIC' ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />
              ) : (
                <XCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
              )}
              <div>
                <h4 className="text-sm font-bold uppercase tracking-wider">
                  {verificationOutcome.status === 'AUTHENTIC' ? 'Verdict: 100% Authentic' : 'Verdict: Forgery / Tamper Detected!'}
                </h4>
                <p className="text-xs mt-0.5">{verificationOutcome.message}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
