// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title CertificateNFT
/// @notice NFT-based certificates for course completion
contract CertificateNFT is ERC721URIStorage, Ownable {
    uint256 public tokenCounter;

    /// @notice Initialize the NFT contract
    constructor() ERC721("CourseCertificate", "CERT") {
        tokenCounter = 0;
    }

    /// @notice Mint a new certificate NFT to a learner
    /// @param recipient The address of the learner
    /// @param tokenURI URI of certificate metadata (IPFS link recommended)
    function issueCertificate(address recipient, string memory tokenURI) external onlyOwner returns (uint256) {
        uint256 newTokenId = tokenCounter;
        _safeMint(recipient, newTokenId);
        _setTokenURI(newTokenId, tokenURI);
        tokenCounter++;
        return newTokenId;
    }

    /// @notice Verify if a user owns a certificate NFT
    /// @param tokenId The certificate NFT token ID
    /// @param user The address of the user to verify
    /// @return True if the user owns this certificate
    function verifyCertificate(uint256 tokenId, address user) external view returns (bool) {
        return ownerOf(tokenId) == user;
    }
}
