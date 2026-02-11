// hardhat.config.js
// Configures Hardhat for compiling & deploying Solidity contracts to Celo Alfajores testnet

require("dotenv").config();
require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  // Solidity compiler version — all our contracts will use 0.8.20
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },

  // Network configurations
  networks: {
    // Local Hardhat network (for testing)
    hardhat: {},

    // Celo Alfajores Testnet (for deployment)
    alfajores: {
      url: process.env.CELO_ALFAJORES_RPC || "https://alfajores-forno.celo-testnet.org",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 44787,
    },
  },

  // Where Hardhat looks for contract source files
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};
