import { useState, useCallback, useRef, useEffect } from 'react';
import type { Service } from '@/types';

interface DemoStep {
  action: string;
  delay: number;
}

const DEMO_STEPS: DemoStep[] = [
  { action: 'connect', delay: 1000 },
  { action: 'select-service', delay: 1500 },
  { action: 'start-payment', delay: 1000 },
  { action: 'show-challenge', delay: 1500 },
  { action: 'create-payment', delay: 1500 },
  { action: 'settlement', delay: 1500 },
  { action: 'attestation', delay: 1500 },
  { action: 'complete', delay: 1000 },
];

export function useDemoMode(
  onConnect: () => void,
  onSelectService: (service: Service) => void,
  onStartPayment: (service: Service) => void,
  onShowChallenge: () => void,
  onCreatePayment: () => void,
  onSettlement: () => void,
  onAttestation: () => void,
  onComplete: () => void,
  services: Service[]
) {
  const [isDemoRunning, setIsDemoRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearDemoTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const stopDemo = useCallback(() => {
    clearDemoTimeout();
    setIsDemoRunning(false);
    setCurrentStep(0);
  }, [clearDemoTimeout]);

  const runDemoStep = useCallback((stepIndex: number) => {
    if (stepIndex >= DEMO_STEPS.length) {
      setIsDemoRunning(false);
      setCurrentStep(0);
      return;
    }

    const step = DEMO_STEPS[stepIndex];
    setCurrentStep(stepIndex);

    timeoutRef.current = setTimeout(() => {
      switch (step.action) {
        case 'connect':
          onConnect();
          break;
        case 'select-service':
          if (services.length > 0) {
            onSelectService(services[0]);
          }
          break;
        case 'start-payment':
          if (services.length > 0) {
            onStartPayment(services[0]);
          }
          break;
        case 'show-challenge':
          onShowChallenge();
          break;
        case 'create-payment':
          onCreatePayment();
          break;
        case 'settlement':
          onSettlement();
          break;
        case 'attestation':
          onAttestation();
          break;
        case 'complete':
          onComplete();
          break;
      }
      runDemoStep(stepIndex + 1);
    }, step.delay);
  }, [onConnect, onSelectService, onStartPayment, onShowChallenge, onCreatePayment, onSettlement, onAttestation, onComplete, services]);

  const startDemo = useCallback(() => {
    stopDemo();
    setIsDemoRunning(true);
    runDemoStep(0);
  }, [stopDemo, runDemoStep]);

  useEffect(() => {
    return () => {
      clearDemoTimeout();
    };
  }, [clearDemoTimeout]);

  return {
    isDemoRunning,
    currentStep,
    startDemo,
    stopDemo,
    demoProgress: ((currentStep + 1) / DEMO_STEPS.length) * 100,
  };
}
