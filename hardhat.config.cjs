require("dotenv").config();
require("@nomicfoundation/hardhat-toolbox");

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
const config = {
  defaultNetwork: "hardhat",

  networks: {
    hardhat: {},
    polygon: {
      url: process.env.POLYGON_AMOY_RPC_URL || "",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 80002, // ✅ Amoy testnet
    },
  },

  solidity: {
    version: "0.8.21",
    settings: {
      optimizer: { enabled: true, runs: 200 },
    },
  },

  etherscan: {
    apiKey: process.env.POLYGONSCAN_API_KEY || "",
  },

  // ✅ Add Sourcify *inside* config
  sourcify: {
    enabled: true,
  },
};

module.exports = config;
