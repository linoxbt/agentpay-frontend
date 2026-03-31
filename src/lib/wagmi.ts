import { createConfig, http } from 'wagmi';
import { baseSepolia } from 'wagmi/chains';
import { injected } from 'wagmi/connectors';
import { getDefaultConfig } from '@rainbow-me/rainbowkit';

// Kite Network Configuration
export const kiteNetwork = {
  id: 2368,
  name: 'Kite AI',
  nativeCurrency: {
    name: 'KITE',
    symbol: 'KITE',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.kiteai.network'],
    },
    public: {
      http: ['https://rpc.kiteai.network'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Kite Explorer',
      url: 'https://explorer.kiteai.network',
    },
  },
  testnet: false,
} as const;

// RainbowKit + Wagmi Config
export const rainbowConfig = getDefaultConfig({
  appName: 'AgentPay - AI Agent Marketplace',
  projectId: 'agentpay-marketplace-123', // WalletConnect project ID
  chains: [baseSepolia, kiteNetwork],
  transports: {
    [baseSepolia.id]: http('https://sepolia.base.org'),
    [kiteNetwork.id]: http('https://rpc.kiteai.network'),
  },
});

// Legacy wagmi config for compatibility
export const wagmiConfig = createConfig({
  chains: [baseSepolia, kiteNetwork],
  connectors: [
    injected({ target: 'metaMask' }),
  ],
  transports: {
    [baseSepolia.id]: http('https://sepolia.base.org'),
    [kiteNetwork.id]: http('https://rpc.kiteai.network'),
  },
});

export const USDC_TOKEN = {
  address: '0x036CbD53842c5426634e7929541eC2318f3dCF7e' as const, // Base Sepolia USDC
  decimals: 6,
  symbol: 'USDC',
  name: 'USD Coin',
};

export const KITE_TOKEN = {
  address: '0x0000000000000000000000000000000000000000' as const, // Native KITE
  decimals: 18,
  symbol: 'KITE',
  name: 'KITE',
};

// Kite AI Attestation Contract
export const KITE_ATTESTATION_CONTRACT = {
  // Use environment variables or default to a mock deployment address
  address: (import.meta.env.VITE_KITE_ATTESTATION_CONTRACT || '0x1234567890123456789012345678901234567890') as `0x${string}`, 
  abi: [
    {
      inputs: [
        { name: 'agentDID', type: 'string' },
        { name: 'serviceId', type: 'string' },
        { name: 'amount', type: 'uint256' },
        { name: 'proof', type: 'bytes' },
      ],
      name: 'attestPayment',
      outputs: [{ name: 'attestationId', type: 'bytes32' }],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [{ name: 'attestationId', type: 'bytes32' }],
      name: 'getAttestation',
      outputs: [
        {
          components: [
            { name: 'agentDID', type: 'string' },
            { name: 'serviceId', type: 'string' },
            { name: 'amount', type: 'uint256' },
            { name: 'timestamp', type: 'uint256' },
            { name: 'blockNumber', type: 'uint256' },
            { name: 'proof', type: 'bytes' },
          ],
          name: '',
          type: 'tuple',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
  ] as const,
};

// x402 Payment Contract
export const X402_PAYMENT_CONTRACT = {
  // Use environment variables or default to a mock deployment address
  address: (import.meta.env.VITE_X402_PAYMENT_CONTRACT || '0xabcdef1234567890abcdef1234567890abcdef12') as `0x${string}`, 
  abi: [
    {
      inputs: [
        { name: 'serviceId', type: 'string' },
        { name: 'amount', type: 'uint256' },
        { name: 'signature', type: 'bytes' },
      ],
      name: 'pay',
      outputs: [{ name: 'success', type: 'bool' }],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [{ name: 'serviceId', type: 'string' }],
      name: 'getPrice',
      outputs: [{ name: 'price', type: 'uint256' }],
      stateMutability: 'view',
      type: 'function',
    },
  ] as const,
};
