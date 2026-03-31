import { useCallback, useState } from 'react';
import { 
  useWriteContract, 
  useWaitForTransactionReceipt,
  useAccount,
  useChainId,
  useSwitchChain,
} from 'wagmi';
import { parseUnits } from 'viem';
import { USDC_CONTRACT } from '@/types';
import { baseSepolia } from 'wagmi/chains';
import { kiteNetwork, X402_PAYMENT_CONTRACT, KITE_ATTESTATION_CONTRACT } from '@/lib/wagmi';
import type { Service, KiteAttestation } from '@/types';

// ERC20 ABI for USDC transfers and approvals
const ERC20_ABI = [
  {
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'value', type: 'uint256' },
    ],
    name: 'transfer',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    name: 'allowance',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'value', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

interface PaymentStatus {
  step: 'idle' | 'switching_network' | 'approving' | 'transferring' | 'attesting' | 'confirmed' | 'error';
  txHash?: string;
  attestationTxHash?: string;
  error?: string;
}

export function useRealPayment() {
  const { address } = useAccount();
  const chainId = useChainId();
  const { switchChainAsync } = useSwitchChain();
  
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>({ step: 'idle' });

  // USDC Transfer / Approve
  const { 
    writeContractAsync: writeTransferAsync, 
    data: transferHash,
    error: transferError,
    isPending: isTransferPending,
  } = useWriteContract();

  // Wait for transfer confirmation
  const { 
    isLoading: isTransferConfirming, 
    isSuccess: isTransferConfirmed,
    data: transferReceipt,
  } = useWaitForTransactionReceipt({
    hash: transferHash,
  });

  // Kite Attestation
  const {
    writeContractAsync: writeAttestationAsync,
    data: attestationHash,
    error: attestationError,
    isPending: isAttestationPending,
  } = useWriteContract();

  // Wait for attestation confirmation
  const {
    isLoading: isAttestationConfirming,
    isSuccess: isAttestationConfirmed,
    data: attestationReceipt,
  } = useWaitForTransactionReceipt({
    hash: attestationHash,
  });

  const handleWalletError = (error: unknown): string => {
    const err = error as Error;
    if (err.message?.includes('User rejected') || err.message?.includes('4001')) {
      return 'Transaction rejected by user.';
    }
    return err.message || 'An unknown error occurred';
  };

  const executePayment = useCallback(async (
    service: Service,
    _agentDID: string
  ): Promise<{ success: boolean; txHash?: string; error?: string }> => {
    if (!address) {
      return { success: false, error: 'Wallet not connected' };
    }

    try {
      // 1. Network Switching to Base Sepolia
      if (chainId !== baseSepolia.id) {
        setPaymentStatus({ step: 'switching_network' });
        if (switchChainAsync) {
          await switchChainAsync({ chainId: baseSepolia.id });
        } else {
          throw new Error('Please switch your wallet to Base Sepolia manually.');
        }
      }

      setPaymentStatus({ step: 'approving' });

      // Convert price to USDC units (6 decimals)
      const amount = parseUnits(service.price, USDC_CONTRACT.decimals);

      // 2. Approve the X402 Contract to spend USDC
      // For this demo, we simulate the approve+pay UX using a direct transfer.
      // In production you would do an `approve` then await, followed by `pay`.
      setPaymentStatus({ step: 'transferring' });
      
      const newTransferHash = await writeTransferAsync({
        address: USDC_CONTRACT.address,
        abi: ERC20_ABI,
        functionName: 'transfer',
        // Example: Transfer directly to X402_PAYMENT_CONTRACT.address for escrow processing.
        args: [X402_PAYMENT_CONTRACT.address, amount],
      });

      // Transaction submitted successfully
      setPaymentStatus({ step: 'confirmed', txHash: newTransferHash });
      return { success: true, txHash: newTransferHash };

    } catch (error) {
      const errorMessage = handleWalletError(error);
      setPaymentStatus({ step: 'error', error: errorMessage });
      return { success: false, error: errorMessage };
    }
  }, [address, chainId, switchChainAsync, writeTransferAsync]);

  const executeAttestation = useCallback(async (
    service: Service,
    _agentDID: string,
    paymentTxHash: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (!address) {
      return { success: false, error: 'Wallet not connected' };
    }

    try {
      // 1. Network Switching to Kite AI Network
      if (chainId !== kiteNetwork.id) {
        setPaymentStatus({ step: 'switching_network' });
        if (switchChainAsync) {
          await switchChainAsync({ chainId: kiteNetwork.id });
        } else {
          throw new Error('Please switch your wallet to Kite AI Network manually.');
        }
      }

      setPaymentStatus({ step: 'attesting' });

      // Generate proof from payment hash (production: this comes from backend endpoint)
      const mockProof = `0x${paymentTxHash.slice(2)}${Array(64 - paymentTxHash.length + 2).fill('0').join('')}` as `0x${string}`;

      // Execute Kite attestation using the contract
      const newAttestationHash = await writeAttestationAsync({
        address: KITE_ATTESTATION_CONTRACT.address,
        abi: KITE_ATTESTATION_CONTRACT.abi,
        functionName: 'attestPayment',
        args: [_agentDID, service.id, parseUnits(service.price, USDC_CONTRACT.decimals), mockProof],
      });

      setPaymentStatus({ step: 'confirmed', attestationTxHash: newAttestationHash });
      return { success: true };

    } catch (error) {
      const errorMessage = handleWalletError(error);
      setPaymentStatus({ step: 'error', error: errorMessage });
      return { success: false, error: errorMessage };
    }
  }, [address, chainId, switchChainAsync, writeAttestationAsync]);

  const resetPayment = useCallback(() => {
    setPaymentStatus({ step: 'idle' });
  }, []);

  // API Call simulation for async Attestation Generation
  const generateAttestation = useCallback(async (txHash: string, agentDID: string): Promise<KiteAttestation> => {
    // In production, you would fetch from the backend via: 
    // const res = await fetch(`/api/attestation/verify?tx=${txHash}`);
    // return res.json();
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          txHash,
          blockNumber: Number(transferReceipt?.blockNumber || Math.floor(Math.random() * 10000000) + 15000000),
          agentDID,
          timestamp: Date.now(),
          proof: `0x${Array(128).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`,
        });
      }, 1500); // simulate 1.5s latency from "indexer"
    });
  }, [transferReceipt]);

  return {
    paymentStatus,
    executePayment,
    executeAttestation,
    resetPayment,
    generateAttestation,
    // Transaction states
    transferHash,
    isTransferPending,
    isTransferConfirming,
    isTransferConfirmed,
    transferReceipt,
    transferError,
    attestationHash,
    isAttestationPending,
    isAttestationConfirming,
    isAttestationConfirmed,
    attestationReceipt,
    attestationError,
  };
}
