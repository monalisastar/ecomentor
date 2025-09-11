require("dotenv").config();
require("@nomicfoundation/hardhat-toolbox");
// require("@nomicfoundation/hardhat-verify"); // <-- comment this out


/**
 * @type {import('hardhat/config').HardhatUserConfig & { etherscan?: any }}
 */
const config = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {},
    polygon: {
      url: process.env.POLYGON_AMOY_RPC_URL || "",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 137,
    },
  },
  solidity: {
    version: "0.8.21",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  etherscan: {
    apiKey: process.env.POLYGONSCAN_API_KEY || "",
  },
};

module.exports = config;
