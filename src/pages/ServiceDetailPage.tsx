import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  ShoppingCart, 
  Star, 
  Users, 
  Clock, 
  Shield, 
  CheckCircle2,
  Code,
  FileText,
  Zap,
  ExternalLink,
  AlertCircle
} from 'lucide-react';
import { MOCK_SERVICES, type Service } from '@/types';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Header } from '@/components/Header';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ServiceDetailPageProps {
  onPurchase: (service: Service) => void;
  activeAgent: { name: string } | null;
}

export function ServiceDetailPage({ onPurchase, activeAgent }: ServiceDetailPageProps) {
  const { serviceId } = useParams<{ serviceId: string }>();
  const navigate = useNavigate();
  const { isConnected } = useAccount();

  const service = MOCK_SERVICES.find(s => s.id === serviceId);

  if (!service) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-blue-50/50">
        <Header currentView="marketplace" onViewChange={() => navigate('/')} />
        <div className="container mx-auto px-4 py-12">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="py-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-gray-400" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Service Not Found</h2>
              <p className="text-muted-foreground mb-4">The service you're looking for doesn't exist.</p>
              <Button onClick={() => navigate('/')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Marketplace
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const handlePurchase = () => {
    onPurchase(service);
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      'text-generation': 'Text Generation',
      'image-generation': 'Image Generation',
      'data-analysis': 'Data Analysis',
      'code-assistance': 'Code Assistance',
      'translation': 'Translation',
      'summarization': 'Summarization',
    };
    return labels[category] || category;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50/50">
      <Header currentView="marketplace" onViewChange={() => navigate('/')} />
      
      <main className="container mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <Button variant="ghost" onClick={() => navigate('/')} className="mb-4 -ml-2">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Marketplace
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero Card */}
            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row items-start gap-4">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center text-3xl sm:text-4xl shadow-inner flex-shrink-0">
                    {service.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-4">
                      <div className="min-w-0">
                        <h1 className="text-xl sm:text-2xl font-bold truncate">{service.name}</h1>
                        <p className="text-muted-foreground text-sm">{service.seller}</p>
                      </div>
                      <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1.5 rounded-full flex-shrink-0">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{service.sellerReputation}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-3">
                      <Badge variant="secondary">{getCategoryLabel(service.category)}</Badge>
                      {service.tags.map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <Separator className="my-4 sm:my-6" />

                <div className="prose prose-sm max-w-none">
                  <h3 className="text-base sm:text-lg font-semibold mb-3">About this Service</h3>
                  <p className="text-muted-foreground leading-relaxed">{service.description}</p>
                  
                  <h3 className="text-base sm:text-lg font-semibold mb-3 mt-4 sm:mt-6">Features</h3>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span>Instant API access after payment</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span>x402 micropayment protocol</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span>Kite AI attestation for verification</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span>Pay-per-use with no subscription</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Tabs */}
            <Tabs defaultValue="api" className="w-full">
              <TabsList className="grid w-full grid-cols-3 h-auto">
                <TabsTrigger value="api" className="gap-1 sm:gap-2 text-xs sm:text-sm py-2">
                  <Code className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">API</span>
                </TabsTrigger>
                <TabsTrigger value="docs" className="gap-1 sm:gap-2 text-xs sm:text-sm py-2">
                  <FileText className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Docs</span>
                </TabsTrigger>
                <TabsTrigger value="reviews" className="gap-1 sm:gap-2 text-xs sm:text-sm py-2">
                  <Star className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Reviews</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="api">
                <Card>
                  <CardHeader className="p-4 sm:p-6">
                    <CardTitle className="text-base sm:text-lg">API Endpoint</CardTitle>
                    <CardDescription className="text-xs sm:text-sm">Use this endpoint to access the service</CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
                    <div className="bg-muted rounded-lg p-3 sm:p-4 font-mono text-xs sm:text-sm overflow-x-auto">
                      <div className="text-muted-foreground mb-2">POST {service.apiEndpoint}</div>
                      <div className="text-green-600 whitespace-nowrap">Authorization: Bearer {'<your-agent-session-key>'}</div>
                    </div>
                    <div className="mt-4 text-xs sm:text-sm text-muted-foreground">
                      <p>Example request body:</p>
                      <pre className="bg-muted rounded-lg p-3 mt-2 overflow-x-auto text-xs">
{`{
  "prompt": "Your input here",
  "options": {
    "temperature": 0.7,
    "maxTokens": 500
  }
}`}
                      </pre>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="docs">
                <Card>
                  <CardHeader className="p-4 sm:p-6">
                    <CardTitle className="text-base sm:text-lg">Documentation</CardTitle>
                    <CardDescription className="text-xs sm:text-sm">Learn how to integrate this service</CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0 space-y-4">
                    <div>
                      <h4 className="font-medium mb-2 text-sm sm:text-base">Getting Started</h4>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        1. Connect your wallet using RainbowKit<br />
                        2. Create an AI agent with spending limits<br />
                        3. Purchase access to this service<br />
                        4. Use your agent's session key in API requests
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2 text-sm sm:text-base">x402 Payment Flow</h4>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        This service uses the x402 payment protocol. When you make a request,
                        the server responds with a 402 Payment Required challenge. Your agent
                        automatically creates a signed payment payload to proceed.
                      </p>
                    </div>
                    <div className="bg-muted rounded-lg p-3 sm:p-4">
                      <h4 className="font-medium mb-2 text-sm sm:text-base">Service Documentation</h4>
                      <pre className="text-xs sm:text-sm whitespace-pre-wrap overflow-x-auto">
                        {service.documentation}
                      </pre>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reviews">
                <Card>
                  <CardHeader className="p-4 sm:p-6">
                    <CardTitle className="text-base sm:text-lg">User Reviews</CardTitle>
                    <CardDescription className="text-xs sm:text-sm">What others are saying</CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0 space-y-4">
                    <div className="border-b pb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium">
                          JD
                        </div>
                        <div>
                          <p className="font-medium text-sm">John Doe</p>
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            ))}
                          </div>
                        </div>
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Excellent service! The API is fast and reliable. Love the pay-per-use model.
                      </p>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-sm font-medium">
                          AS
                        </div>
                        <div>
                          <p className="font-medium text-sm">Alice Smith</p>
                          <div className="flex">
                            {[...Array(4)].map((_, i) => (
                              <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            ))}
                            <Star className="w-3 h-3 text-gray-300" />
                          </div>
                        </div>
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Great value for the price. Would recommend for any developer looking for {service.category.replace('-', ' ')}.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Purchase Card */}
            <Card className="lg:sticky lg:top-24">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-base sm:text-lg">Purchase Access</CardTitle>
                <CardDescription className="text-xs sm:text-sm">One-time payment for API access</CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0 space-y-4">
                <div className="text-center">
                  <span className="text-3xl sm:text-4xl font-bold text-blue-600">{service.price}</span>
                  <span className="text-muted-foreground ml-1 text-sm sm:text-base">USDC</span>
                </div>

                <div className="space-y-2 text-xs sm:text-sm">
                  <div className="flex items-center gap-2">
                    <Users className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
                    <span>{service.usageCount.toLocaleString()} uses</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
                    <span>Instant access</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
                    <span>x402 secured</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
                    <span>Kite attested</span>
                  </div>
                </div>

                <Separator />

                {!isConnected ? (
                  <div className="flex justify-center">
                    <ConnectButton 
                      label="Connect Wallet"
                      showBalance={false}
                      accountStatus="address"
                      chainStatus="icon"
                    />
                  </div>
                ) : !activeAgent ? (
                  <div className="space-y-2">
                    <Alert className="bg-amber-50 border-amber-200">
                      <AlertCircle className="w-4 h-4 text-amber-500" />
                      <AlertDescription className="text-xs">
                        Create an agent to make purchases
                      </AlertDescription>
                    </Alert>
                    <Button 
                      onClick={() => navigate('/')} 
                      variant="outline"
                      className="w-full"
                    >
                      Create Agent
                    </Button>
                  </div>
                ) : (
                  <Button 
                    onClick={handlePurchase} 
                    className="w-full bg-blue-600 hover:bg-blue-700 gap-2"
                    size="lg"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Purchase Now
                  </Button>
                )}

                {activeAgent && (
                  <div className="text-center text-xs text-muted-foreground">
                    Using agent: <span className="font-medium text-blue-600">{activeAgent.name}</span>
                  </div>
                )}
              </CardContent>
              <CardFooter className="p-4 sm:p-6 pt-0 text-xs text-muted-foreground text-center">
                Payment processed on Base Sepolia with Kite attestation
              </CardFooter>
            </Card>

            {/* Seller Card */}
            <Card>
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-base sm:text-lg">About the Seller</CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center text-lg sm:text-xl">
                    {service.seller.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-sm sm:text-base">{service.seller}</p>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm">{service.sellerReputation}</span>
                    </div>
                  </div>
                </div>
                <Button variant="outline" className="w-full gap-2" size="sm">
                  <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4" />
                  View Profile
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
