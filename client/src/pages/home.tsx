import { useState } from "react";
import NavigationHeader from "@/components/navigation-header";
import VoiceAssistant from "@/components/voice-assistant";
import FilterSidebar from "@/components/filter-sidebar";
import ProductGrid from "@/components/product-grid";
import { useProducts } from "@/hooks/use-products";

export default function Home() {
  const [filters, setFilters] = useState({
    search: "",
    brand: "",
    size: "",
    minPrice: undefined as number | undefined,
    maxPrice: undefined as number | undefined,
    condition: "",
  });

  const [sortBy, setSortBy] = useState("relevant");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const { data: products, isLoading, error } = useProducts(filters);

  const handleFiltersChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
  };

  const handleSearchChange = (search: string) => {
    setFilters(prev => ({ ...prev, search }));
  };

  return (
    <div className="min-h-screen bg-background">
      <NavigationHeader onSearchChange={handleSearchChange} />
      <VoiceAssistant />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          <FilterSidebar 
            filters={filters}
            onFiltersChange={handleFiltersChange}
          />
          
          <div className="flex-1">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-3xl font-space font-bold mb-2">Sneakers</h1>
                <p className="text-muted-foreground">
                  {isLoading ? "Loading..." : `${products?.length || 0} items found`}
                </p>
              </div>
              
              <div className="flex items-center gap-4">
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-secondary border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  <option value="relevant">Most Relevant</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="newest">Newest</option>
                </select>
                
                <div className="flex bg-secondary rounded-lg p-1">
                  <button 
                    onClick={() => setViewMode("grid")}
                    className={`px-3 py-1 rounded ${
                      viewMode === "grid" 
                        ? "bg-accent text-accent-foreground" 
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <i className="fas fa-th"></i>
                  </button>
                  <button 
                    onClick={() => setViewMode("list")}
                    className={`px-3 py-1 rounded ${
                      viewMode === "list" 
                        ? "bg-accent text-accent-foreground" 
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <i className="fas fa-list"></i>
                  </button>
                </div>
              </div>
            </div>

            {error ? (
              <div className="text-center py-12">
                <p className="text-destructive">Failed to load products. Please try again.</p>
              </div>
            ) : (
              <ProductGrid 
                products={products || []}
                isLoading={isLoading}
                viewMode={viewMode}
                sortBy={sortBy}
              />
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-secondary border-t border-border mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-space font-semibold text-accent mb-4">SneakDeal</h3>
              <p className="text-muted-foreground text-sm mb-4">
                The first AI-powered sneaker marketplace that negotiates the best deals for you.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-muted-foreground hover:text-foreground">
                  <i className="fab fa-twitter"></i>
                </a>
                <a href="#" className="text-muted-foreground hover:text-foreground">
                  <i className="fab fa-instagram"></i>
                </a>
                <a href="#" className="text-muted-foreground hover:text-foreground">
                  <i className="fab fa-tiktok"></i>
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-foreground mb-4">Shop</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">All Sneakers</a></li>
                <li><a href="#" className="hover:text-foreground">Nike</a></li>
                <li><a href="#" className="hover:text-foreground">Adidas</a></li>
                <li><a href="#" className="hover:text-foreground">Jordan</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-foreground mb-4">Sell</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">Start Selling</a></li>
                <li><a href="#" className="hover:text-foreground">Seller Protection</a></li>
                <li><a href="#" className="hover:text-foreground">Authentication</a></li>
                <li><a href="#" className="hover:text-foreground">Shipping</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-foreground mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">Help Center</a></li>
                <li><a href="#" className="hover:text-foreground">Contact Us</a></li>
                <li><a href="#" className="hover:text-foreground">Size Guide</a></li>
                <li><a href="#" className="hover:text-foreground">Returns</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-border mt-8 pt-8 flex justify-between items-center">
            <p className="text-muted-foreground text-sm">© 2024 SneakDeal. All rights reserved.</p>
            <div className="flex space-x-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground">Privacy Policy</a>
              <a href="#" className="hover:text-foreground">Terms of Service</a>
              <a href="#" className="hover:text-foreground">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
