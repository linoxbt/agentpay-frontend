import { useState, useCallback, useEffect, useMemo } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RainbowKitProvider, darkTheme, lightTheme } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import { rainbowConfig } from '@/lib/wagmi';
import { Header } from '@/components/Header';
import { ServiceCard } from '@/components/ServiceCard';
import { FilterSidebar } from '@/components/FilterSidebar';
import { CreateAgentForm } from '@/components/CreateAgentForm';
import { CreateServiceForm } from '@/components/CreateServiceForm';
import { AgentDashboard } from '@/components/AgentDashboard';
import { PaymentFlowDialog } from '@/components/PaymentFlowDialog';
import { ServiceDetailPage } from '@/pages/ServiceDetailPage';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Filter, Bot, Store, Plus, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAgents } from '@/hooks/useAgents';
import { useServices } from '@/hooks/useServices';
import { usePaymentFlow } from '@/hooks/usePaymentFlow';
import { useRealPayment } from '@/hooks/useRealPayment';
import { type Service, type FilterState, type CreateServiceInput } from '@/types';
import { useAccount } from 'wagmi';

const queryClient = new QueryClient();

// Shared state wrapper component
function AppRouter() {
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isRealTransaction, setIsRealTransaction] = useState(false);
  
  const { agents, createAgent, toggleAgentStatus, deleteAgent, addPurchase, updatePurchaseAttestation, getActiveAgent, getTotalSpent, getTotalPurchases } = useAgents();
  const { services, createService } = useServices();
  const { paymentState, startPayment, setChallenge, proceedToPayment, proceedToSettlement, proceedToAttestation, completePayment, resetPayment, setError } = usePaymentFlow();
  const { address, isConnected } = useAccount();
  
  // Real payment hooks
  const {
    executePayment,
    generateAttestation,
    transferHash,
    isTransferPending,
    isTransferConfirming,
    isTransferConfirmed,
    transferError,
    resetPayment: resetRealPayment,
  } = useRealPayment();
  
  const activeAgent = getActiveAgent();

  const handlePurchase = useCallback(async (service: Service) => {
    if (!isConnected) {
      return;
    }
    if (!activeAgent) {
      return;
    }
    
    setSelectedService(service);
    setIsRealTransaction(true);
    startPayment(service);
    setIsPaymentDialogOpen(true);
  }, [isConnected, activeAgent, startPayment]);

  // Handle real payment execution
  const handlePaymentProceed = useCallback(async () => {
    if (!selectedService || !activeAgent || !address) return;

    switch (paymentState.step) {
      case 'challenge':
        // Generate challenge first
        setChallenge(selectedService);
        break;
        
      case 'payment':
        // Execute real payment
        try {
          const result = await executePayment(selectedService, `did:kite:${activeAgent.sessionKey.slice(0, 32)}`);
          if (result.success && result.txHash) {
            proceedToPayment(activeAgent, address);
            proceedToSettlement();
          } else if (result.error) {
            setError(result.error);
          }
        } catch (error) {
          setError(error instanceof Error ? error.message : 'Payment failed');
        }
        break;
        
        case 'settlement':
        if (isTransferConfirmed && transferHash) {
          // Generate attestation 
          generateAttestation(transferHash, `did:kite:${activeAgent.sessionKey.slice(0, 32)}`).then(attestation => {
            proceedToAttestation(activeAgent);
            
            // Add purchase to agent
            const purchase = addPurchase(activeAgent.id, {
              serviceId: selectedService.id,
              serviceName: selectedService.name,
              amount: selectedService.price,
              status: 'completed',
              txHash: transferHash,
            });
            if (purchase) {
              updatePurchaseAttestation(activeAgent.id, purchase.id, attestation);
            }
          });
        }
        break;
        
      case 'attestation':
        completePayment();
        break;
        
      default:
        break;
    }
  }, [paymentState.step, selectedService, activeAgent, address, setChallenge, executePayment, proceedToPayment, proceedToSettlement, isTransferConfirmed, transferHash, generateAttestation, proceedToAttestation, addPurchase, updatePurchaseAttestation, completePayment, setError]);

  const handlePaymentComplete = useCallback(() => {
    setIsPaymentDialogOpen(false);
    resetPayment();
    resetRealPayment();
    setSelectedService(null);
    setIsRealTransaction(false);
  }, [resetPayment, resetRealPayment]);

  const handleRetry = useCallback(() => {
    resetPayment();
    resetRealPayment();
    if (selectedService) {
      startPayment(selectedService);
    }
  }, [resetPayment, resetRealPayment, selectedService, startPayment]);

  // Watch for transaction confirmation
  useEffect(() => {
    if (paymentState.step === 'settlement' && isTransferConfirmed && transferHash && activeAgent && selectedService) {
      generateAttestation(transferHash, `did:kite:${activeAgent.sessionKey.slice(0, 32)}`).then(attestation => {
        proceedToAttestation(activeAgent);
        
        const purchase = addPurchase(activeAgent.id, {
          serviceId: selectedService.id,
          serviceName: selectedService.name,
          amount: selectedService.price,
          status: 'completed',
          txHash: transferHash,
        });
        if (purchase) {
          updatePurchaseAttestation(activeAgent.id, purchase.id, attestation);
        }
      });
    }
  }, [isTransferConfirmed, transferHash, paymentState.step, activeAgent, selectedService, generateAttestation, proceedToAttestation, addPurchase, updatePurchaseAttestation]);

  // Handle transfer errors
  useEffect(() => {
    if (transferError) {
      setError(transferError.message);
    }
  }, [transferError, setError]);

  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/" 
          element={
            <MarketplacePage 
              services={services}
              agents={agents}
              createAgent={createAgent}
              createService={createService}
              toggleAgentStatus={toggleAgentStatus}
              deleteAgent={deleteAgent}
              getActiveAgent={getActiveAgent}
              getTotalSpent={getTotalSpent}
              getTotalPurchases={getTotalPurchases}
              onPurchase={handlePurchase}
            />
          } 
        />
        <Route 
          path="/service/:serviceId" 
          element={
            <ServiceDetailPage 
              onPurchase={handlePurchase}
              activeAgent={activeAgent || null}
            />
          } 
        />
      </Routes>
      
      {/* Global Payment Flow Dialog */}
      <PaymentFlowDialog
        isOpen={isPaymentDialogOpen}
        onClose={handlePaymentComplete}
        paymentState={paymentState}
        selectedAgent={activeAgent || null}
        walletAddress={address}
        onProceed={handlePaymentProceed}
        onComplete={handlePaymentComplete}
        onRetry={handleRetry}
        isRealTransaction={isRealTransaction}
        transferHash={transferHash}
        isTransferPending={isTransferPending}
        isTransferConfirming={isTransferConfirming}
        isTransferConfirmed={isTransferConfirmed}
        transferError={transferError}
      />
    </BrowserRouter>
  );
}

// Marketplace Page Component
interface MarketplacePageProps {
  services: Service[];
  agents: any[];
  createAgent: (name: string, limit: string) => any;
  createService: (input: CreateServiceInput, sellerAddress: string, sellerName: string) => void;
  toggleAgentStatus: (id: string) => void;
  deleteAgent: (id: string) => void;
  getActiveAgent: () => any;
  getTotalSpent: () => string;
  getTotalPurchases: () => number;
  onPurchase?: (service: Service) => void;
}

function MarketplacePage({
  services,
  agents,
  createAgent,
  createService,
  toggleAgentStatus,
  deleteAgent,
  getActiveAgent,
  getTotalSpent,
  getTotalPurchases,
  onPurchase: _onPurchase,
}: MarketplacePageProps) {
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState<'marketplace' | 'dashboard' | 'create-agent' | 'create-service'>('marketplace');
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    minPrice: '',
    maxPrice: '',
    minReputation: 0,
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const { address, isConnected } = useAccount();
  const activeAgent = getActiveAgent();

  // Filter services
  const filteredServices = useMemo(() => {
    return services.filter((service) => {
      if (filters.categories.length > 0 && !filters.categories.includes(service.category)) {
        return false;
      }
      if (filters.minPrice && parseFloat(service.price) < parseFloat(filters.minPrice)) {
        return false;
      }
      if (filters.maxPrice && parseFloat(service.price) > parseFloat(filters.maxPrice)) {
        return false;
      }
      if (service.sellerReputation < filters.minReputation) {
        return false;
      }
      return true;
    });
  }, [services, filters]);

  // Handle service card click (navigate to detail)
  const handleServiceClick = useCallback((service: Service) => {
    navigate(`/service/${service.id}`);
  }, [navigate]);

  // Handle create service
  const handleCreateService = useCallback((input: CreateServiceInput) => {
    if (address) {
      createService(input, address, 'You');
    }
  }, [createService, address]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50/50">
      <Header
        currentView={currentView}
        onViewChange={setCurrentView}
      />

      <main className="container mx-auto px-4 py-6">
        {/* Alerts */}
        {!isConnected && currentView === 'marketplace' && (
          <Alert className="mb-6 bg-amber-50 border-amber-200">
            <AlertCircle className="w-4 h-4 text-amber-500" />
            <AlertDescription className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span>Connect your wallet to start purchasing services</span>
            </AlertDescription>
          </Alert>
        )}

        {isConnected && !activeAgent && currentView === 'marketplace' && (
          <Alert className="mb-6 bg-blue-50 border-blue-200">
            <Bot className="w-4 h-4 text-blue-500" />
            <AlertDescription className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span>Create an agent to enable automatic payments</span>
              <Button size="sm" onClick={() => setCurrentView('create-agent')} className="bg-blue-600 w-full sm:w-auto">
                Create Agent
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Views */}
        {currentView === 'marketplace' && (
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Mobile Filter Button */}
            <div className="lg:hidden fixed bottom-4 right-4 z-30 flex flex-col gap-2">
              <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                <SheetTrigger asChild>
                  <Button size="lg" className="rounded-full shadow-lg gap-2">
                    <Filter className="w-4 h-4" />
                    Filters
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80 p-0">
                  <FilterSidebar
                    filters={filters}
                    onFilterChange={setFilters}
                    isOpen={true}
                    onClose={() => setIsFilterOpen(false)}
                  />
                </SheetContent>
              </Sheet>
            </div>

            {/* Desktop Sidebar */}
            <div className="hidden lg:block w-72 flex-shrink-0">
              <FilterSidebar
                filters={filters}
                onFilterChange={setFilters}
                isOpen={false}
                onClose={() => {}}
              />
            </div>

            {/* Main Content */}
            <div className="flex-1">
              {/* Results Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
                <div>
                  <h2 className="text-2xl font-bold">AI Services</h2>
                  <p className="text-muted-foreground">
                    {filteredServices.length} service{filteredServices.length !== 1 ? 's' : ''} available
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {activeAgent && (
                    <Badge variant="outline" className="gap-2">
                      <Bot className="w-3 h-3" />
                      {activeAgent.name}
                    </Badge>
                  )}
                  <Button 
                    size="sm" 
                    onClick={() => setCurrentView('create-service')}
                    className="bg-green-600 hover:bg-green-700 gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">Create Service</span>
                  </Button>
                </div>
              </div>

              {/* Services Grid */}
              {filteredServices.length === 0 ? (
                <div className="text-center py-12">
                  <Store className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">No services match your filters</p>
                  <Button
                    variant="outline"
                    onClick={() =>
                      setFilters({
                        categories: [],
                        minPrice: '',
                        maxPrice: '',
                        minReputation: 0,
                      })
                    }
                  >
                    Clear Filters
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filteredServices.map((service) => (
                    <ServiceCard
                      key={service.id}
                      service={service}
                      onPurchase={handleServiceClick}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {currentView === 'create-agent' && (
          <div className="max-w-2xl mx-auto py-8 px-4">
            <CreateAgentForm
              onCreateAgent={(name, limit) => {
                const agent = createAgent(name, limit);
                setCurrentView('marketplace');
                return agent;
              }}
              onCancel={() => setCurrentView('marketplace')}
            />
          </div>
        )}

        {currentView === 'create-service' && (
          <div className="max-w-2xl mx-auto py-8 px-4">
            <CreateServiceForm
              onCreateService={handleCreateService}
              onCancel={() => setCurrentView('marketplace')}
              sellerName="You"
            />
          </div>
        )}

        {currentView === 'dashboard' && (
          <div className="py-4">
            <AgentDashboard
              agents={agents}
              onToggleAgent={toggleAgentStatus}
              onDeleteAgent={deleteAgent}
              totalSpent={getTotalSpent()}
              totalPurchases={getTotalPurchases()}
            />
          </div>
        )}
      </main>
    </div>
  );
}

// Main App with Providers
function App() {
  return (
    <WagmiProvider config={rainbowConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider 
          theme={{
            lightMode: lightTheme({
              accentColor: '#2563eb',
              accentColorForeground: '#ffffff',
              borderRadius: 'medium',
            }),
            darkMode: darkTheme({
              accentColor: '#3b82f6',
              accentColorForeground: '#ffffff',
              borderRadius: 'medium',
            }),
          }}
        >
          <AppRouter />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;
