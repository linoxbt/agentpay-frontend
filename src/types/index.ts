// AgentPay - Type Definitions

export interface Service {
  id: string;
  name: string;
  description: string;
  price: string; // in USDC
  seller: string;
  sellerAddress: string;
  sellerReputation: number; // 0-5 stars
  category: ServiceCategory;
  tags: string[];
  icon: string;
  usageCount: number;
  createdAt: number;
  apiEndpoint: string;
  documentation: string;
}

export type ServiceCategory =
  | 'text-generation'
  | 'image-generation'
  | 'data-analysis'
  | 'code-assistance'
  | 'translation'
  | 'summarization';

export interface Agent {
  id: string;
  name: string;
  spendingLimit: string; // in USDC
  spentAmount: string; // in USDC
  sessionKey: string;
  createdAt: number;
  isActive: boolean;
  purchases: Purchase[];
}

export interface Purchase {
  id: string;
  serviceId: string;
  serviceName: string;
  amount: string;
  timestamp: number;
  status: 'pending' | 'completed' | 'failed';
  txHash?: string;
  attestation?: KiteAttestation;
}

export interface KiteAttestation {
  txHash: string;
  blockNumber: number;
  agentDID: string;
  timestamp: number;
  proof: string;
}

export interface X402Challenge {
  scheme: string;
  network: string;
  maxAmountRequired: string;
  resource: string;
  description: string;
  timestamp: number;
}

export interface X402PaymentPayload {
  signature: string;
  from: string;
  to: string;
  amount: string;
  nonce: number;
  timestamp: number;
}

export interface PaymentFlowState {
  step: 'idle' | 'challenge' | 'payment' | 'settlement' | 'attestation' | 'complete' | 'error';
  service?: Service;
  challenge?: X402Challenge;
  paymentPayload?: X402PaymentPayload;
  attestation?: KiteAttestation;
  txHash?: string;
  error?: string;
}

export interface FilterState {
  categories: ServiceCategory[];
  minPrice: string;
  maxPrice: string;
  minReputation: number;
}

export interface CreateServiceInput {
  name: string;
  description: string;
  price: string;
  category: ServiceCategory;
  tags: string[];
  apiEndpoint: string;
  documentation: string;
}

export const SERVICE_CATEGORIES: { value: ServiceCategory; label: string; icon: string }[] = [
  { value: 'text-generation', label: 'Text Generation', icon: '✍️' },
  { value: 'image-generation', label: 'Image Generation', icon: '🎨' },
  { value: 'data-analysis', label: 'Data Analysis', icon: '📊' },
  { value: 'code-assistance', label: 'Code Assistance', icon: '💻' },
  { value: 'translation', label: 'Translation', icon: '🌐' },
  { value: 'summarization', label: 'Summarization', icon: '📝' },
];

export const MOCK_SERVICES: Service[] = [
  {
    id: '1',
    name: 'GPT-4 Mini Writer',
    description: 'High-quality text generation for articles, emails, and creative writing. Optimized for speed and cost.',
    price: '0.001',
    seller: 'OpenAI Agents',
    sellerAddress: '0x1234567890123456789012345678901234567890',
    sellerReputation: 4.9,
    category: 'text-generation',
    tags: ['writing', 'creative', 'fast'],
    icon: '✍️',
    usageCount: 15420,
    createdAt: Date.now() - 86400000 * 30,
    apiEndpoint: '/api/v1/text/generate',
    documentation: '# GPT-4 Mini Writer API\n\n## Endpoint\nPOST /api/v1/text/generate\n\n## Parameters\n- prompt: string\n- maxTokens: number (optional)\n- temperature: number (optional)',
  },
  {
    id: '2',
    name: 'DALL-E Micro',
    description: 'Generate stunning images from text descriptions. Perfect for social media and marketing materials.',
    price: '0.005',
    seller: 'VisualAI Labs',
    sellerAddress: '0xabcdef1234567890abcdef1234567890abcdef12',
    sellerReputation: 4.7,
    category: 'image-generation',
    tags: ['images', 'art', 'marketing'],
    icon: '🎨',
    usageCount: 8930,
    createdAt: Date.now() - 86400000 * 45,
    apiEndpoint: '/api/v1/images/generate',
    documentation: '# DALL-E Micro API\n\n## Endpoint\nPOST /api/v1/images/generate\n\n## Parameters\n- prompt: string\n- size: "256x256" | "512x512" | "1024x1024"',
  },
  {
    id: '3',
    name: 'DataInsight Pro',
    description: 'Advanced data analysis and visualization. Upload CSV and get instant insights and charts.',
    price: '0.003',
    seller: 'AnalyticsDAO',
    sellerAddress: '0x9876543210987654321098765432109876543210',
    sellerReputation: 4.8,
    category: 'data-analysis',
    tags: ['analytics', 'charts', 'csv'],
    icon: '📊',
    usageCount: 6230,
    createdAt: Date.now() - 86400000 * 20,
    apiEndpoint: '/api/v1/data/analyze',
    documentation: '# DataInsight Pro API\n\n## Endpoint\nPOST /api/v1/data/analyze\n\n## Parameters\n- data: CSV string or JSON array\n- analysisType: "summary" | "correlation" | "trend"',
  },
  {
    id: '4',
    name: 'CodeCompanion',
    description: 'AI pair programmer that helps write, debug, and optimize code in any programming language.',
    price: '0.002',
    seller: 'DevTools Inc',
    sellerAddress: '0xfedcba0987654321fedcba0987654321fedcba09',
    sellerReputation: 4.6,
    category: 'code-assistance',
    tags: ['coding', 'debugging', 'programming'],
    icon: '💻',
    usageCount: 12100,
    createdAt: Date.now() - 86400000 * 60,
    apiEndpoint: '/api/v1/code/assist',
    documentation: '# CodeCompanion API\n\n## Endpoint\nPOST /api/v1/code/assist\n\n## Parameters\n- code: string\n- language: string\n- task: "explain" | "debug" | "optimize" | "generate"',
  },
  {
    id: '5',
    name: 'Polyglot Translator',
    description: 'Neural machine translation supporting 100+ languages with context-aware accuracy.',
    price: '0.001',
    seller: 'LinguaTech',
    sellerAddress: '0x1111111111111111111111111111111111111111',
    sellerReputation: 4.5,
    category: 'translation',
    tags: ['language', 'translate', 'global'],
    icon: '🌐',
    usageCount: 7800,
    createdAt: Date.now() - 86400000 * 15,
    apiEndpoint: '/api/v1/translate',
    documentation: '# Polyglot Translator API\n\n## Endpoint\nPOST /api/v1/translate\n\n## Parameters\n- text: string\n- sourceLang: string\n- targetLang: string',
  },
  {
    id: '6',
    name: 'TL;DR Summarizer',
    description: 'Instantly summarize long documents, articles, and reports into key bullet points.',
    price: '0.0015',
    seller: 'EfficiencyAI',
    sellerAddress: '0x2222222222222222222222222222222222222222',
    sellerReputation: 4.4,
    category: 'summarization',
    tags: ['summary', 'reading', 'productivity'],
    icon: '📝',
    usageCount: 9450,
    createdAt: Date.now() - 86400000 * 25,
    apiEndpoint: '/api/v1/summarize',
    documentation: '# TL;DR Summarizer API\n\n## Endpoint\nPOST /api/v1/summarize\n\n## Parameters\n- text: string\n- maxLength: number (optional)\n- format: "bullet" | "paragraph"',
  },
];

export const USDC_CONTRACT = {
  address: '0x036CbD53842c5426634e7929541eC2318f3dCF7e' as const, // Base Sepolia USDC
  decimals: 6,
  symbol: 'USDC',
};

export const BASE_SEPOLIA_CHAIN_ID = 84532;
