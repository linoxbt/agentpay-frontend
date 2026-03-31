import { useAccount, useReadContract } from 'wagmi';
import { formatUnits } from 'viem';
import { USDC_TOKEN } from '@/lib/wagmi';

const USDC_ABI = [
  {
    constant: true,
    inputs: [{ name: '_owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: 'balance', type: 'uint256' }],
    type: 'function',
  },
] as const;

export function useUSDCBalance() {
  const { address, isConnected } = useAccount();

  const { data: balance, isLoading, error, refetch } = useReadContract({
    address: USDC_TOKEN.address,
    abi: USDC_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: isConnected && !!address,
    },
  });

  const formattedBalance = balance && typeof balance === 'bigint' ? formatUnits(balance, USDC_TOKEN.decimals) : '0';

  return {
    balance: formattedBalance,
    rawBalance: balance,
    isLoading,
    error,
    refetch,
    isConnected,
    address,
  };
}
