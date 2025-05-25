import { useState } from "react";
import { Link } from "wouter";
import { Heart, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import NegotiationModal from "./negotiation-modal";
import type { SneakerWithSeller } from "@shared/schema";

interface ProductCardProps {
  product: SneakerWithSeller;
  viewMode: "grid" | "list";
}

export default function ProductCard({ product, viewMode }: ProductCardProps) {
  const [isFavorited, setIsFavorited] = useState(false);
  const [isNegotiationOpen, setIsNegotiationOpen] = useState(false);

  const handleNegotiateClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsNegotiationOpen(true);
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorited(!isFavorited);
  };

  const conditionColor = {
    "New": "text-accent",
    "Like New": "text-yellow-400", 
    "Used": "text-orange-400",
  }[product.condition] || "text-muted-foreground";

  const CardWrapper = ({ children }: { children: React.ReactNode }) => (
    <Link href={`/product/${product.id}`}>
      <Card className="bg-secondary hover:ring-2 hover:ring-accent transition-all duration-300 group cursor-pointer overflow-hidden">
        {children}
      </Card>
    </Link>
  );

  if (viewMode === "list") {
    return (
      <>
        <CardWrapper>
          <CardContent className="p-0">
            <div className="flex">
              <div className="relative w-48 h-32">
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <button
                  onClick={handleFavoriteClick}
                  className="absolute top-2 right-2 bg-black bg-opacity-50 rounded-full p-1.5"
                >
                  <Heart className={`h-3 w-3 ${isFavorited ? "text-red-500 fill-current" : "text-white"}`} />
                </button>
                {product.aiDealAvailable && (
                  <Badge className="absolute top-2 left-2 bg-accent text-accent-foreground text-xs">
                    AI Deal
                  </Badge>
                )}
              </div>
              
              <div className="flex-1 p-4 flex justify-between">
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-medium text-foreground">{product.name}</h3>
                    <Badge variant="outline" className={conditionColor}>
                      {product.condition}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground text-sm mb-1">{product.brand}</p>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-lg font-bold text-foreground">${product.price}</span>
                    <span className="text-sm text-muted-foreground">Size {product.size}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3 w-3 ${
                            i < Math.floor(parseFloat(product.seller.rating))
                              ? "text-yellow-400 fill-current"
                              : "text-muted-foreground"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-muted-foreground text-xs">({product.seller.rating})</span>
                  </div>
                </div>
                
                <div className="ml-4">
                  <Button
                    onClick={handleNegotiateClick}
                    size="sm"
                    disabled={!product.aiDealAvailable}
                  >
                    {product.aiDealAvailable ? "Negotiate" : "Fixed Price"}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </CardWrapper>
        
        {isNegotiationOpen && (
          <NegotiationModal
            product={product}
            onClose={() => setIsNegotiationOpen(false)}
          />
        )}
      </>
    );
  }

  return (
    <>
      <CardWrapper>
        <CardContent className="p-0">
          <div className="relative">
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
            />
            
            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-1">
              {product.aiDealAvailable && (
                <Badge className="bg-accent text-accent-foreground text-xs">
                  AI Deal Available
                </Badge>
              )}
              {product.featured && (
                <Badge className="bg-red-500 text-white text-xs">
                  Hot Deal
                </Badge>
              )}
            </div>
            
            {/* Favorite Button */}
            <button
              onClick={handleFavoriteClick}
              className="absolute top-3 right-3 bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-70 transition-colors"
            >
              <Heart className={`h-4 w-4 ${isFavorited ? "text-red-500 fill-current" : "text-white"}`} />
            </button>
          </div>
          
          <div className="p-4">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-medium text-foreground line-clamp-2">{product.name}</h3>
              <Badge variant="outline" className={conditionColor}>
                {product.condition}
              </Badge>
            </div>
            <p className="text-muted-foreground text-sm mb-2">{product.brand}</p>
            
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-foreground">${product.price}</span>
                {product.originalPrice && product.originalPrice !== product.price && (
                  <span className="text-sm text-muted-foreground line-through">
                    ${product.originalPrice}
                  </span>
                )}
              </div>
              <span className="text-sm text-muted-foreground">Size {product.size}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3 w-3 ${
                        i < Math.floor(parseFloat(product.seller.rating))
                          ? "text-yellow-400 fill-current"
                          : "text-muted-foreground"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-muted-foreground text-xs">({product.seller.rating})</span>
              </div>
              
              <Button
                onClick={handleNegotiateClick}
                size="sm"
                disabled={!product.aiDealAvailable}
              >
                {product.aiDealAvailable ? "Negotiate" : "Fixed"}
              </Button>
            </div>
          </div>
        </CardContent>
      </CardWrapper>
      
      {isNegotiationOpen && (
        <NegotiationModal
          product={product}
          onClose={() => setIsNegotiationOpen(false)}
        />
      )}
    </>
  );
}
