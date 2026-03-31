import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import type { Agent, Purchase, KiteAttestation } from '@/types';

export function useAgents() {
  const [agents, setAgents] = useLocalStorage<Agent[]>('agentpay-agents', []);

  const createAgent = useCallback((name: string, spendingLimit: string): Agent => {
    const newAgent: Agent = {
      id: `agent-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      spendingLimit,
      spentAmount: '0',
      sessionKey: `sk-${Math.random().toString(36).substr(2, 16)}${Math.random().toString(36).substr(2, 16)}`,
      createdAt: Date.now(),
      isActive: true,
      purchases: [],
    };

    setAgents(prev => [newAgent, ...prev]);
    return newAgent;
  }, [setAgents]);

  const updateAgent = useCallback((agentId: string, updates: Partial<Agent>) => {
    setAgents(prev =>
      prev.map(agent =>
        agent.id === agentId ? { ...agent, ...updates } : agent
      )
    );
  }, [setAgents]);

  const deleteAgent = useCallback((agentId: string) => {
    setAgents(prev => prev.filter(agent => agent.id !== agentId));
  }, [setAgents]);

  const addPurchase = useCallback((agentId: string, purchase: Omit<Purchase, 'id' | 'timestamp'>) => {
    const newPurchase: Purchase = {
      ...purchase,
      id: `purchase-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    };

    setAgents(prev =>
      prev.map(agent => {
        if (agent.id === agentId) {
          const newSpentAmount = (parseFloat(agent.spentAmount) + parseFloat(purchase.amount)).toFixed(6);
          return {
            ...agent,
            spentAmount: newSpentAmount,
            purchases: [newPurchase, ...agent.purchases],
          };
        }
        return agent;
      })
    );

    return newPurchase;
  }, [setAgents]);

  const updatePurchaseAttestation = useCallback((agentId: string, purchaseId: string, attestation: KiteAttestation) => {
    setAgents(prev =>
      prev.map(agent => {
        if (agent.id === agentId) {
          return {
            ...agent,
            purchases: agent.purchases.map(purchase =>
              purchase.id === purchaseId
                ? { ...purchase, attestation, status: 'completed' as const }
                : purchase
            ),
          };
        }
        return agent;
      })
    );
  }, [setAgents]);

  const toggleAgentStatus = useCallback((agentId: string) => {
    setAgents(prev =>
      prev.map(agent =>
        agent.id === agentId ? { ...agent, isActive: !agent.isActive } : agent
      )
    );
  }, [setAgents]);

  const getActiveAgent = useCallback((): Agent | undefined => {
    return agents.find(agent => agent.isActive);
  }, [agents]);

  const getTotalSpent = useCallback((): string => {
    return agents
      .reduce((total, agent) => total + parseFloat(agent.spentAmount), 0)
      .toFixed(6);
  }, [agents]);

  const getTotalPurchases = useCallback((): number => {
    return agents.reduce((total, agent) => total + agent.purchases.length, 0);
  }, [agents]);

  return {
    agents,
    createAgent,
    updateAgent,
    deleteAgent,
    addPurchase,
    updatePurchaseAttestation,
    toggleAgentStatus,
    getActiveAgent,
    getTotalSpent,
    getTotalPurchases,
  };
}
