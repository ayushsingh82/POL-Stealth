import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: "0.8.28",
  networks: {
    horizenTestnet: {
      url: "https://horizen-rpc-testnet.appchain.base.org",
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
      horizenTestnet: "not-needed", // Horizen doesn't have Etherscan
    },
    customChains: [
      {
        network: "horizenTestnet",
        chainId: 845320009,
        urls: {
          apiURL: "https://horizen-explorer-testnet.appchain.base.org/api",
          browserURL: "https://horizen-explorer-testnet.appchain.base.org"
        }
      }
    ]
  }
};

export default config;



