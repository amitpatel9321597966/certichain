import React, { useState } from 'react';
import { Award, CheckCircle2 } from 'lucide-react';
import { blockchainService } from '../services/blockchain';
import CertificateTemplate from './CertificateTemplate';

export default function IssueCertificate({ onCertificateIssued }) {
  const [formData, setFormData] = useState({
    recipientName: '',
    studentId: '',
    courseName: 'Bachelor of Technology in Computer Science & Engineering',
    grade: 'First Class with Distinction',
    issueDate: new Date().toISOString().split('T')[0],
    issuerName: 'Delhi Technological University'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [issuedCert, setIssuedCert] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFillSample = () => {
    setFormData({
      recipientName: 'Sneha Patel',
      studentId: '2022CS145',
      courseName: 'Bachelor of Technology in Computer Science & Engineering',
      grade: 'First Class with Distinction (9.1 CGPA)',
      issueDate: new Date().toISOString().split('T')[0],
      issuerName: 'Delhi Technological University'
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.recipientName.trim() || !formData.courseName.trim()) {
      alert('Please fill in Student Name and Degree/Course.');
      return;
    }

    setIsSubmitting(true);
    setIssuedCert(null);

    try {
      await new Promise(r => setTimeout(r, 600));
      const cert = await blockchainService.issueCertificate(formData);
      setIssuedCert(cert);
      if (onCertificateIssued) {
        onCertificateIssued(cert);
      }
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-4 sm:space-y-6 px-1 sm:px-0">
      {/* Title */}
      <div className="text-center space-y-1.5 sm:space-y-2">
        <h1 className="text-xl sm:text-3xl font-bold text-slate-900">
          Issue New Academic Certificate
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto">
          Authorized university registrar portal to record graduate degrees onto the blockchain.
        </p>
      </div>

      {/* Issuance Form */}
      <div className="p-4 sm:p-6 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4 sm:space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <span className="text-xs sm:text-sm font-bold text-slate-800">Student & Degree Information</span>
          <button
            type="button"
            onClick={handleFillSample}
            className="text-xs text-blue-700 hover:text-blue-800 font-semibold underline"
          >
            Auto-Fill Sample
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 sm:space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Student Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="recipientName"
                value={formData.recipientName}
                onChange={handleChange}
                placeholder="e.g. Rahul Sharma"
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-700"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Roll Number / Enrollment No.
              </label>
              <input
                type="text"
                name="studentId"
                value={formData.studentId}
                onChange={handleChange}
                placeholder="e.g. 2022CS101"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 font-mono focus:bg-white focus:outline-none focus:border-blue-700"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Degree / Program Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="courseName"
              value={formData.courseName}
              onChange={handleChange}
              placeholder="e.g. Bachelor of Technology in Computer Science & Engineering"
              required
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-700"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Division / Grade
              </label>
              <input
                type="text"
                name="grade"
                value={formData.grade}
                onChange={handleChange}
                placeholder="e.g. First Class with Distinction"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-700"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Date of Issue
              </label>
              <input
                type="date"
                name="issueDate"
                value={formData.issueDate}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-700"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                University Name
              </label>
              <input
                type="text"
                name="issuerName"
                value={formData.issuerName}
                onChange={handleChange}
                placeholder="e.g. Delhi Technological University"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-700"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !formData.recipientName.trim()}
            className="w-full py-3 bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs rounded-xl shadow-xs transition disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
          >
            {isSubmitting ? 'Calculating Hash & Minting to Blockchain...' : 'Generate Certificate & Record on Blockchain'}
          </button>
        </form>
      </div>

      {/* Success Banner & Preview */}
      {issuedCert && (
        <div className="p-4 sm:p-5 bg-emerald-50 border border-emerald-300 rounded-2xl space-y-3 sm:space-y-4 animate-fadeIn">
          <div className="flex items-center gap-2 text-emerald-900">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <h3 className="text-xs sm:text-sm font-bold">
              Certificate Successfully Issued & Sealed on Blockchain!
            </h3>
          </div>
          <p className="text-xs text-emerald-800">
            Certificate ID: <span className="font-mono font-bold text-slate-900">{issuedCert.id}</span> | Mined in Block #{issuedCert.blockNumber}
          </p>

          <div className="pt-2">
            <CertificateTemplate certificate={issuedCert} />
          </div>
        </div>
      )}
    </div>
  );
}
