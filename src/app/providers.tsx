'use client';

import '@rainbow-me/rainbowkit/styles.css';
import {
  getDefaultConfig,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { polygonAmoy } from 'viem/chains';

import {
  QueryClientProvider,
  QueryClient,
} from "@tanstack/react-query";

// Polygon Testnet configuration
// const PolygonTestnet = {
//   id: 80002,
//   name: 'AMoy Testnet',
//   network: 'AMoy Testnet',
//   nativeCurrency: {
//     decimals: 18,
//     name: 'POL',
//       symbol: 'ETH',
//   },
//   rpcUrls: {
//     public: { http: ['rpc-amoy.polygon.technology'] },
//     default: { http: ['rpc-amoy.polygon.technology'] },
//   },
//   blockExplorers: {
//     default: { name: 'Polygon Explorer', url: 'amoy.polygonscan.com' },
//   },
//   testnet: true,
// } as const;

const config = getDefaultConfig({
  appName: 'Private Send - Polygon',
  projectId: 'c4f79cc821944d9680842e34466bfbd9', // Using a demo project ID - replace with your own
  chains: [ polygonAmoy],
  ssr: true,
});

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          locale="en-US"
          initialChain={polygonAmoy}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

// Default export for dynamic imports
export default Providers; 