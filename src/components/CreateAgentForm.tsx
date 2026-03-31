import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Bot, Key, DollarSign, AlertCircle, CheckCircle2, Copy, RefreshCw } from 'lucide-react';
import type { Agent } from '@/types';

interface CreateAgentFormProps {
  onCreateAgent: (name: string, spendingLimit: string) => Agent;
  onCancel: () => void;
}

export function CreateAgentForm({ onCreateAgent, onCancel }: CreateAgentFormProps) {
  const [name, setName] = useState('');
  const [spendingLimit, setSpendingLimit] = useState([0.01]);
  const [createdAgent, setCreatedAgent] = useState<Agent | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      const agent = onCreateAgent(name.trim(), spendingLimit[0].toFixed(6));
      setCreatedAgent(agent);
    }
  };

  const copySessionKey = () => {
    if (createdAgent) {
      navigator.clipboard.writeText(createdAgent.sessionKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const generateNewKey = () => {
    if (createdAgent) {
      const updatedAgent = {
        ...createdAgent,
        sessionKey: `sk-${Math.random().toString(36).substr(2, 16)}${Math.random().toString(36).substr(2, 16)}`,
      };
      setCreatedAgent(updatedAgent);
    }
  };

  if (createdAgent) {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <CardTitle>Agent Created!</CardTitle>
              <CardDescription>Your AI agent is ready to make payments</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Agent Name</Label>
            <div className="p-3 bg-muted rounded-lg font-medium">{createdAgent.name}</div>
          </div>

          <div className="space-y-2">
            <Label>Spending Limit</Label>
            <div className="p-3 bg-muted rounded-lg">
              <span className="text-2xl font-bold text-blue-600">{createdAgent.spendingLimit}</span>
              <span className="text-muted-foreground ml-1">USDC</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <Key className="w-4 h-4" />
                Session Key
              </Label>
              <Badge variant="outline" className="text-xs">Keep Secret</Badge>
            </div>
            <div className="flex gap-2">
              <code className="flex-1 p-3 bg-muted rounded-lg text-xs break-all">
                {createdAgent.sessionKey}
              </code>
              <div className="flex flex-col gap-1">
                <Button size="icon" variant="outline" onClick={copySessionKey} className="h-8 w-8">
                  {copied ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </Button>
                <Button size="icon" variant="outline" onClick={generateNewKey} className="h-8 w-8">
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              This key allows your agent to sign payments on your behalf.
            </p>
          </div>

          <Alert className="bg-blue-50 border-blue-200">
            <AlertCircle className="w-4 h-4 text-blue-500" />
            <AlertDescription className="text-xs text-blue-700">
              Save this session key securely. It cannot be recovered if lost.
            </AlertDescription>
          </Alert>
        </CardContent>
        <CardFooter>
          <Button onClick={onCancel} className="w-full bg-blue-600 hover:bg-blue-700">
            Go to Marketplace
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <CardTitle>Create New Agent</CardTitle>
            <CardDescription>Set up an AI agent with spending limits</CardDescription>
          </div>
        </div>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Agent Name</Label>
            <Input
              id="name"
              placeholder="e.g., Content Writer Bot"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Spending Limit
              </Label>
              <Badge variant="secondary" className="text-blue-600">
                {spendingLimit[0].toFixed(3)} USDC
              </Badge>
            </div>
            <Slider
              value={spendingLimit}
              onValueChange={setSpendingLimit}
              max={0.1}
              min={0.001}
              step={0.001}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0.001 USDC</span>
              <span>0.1 USDC</span>
            </div>
          </div>

          <Alert className="bg-amber-50 border-amber-200">
            <AlertCircle className="w-4 h-4 text-amber-500" />
            <AlertDescription className="text-xs text-amber-700">
              Your agent will be able to spend up to this amount without additional approval.
            </AlertDescription>
          </Alert>
        </CardContent>
        <CardFooter className="flex gap-2">
          <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
            Cancel
          </Button>
          <Button
            type="submit"
            className="flex-1 bg-blue-600 hover:bg-blue-700"
            disabled={!name.trim()}
          >
            <Bot className="w-4 h-4 mr-2" />
            Create Agent
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
