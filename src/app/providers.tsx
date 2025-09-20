'use client';

import '@rainbow-me/rainbowkit/styles.css';
import {
  getDefaultConfig,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';

import {
  QueryClientProvider,
  QueryClient,
} from "@tanstack/react-query";

// Polygon Testnet configuration
const PolygonTestnet = {
  id: 845320009,
  name: 'Polygon Testnet',
  network: 'Polygon-testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'ETH',
    symbol: 'ETH',
  },
  rpcUrls: {
    public: { http: ['https://Polygon-rpc-testnet.appchain.base.org'] },
    default: { http: ['https://Polygon-rpc-testnet.appchain.base.org'] },
  },
  blockExplorers: {
    default: { name: 'Polygon Explorer', url: 'https://Polygon-explorer-testnet.appchain.base.org/' },
  },
  testnet: true,
} as const;

const config = getDefaultConfig({
  appName: 'Private Send - Polygon',
  projectId: 'c4f79cc821944d9680842e34466bfbd9', // Using a demo project ID - replace with your own
  chains: [PolygonTestnet],
  ssr: true,
});

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          locale="en-US"
          initialChain={PolygonTestnet}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

// Default export for dynamic imports
export default Providers; 