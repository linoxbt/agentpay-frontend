import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Loader2,
  Shield,
  CheckCircle2,
  AlertCircle,
  Lock,
  FileSignature,
  Clock,
  Award,
  Wallet,
  ExternalLink,
} from 'lucide-react';
import type { Service, Agent, PaymentFlowState } from '@/types';
import { useEffect, useState } from 'react';
import { useChainId } from 'wagmi';
import { baseSepolia } from 'wagmi/chains';

interface PaymentFlowDialogProps {
  isOpen: boolean;
  onClose: () => void;
  paymentState: PaymentFlowState;
  selectedAgent: Agent | null;
  walletAddress?: string | undefined;
  onProceed: () => void;
  onComplete: () => void;
  onRetry?: () => void;
  isRealTransaction?: boolean;
  transferHash?: string;
  isTransferPending?: boolean;
  isTransferConfirming?: boolean;
  isTransferConfirmed?: boolean;
  transferError?: Error | null;
}

const STEP_CONFIG = {
  idle: { label: 'Ready', icon: Lock, color: 'gray' },
  challenge: { label: '402 Challenge', icon: Shield, color: 'blue' },
  payment: { label: 'Payment Payload', icon: FileSignature, color: 'blue' },
  settlement: { label: 'Settlement', icon: Clock, color: 'yellow' },
  attestation: { label: 'Attestation', icon: Award, color: 'purple' },
  complete: { label: 'Complete', icon: CheckCircle2, color: 'green' },
  error: { label: 'Error', icon: AlertCircle, color: 'red' },
};

export function PaymentFlowDialog({
  isOpen,
  onClose,
  paymentState,
  selectedAgent,
  walletAddress: _walletAddress,
  onProceed,
  onComplete,
  onRetry,
  isRealTransaction = false,
  transferHash,
  isTransferPending,
  isTransferConfirming,
  isTransferConfirmed: _isTransferConfirmed2,
  transferError: _transferError2,
}: PaymentFlowDialogProps) {
  const [progress, setProgress] = useState(0);
  const chainId = useChainId();

  useEffect(() => {
    const stepIndex = ['idle', 'challenge', 'payment', 'settlement', 'attestation', 'complete', 'error'].indexOf(paymentState.step);
    setProgress((stepIndex / 6) * 100);
  }, [paymentState.step]);

  const renderStepContent = () => {
    switch (paymentState.step) {
      case 'challenge':
        return <ChallengeStep service={paymentState.service!} challenge={paymentState.challenge!} />;
      case 'payment':
        return (
          <PaymentStep 
            payload={paymentState.paymentPayload!} 
            agent={selectedAgent!} 
            isRealTransaction={isRealTransaction}
            isTransferPending={isTransferPending}
          />
        );
      case 'settlement':
        return (
          <SettlementStep 
            payload={paymentState.paymentPayload!} 
            isRealTransaction={isRealTransaction}
            transferHash={transferHash}
            isTransferConfirming={isTransferConfirming}
            chainId={chainId}
          />
        );
      case 'attestation':
        return <AttestationStep attestation={paymentState.attestation!} />;
      case 'complete':
        return (
          <CompleteStep 
            service={paymentState.service!} 
            attestation={paymentState.attestation!}
            transferHash={transferHash}
            chainId={chainId}
          />
        );
      case 'error':
        return <ErrorStep error={paymentState.error!} onRetry={onRetry} />;
      default:
        return null;
    }
  };

  const CurrentIcon = STEP_CONFIG[paymentState.step].icon;
  const isError = paymentState.step === 'error';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CurrentIcon className={`w-5 h-5 ${isError ? 'text-red-500' : `text-${STEP_CONFIG[paymentState.step].color}-500`}`} />
            x402 Payment Flow
          </DialogTitle>
          <DialogDescription>
            {isRealTransaction ? 'Real on-chain transaction' : 'Step-by-step micropayment simulation'}
          </DialogDescription>
        </DialogHeader>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress 
            value={progress} 
            className={`h-2 ${isError ? 'bg-red-100' : ''}`}
          />
        </div>

        {/* Step Indicators */}
        <div className="flex justify-between text-xs overflow-x-auto pb-2">
          {Object.entries(STEP_CONFIG).slice(1).map(([key, config], index) => {
            const isActive = paymentState.step === key;
            const isCompleted = ['idle', 'challenge', 'payment', 'settlement', 'attestation', 'complete'].indexOf(paymentState.step) > index + 1;
            const isErrorStep = key === 'error';
            return (
              <div
                key={key}
                className={`flex flex-col items-center gap-1 min-w-[60px] ${
                  isActive ? 'text-blue-600 font-medium' : 
                  isCompleted ? 'text-green-600' : 
                  isErrorStep ? 'text-red-500' : 'text-muted-foreground'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                    isActive
                      ? 'bg-blue-100 text-blue-600'
                      : isCompleted
                      ? 'bg-green-100 text-green-600'
                      : isErrorStep
                      ? 'bg-red-100 text-red-600'
                      : 'bg-gray-100'
                  }`}
                >
                  {isCompleted ? <CheckCircle2 className="w-3 h-3" /> : index + 1}
                </div>
                <span className="hidden sm:inline text-[10px]">{config.label}</span>
              </div>
            );
          })}
        </div>

        {/* Step Content */}
        <div className="py-4">{renderStepContent()}</div>

        {/* Actions */}
        <div className="flex justify-end gap-2">
          {paymentState.step === 'complete' ? (
            <Button onClick={onComplete} className="bg-green-600 hover:bg-green-700">
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Done
            </Button>
          ) : paymentState.step === 'error' ? (
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              {onRetry && (
                <Button onClick={onRetry} className="bg-blue-600 hover:bg-blue-700">
                  <Loader2 className="w-4 h-4 mr-2" />
                  Retry
                </Button>
              )}
            </div>
          ) : paymentState.step !== 'settlement' && paymentState.step !== 'attestation' ? (
            <Button 
              onClick={onProceed} 
              className="bg-blue-600 hover:bg-blue-700"
              disabled={isTransferPending}
            >
              {isTransferPending ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Confirm in Wallet...
                </span>
              ) : (
                <>
                  {paymentState.step === 'challenge' && (
                    <span className="flex items-center gap-2">
                      <Wallet className="w-4 h-4" />
                      Sign & Pay
                    </span>
                  )}
                  {paymentState.step === 'payment' && 'Submit Settlement'}
                  {paymentState.step === 'idle' && 'Start'}
                </>
              )}
            </Button>
          ) : (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              {isTransferConfirming ? 'Confirming on-chain...' : 'Processing...'}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ChallengeStep({ service, challenge }: { service: Service; challenge: any }) {
  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-xl">
          {service.icon}
        </div>
        <div>
          <h4 className="font-medium">{service.name}</h4>
          <p className="text-sm text-muted-foreground">{service.seller}</p>
        </div>
      </div>

      <div className="border rounded-lg p-3 space-y-2 bg-muted/50">
        <div className="flex items-center gap-2 text-sm">
          <Shield className="w-4 h-4 text-blue-500" />
          <span className="font-medium">402 Payment Required</span>
        </div>
        <div className="text-xs space-y-1 font-mono">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Scheme:</span>
            <span>{challenge.scheme}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Network:</span>
            <span>{challenge.network}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Amount:</span>
            <span className="text-blue-600 font-semibold">{challenge.maxAmountRequired} USDC</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Resource:</span>
            <span className="truncate max-w-[150px]">{challenge.resource}</span>
          </div>
        </div>
      </div>

      <div className="flex items-start gap-2 text-xs text-muted-foreground">
        <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
        <p>
          The server responded with HTTP 402 Payment Required. Your agent will create a signed
          payment payload to proceed. Click "Sign & Pay" to confirm the transaction in your wallet.
        </p>
      </div>
    </Card>
  );
}

function PaymentStep({ 
  payload, 
  agent, 
  isRealTransaction,
  isTransferPending,
}: { 
  payload: any; 
  agent: Agent;
  isRealTransaction?: boolean;
  isTransferPending?: boolean;
}) {
  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center gap-2">
        <FileSignature className="w-5 h-5 text-blue-500" />
        <h4 className="font-medium">Signed Payment Payload</h4>
      </div>

      <div className="border rounded-lg p-3 space-y-2 bg-muted/50 font-mono text-xs">
        <div>
          <span className="text-muted-foreground">From:</span>
          <div className="truncate">{payload.from}</div>
        </div>
        <div>
          <span className="text-muted-foreground">To:</span>
          <div className="truncate">{payload.to}</div>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Amount:</span>
          <span className="text-blue-600 font-semibold">
            {(parseInt(payload.amount) / 1e6).toFixed(6)} USDC
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Nonce:</span>
          <span>{payload.nonce}</span>
        </div>
        <div>
          <span className="text-muted-foreground">Signature:</span>
          <div className="truncate text-green-600">{payload.signature.slice(0, 32)}...</div>
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs">
        <Badge variant="outline" className="gap-1">
          <Lock className="w-3 h-3" />
          Signed by {agent.name}
        </Badge>
        {isRealTransaction && (
          <Badge className="bg-purple-100 text-purple-700">On-Chain</Badge>
        )}
      </div>

      {isTransferPending && (
        <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 p-2 rounded">
          <Loader2 className="w-4 h-4 animate-spin" />
          Please confirm the transaction in your wallet...
        </div>
      )}
    </Card>
  );
}

function SettlementStep({ 
  payload, 
  isRealTransaction,
  transferHash,
  isTransferConfirming,
  chainId,
}: { 
  payload: any;
  isRealTransaction?: boolean;
  transferHash?: string;
  isTransferConfirming?: boolean;
  chainId?: number;
}) {
  const explorerUrl = chainId === baseSepolia.id 
    ? `https://sepolia.basescan.org/tx/${transferHash}`
    : `https://explorer.kiteai.network/tx/${transferHash}`;

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          <Clock className="w-6 h-6 text-blue-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
      </div>

      <div className="text-center space-y-2">
        <h4 className="font-medium">Processing Settlement</h4>
        <p className="text-sm text-muted-foreground">
          {isRealTransaction 
            ? 'Submitting transaction to the blockchain...'
            : 'Submitting payment to the Base Sepolia network...'}
        </p>
      </div>

      {transferHash && (
        <div className="border rounded-lg p-3 space-y-2 bg-muted/50">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Transaction Hash:</span>
            <a 
              href={explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:underline flex items-center gap-1"
            >
              {transferHash.slice(0, 12)}...{transferHash.slice(-8)}
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          {isTransferConfirming && (
            <div className="flex items-center gap-2 text-sm text-amber-600">
              <Loader2 className="w-4 h-4 animate-spin" />
              Waiting for confirmation...
            </div>
          )}
        </div>
      )}

      <div className="text-xs text-muted-foreground font-mono">
        Nonce: {payload.nonce} | Amount: {(parseInt(payload.amount) / 1e6).toFixed(6)} USDC
      </div>
    </Card>
  );
}

function AttestationStep({ attestation }: { attestation: any }) {
  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Award className="w-5 h-5 text-purple-500" />
        <h4 className="font-medium">Kite AI Attestation</h4>
      </div>

      <div className="border rounded-lg p-3 space-y-3 bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="flex items-center gap-2">
          <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100">Verified</Badge>
          <span className="text-xs text-muted-foreground">
            {new Date(attestation.timestamp).toLocaleString()}
          </span>
        </div>

        <div className="space-y-2 font-mono text-xs">
          <div>
            <span className="text-muted-foreground">Transaction Hash:</span>
            <div className="truncate text-blue-600">{attestation.txHash}</div>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Block Number:</span>
            <span>{attestation.blockNumber.toLocaleString()}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Agent DID:</span>
            <div className="truncate text-purple-600">{attestation.agentDID}</div>
          </div>
          <div>
            <span className="text-muted-foreground">Proof:</span>
            <div className="truncate text-green-600">{attestation.proof.slice(0, 40)}...</div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <CheckCircle2 className="w-4 h-4 text-green-500" />
        <p>
          Payment verified and attested by Kite AI. The service can now be accessed.
        </p>
      </div>
    </Card>
  );
}

function CompleteStep({ 
  service, 
  attestation,
  transferHash,
  chainId,
}: { 
  service: Service; 
  attestation: any;
  transferHash?: string;
  chainId?: number;
}) {
  const explorerUrl = chainId === baseSepolia.id 
    ? `https://sepolia.basescan.org/tx/${transferHash}`
    : `https://explorer.kiteai.network/tx/${transferHash}`;

  return (
    <Card className="p-4 space-y-4">
      <div className="text-center space-y-3">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8 text-green-600" />
        </div>
        <div>
          <h4 className="font-medium text-lg">Payment Complete!</h4>
          <p className="text-sm text-muted-foreground">
            You now have access to {service.name}
          </p>
        </div>
      </div>

      <div className="border rounded-lg p-3 space-y-2 bg-green-50">
        <div className="flex items-center gap-2 text-sm">
          <Award className="w-4 h-4 text-purple-500" />
          <span className="font-medium">Attestation Recorded</span>
        </div>
        <div className="text-xs font-mono space-y-1">
          <div className="truncate">TX: {attestation.txHash.slice(0, 30)}...</div>
          <div>Block: {attestation.blockNumber.toLocaleString()}</div>
        </div>
      </div>

      {transferHash && (
        <a
          href={explorerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 text-sm text-blue-600 hover:underline"
        >
          <ExternalLink className="w-4 h-4" />
          View on Explorer
        </a>
      )}
    </Card>
  );
}

function ErrorStep({ error }: { error: string; onRetry?: () => void }) {
  return (
    <Card className="p-4 space-y-4">
      <div className="text-center space-y-3">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8 text-red-600" />
        </div>
        <div>
          <h4 className="font-medium text-lg text-red-600">Payment Failed</h4>
          <p className="text-sm text-muted-foreground">
            {error}
          </p>
        </div>
      </div>

      <div className="text-xs text-muted-foreground">
        Common issues:
        <ul className="list-disc list-inside mt-1 space-y-1">
          <li>Insufficient USDC balance</li>
          <li>Network congestion</li>
          <li>User rejected the transaction</li>
          <li>Wrong network selected</li>
        </ul>
      </div>
    </Card>
  );
}
