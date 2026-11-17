import { sha256, computeCertificateHash, generateTxHash } from '../utils/crypto';

const STORAGE_KEY = 'simple_blockchain_certificates_v3';

// Realistic sample certificates pre-loaded on blockchain
const DEFAULT_CERTIFICATES = [
  {
    id: 'CERT-2026-004',
    recipientName: 'Amit Patel',
    studentId: '2022CS088',
    courseName: 'Bachelor of Technology in Computer Science & Engineering',
    grade: 'First Class with Distinction (9.2 CGPA)',
    issueDate: '2026-06-15',
    issuerName: 'Delhi Technological University',
    signatoryName: 'Prof. Prateek Saxena',
    signatoryTitle: 'Controller of Examinations',
    status: 'VALID',
    revocationReason: '',
    blockNumber: 104,
    txHash: '0x88f12a7bf309ef3214da8892bc510aa27f88410b01c38e653896504aef72c810',
    timestamp: 1781520000000,
  },
  {
    id: 'CERT-2026-001',
    recipientName: 'Rahul Sharma',
    studentId: '2022CS101',
    courseName: 'Bachelor of Technology in Computer Science & Engineering',
    grade: 'First Class with Distinction (8.9 CGPA)',
    issueDate: '2026-06-15',
    issuerName: 'Delhi Technological University',
    signatoryName: 'Prof. Prateek Saxena',
    signatoryTitle: 'Controller of Examinations',
    status: 'VALID',
    revocationReason: '',
    blockNumber: 101,
    txHash: '0x4f82a19b6e820c7410eb7192ba8491c0e816a73592bc1940ef82149b01cd7a21',
    timestamp: 1781516400000,
  },
  {
    id: 'CERT-2026-002',
    recipientName: 'Ananya Verma',
    studentId: '2022IT204',
    courseName: 'Bachelor of Technology in Information Technology',
    grade: 'First Class (8.4 CGPA)',
    issueDate: '2026-06-15',
    issuerName: 'Delhi Technological University',
    signatoryName: 'Prof. Prateek Saxena',
    signatoryTitle: 'Controller of Examinations',
    status: 'VALID',
    revocationReason: '',
    blockNumber: 102,
    txHash: '0x9b12c841ae09184b2c991a03fc847192a01948bc7210e3958af10294bcda8190',
    timestamp: 1781518000000,
  },
  {
    id: 'CERT-2025-099',
    recipientName: 'Vikas Kumar',
    studentId: '2021ME315',
    courseName: 'Bachelor of Technology in Mechanical Engineering',
    grade: 'Second Class (Revoked)',
    issueDate: '2025-07-10',
    issuerName: 'Delhi Technological University',
    signatoryName: 'Prof. Prateek Saxena',
    signatoryTitle: 'Controller of Examinations',
    status: 'REVOKED',
    revocationReason: 'Original degree invalidated due to submission of forged 12th marksheet during admission audit.',
    blockNumber: 99,
    txHash: '0x7e81042a9b3c1048ba1920ce9104fa2819401cb891048f72a9103847fed29a41',
    timestamp: 1752140400000,
  }
];

class BlockchainService {
  constructor() {
    this.certificates = [];
    this.initialized = false;
  }

  async init() {
    if (this.initialized) return;

    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        this.certificates = JSON.parse(saved);
        this.initialized = true;
        return;
      } catch (e) {
        console.warn('Resetting storage', e);
      }
    }

    // Set defaults with real calculated hashes
    this.certificates = [];
    for (const cert of DEFAULT_CERTIFICATES) {
      const certHash = await computeCertificateHash(cert);
      this.certificates.push({ ...cert, certHash });
    }
    this.save();
    this.initialized = true;
  }

  save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.certificates));
  }

  async issueCertificate(data) {
    await this.init();

    const certId = data.id?.trim() || `CERT-2026-${String(this.certificates.length + 1).padStart(3, '0')}`;
    
    // Check if ID already exists
    if (this.certificates.some(c => c.id.toLowerCase() === certId.toLowerCase())) {
      throw new Error(`Certificate with ID ${certId} already exists on the blockchain.`);
    }

    const newCert = {
      id: certId,
      recipientName: data.recipientName.trim(),
      studentId: data.studentId?.trim() || 'N/A',
      courseName: data.courseName.trim(),
      grade: data.grade?.trim() || 'Passed',
      issueDate: data.issueDate || new Date().toISOString().split('T')[0],
      issuerName: data.issuerName?.trim() || 'Delhi Technological University',
      signatoryName: 'Prof. Prateek Saxena',
      signatoryTitle: 'Controller of Examinations',
      status: 'VALID',
      revocationReason: '',
      blockNumber: 100 + this.certificates.length + 1,
      timestamp: Date.now()
    };

    // Calculate SHA-256 hash of data
    const certHash = await computeCertificateHash(newCert);
    newCert.certHash = certHash;

    // Generate blockchain transaction hash
    const txHash = await generateTxHash(newCert.blockNumber, certHash, newCert.timestamp);
    newCert.txHash = txHash;

    this.certificates.unshift(newCert);
    this.save();

    return newCert;
  }

  async verifyCertificate(certId) {
    await this.init();
    if (!certId || !certId.trim()) {
      return { found: false, message: 'Please enter a Certificate ID' };
    }

    const cleanId = certId.trim().toUpperCase();
    const cert = this.certificates.find(c => c.id.toUpperCase() === cleanId);

    if (!cert) {
      return {
        found: false,
        message: `No certificate found with ID "${cleanId}". This certificate was never recorded on the blockchain.`
      };
    }

    // Check if data was tampered by recomputing hash
    const recomputed = await computeCertificateHash(cert);
    if (recomputed !== cert.certHash) {
      return {
        found: true,
        tampered: true,
        cert,
        message: 'ALERT: Certificate data does not match the blockchain hash. Document has been modified!'
      };
    }

    if (cert.status === 'REVOKED') {
      return {
        found: true,
        revoked: true,
        cert,
        message: `This certificate was officially REVOKED by ${cert.issuerName}. Reason: ${cert.revocationReason}`
      };
    }

    return {
      found: true,
      valid: true,
      cert,
      message: 'Certificate is 100% Genuine & Verified on Blockchain.'
    };
  }

  async getAllCertificates() {
    await this.init();
    return [...this.certificates];
  }

  async resetToDefaults() {
    localStorage.removeItem(STORAGE_KEY);
    this.initialized = false;
    await this.init();
    return true;
  }
}

export const blockchainService = new BlockchainService();
