import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Wallet, LogOut, Copy, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { useUSDCBalance } from '@/hooks/useUSDCBalance';

export function WalletConnect() {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { balance, isLoading: balanceLoading } = useUSDCBalance();
  const [copied, setCopied] = useState(false);

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  if (isConnected && address) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="gap-2 border-blue-200 hover:bg-blue-50">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="font-medium">{formatAddress(address)}</span>
            <span className="text-blue-600 font-semibold">
              {balanceLoading ? '...' : `${parseFloat(balance).toFixed(4)} USDC`}
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-72">
          <DropdownMenuLabel className="flex items-center gap-2">
            <Wallet className="w-4 h-4" />
            Connected Wallet
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <div className="px-3 py-2">
            <p className="text-xs text-muted-foreground mb-1">Address</p>
            <div className="flex items-center gap-2">
              <code className="text-xs bg-muted px-2 py-1 rounded flex-1 truncate">
                {address}
              </code>
              <button
                onClick={copyAddress}
                className="p-1 hover:bg-muted rounded transition-colors"
              >
                {copied ? (
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
          <div className="px-3 py-2">
            <p className="text-xs text-muted-foreground mb-1">USDC Balance (Base Sepolia)</p>
            <p className="text-lg font-semibold text-blue-600">
              {balanceLoading ? 'Loading...' : `${parseFloat(balance).toFixed(6)} USDC`}
            </p>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => disconnect()}
            className="text-red-600 focus:text-red-600 cursor-pointer"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Disconnect
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <div className="flex gap-2">
      {connectors.map((connector) => (
        <Button
          key={connector.uid}
          onClick={() => connect({ connector })}
          disabled={isPending}
          className="gap-2 bg-blue-600 hover:bg-blue-700"
        >
          <Wallet className="w-4 h-4" />
          {isPending ? 'Connecting...' : 'Connect Wallet'}
        </Button>
      ))}
    </div>
  );
}
