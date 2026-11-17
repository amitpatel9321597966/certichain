/**
 * Cryptographic Utility for Blockchain Certificate Verification
 * Utilizes Web Crypto API SHA-256 for deterministic hashing and tamper detection.
 */

export async function sha256(message) {
  // Encode message as UTF-8
  const msgBuffer = new TextEncoder().encode(message);
  // Hash the message with SHA-256
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  // Convert ArrayBuffer to Array
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  // Convert bytes to hex string
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return '0x' + hashHex;
}

/**
 * Creates canonical string representation of certificate payload to hash
 */
export function getCanonicalCertificateString(cert) {
  return [
    cert.id?.trim() || '',
    cert.recipientName?.trim().toLowerCase() || '',
    cert.studentId?.trim().toLowerCase() || '',
    cert.courseName?.trim().toLowerCase() || '',
    cert.grade?.trim().toLowerCase() || '',
    cert.issueDate || '',
    cert.issuerName?.trim().toLowerCase() || ''
  ].join('|');
}

/**
 * Generate standard certificate SHA-256 hash
 */
export async function computeCertificateHash(cert) {
  const canonical = getCanonicalCertificateString(cert);
  return await sha256(canonical);
}

/**
 * Generate an authentic-looking Ethereum-style address from string seed or random
 */
export function generateEthAddress(seed = '') {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  const randomSuffix = Math.random().toString(16).substring(2, 34);
  return ('0x' + hex + randomSuffix).slice(0, 42);
}

/**
 * Generate realistic block transaction hash
 */
export async function generateTxHash(blockIndex, certHash, timestamp) {
  const payload = `TX|BLOCK:${blockIndex}|HASH:${certHash}|TS:${timestamp}`;
  return await sha256(payload);
}

/**
 * Shorten hash or address for display: 0x1234...5678
 */
export function truncateHash(hash, start = 6, end = 4) {
  if (!hash) return '';
  if (hash.length <= start + end) return hash;
  return `${hash.slice(0, start)}...${hash.slice(-end)}`;
}
