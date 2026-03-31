import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Users, ArrowRight } from 'lucide-react';
import type { Service } from '@/types';

interface ServiceCardProps {
  service: Service;
  onPurchase: (service: Service) => void;
  isDemoSelected?: boolean;
}

export function ServiceCard({ service, onPurchase, isDemoSelected }: ServiceCardProps) {
  return (
    <Card
      onClick={() => onPurchase(service)}
      className={`group relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-blue-100 hover:-translate-y-1 cursor-pointer ${
        isDemoSelected ? 'ring-2 ring-blue-500 shadow-xl shadow-blue-200' : ''
      }`}
    >
      {/* Gradient Border Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center text-2xl shadow-inner">
              {service.icon}
            </div>
            <div>
              <h3 className="font-semibold text-lg leading-tight">{service.name}</h3>
              <p className="text-xs text-muted-foreground">{service.seller}</p>
            </div>
          </div>
          <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-full">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            <span className="text-xs font-medium">{service.sellerReputation}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pb-4">
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {service.description}
        </p>

        <div className="flex flex-wrap gap-1.5 mb-3">
          {service.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs bg-blue-50 text-blue-700 hover:bg-blue-100">
              {tag}
            </Badge>
          ))}
        </div>

        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            <span>{service.usageCount.toLocaleString()} uses</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-0 flex items-center justify-between">
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold text-blue-600">{service.price}</span>
          <span className="text-sm text-muted-foreground">USDC</span>
        </div>
        <Button
          onClick={(e) => {
            e.stopPropagation();
            onPurchase(service);
          }}
          className="gap-2 bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all hover:shadow-xl hover:shadow-blue-300"
        >
          <span>View Details</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
