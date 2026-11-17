import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Download, Printer, CheckCircle } from 'lucide-react';
import { exportCertificatePDF, triggerPrint } from '../utils/pdfExport';
import { truncateHash } from '../utils/crypto';

export default function CertificateTemplate({ certificate }) {
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (certificate?.id) {
      // Dynamic QR code with direct verification link
      const verifyUrl = `${window.location.origin}${window.location.pathname}?id=${encodeURIComponent(certificate.id)}`;
      QRCode.toDataURL(verifyUrl, {
        width: 120,
        margin: 1,
        color: {
          dark: '#0f172a',
          light: '#ffffff'
        }
      }).then(url => setQrCodeUrl(url)).catch(err => console.error(err));
    }
  }, [certificate]);

  const handleDownload = async () => {
    try {
      setDownloading(true);
      const filename = `${certificate.recipientName.replace(/\s+/g, '_')}_Degree_${certificate.id}.pdf`;
      await exportCertificatePDF('university-certificate-target', filename);
    } catch (err) {
      alert('PDF generation error: ' + err.message);
    } finally {
      setDownloading(false);
    }
  };

  if (!certificate) return null;

  const isRevoked = certificate.status === 'REVOKED';

  return (
    <div className="flex flex-col items-center w-full my-6">
      {/* Action Buttons */}
      <div className="flex items-center justify-between w-full max-w-[900px] mb-4">
        <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
          <span>Official University Degree Format (Print & PDF Ready)</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={triggerPrint}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 shadow-xs transition"
          >
            <Printer className="w-3.5 h-3.5" /> Print
          </button>
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold shadow-xs transition disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            {downloading ? 'Downloading...' : 'Download PDF (A4)'}
          </button>
        </div>
      </div>

      {/* Realistic University Certificate Layout */}
      <div className="w-full overflow-x-auto flex justify-center p-4 bg-slate-100 rounded-xl border border-slate-200">
        <div
          id="university-certificate-target"
          className="relative w-[900px] h-[640px] bg-[#fffefb] text-slate-900 p-8 flex flex-col justify-between shadow-lg select-none border-[10px] border-[#1e293b]"
          style={{ width: '900px', height: '640px' }}
        >
          {/* Inner Golden Border */}
          <div className="absolute inset-2 border-2 border-[#b45309] pointer-events-none" />
          <div className="absolute inset-3 border border-[#d97706]/40 pointer-events-none" />

          {/* Faint Background University Crest Watermark */}
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
            <svg className="w-[420px] h-[420px] text-slate-900" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zm0 12.5L4 11v5c0 3.31 3.58 6 8 6s8-2.69 8-6v-5l-8 4.5z"/>
            </svg>
          </div>

          {/* Header */}
          <div className="text-center relative z-10 pt-2">
            {/* University Crest */}
            <div className="w-12 h-12 mx-auto rounded-full border-2 border-[#b45309] flex items-center justify-center bg-[#1e293b] text-amber-400 mb-2 shadow-sm">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>

            <h2 className="font-serif tracking-widest text-xs uppercase text-[#92400e] font-bold">
              {certificate.issuerName || 'Delhi Technological University'}
            </h2>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">
              (Estd. by Govt. of NCT of Delhi • Recognized by UGC)
            </p>

            <h1 className="font-serif text-2xl font-bold tracking-tight text-[#1e293b] mt-3 uppercase">
              Degree of Bachelor of Technology
            </h1>
          </div>

          {/* Body Text */}
          <div className="text-center my-auto py-2 relative z-10 space-y-2">
            <p className="font-serif italic text-sm text-slate-600">
              This is to certify that
            </p>

            {/* Student Name */}
            <h2 className="font-serif text-3xl font-bold text-[#0f172a] tracking-wide border-b border-[#b45309]/30 pb-1 inline-block px-10">
              {certificate.recipientName}
            </h2>

            <p className="text-xs text-slate-600 font-mono">
              Roll No / Enrollment: <span className="font-bold text-slate-900">{certificate.studentId}</span>
            </p>

            <p className="font-serif text-xs text-slate-700 max-w-lg mx-auto leading-relaxed pt-1">
              having fulfilled all requirements and passed the prescribed examinations has been admitted to the degree of
            </p>

            {/* Program Name */}
            <div className="pt-1">
              <span className="font-serif text-lg font-bold text-[#1e293b] bg-amber-50/60 px-5 py-1 rounded border border-[#b45309]/30 inline-block">
                {certificate.courseName}
              </span>
            </div>

            {certificate.grade && (
              <p className="text-xs font-semibold text-slate-800">
                Division / Grade: <span className="text-[#92400e] font-bold">{certificate.grade}</span>
              </p>
            )}
          </div>

          {/* Footer: Signatures, Seal, & QR Code */}
          <div className="relative z-10 pt-2 border-t border-[#b45309]/30 flex items-end justify-between px-6 pb-2">
            {/* Signature 1 */}
            <div className="text-center w-40">
              <div className="font-serif italic text-lg text-slate-800 h-8 flex items-center justify-center font-medium">
                Prateek Saxena
              </div>
              <div className="border-t border-slate-400 pt-1">
                <p className="text-[10px] font-bold text-slate-900">{certificate.signatoryName || 'Prof. Prateek Saxena'}</p>
                <p className="text-[8px] text-slate-500 uppercase">{certificate.signatoryTitle || 'Controller of Examinations'}</p>
              </div>
            </div>

            {/* University Embossed Stamp / Seal */}
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 rounded-full border-2 border-dashed border-[#b45309] flex flex-col items-center justify-center p-1 bg-amber-50 text-center">
                <div className="w-16 h-16 rounded-full border border-[#b45309] flex flex-col items-center justify-center text-[#92400e]">
                  <span className="text-[7px] font-bold uppercase tracking-tight">OFFICIAL SEAL</span>
                  <span className="text-[6px] text-slate-600 mt-0.5">BLOCK #{certificate.blockNumber || 101}</span>
                  <span className="text-[6px] text-emerald-700 font-bold mt-0.5">✓ VERIFIED</span>
                </div>
              </div>
            </div>

            {/* Verification QR Code */}
            <div className="flex items-center gap-2">
              <div className="text-right">
                <p className="text-[9px] font-bold text-slate-800 uppercase">Scan to Verify</p>
                <p className="text-[8px] text-slate-500">Date: {certificate.issueDate}</p>
                <p className="text-[8px] font-mono text-slate-600">ID: {certificate.id}</p>
              </div>
              <div className="p-1 bg-white border border-slate-300 rounded shadow-xs">
                {qrCodeUrl ? (
                  <img src={qrCodeUrl} alt="QR" className="w-16 h-16 object-contain" />
                ) : (
                  <div className="w-16 h-16 bg-slate-100 flex items-center justify-center text-[8px]">QR</div>
                )}
              </div>
            </div>
          </div>

          {/* Microprint Security Ledger Line */}
          <div className="relative z-10 pt-1 border-t border-slate-200 flex items-center justify-between text-[8px] font-mono text-slate-500">
            <div>Blockchain Hash: {truncateHash(certificate.certHash, 16, 12)}</div>
            <div>Transaction: {truncateHash(certificate.txHash, 14, 10)}</div>
            <div className="text-blue-700 font-semibold">Decentralized Academic Ledger</div>
          </div>

          {/* Revoked Banner Overlay */}
          {isRevoked && (
            <div className="absolute inset-0 bg-red-900/60 backdrop-blur-[1px] z-30 flex items-center justify-center pointer-events-none">
              <div className="rotate-[-18deg] border-4 border-red-600 bg-red-600 text-white px-12 py-3 rounded-lg shadow-xl text-center">
                <h3 className="text-3xl font-black uppercase tracking-widest">REVOKED / CANCELLED</h3>
                <p className="text-xs font-medium mt-0.5">{certificate.revocationReason || 'Invalidated by University'}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
