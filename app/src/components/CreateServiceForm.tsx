import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Store, 
  DollarSign, 
  Tag, 
  Link, 
  FileText, 
  CheckCircle2, 
  Plus,
  X,
  AlertCircle
} from 'lucide-react';
import { SERVICE_CATEGORIES, type CreateServiceInput, type ServiceCategory } from '@/types';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';

interface CreateServiceFormProps {
  onCreateService: (input: CreateServiceInput) => void;
  onCancel: () => void;
  sellerName: string;
}

export function CreateServiceForm({ onCreateService, onCancel, sellerName }: CreateServiceFormProps) {
  const { isConnected, address } = useAccount();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState<ServiceCategory>('text-generation');
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState('');
  const [apiEndpoint, setApiEndpoint] = useState('');
  const [documentation, setDocumentation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleAddTag = () => {
    if (currentTag.trim() && !tags.includes(currentTag.trim())) {
      setTags([...tags, currentTag.trim()]);
      setCurrentTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected || !address) return;

    setIsSubmitting(true);
    
    const input: CreateServiceInput = {
      name: name.trim(),
      description: description.trim(),
      price: price.trim(),
      category,
      tags,
      apiEndpoint: apiEndpoint.trim(),
      documentation: documentation.trim(),
    };

    onCreateService(input);
    setIsSuccess(true);
    setIsSubmitting(false);
  };

  const isValid = 
    name.trim() && 
    description.trim() && 
    price.trim() && 
    parseFloat(price) > 0 &&
    apiEndpoint.trim() &&
    documentation.trim();

  if (isSuccess) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <CardTitle>Service Created!</CardTitle>
              <CardDescription>Your AI service is now live on the marketplace</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted rounded-lg">
            <p className="font-medium">{name}</p>
            <p className="text-sm text-muted-foreground">{description}</p>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="secondary">{price} USDC</Badge>
              <Badge variant="outline">{SERVICE_CATEGORIES.find(c => c.value === category)?.label}</Badge>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={onCancel} className="w-full bg-blue-600 hover:bg-blue-700">
            Go to Marketplace
          </Button>
        </CardFooter>
      </Card>
    );
  }

  if (!isConnected) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center">
              <Store className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle>Create New Service</CardTitle>
              <CardDescription>List your AI service on the marketplace</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert className="bg-amber-50 border-amber-200">
            <AlertCircle className="w-4 h-4 text-amber-500" />
            <AlertDescription>
              Please connect your wallet to create a service
            </AlertDescription>
          </Alert>
          <div className="flex justify-center">
            <ConnectButton />
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline" onClick={onCancel} className="w-full">
            Cancel
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center">
            <Store className="w-6 h-6 text-white" />
          </div>
          <div>
            <CardTitle>Create New Service</CardTitle>
            <CardDescription>List your AI service on the marketplace</CardDescription>
          </div>
        </div>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          {/* Service Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Service Name</Label>
            <Input
              id="name"
              placeholder="e.g., GPT-4 Content Writer"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe what your service does..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              required
            />
          </div>

          {/* Price and Category Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price" className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Price (USDC)
              </Label>
              <Input
                id="price"
                type="number"
                step="0.0001"
                min="0.0001"
                placeholder="0.001"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as ServiceCategory)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SERVICE_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      <span className="flex items-center gap-2">
                        <span>{cat.icon}</span>
                        {cat.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Tag className="w-4 h-4" />
              Tags
            </Label>
            <div className="flex gap-2">
              <Input
                placeholder="Add a tag..."
                value={currentTag}
                onChange={(e) => setCurrentTag(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
              />
              <Button type="button" onClick={handleAddTag} variant="outline" size="icon">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="gap-1">
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-1 hover:text-red-500"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          {/* API Endpoint */}
          <div className="space-y-2">
            <Label htmlFor="apiEndpoint" className="flex items-center gap-2">
              <Link className="w-4 h-4" />
              API Endpoint
            </Label>
            <Input
              id="apiEndpoint"
              placeholder="/api/v1/your-service"
              value={apiEndpoint}
              onChange={(e) => setApiEndpoint(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">
              The endpoint path for your service API
            </p>
          </div>

          {/* Documentation */}
          <div className="space-y-2">
            <Label htmlFor="documentation" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Documentation
            </Label>
            <Textarea
              id="documentation"
              placeholder="# API Documentation\n\n## Endpoint\nPOST /api/v1/your-service\n\n## Parameters\n- param1: description\n- param2: description"
              value={documentation}
              onChange={(e) => setDocumentation(e.target.value)}
              rows={6}
              required
            />
          </div>

          {/* Seller Info */}
          <Alert className="bg-blue-50 border-blue-200">
            <AlertCircle className="w-4 h-4 text-blue-500" />
            <AlertDescription className="text-sm">
              Service will be listed as <strong>{sellerName}</strong> at address{' '}
              <code className="text-xs bg-blue-100 px-1 rounded">{address?.slice(0, 6)}...{address?.slice(-4)}</code>
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
            disabled={!isValid || isSubmitting}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Creating...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Store className="w-4 h-4" />
                Create Service
              </span>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
