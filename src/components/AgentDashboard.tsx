import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Bot,
  Wallet,
  ShoppingBag,
  TrendingUp,
  Key,
  Copy,
  CheckCircle2,
  ExternalLink,
  Power,
  PowerOff,
  Trash2,
} from 'lucide-react';
import type { Agent, Purchase } from '@/types';

interface AgentDashboardProps {
  agents: Agent[];
  onToggleAgent: (agentId: string) => void;
  onDeleteAgent: (agentId: string) => void;
  totalSpent: string;
  totalPurchases: number;
}

export function AgentDashboard({
  agents,
  onToggleAgent,
  onDeleteAgent,
  totalSpent,
  totalPurchases,
}: AgentDashboardProps) {
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(agents[0] || null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copySessionKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const getStatusBadge = (status: Purchase['status']) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-700">Completed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-700">Pending</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-700">Failed</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Agents</CardDescription>
            <CardTitle className="text-3xl flex items-center gap-2">
              <Bot className="w-8 h-8 text-blue-500" />
              {agents.length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Spent</CardDescription>
            <CardTitle className="text-3xl flex items-center gap-2">
              <Wallet className="w-8 h-8 text-green-500" />
              {parseFloat(totalSpent).toFixed(4)} USDC
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Purchases</CardDescription>
            <CardTitle className="text-3xl flex items-center gap-2">
              <ShoppingBag className="w-8 h-8 text-purple-500" />
              {totalPurchases}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="agents" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="agents">My Agents</TabsTrigger>
          <TabsTrigger value="history">Purchase History</TabsTrigger>
        </TabsList>

        <TabsContent value="agents" className="space-y-4">
          {agents.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Bot className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Agents Yet</h3>
                <p className="text-muted-foreground">Create your first agent to start making payments</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Agent List */}
              <div className="space-y-3">
                {agents.map((agent) => (
                  <Card
                    key={agent.id}
                    className={`cursor-pointer transition-all ${
                      selectedAgent?.id === agent.id ? 'ring-2 ring-blue-500' : 'hover:shadow-md'
                    }`}
                    onClick={() => setSelectedAgent(agent)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            agent.isActive ? 'bg-green-100' : 'bg-gray-100'
                          }`}>
                            <Bot className={`w-5 h-5 ${agent.isActive ? 'text-green-600' : 'text-gray-500'}`} />
                          </div>
                          <div>
                            <h4 className="font-medium">{agent.name}</h4>
                            <p className="text-xs text-muted-foreground">
                              Created {new Date(agent.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {agent.isActive ? (
                            <Badge className="bg-green-100 text-green-700">Active</Badge>
                          ) : (
                            <Badge variant="secondary">Inactive</Badge>
                          )}
                        </div>
                      </div>

                      <div className="mt-3 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Spending</span>
                          <span className="font-medium">
                            {agent.spentAmount} / {agent.spendingLimit} USDC
                          </span>
                        </div>
                        <Progress
                          value={(parseFloat(agent.spentAmount) / parseFloat(agent.spendingLimit)) * 100}
                          className="h-2"
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Agent Details */}
              {selectedAgent && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          selectedAgent.isActive ? 'bg-green-100' : 'bg-gray-100'
                        }`}>
                          <Bot className={`w-6 h-6 ${selectedAgent.isActive ? 'text-green-600' : 'text-gray-500'}`} />
                        </div>
                        <div>
                          <CardTitle>{selectedAgent.name}</CardTitle>
                          <CardDescription>Agent Details</CardDescription>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => onToggleAgent(selectedAgent.id)}
                        >
                          {selectedAgent.isActive ? (
                            <PowerOff className="w-4 h-4 text-red-500" />
                          ) : (
                            <Power className="w-4 h-4 text-green-500" />
                          )}
                        </Button>
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => onDeleteAgent(selectedAgent.id)}
                          className="text-red-500 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="flex items-center gap-2">
                          <Key className="w-4 h-4" />
                          Session Key
                        </Label>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copySessionKey(selectedAgent.sessionKey)}
                        >
                          {copiedKey === selectedAgent.sessionKey ? (
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                      <code className="block p-3 bg-muted rounded-lg text-xs break-all">
                        {selectedAgent.sessionKey}
                      </code>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="text-xs text-muted-foreground mb-1">Spending Limit</p>
                        <p className="text-lg font-semibold">{selectedAgent.spendingLimit} USDC</p>
                      </div>
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="text-xs text-muted-foreground mb-1">Spent</p>
                        <p className="text-lg font-semibold text-blue-600">{selectedAgent.spentAmount} USDC</p>
                      </div>
                    </div>

                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">Purchases</p>
                      <p className="text-lg font-semibold">{selectedAgent.purchases.length}</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Purchase History
              </CardTitle>
              <CardDescription>All purchases across your agents</CardDescription>
            </CardHeader>
            <CardContent>
              {agents.flatMap((a) => a.purchases).length === 0 ? (
                <div className="py-12 text-center">
                  <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Purchases Yet</h3>
                  <p className="text-muted-foreground">Your purchase history will appear here</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Service</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Attestation</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {agents
                        .flatMap((agent) =>
                          agent.purchases.map((purchase) => ({ ...purchase, agentName: agent.name }))
                        )
                        .sort((a, b) => b.timestamp - a.timestamp)
                        .map((purchase) => (
                          <TableRow key={purchase.id}>
                            <TableCell>
                              <div>
                                <p className="font-medium">{purchase.serviceName}</p>
                                <p className="text-xs text-muted-foreground">{purchase.agentName}</p>
                              </div>
                            </TableCell>
                            <TableCell>{purchase.amount} USDC</TableCell>
                            <TableCell>{getStatusBadge(purchase.status)}</TableCell>
                            <TableCell>{formatDate(purchase.timestamp)}</TableCell>
                            <TableCell>
                              {purchase.attestation ? (
                                <Button size="sm" variant="ghost" className="gap-1">
                                  <ExternalLink className="w-3 h-3" />
                                  View
                                </Button>
                              ) : (
                                <span className="text-muted-foreground text-sm">-</span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

import { Label } from '@/components/ui/label';
