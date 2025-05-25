import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface FilterSidebarProps {
  filters: {
    search: string;
    brand: string;
    size: string;
    minPrice?: number;
    maxPrice?: number;
    condition: string;
  };
  onFiltersChange: (filters: any) => void;
}

interface FilterOptions {
  brands: { name: string; count: number }[];
  sizes: string[];
  conditions: string[];
  priceRange: { min: number; max: number };
}

export default function FilterSidebar({ filters, onFiltersChange }: FilterSidebarProps) {
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [selectedSize, setSelectedSize] = useState("");
  const [priceMin, setPriceMin] = useState<string>("");
  const [priceMax, setPriceMax] = useState<string>("");

  const { data: filterOptions } = useQuery<FilterOptions>({
    queryKey: ["/api/filters"],
  });

  const handleBrandChange = (brand: string, checked: boolean) => {
    const newBrands = checked
      ? [...selectedBrands, brand]
      : selectedBrands.filter(b => b !== brand);
    setSelectedBrands(newBrands);
  };

  const handleConditionChange = (condition: string, checked: boolean) => {
    const newConditions = checked
      ? [...selectedConditions, condition]
      : selectedConditions.filter(c => c !== condition);
    setSelectedConditions(newConditions);
  };

  const handleSizeSelect = (size: string) => {
    setSelectedSize(size === selectedSize ? "" : size);
  };

  const applyFilters = () => {
    onFiltersChange({
      ...filters,
      brand: selectedBrands.join(","),
      size: selectedSize,
      condition: selectedConditions.join(","),
      minPrice: priceMin ? parseFloat(priceMin) : undefined,
      maxPrice: priceMax ? parseFloat(priceMax) : undefined,
    });
  };

  const clearFilters = () => {
    setSelectedBrands([]);
    setSelectedConditions([]);
    setSelectedSize("");
    setPriceMin("");
    setPriceMax("");
    onFiltersChange({
      search: filters.search,
      brand: "",
      size: "",
      condition: "",
      minPrice: undefined,
      maxPrice: undefined,
    });
  };

  if (!filterOptions) {
    return (
      <aside className="w-64 flex-shrink-0">
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-muted rounded w-20"></div>
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded"></div>
                <div className="h-4 bg-muted rounded"></div>
                <div className="h-4 bg-muted rounded"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </aside>
    );
  }

  return (
    <aside className="w-64 flex-shrink-0">
      <Card className="sticky top-24">
        <CardHeader>
          <CardTitle className="text-lg font-space">Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Brand Filter */}
          <div>
            <h3 className="font-medium mb-3">Brand</h3>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {filterOptions.brands.map((brand) => (
                <div key={brand.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`brand-${brand.name}`}
                      checked={selectedBrands.includes(brand.name)}
                      onCheckedChange={(checked) => 
                        handleBrandChange(brand.name, checked as boolean)
                      }
                    />
                    <Label 
                      htmlFor={`brand-${brand.name}`}
                      className="text-sm text-muted-foreground cursor-pointer"
                    >
                      {brand.name}
                    </Label>
                  </div>
                  <span className="text-xs text-muted-foreground">({brand.count})</span>
                </div>
              ))}
            </div>
          </div>

          {/* Size Filter */}
          <div>
            <h3 className="font-medium mb-3">Size (US)</h3>
            <div className="grid grid-cols-3 gap-2">
              {filterOptions.sizes.map((size) => (
                <Button
                  key={size}
                  variant={selectedSize === size ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleSizeSelect(size)}
                  className="text-xs"
                >
                  {size}
                </Button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div>
            <h3 className="font-medium mb-3">Price Range</h3>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Min"
                value={priceMin}
                onChange={(e) => setPriceMin(e.target.value)}
                className="text-sm"
              />
              <Input
                type="number"
                placeholder="Max"
                value={priceMax}
                onChange={(e) => setPriceMax(e.target.value)}
                className="text-sm"
              />
            </div>
            {filterOptions.priceRange && (
              <div className="text-xs text-muted-foreground mt-1">
                ${filterOptions.priceRange.min} - ${filterOptions.priceRange.max}
              </div>
            )}
          </div>

          {/* Condition */}
          <div>
            <h3 className="font-medium mb-3">Condition</h3>
            <div className="space-y-2">
              {filterOptions.conditions.map((condition) => (
                <div key={condition} className="flex items-center space-x-2">
                  <Checkbox
                    id={`condition-${condition}`}
                    checked={selectedConditions.includes(condition)}
                    onCheckedChange={(checked) => 
                      handleConditionChange(condition, checked as boolean)
                    }
                  />
                  <Label 
                    htmlFor={`condition-${condition}`}
                    className="text-sm text-muted-foreground cursor-pointer"
                  >
                    {condition}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Apply/Clear Buttons */}
          <div className="space-y-2">
            <Button onClick={applyFilters} className="w-full">
              Apply Filters
            </Button>
            <Button onClick={clearFilters} variant="outline" className="w-full">
              Clear All
            </Button>
          </div>
        </CardContent>
      </Card>
    </aside>
  );
}
