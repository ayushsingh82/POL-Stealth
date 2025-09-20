// Import ABIs from the main ABI file
import { TokenTransferAbi, ERC20Abi } from '../abi';

// Contract configuration for TokenTransfer
export const contractConfig = {
  address: "0xf12F7584143D17169905D7954D3DEab8942a310d", // Replace with deployed contract address
  abi: TokenTransferAbi,
} as const;

// ERC20 Token configuration
export const erc20Config = {
  abi: ERC20Abi,
} as const;

// Polygon testnet configuration
export const PolygonConfig = {
  chainId: 845320009,
  name: "Polygon Testnet",
  network: "Polygon-testnet",
  nativeCurrency: {
    decimals: 18,
    name: "ETH",
    symbol: "ETH",
  },
  rpcUrls: {
    public: { http: ["https://Polygon-rpc-testnet.appchain.base.org"] },
    default: { http: ["https://Polygon-rpc-testnet.appchain.base.org"] },
  },
  blockExplorers: {
    default: { 
      name: "Polygon Explorer", 
      url: "https://Polygon-explorer-testnet.appchain.base.org/" 
    },
  },
  testnet: true,
} as const; 