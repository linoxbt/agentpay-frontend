import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import type { Service, CreateServiceInput, ServiceCategory } from '@/types';
import { MOCK_SERVICES } from '@/types';

const ICONS: Record<ServiceCategory, string> = {
  'text-generation': '✍️',
  'image-generation': '🎨',
  'data-analysis': '📊',
  'code-assistance': '💻',
  'translation': '🌐',
  'summarization': '📝',
};

export function useServices() {
  const [services, setServices] = useLocalStorage<Service[]>('agentpay-services', MOCK_SERVICES);

  const createService = useCallback((input: CreateServiceInput, sellerAddress: string, sellerName: string): Service => {
    const newService: Service = {
      id: `service-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: input.name,
      description: input.description,
      price: input.price,
      seller: sellerName,
      sellerAddress,
      sellerReputation: 0,
      category: input.category,
      tags: input.tags,
      icon: ICONS[input.category],
      usageCount: 0,
      createdAt: Date.now(),
      apiEndpoint: input.apiEndpoint,
      documentation: input.documentation,
    };

    setServices(prev => [newService, ...prev]);
    return newService;
  }, [setServices]);

  const updateService = useCallback((serviceId: string, updates: Partial<Service>) => {
    setServices(prev =>
      prev.map(service =>
        service.id === serviceId ? { ...service, ...updates } : service
      )
    );
  }, [setServices]);

  const deleteService = useCallback((serviceId: string) => {
    setServices(prev => prev.filter(service => service.id !== serviceId));
  }, [setServices]);

  const incrementUsage = useCallback((serviceId: string) => {
    setServices(prev =>
      prev.map(service =>
        service.id === serviceId
          ? { ...service, usageCount: service.usageCount + 1 }
          : service
      )
    );
  }, [setServices]);

  const getServiceById = useCallback((serviceId: string): Service | undefined => {
    return services.find(service => service.id === serviceId);
  }, [services]);

  const getServicesBySeller = useCallback((sellerAddress: string): Service[] => {
    return services.filter(service => service.sellerAddress.toLowerCase() === sellerAddress.toLowerCase());
  }, [services]);

  return {
    services,
    createService,
    updateService,
    deleteService,
    incrementUsage,
    getServiceById,
    getServicesBySeller,
  };
}
