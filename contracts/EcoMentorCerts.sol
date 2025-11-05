// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title EcoMentorCerts
 * @notice Soulbound ERC-721 certificates for verified Eco-Mentor students.
 */
contract EcoMentorCerts is ERC721, Ownable {
    uint256 public nextTokenId = 1;

    mapping(uint256 => string) private _certificateURIs;

    event CertificateMinted(address indexed to, uint256 tokenId, string uri);
    event CertificateRevoked(uint256 indexed tokenId);

    constructor() ERC721("EcoMentor Certificate", "ECOCERT") Ownable(msg.sender) {}

    function mintCertificate(address student, string memory uri)
        external
        onlyOwner
    {
        uint256 tokenId = nextTokenId++;
        _safeMint(student, tokenId);
        _certificateURIs[tokenId] = uri;
        emit CertificateMinted(student, tokenId, uri);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override
        returns (string memory)
    {
        require(_existsInternal(tokenId), "Certificate does not exist");
        return _certificateURIs[tokenId];
    }

    function _existsInternal(uint256 tokenId) internal view returns (bool) {
        return _ownerOf(tokenId) != address(0);
    }

    // ⚡ Updated to new OZ 5.x lifecycle hook `_update`
    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override returns (address) {
        address from = _ownerOf(tokenId);

        if (from != address(0) && to != address(0)) {
            revert("Soulbound: Certificates cannot be transferred");
        }

        return super._update(to, tokenId, auth);
    }

    function revokeCertificate(uint256 tokenId) external onlyOwner {
        require(_existsInternal(tokenId), "Certificate does not exist");
        _burn(tokenId);
        emit CertificateRevoked(tokenId);
    }

    function verifyCertificate(uint256 tokenId, address holder)
        external
        view
        returns (bool)
    {
        return _existsInternal(tokenId) && ownerOf(tokenId) == holder;
    }
}
