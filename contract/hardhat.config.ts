import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: "0.8.28",
  networks: {
    PolygonTestnet: {
      url: "https://Polygon-rpc-testnet.appchain.base.org",
      chainId: 845320009,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      gasPrice: 1000000000, // 1 gwei
      gas: 2100000,
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
    },
  },
  etherscan: {
    apiKey: {
      PolygonTestnet: "not-needed", // Polygon doesn't have Etherscan
    },
    customChains: [
      {
        network: "PolygonTestnet",
        chainId: 845320009,
        urls: {
          apiURL: "https://Polygon-explorer-testnet.appchain.base.org/api",
          browserURL: "https://Polygon-explorer-testnet.appchain.base.org"
        }
      }
    ]
  }
};

export default config;



