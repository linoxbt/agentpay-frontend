import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { SERVICE_CATEGORIES, type ServiceCategory, type FilterState } from '@/types';
import { Filter, X } from 'lucide-react';

interface FilterSidebarProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function FilterSidebar({ filters, onFilterChange, isOpen, onClose }: FilterSidebarProps) {
  const handleCategoryToggle = (category: ServiceCategory) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter((c) => c !== category)
      : [...filters.categories, category];
    onFilterChange({ ...filters, categories: newCategories });
  };

  const handleMinPriceChange = (value: string) => {
    onFilterChange({ ...filters, minPrice: value });
  };

  const handleMaxPriceChange = (value: string) => {
    onFilterChange({ ...filters, maxPrice: value });
  };

  const handleReputationChange = (value: number[]) => {
    onFilterChange({ ...filters, minReputation: value[0] });
  };

  const clearFilters = () => {
    onFilterChange({
      categories: [],
      minPrice: '',
      maxPrice: '',
      minReputation: 0,
    });
  };

  const hasActiveFilters =
    filters.categories.length > 0 ||
    filters.minPrice !== '' ||
    filters.maxPrice !== '' ||
    filters.minReputation > 0;

  const sidebarContent = (
    <>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </CardTitle>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 text-red-600">
              <X className="w-4 h-4 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Categories */}
        <div>
          <h4 className="font-medium mb-3 text-sm">Categories</h4>
          <div className="space-y-2">
            {SERVICE_CATEGORIES.map((category) => (
              <div key={category.value} className="flex items-center space-x-2">
                <Checkbox
                  id={category.value}
                  checked={filters.categories.includes(category.value)}
                  onCheckedChange={() => handleCategoryToggle(category.value)}
                />
                <Label
                  htmlFor={category.value}
                  className="text-sm cursor-pointer flex items-center gap-2"
                >
                  <span>{category.icon}</span>
                  {category.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Price Range */}
        <div>
          <h4 className="font-medium mb-3 text-sm">Price Range (USDC)</h4>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Input
                type="number"
                placeholder="Min"
                value={filters.minPrice}
                onChange={(e) => handleMinPriceChange(e.target.value)}
                className="pr-8"
                min="0"
                step="0.001"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                $
              </span>
            </div>
            <span className="text-muted-foreground">-</span>
            <div className="relative flex-1">
              <Input
                type="number"
                placeholder="Max"
                value={filters.maxPrice}
                onChange={(e) => handleMaxPriceChange(e.target.value)}
                className="pr-8"
                min="0"
                step="0.001"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                $
              </span>
            </div>
          </div>
        </div>

        {/* Minimum Reputation */}
        <div>
          <h4 className="font-medium mb-3 text-sm">Minimum Reputation</h4>
          <div className="px-1">
            <Slider
              value={[filters.minReputation]}
              onValueChange={handleReputationChange}
              max={5}
              min={0}
              step={0.1}
            />
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span>Any</span>
              <span className="font-medium text-blue-600">
                {filters.minReputation > 0 ? `${filters.minReputation}+ stars` : 'Any'}
              </span>
              <span>5.0</span>
            </div>
          </div>
        </div>
      </CardContent>
    </>
  );

  // Mobile overlay
  if (isOpen) {
    return (
      <>
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
        <Card className="fixed left-0 top-0 h-full w-80 z-50 lg:hidden overflow-auto">
          {sidebarContent}
        </Card>
      </>
    );
  }

  // Desktop sidebar
  return (
    <Card className="hidden lg:block sticky top-24 h-fit">
      {sidebarContent}
    </Card>
  );
}
