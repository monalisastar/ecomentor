import { ethers } from "hardhat";

async function main() {
  console.log("Deploying CertificateNFT...");

  const CertificateNFT = await ethers.getContractFactory("CertificateNFT");
  const certificate = await CertificateNFT.deploy("CertificateNFT", "CERT");
  await certificate.deployed();

  console.log("CertificateNFT deployed to:", certificate.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
