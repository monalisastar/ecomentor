const hre = require("hardhat");

async function main() {
  const EcoMentorCerts = await hre.ethers.getContractFactory("EcoMentorCerts");
  const contract = await EcoMentorCerts.deploy();
  await contract.waitForDeployment();

  console.log("✅ EcoMentorCerts deployed to:", await contract.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
