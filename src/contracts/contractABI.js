export const CONTRACT_ADDRESS = "0x89D2c5942468d6175127027B8855FBE54F65a882";

export const CONTRACT_ABI = [
  "event CertificateIssued(string indexed id, bytes32 indexed certHash, string recipientName, address indexed issuer, uint256 timestamp)",
  "event CertificateRevoked(string indexed id, string reason, address indexed revokedBy, uint256 timestamp)",
  "event IssuerAuthorized(address indexed issuer, string name)",
  "event IssuerRevoked(address indexed issuer)",
  "function authorizeIssuer(address _issuer, string calldata _name) external",
  "function revokeIssuer(address _issuer) external",
  "function issueCertificate(string calldata _id, bytes32 _certHash, string calldata _recipientName, string calldata _studentId, string calldata _courseName, string calldata _grade, uint256 _issueDate, string calldata _ipfsHash) external",
  "function revokeCertificate(string calldata _id, string calldata _reason) external",
  "function verifyCertificate(string calldata _id) external view returns (tuple(string id, bytes32 certHash, string recipientName, string studentId, string courseName, string grade, uint256 issueDate, address issuerAddress, string issuerName, bool isRevoked, string revocationReason, string ipfsHash, uint256 blockNumber))",
  "function verifyByHash(bytes32 _certHash) external view returns (tuple(string id, bytes32 certHash, string recipientName, string studentId, string courseName, string grade, uint256 issueDate, address issuerAddress, string issuerName, bool isRevoked, string revocationReason, string ipfsHash, uint256 blockNumber))",
  "function getTotalCertificates() external view returns (uint256)",
  "function owner() external view returns (address)",
  "function authorizedIssuers(address) external view returns (bool)",
  "function issuerNames(address) external view returns (string)"
];
