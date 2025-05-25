import { useState } from "react";
import { Link } from "wouter";
import { Search, ShoppingCart, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface NavigationHeaderProps {
  onSearchChange: (search: string) => void;
}

export default function NavigationHeader({ onSearchChange }: NavigationHeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [cartCount] = useState(3); // Mock cart count

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchChange(searchQuery);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    // Debounced search
    const timeoutId = setTimeout(() => {
      onSearchChange(value);
    }, 300);
    
    return () => clearTimeout(timeoutId);
  };

  return (
    <nav className="bg-background border-b border-border sticky top-0 z-50 backdrop-blur-sm bg-background/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/">
            <div className="flex items-center cursor-pointer">
              <h1 className="text-2xl font-space font-bold text-accent">SneakDeal</h1>
              <Badge className="ml-2 bg-accent text-accent-foreground text-xs px-2 py-1">
                AI
              </Badge>
            </div>
          </Link>
          
          {/* Search Bar */}
          <div className="flex-1 max-w-2xl mx-8">
            <form onSubmit={handleSearchSubmit} className="relative">
              <Input
                type="text"
                placeholder="Search sneakers, brands, or sellers..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full bg-secondary border-border pl-10 text-foreground placeholder-muted-foreground focus:border-accent focus:ring-accent"
              />
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            </form>
          </div>
          
          {/* Navigation Links */}
          <div className="flex items-center space-x-6">
            <Link href="/sell">
              <span className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                Sell
              </span>
            </Link>
            <Link href="/my-deals">
              <span className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                My Deals
              </span>
            </Link>
            
            {/* Cart */}
            <div className="relative">
              <Button variant="ghost" size="sm" className="relative">
                <ShoppingCart className="h-4 w-4" />
                {cartCount > 0 && (
                  <Badge 
                    className="absolute -top-2 -right-2 bg-accent text-accent-foreground text-xs h-5 w-5 flex items-center justify-center p-0"
                  >
                    {cartCount}
                  </Badge>
                )}
              </Button>
            </div>
            
            {/* User */}
            <Button className="bg-foreground text-background hover:bg-foreground/90">
              <User className="h-4 w-4 mr-2" />
              Sign In
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
