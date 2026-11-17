import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { Download, Printer, ShieldCheck, Share2, CheckCircle2, AlertTriangle, Sparkles, ExternalLink } from 'lucide-react';
import { exportCertificatePDF, triggerPrint } from '../utils/pdfExport';
import { truncateHash } from '../utils/crypto';

export default function CertificateView({ certificate, onVerifyDirectly }) {
  const [template, setTemplate] = useState(certificate.template || 'royal');
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (certificate?.id) {
      const verifyUrl = `${window.location.origin}${window.location.pathname}?verifyId=${encodeURIComponent(certificate.id)}`;
      QRCode.toDataURL(verifyUrl, {
        width: 140,
        margin: 1,
        color: {
          dark: template === 'modern' ? '#38bdf8' : '#1e293b',
          light: template === 'modern' ? '#0f172a' : '#ffffff'
        }
      })
      .then(url => setQrDataUrl(url))
      .catch(err => console.error('QR code generation failed', err));
    }
  }, [certificate, template]);

  const handleDownloadPDF = async () => {
    try {
      setIsExporting(true);
      const filename = `${certificate.recipientName.replace(/\s+/g, '_')}_Certificate_${certificate.id}.pdf`;
      await exportCertificatePDF('certificate-render-target', filename);
    } catch (err) {
      alert('Error generating PDF: ' + err.message);
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}${window.location.pathname}?verifyId=${encodeURIComponent(certificate.id)}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  if (!certificate) return null;

  const isRevoked = certificate.status === 'REVOKED';

  return (
    <div className="flex flex-col items-center w-full">
      {/* Top Controls Bar */}
      <div className="w-full max-w-5xl flex flex-wrap items-center justify-between gap-4 mb-6 p-4 bg-white border border-slate-200 rounded-2xl shadow-md">
        {/* Template Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase tracking-wider text-slate-500 font-bold flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-500" /> Style:
          </span>
          <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs">
            <button
              onClick={() => setTemplate('royal')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                template === 'royal' 
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Classic Royal
            </button>
            <button
              onClick={() => setTemplate('modern')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                template === 'modern' 
                  ? 'bg-slate-900 text-cyan-300 font-bold shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Cyber Web3
            </button>
            <button
              onClick={() => setTemplate('gold')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                template === 'gold' 
                  ? 'bg-amber-400 text-slate-950 font-bold shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Executive Gold
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition border border-slate-200"
            title="Copy Public Verification Link"
          >
            <Share2 className="w-3.5 h-3.5" />
            {copiedLink ? 'Copied Link!' : 'Share Link'}
          </button>
          <button
            onClick={triggerPrint}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition border border-slate-200"
          >
            <Printer className="w-3.5 h-3.5" /> Print
          </button>
          <button
            onClick={handleDownloadPDF}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-md shadow-indigo-100 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            {isExporting ? 'Generating PDF...' : 'Download PDF (A4)'}
          </button>
          {onVerifyDirectly && (
            <button
              onClick={() => onVerifyDirectly(certificate.id)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-md shadow-emerald-100"
            >
              <ShieldCheck className="w-4 h-4" /> Verify on Chain
            </button>
          )}
        </div>
      </div>

      {/* Main Certificate Container Frame */}
      <div className="w-full overflow-x-auto flex justify-center py-4 px-2 bg-slate-200/60 rounded-3xl border border-slate-200 shadow-inner">
        <div
          id="certificate-render-target"
          className="relative w-[960px] min-h-[680px] select-none transition-all shadow-2xl rounded-sm bg-white"
          style={{ width: '960px', height: '680px' }}
        >
          {/* ==============================================
              TEMPLATE 1: ROYAL HERITAGE ACADEMIC (PRESTIGE)
             ============================================== */}
          {template === 'royal' && (
            <div className="relative w-full h-full bg-[#fdfbf7] text-[#1c1917] p-8 flex flex-col justify-between overflow-hidden border-[14px] border-[#0c182b]">
              {/* Outer Golden Guilloche / Ornamental Borders */}
              <div className="absolute inset-2 border-[2px] border-[#c29b38] pointer-events-none" />
              <div className="absolute inset-4 border-[1px] border-[#c29b38]/40 pointer-events-none" />

              {/* Corner Ornaments */}
              <div className="absolute top-4 left-4 w-12 h-12 border-t-4 border-l-4 border-[#c29b38]" />
              <div className="absolute top-4 right-4 w-12 h-12 border-t-4 border-r-4 border-[#c29b38]" />
              <div className="absolute bottom-4 left-4 w-12 h-12 border-b-4 border-l-4 border-[#c29b38]" />
              <div className="absolute bottom-4 right-4 w-12 h-12 border-b-4 border-r-4 border-[#c29b38]" />

              {/* Faint Background Watermark Seal */}
              <div className="absolute inset-0 flex items-center justify-center opacity-[0.035] pointer-events-none">
                <svg className="w-[520px] h-[520px] text-[#0c182b]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L1 7l11 5 9-4.09V17h2V7L12 2zm0 13l-7-3.18v4.93L12 20l7-3.25v-4.93L12 15z"/>
                </svg>
              </div>

              {/* Header Section */}
              <div className="text-center relative z-10 pt-2">
                <div className="flex items-center justify-center gap-3 mb-2">
                  <div className="h-[1px] w-20 bg-gradient-to-r from-transparent to-[#c29b38]" />
                  <div className="w-12 h-12 rounded-full border-2 border-[#c29b38] bg-[#0c182b] flex items-center justify-center shadow-md">
                    <svg className="w-6 h-6 text-[#eab308]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                    </svg>
                  </div>
                  <div className="h-[1px] w-20 bg-gradient-to-l from-transparent to-[#c29b38]" />
                </div>

                <h3 className="font-cinzel text-xs tracking-[0.35em] uppercase text-[#785b19] font-bold">
                  {certificate.issuerName || 'University / Academic Board'}
                </h3>
                <h1 className="font-playfair text-3xl font-bold tracking-tight text-[#0c182b] mt-1 mb-1">
                  Certificate of Academic Achievement
                </h1>
                <p className="font-serif italic text-xs text-[#57534e]">
                  This is to formally certify that the credential conferred herein has been permanently anchored to the blockchain
                </p>
              </div>

              {/* Recipient & Course Details */}
              <div className="text-center my-auto py-2 relative z-10">
                <span className="font-serif italic text-sm text-[#78716c]">This official credential is presented to</span>
                
                {/* Student Name */}
                <h2 className="font-playfair text-4xl font-extrabold text-[#0c182b] tracking-wide my-2 border-b-2 border-[#c29b38]/30 pb-2 inline-block px-12">
                  {certificate.recipientName}
                </h2>
                
                <div className="text-xs text-[#78716c] font-mono-code mb-2">
                  Student ID / Roll No: <span className="font-bold text-[#1c1917]">{certificate.studentId || 'N/A'}</span>
                </div>

                <p className="font-serif text-sm text-[#44403c] max-w-xl mx-auto leading-relaxed">
                  who has diligently satisfied all academic standards, research requirements, and examinations for the award of
                </p>

                {/* Course Title */}
                <div className="mt-2 mb-1">
                  <span className="font-cinzel text-xl font-bold text-[#0c182b] bg-amber-50/80 px-6 py-1.5 rounded-lg border border-[#c29b38]/40 shadow-sm inline-block">
                    {certificate.courseName}
                  </span>
                </div>

                {certificate.grade && (
                  <div className="mt-1">
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-[#0c182b] text-[#fef08a] shadow-sm">
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      {certificate.grade}
                    </span>
                  </div>
                )}
              </div>

              {/* Lower Section: Signatures, Seal, & QR Code */}
              <div className="relative z-10 pt-2 border-t border-[#c29b38]/30 flex items-end justify-between px-4 pb-2">
                {/* Signatory 1 */}
                <div className="text-center w-48">
                  <div className="font-script text-2xl text-[#0c182b] h-8 flex items-center justify-center">
                    {certificate.signatoryName || 'Prof. R. K. Shevgaonkar'}
                  </div>
                  <div className="border-t border-[#44403c]/40 pt-1 mt-1">
                    <p className="text-[11px] font-bold text-[#1c1917]">{certificate.signatoryName || 'Authorized Signatory'}</p>
                    <p className="text-[9px] uppercase tracking-wider text-[#78716c]">{certificate.signatoryTitle || 'Dean of Academic Affairs'}</p>
                  </div>
                </div>

                {/* Official Gold Embossed Seal */}
                <div className="relative flex flex-col items-center">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#fef08a] via-[#eab308] to-[#92400e] p-[3px] shadow-xl flex items-center justify-center">
                    <div className="w-full h-full rounded-full border-2 border-dashed border-[#78350f] flex flex-col items-center justify-center bg-gradient-to-tr from-[#ca8a04] to-[#facc15] text-[#451a03] p-1 text-center">
                      <ShieldCheck className="w-7 h-7 text-[#451a03] mb-0.5" />
                      <span className="text-[7.5px] font-black uppercase tracking-tighter leading-none">VERIFIED ON-CHAIN</span>
                      <span className="text-[6.5px] font-bold tracking-widest text-[#78350f] mt-0.5">BLOCK #{certificate.blockNumber || 1042}</span>
                    </div>
                  </div>
                  {/* Decorative Ribbons */}
                  <div className="flex gap-2 -mt-2">
                    <div className="w-3.5 h-6 bg-gradient-to-b from-[#ca8a04] to-[#854d0e] [clip-path:polygon(0_0,100%_0,100%_100%,50%_75%,0_100%)] shadow-sm" />
                    <div className="w-3.5 h-6 bg-gradient-to-b from-[#ca8a04] to-[#854d0e] [clip-path:polygon(0_0,100%_0,100%_100%,50%_75%,0_100%)] shadow-sm" />
                  </div>
                </div>

                {/* Scannable Dynamic QR Code */}
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-[10px] uppercase tracking-wider font-bold text-[#0c182b]">Scan to Verify</p>
                    <p className="text-[9px] text-[#78716c]">Issue Date: {certificate.issueDate}</p>
                    <p className="text-[8.5px] font-mono-code text-[#78716c] max-w-[120px] truncate" title={certificate.id}>
                      ID: {certificate.id}
                    </p>
                  </div>
                  <div className="p-1 bg-white border border-[#c29b38]/50 rounded-lg shadow-md">
                    {qrDataUrl ? (
                      <img src={qrDataUrl} alt="Verification QR Code" className="w-20 h-20 object-contain" />
                    ) : (
                      <div className="w-20 h-20 bg-slate-100 flex items-center justify-center text-[8px] text-slate-400">Loading QR</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Cryptographic Ledger Footer Line */}
              <div className="relative z-10 mt-2 pt-1 border-t border-slate-200 flex items-center justify-between text-[8px] font-mono-code text-slate-500">
                <div>
                  <span className="font-semibold text-slate-700">SHA-256: </span>
                  <span>{truncateHash(certificate.certHash, 16, 12)}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-700">Tx: </span>
                  <span>{truncateHash(certificate.txHash, 14, 10)}</span>
                </div>
                <div>
                  <span className="text-emerald-700 font-bold">● IMMUTABLE LEDGER RECORD</span>
                </div>
              </div>

              {/* Revoked Banner Overlay */}
              {isRevoked && (
                <div className="absolute inset-0 bg-red-950/70 backdrop-blur-[2px] z-30 flex items-center justify-center pointer-events-none">
                  <div className="rotate-[-22deg] border-8 border-red-500 bg-red-600/95 text-white px-16 py-4 rounded-xl shadow-2xl text-center">
                    <h2 className="text-5xl font-black tracking-widest uppercase">REVOKED / CANCELLED</h2>
                    <p className="text-sm font-semibold tracking-wide mt-1">
                      Reason: {certificate.revocationReason || 'Invalidated by Issuing Authority'}
                    </p>
                    <p className="text-xs font-mono-code mt-0.5 opacity-90">Recorded in Block Ledger</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ==============================================
              TEMPLATE 2: CYBER WEB3 / HOLOGRAPHIC
             ============================================== */}
          {template === 'modern' && (
            <div className="relative w-full h-full bg-[#090d16] text-slate-100 p-8 flex flex-col justify-between overflow-hidden border-2 border-cyan-500/30">
              <div className="absolute inset-0 opacity-15 bg-[linear-gradient(to_right,#0891b215_1px,transparent_1px),linear-gradient(to_bottom,#0891b215_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
              <div className="absolute -top-32 -right-32 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-cyan-400" />
              <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-cyan-400" />
              <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-cyan-400" />
              <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-cyan-400" />

              <div className="text-center relative z-10 pt-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/70 border border-cyan-500/40 text-cyan-400 text-[10px] font-mono-code uppercase tracking-widest mb-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                  Smart Contract Verified Credential
                </div>
                <h3 className="text-xs uppercase tracking-[0.25em] text-slate-400 font-semibold">
                  {certificate.issuerName || 'Decentralized Academy'}
                </h3>
                <h1 className="text-3xl font-black tracking-tight text-white mt-1 bg-gradient-to-r from-cyan-300 via-sky-200 to-indigo-300 bg-clip-text text-transparent">
                  Cryptographic Certificate of Completion
                </h1>
              </div>

              <div className="text-center my-auto py-2 relative z-10">
                <span className="text-xs font-mono-code text-cyan-400 uppercase tracking-widest">Awarded To</span>
                <h2 className="text-4xl font-extrabold text-white tracking-wide my-2">
                  {certificate.recipientName}
                </h2>
                <div className="text-xs text-slate-400 font-mono-code mb-3">
                  Student Roll / ID: <span className="text-cyan-300 font-semibold">{certificate.studentId || 'N/A'}</span>
                </div>

                <p className="text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
                  For demonstrated excellence and mastery in the specialized program
                </p>

                <div className="mt-3">
                  <span className="text-xl font-bold text-white bg-slate-900/90 px-6 py-2 rounded-xl border border-cyan-500/30 shadow-lg shadow-cyan-900/20 inline-block">
                    {certificate.courseName}
                  </span>
                </div>

                {certificate.grade && (
                  <div className="mt-2">
                    <span className="inline-flex items-center gap-1.5 text-xs font-mono-code font-bold px-3 py-1 rounded-md bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                      ◆ {certificate.grade}
                    </span>
                  </div>
                )}
              </div>

              <div className="relative z-10 pt-3 border-t border-slate-800 flex items-end justify-between px-4 pb-2">
                <div className="w-48">
                  <div className="font-script text-2xl text-cyan-300 h-8 flex items-center">
                    {certificate.signatoryName || 'Dr. Michael Levitt'}
                  </div>
                  <div className="border-t border-slate-700 pt-1 mt-1">
                    <p className="text-[11px] font-bold text-slate-200">{certificate.signatoryName || 'Authorized Signatory'}</p>
                    <p className="text-[9px] uppercase tracking-wider text-slate-400">{certificate.signatoryTitle || 'Academic Chair'}</p>
                  </div>
                </div>

                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-cyan-600 to-indigo-600 p-[2px] shadow-xl">
                    <div className="w-full h-full rounded-2xl bg-slate-950 flex flex-col items-center justify-center p-2 text-center">
                      <ShieldCheck className="w-6 h-6 text-cyan-400 mb-1" />
                      <span className="text-[7.5px] font-mono-code text-cyan-300 font-bold uppercase">BLOCK #{certificate.blockNumber || 1043}</span>
                      <span className="text-[6.5px] text-slate-400">ETHEREUM VM</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-[10px] font-mono-code text-cyan-400 font-bold uppercase">VERIFY VIA DAPP</p>
                    <p className="text-[9px] text-slate-400">Date: {certificate.issueDate}</p>
                    <p className="text-[8.5px] font-mono-code text-slate-500">ID: {certificate.id}</p>
                  </div>
                  <div className="p-1 bg-slate-950 border border-cyan-500/40 rounded-xl shadow-md">
                    {qrDataUrl ? (
                      <img src={qrDataUrl} alt="Verification QR Code" className="w-20 h-20 object-contain rounded-lg" />
                    ) : (
                      <div className="w-20 h-20 bg-slate-900 flex items-center justify-center text-[8px] text-slate-500">Loading QR</div>
                    )}
                  </div>
                </div>
              </div>

              <div className="relative z-10 mt-2 pt-1 border-t border-slate-900 flex items-center justify-between text-[8px] font-mono-code text-slate-500">
                <div>HASH: {truncateHash(certificate.certHash, 18, 12)}</div>
                <div>TX: {truncateHash(certificate.txHash, 16, 10)}</div>
                <div className="text-cyan-400">● SHA-256 IMMUTABLE STATE</div>
              </div>

              {isRevoked && (
                <div className="absolute inset-0 bg-red-950/80 backdrop-blur-sm z-30 flex items-center justify-center pointer-events-none">
                  <div className="rotate-[-20deg] border-4 border-red-500 bg-red-600/90 text-white px-12 py-3 rounded-lg shadow-2xl text-center">
                    <h2 className="text-4xl font-black tracking-widest uppercase">REVOKED ON-CHAIN</h2>
                    <p className="text-xs font-semibold mt-1">{certificate.revocationReason || 'Invalidated'}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ==============================================
              TEMPLATE 3: EXECUTIVE MINIMALIST GOLD
             ============================================== */}
          {template === 'gold' && (
            <div className="relative w-full h-full bg-[#fdfbf7] text-slate-900 p-8 flex flex-col justify-between overflow-hidden border-[8px] border-amber-600">
              <div className="absolute inset-3 border border-amber-400/50 pointer-events-none" />

              <div className="text-center relative z-10 pt-4">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-slate-950 font-black text-sm">
                    ✦
                  </div>
                </div>
                <h3 className="font-cinzel text-xs uppercase tracking-[0.3em] text-amber-700 font-bold">
                  {certificate.issuerName || 'Executive Accreditation Board'}
                </h3>
                <h1 className="font-playfair text-3xl font-extrabold tracking-tight text-slate-900 mt-1">
                  Executive Professional Credential
                </h1>
              </div>

              <div className="text-center my-auto py-2 relative z-10">
                <p className="text-xs uppercase tracking-widest text-slate-500 font-semibold">Awarded Proudly To</p>
                <h2 className="font-playfair text-4xl font-bold text-slate-950 my-2">
                  {certificate.recipientName}
                </h2>
                <p className="text-xs text-slate-500 font-mono-code mb-2">
                  Credential ID: <span className="font-semibold text-slate-800">{certificate.id}</span>
                </p>

                <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                  In recognition of superior competence, professional mastery, and adherence to certified standards in
                </p>

                <div className="mt-2">
                  <span className="font-cinzel text-xl font-bold text-amber-900 bg-amber-100/70 px-6 py-1.5 rounded-md border border-amber-300 inline-block">
                    {certificate.courseName}
                  </span>
                </div>

                {certificate.grade && (
                  <div className="mt-1">
                    <span className="text-xs font-semibold px-3 py-1 rounded bg-slate-900 text-amber-300">
                      {certificate.grade}
                    </span>
                  </div>
                )}
              </div>

              <div className="relative z-10 pt-2 border-t border-amber-200 flex items-end justify-between px-4 pb-2">
                <div className="w-44">
                  <div className="font-script text-2xl text-slate-900 h-8 flex items-center">
                    {certificate.signatoryName || 'Dr. Neha Kulkarni'}
                  </div>
                  <div className="border-t border-slate-400 pt-1 mt-1">
                    <p className="text-[11px] font-bold text-slate-900">{certificate.signatoryName || 'Authorized Signatory'}</p>
                    <p className="text-[9px] uppercase tracking-wider text-slate-500">{certificate.signatoryTitle || 'Governing Director'}</p>
                  </div>
                </div>

                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 rounded-full bg-amber-500 p-1 flex items-center justify-center shadow-lg">
                    <div className="w-full h-full rounded-full border border-amber-200 flex flex-col items-center justify-center text-slate-950">
                      <ShieldCheck className="w-6 h-6 text-slate-950" />
                      <span className="text-[7px] font-black uppercase tracking-tight">OFFICIAL GOLD</span>
                      <span className="text-[6px] font-bold">BLOCK #{certificate.blockNumber || 1044}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <p className="text-[9px] font-bold uppercase text-slate-800">Scan to Verify</p>
                    <p className="text-[8.5px] text-slate-500">{certificate.issueDate}</p>
                  </div>
                  <div className="p-1 bg-white border border-amber-300 rounded shadow">
                    {qrDataUrl ? (
                      <img src={qrDataUrl} alt="QR" className="w-16 h-16 object-contain" />
                    ) : (
                      <div className="w-16 h-16 bg-slate-100 flex items-center justify-center text-[7px]">QR</div>
                    )}
                  </div>
                </div>
              </div>

              <div className="relative z-10 mt-1 pt-1 border-t border-slate-200 flex items-center justify-between text-[8px] font-mono-code text-slate-500">
                <div>HASH: {truncateHash(certificate.certHash, 14, 10)}</div>
                <div>TX: {truncateHash(certificate.txHash, 14, 8)}</div>
                <div className="text-amber-800 font-bold">IMMUTABLE ANCHOR</div>
              </div>

              {isRevoked && (
                <div className="absolute inset-0 bg-red-950/75 backdrop-blur-[2px] z-30 flex items-center justify-center pointer-events-none">
                  <div className="rotate-[-20deg] border-4 border-red-500 bg-red-600/90 text-white px-12 py-3 rounded-lg shadow-2xl text-center">
                    <h2 className="text-4xl font-black tracking-widest uppercase">REVOKED</h2>
                    <p className="text-xs font-semibold mt-1">{certificate.revocationReason || 'Invalidated'}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
