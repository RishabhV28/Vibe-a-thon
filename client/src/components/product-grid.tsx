import ProductCard from "./product-card";
import { Button } from "@/components/ui/button";
import type { SneakerWithSeller } from "@shared/schema";

interface ProductGridProps {
  products: SneakerWithSeller[];
  isLoading: boolean;
  viewMode: "grid" | "list";
  sortBy: string;
}

export default function ProductGrid({ products, isLoading, viewMode }: ProductGridProps) {
  
  if (isLoading) {
    return (
      <div className={`grid gap-6 ${
        viewMode === "grid" 
          ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
          : "grid-cols-1"
      }`}>
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-secondary rounded-xl overflow-hidden">
            <div className="skeleton w-full h-64"></div>
            <div className="p-4 space-y-2">
              <div className="skeleton h-4 w-3/4"></div>
              <div className="skeleton h-4 w-1/2"></div>
              <div className="skeleton h-6 w-1/3"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground text-lg">No sneakers found matching your criteria.</p>
        <p className="text-muted-foreground text-sm mt-2">Try adjusting your filters or search terms.</p>
      </div>
    );
  }

  return (
    <>
      <div className={`grid gap-6 ${
        viewMode === "grid" 
          ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
          : "grid-cols-1"
      }`}>
        {products.map((product) => (
          <ProductCard 
            key={product.id} 
            product={product} 
            viewMode={viewMode}
          />
        ))}
      </div>

      {/* Load More Button */}
      {products.length > 0 && (
        <div className="flex justify-center mt-12">
          <Button variant="outline" size="lg">
            Load More Products
          </Button>
        </div>
      )}
    </>
  );
}
