import React, { useState, useEffect } from 'react';
import { Search, Eye, CheckCircle2, AlertTriangle } from 'lucide-react';
import { blockchainService } from '../services/blockchain';
import CertificateTemplate from './CertificateTemplate';

export default function CertificateList({ onSelectVerify }) {
  const [list, setList] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCert, setSelectedCert] = useState(null);

  useEffect(() => {
    blockchainService.getAllCertificates().then(data => setList(data));
  }, []);

  const filtered = list.filter(item => 
    item.recipientName.toLowerCase().includes(search.toLowerCase()) ||
    item.studentId.toLowerCase().includes(search.toLowerCase()) ||
    item.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Registered Academic Certificates
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Database of all degrees permanently anchored on the blockchain.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, roll no, or ID..."
            className="w-full px-3 py-1.5 pl-8 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-700"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold uppercase tracking-wider font-mono">
              <tr>
                <th className="py-3 px-4">Certificate ID</th>
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4">Roll Number</th>
                <th className="py-3 px-4">Degree</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-6 text-center text-slate-400">
                    No matching records found.
                  </td>
                </tr>
              ) : (
                filtered.map((cert) => (
                  <tr key={cert.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-4 font-mono font-bold text-blue-700">
                      {cert.id}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      {cert.recipientName}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">
                      {cert.studentId}
                    </td>
                    <td className="py-3 px-4 text-slate-700 max-w-xs truncate" title={cert.courseName}>
                      {cert.courseName}
                    </td>
                    <td className="py-3 px-4">
                      {cert.status === 'VALID' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Valid
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-50 text-red-800 text-[10px] font-bold border border-red-200">
                          <AlertTriangle className="w-3 h-3 text-red-600" /> Revoked
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedCert(cert)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded font-semibold text-[11px] transition flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" /> View
                        </button>
                        <button
                          onClick={() => onSelectVerify(cert.id)}
                          className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded font-semibold text-[11px] transition border border-blue-200"
                        >
                          Verify
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal to view degree */}
      {selectedCert && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative w-full max-w-4xl bg-white border border-slate-200 rounded-2xl p-6 shadow-xl my-8 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h3 className="text-sm font-bold text-slate-900">
                Degree Certificate: {selectedCert.recipientName} ({selectedCert.id})
              </h3>
              <button
                onClick={() => setSelectedCert(null)}
                className="text-xs font-bold text-slate-500 hover:text-slate-800 px-2 py-1 bg-slate-100 rounded"
              >
                ✕ Close
              </button>
            </div>
            <CertificateTemplate certificate={selectedCert} />
          </div>
        </div>
      )}
    </div>
  );
}
