import { defineChain } from 'viem'

/**
 * Base mainnet chain config without importing the `viem/chains` barrel
 * (avoids webpack "Critical dependency" from optional tempo/ox paths).
 */
export const base = defineChain({
  id: 8453,
  name: 'Base',
  nativeCurrency: { decimals: 18, name: 'Ether', symbol: 'ETH' },
  rpcUrls: {
    default: { http: ['https://mainnet.base.org'] },
  },
  blockExplorers: {
    default: { name: 'Basescan', url: 'https://basescan.org' },
  },
})
