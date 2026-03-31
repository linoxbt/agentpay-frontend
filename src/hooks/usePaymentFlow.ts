import { useState, useCallback } from 'react';
import type { Service, X402Challenge, X402PaymentPayload, KiteAttestation, PaymentFlowState, Agent } from '@/types';
import { USDC_CONTRACT } from '@/types';

export function usePaymentFlow() {
  const [paymentState, setPaymentState] = useState<PaymentFlowState>({
    step: 'idle',
  });

  const generateChallenge = useCallback((service: Service): X402Challenge => {
    return {
      scheme: 'x402-1.0',
      network: 'base-sepolia',
      maxAmountRequired: service.price,
      resource: `service:${service.id}`,
      description: `Payment for ${service.name}`,
      timestamp: Date.now(),
    };
  }, []);

  const generatePaymentPayload = useCallback((
    challenge: X402Challenge,
    _agent: Agent,
    fromAddress: string
  ): X402PaymentPayload => {
    const amount = parseFloat(challenge.maxAmountRequired) * Math.pow(10, USDC_CONTRACT.decimals);
    return {
      signature: `0x${Array(130).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`,
      from: fromAddress,
      to: `0x${Array(40).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`,
      amount: amount.toString(),
      nonce: Math.floor(Math.random() * 1000000),
      timestamp: Date.now(),
    };
  }, []);

  const generateAttestation = useCallback((_paymentPayload: X402PaymentPayload, agent: Agent): KiteAttestation => {
    return {
      txHash: `0x${Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`,
      blockNumber: Math.floor(Math.random() * 10000000) + 15000000,
      agentDID: `did:kite:${agent.sessionKey.slice(0, 32)}`,
      timestamp: Date.now(),
      proof: `0x${Array(128).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`,
    };
  }, []);

  const startPayment = useCallback((service: Service) => {
    setPaymentState({
      step: 'challenge',
      service,
    });
  }, []);

  const proceedToPayment = useCallback((agent: Agent, fromAddress: string) => {
    setPaymentState(prev => {
      if (prev.step !== 'challenge' || !prev.challenge) return prev;
      
      const paymentPayload = generatePaymentPayload(prev.challenge, agent, fromAddress);
      return {
        ...prev,
        step: 'payment',
        paymentPayload,
      };
    });
  }, [generatePaymentPayload]);

  const proceedToSettlement = useCallback(() => {
    setPaymentState(prev => ({
      ...prev,
      step: 'settlement',
    }));
  }, []);

  const proceedToAttestation = useCallback((agent: Agent) => {
    setPaymentState(prev => {
      if (!prev.paymentPayload) return prev;
      
      const attestation = generateAttestation(prev.paymentPayload, agent);
      return {
        ...prev,
        step: 'attestation',
        attestation,
      };
    });
  }, [generateAttestation]);

  const completePayment = useCallback(() => {
    setPaymentState(prev => ({
      ...prev,
      step: 'complete',
    }));
  }, []);

  const setError = useCallback((error: string) => {
    setPaymentState(prev => ({
      ...prev,
      step: 'error',
      error,
    }));
  }, []);

  const resetPayment = useCallback(() => {
    setPaymentState({
      step: 'idle',
    });
  }, []);

  const setChallenge = useCallback((service: Service) => {
    const challenge = generateChallenge(service);
    setPaymentState(prev => ({
      ...prev,
      challenge,
    }));
  }, [generateChallenge]);

  return {
    paymentState,
    startPayment,
    setChallenge,
    proceedToPayment,
    proceedToSettlement,
    proceedToAttestation,
    completePayment,
    setError,
    resetPayment,
  };
}
