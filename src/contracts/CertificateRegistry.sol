// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title CertificateRegistry
 * @dev Immutable on-chain registry for issuing, verifying, and revoking academic/professional credentials.
 * Developed for Blockchain-Based Certificate Verification System.
 */
contract CertificateRegistry {
    // Contract Owner (e.g., Higher Education Board / Ministry / System Admin)
    address public owner;

    // Authorized University / Institutional Issuers
    mapping(address => bool) public authorizedIssuers;
    mapping(address => string) public issuerNames;

    // Certificate record struct
    struct Certificate {
        string id;                  // Unique Certificate ID (e.g., CERT-2026-CS-101)
        bytes32 certHash;           // SHA-256 / Keccak-256 hash of certificate payload
        string recipientName;       // Student / Recipient full name
        string studentId;           // Roll Number / Registration ID
        string courseName;          // Degree / Certificate program
        string grade;               // Grade / GPA / Distinction
        uint256 issueDate;          // Unix timestamp
        address issuerAddress;      // Ethereum address of issuing institute
        string issuerName;          // Official Institute name
        bool isRevoked;             // Revocation flag
        string revocationReason;    // Reason if revoked (fraud, clerical error, etc.)
        string ipfsHash;            // Decentralized IPFS storage CID (optional)
        uint256 blockNumber;        // Minted block number
    }

    // Mapping from Certificate ID to Certificate details
    mapping(string => Certificate) private certificates;
    
    // Mapping from Certificate Hash to Certificate ID (for O(1) hash verification)
    mapping(bytes32 => string) private hashToCertId;

    // Array of all issued Certificate IDs
    string[] public certificateIds;

    // Events for real-time indexing & dApp event listeners
    event CertificateIssued(
        string indexed id,
        bytes32 indexed certHash,
        string recipientName,
        address indexed issuer,
        uint256 timestamp
    );

    event CertificateRevoked(
        string indexed id,
        string reason,
        address indexed revokedBy,
        uint256 timestamp
    );

    event IssuerAuthorized(address indexed issuer, string name);
    event IssuerRevoked(address indexed issuer);

    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    modifier onlyAuthorizedIssuer() {
        require(
            authorizedIssuers[msg.sender] || msg.sender == owner,
            "Caller is not an authorized certificate issuer"
        );
        _;
    }

    constructor() {
        owner = msg.sender;
        authorizedIssuers[msg.sender] = true;
        issuerNames[msg.sender] = "Genesis Certification Authority";
        emit IssuerAuthorized(msg.sender, "Genesis Certification Authority");
    }

    /**
     * @dev Authorize an educational institute to issue certificates
     */
    function authorizeIssuer(address _issuer, string calldata _name) external onlyOwner {
        require(_issuer != address(0), "Invalid address");
        authorizedIssuers[_issuer] = true;
        issuerNames[_issuer] = _name;
        emit IssuerAuthorized(_issuer, _name);
    }

    /**
     * @dev Revoke institution's issuing privileges
     */
    function revokeIssuer(address _issuer) external onlyOwner {
        authorizedIssuers[_issuer] = false;
        emit IssuerRevoked(_issuer);
    }

    /**
     * @dev Issue a new tamper-proof certificate on the blockchain
     */
    function issueCertificate(
        string calldata _id,
        bytes32 _certHash,
        string calldata _recipientName,
        string calldata _studentId,
        string calldata _courseName,
        string calldata _grade,
        uint256 _issueDate,
        string calldata _ipfsHash
    ) external onlyAuthorizedIssuer {
        require(bytes(_id).length > 0, "Certificate ID cannot be empty");
        require(certificates[_id].certHash == bytes32(0), "Certificate ID already exists");
        require(bytes(hashToCertId[_certHash]).length == 0, "Certificate Hash already registered");

        string memory instName = issuerNames[msg.sender];
        if (bytes(instName).length == 0) {
            instName = "Authorized University / Institute";
        }

        certificates[_id] = Certificate({
            id: _id,
            certHash: _certHash,
            recipientName: _recipientName,
            studentId: _studentId,
            courseName: _courseName,
            grade: _grade,
            issueDate: _issueDate,
            issuerAddress: msg.sender,
            issuerName: instName,
            isRevoked: false,
            revocationReason: "",
            ipfsHash: _ipfsHash,
            blockNumber: block.number
        });

        hashToCertId[_certHash] = _id;
        certificateIds.push(_id);

        emit CertificateIssued(_id, _certHash, _recipientName, msg.sender, block.timestamp);
    }

    /**
     * @dev Revoke a certificate in case of malpractice or error
     */
    function revokeCertificate(string calldata _id, string calldata _reason) external onlyAuthorizedIssuer {
        require(certificates[_id].certHash != bytes32(0), "Certificate does not exist");
        require(!certificates[_id].isRevoked, "Certificate is already revoked");

        // Only original issuer or contract owner can revoke
        require(
            certificates[_id].issuerAddress == msg.sender || msg.sender == owner,
            "Only original issuer can revoke this certificate"
        );

        certificates[_id].isRevoked = true;
        certificates[_id].revocationReason = _reason;

        emit CertificateRevoked(_id, _reason, msg.sender, block.timestamp);
    }

    /**
     * @dev Public verification function: Retrieve certificate by ID
     */
    function verifyCertificate(string calldata _id) external view returns (Certificate memory) {
        require(certificates[_id].certHash != bytes32(0), "Certificate not found on blockchain");
        return certificates[_id];
    }

    /**
     * @dev Public verification function: Retrieve certificate by cryptographic Hash
     */
    function verifyByHash(bytes32 _certHash) external view returns (Certificate memory) {
        string memory certId = hashToCertId[_certHash];
        require(bytes(certId).length > 0, "Cryptographic hash not found on blockchain ledger");
        return certificates[certId];
    }

    /**
     * @dev Total count of certificates issued
     */
    function getTotalCertificates() external view returns (uint256) {
        return certificateIds.length;
    }
}
