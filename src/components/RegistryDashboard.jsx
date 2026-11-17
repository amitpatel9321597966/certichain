import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Search, 
  Filter, 
  ShieldCheck, 
  AlertTriangle, 
  Eye, 
  Ban, 
  ExternalLink, 
  Copy, 
  CheckCircle2, 
  Sparkles,
  Layers,
  ChevronRight
} from 'lucide-react';
import { blockchainService } from '../services/blockchain';
import CertificateView from './CertificateView';
import { truncateHash } from '../utils/crypto';

export default function RegistryDashboard({ onVerifyCertificate }) {
  const [certificates, setCertificates] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedCert, setSelectedCert] = useState(null);
  const [revokingCert, setRevokingCert] = useState(null);
  const [revocationReason, setRevocationReason] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  const loadCertificates = async () => {
    const list = await blockchainService.getAllCertificates();
    setCertificates(list);
  };

  useEffect(() => {
    loadCertificates();
  }, []);

  const handleRevoke = async () => {
    if (!revokingCert || !revocationReason.trim()) return;
    try {
      await blockchainService.revokeCertificate(revokingCert.id, revocationReason);
      setRevokingCert(null);
      setRevocationReason('');
      await loadCertificates();
      alert('Certificate successfully marked as REVOKED on the blockchain ledger.');
    } catch (err) {
      alert('Revocation failed: ' + err.message);
    }
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredCerts = certificates.filter(cert => {
    const matchesSearch = 
      cert.recipientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.courseName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.studentId?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (statusFilter === 'ALL') return matchesSearch;
    return matchesSearch && cert.status === statusFilter;
  });

  const totalValid = certificates.filter(c => c.status === 'VALID').length;
  const totalRevoked = certificates.filter(c => c.status === 'REVOKED').length;

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 animate-fadeIn">
      {/* Header & Stats */}
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Institutional Certificate Registry
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Real-time auditable directory of all cryptographic credentials anchored on-chain.
          </p>
        </div>

        {/* Quick Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs">
            <span className="text-xs text-slate-500 font-semibold block mb-1">Total Issued</span>
            <div className="text-2xl font-black text-slate-900">{certificates.length}</div>
            <span className="text-[10px] text-slate-400 font-mono-code">Registered on ledger</span>
          </div>

          <div className="p-5 bg-white border border-emerald-200 rounded-2xl shadow-xs">
            <span className="text-xs text-emerald-700 font-semibold block mb-1">Active & Valid</span>
            <div className="text-2xl font-black text-emerald-700">{totalValid}</div>
            <span className="text-[10px] text-emerald-600 font-mono-code">Cryptographically intact</span>
          </div>

          <div className="p-5 bg-white border border-red-200 rounded-2xl shadow-xs">
            <span className="text-xs text-red-600 font-semibold block mb-1">Revoked</span>
            <div className="text-2xl font-black text-red-600">{totalRevoked}</div>
            <span className="text-[10px] text-red-500 font-mono-code">Permanently invalidated</span>
          </div>

          <div className="p-5 bg-white border border-indigo-200 rounded-2xl shadow-xs">
            <span className="text-xs text-indigo-700 font-semibold block mb-1">Network State</span>
            <div className="text-2xl font-black text-indigo-700 font-mono-code">SYNCHRONIZED</div>
            <span className="text-[10px] text-indigo-600 font-mono-code">Polygon PoS / Local RPC</span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by student, ID, or course..."
            className="w-full px-3.5 py-2 pl-9 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-500 font-semibold flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Filter:
          </span>
          <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-3 py-1 rounded-lg font-medium transition ${
                statusFilter === 'ALL' ? 'bg-indigo-600 text-white font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({certificates.length})
            </button>
            <button
              onClick={() => setStatusFilter('VALID')}
              className={`px-3 py-1 rounded-lg font-medium transition ${
                statusFilter === 'VALID' ? 'bg-emerald-600 text-white font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Valid ({totalValid})
            </button>
            <button
              onClick={() => setStatusFilter('REVOKED')}
              className={`px-3 py-1 rounded-lg font-medium transition ${
                statusFilter === 'REVOKED' ? 'bg-red-600 text-white font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Revoked ({totalRevoked})
            </button>
          </div>
        </div>
      </div>

      {/* Certificate Table */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xl shadow-slate-200/40">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider font-mono-code font-bold">
              <tr>
                <th className="py-3.5 px-4">Certificate ID</th>
                <th className="py-3.5 px-4">Recipient</th>
                <th className="py-3.5 px-4">Degree / Course</th>
                <th className="py-3.5 px-4">Issuing Institute</th>
                <th className="py-3.5 px-4">Issue Date</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCerts.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-400">
                    No certificates matching the current filter.
                  </td>
                </tr>
              ) : (
                filteredCerts.map((cert) => (
                  <tr key={cert.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 font-mono-code text-indigo-700 font-bold whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span>{cert.id}</span>
                        <button
                          onClick={() => copyToClipboard(cert.id, cert.id)}
                          className="text-slate-400 hover:text-slate-600"
                          title="Copy ID"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                      <div>{cert.recipientName}</div>
                      <div className="text-[10px] text-slate-500 font-mono-code font-normal">{cert.studentId || 'No Roll No'}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 max-w-xs truncate font-medium" title={cert.courseName}>
                      {cert.courseName}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 max-w-[180px] truncate" title={cert.issuerName}>
                      {cert.issuerName}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                      {cert.issueDate}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {cert.status === 'VALID' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-800 font-bold text-[10px]">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Valid
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-50 border border-red-300 text-red-800 font-bold text-[10px]">
                          <AlertTriangle className="w-3 h-3 text-red-600" /> Revoked
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedCert(cert)}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold transition flex items-center gap-1 border border-slate-200"
                          title="View & Download Certificate"
                        >
                          <Eye className="w-3 h-3" /> View
                        </button>
                        <button
                          onClick={() => onVerifyCertificate(cert.id)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-semibold transition border border-emerald-300 flex items-center gap-1"
                          title="Verify on Blockchain"
                        >
                          <ShieldCheck className="w-3 h-3 text-emerald-600" /> Verify
                        </button>
                        {cert.status === 'VALID' && (
                          <button
                            onClick={() => setRevokingCert(cert)}
                            className="px-2 py-1 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 text-[11px] font-semibold transition border border-red-300"
                            title="Revoke Certificate on Chain"
                          >
                            <Ban className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: View Certificate */}
      {selectedCert && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative w-full max-w-5xl bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                Certificate Preview & Export ({selectedCert.id})
              </h3>
              <button
                onClick={() => setSelectedCert(null)}
                className="text-slate-600 hover:text-slate-900 text-sm font-bold px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg"
              >
                ✕ Close
              </button>
            </div>
            <CertificateView 
              certificate={selectedCert} 
              onVerifyDirectly={(id) => {
                setSelectedCert(null);
                onVerifyCertificate(id);
              }}
            />
          </div>
        </div>
      )}

      {/* Modal: Revoke Certificate */}
      {revokingCert && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white border border-red-300 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-lg font-bold text-slate-900">Revoke Certificate on Blockchain</h3>
            </div>
            <p className="text-xs text-slate-700">
              You are about to permanently invalidate Certificate <span className="font-mono-code font-bold text-red-600">{revokingCert.id}</span> issued to <span className="font-bold text-slate-900">{revokingCert.recipientName}</span>.
            </p>
            <p className="text-[11px] text-amber-700">
              This action writes a permanent revocation transaction to the blockchain ledger and cannot be undone.
            </p>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Official Revocation Reason <span className="text-red-500">*</span>
              </label>
              <textarea
                value={revocationReason}
                onChange={(e) => setRevocationReason(e.target.value)}
                placeholder="e.g. Academic misconduct, forged prerequisite documentation, clerical error"
                rows={3}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-red-500 focus:bg-white"
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  setRevokingCert(null);
                  setRevocationReason('');
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleRevoke}
                disabled={!revocationReason.trim()}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition disabled:opacity-50"
              >
                Confirm Blockchain Revocation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
