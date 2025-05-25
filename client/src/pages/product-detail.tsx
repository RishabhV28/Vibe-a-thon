import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Heart, ShoppingCart, Star, Shield, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import NavigationHeader from "@/components/navigation-header";
import VoiceAssistant from "@/components/voice-assistant";
import NegotiationModal from "@/components/negotiation-modal";
import { useState } from "react";
import type { SneakerWithSeller } from "@shared/schema";

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const [isNegotiationOpen, setIsNegotiationOpen] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);

  const { data: product, isLoading, error } = useQuery<SneakerWithSeller>({
    queryKey: [`/api/sneakers/${id}`],
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <NavigationHeader onSearchChange={() => {}} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-32 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="h-96 bg-muted rounded-xl"></div>
              <div className="space-y-4">
                <div className="h-8 bg-muted rounded w-3/4"></div>
                <div className="h-6 bg-muted rounded w-1/2"></div>
                <div className="h-12 bg-muted rounded w-1/3"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-background">
        <NavigationHeader onSearchChange={() => {}} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <p className="text-destructive">Product not found or failed to load.</p>
            <Link href="/">
              <Button variant="outline" className="mt-4">
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const conditionColor = {
    "New": "text-accent",
    "Like New": "text-yellow-400",
    "Used": "text-orange-400",
  }[product.condition] || "text-muted-foreground";

  return (
    <div className="min-h-screen bg-background">
      <NavigationHeader onSearchChange={() => {}} />
      <VoiceAssistant />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-8">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Sneakers
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="relative overflow-hidden rounded-xl bg-secondary">
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-full h-96 object-cover"
              />
              <button
                onClick={() => setIsFavorited(!isFavorited)}
                className="absolute top-4 right-4 bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-70 transition-colors"
              >
                <Heart 
                  className={`h-5 w-5 ${isFavorited ? "text-red-500 fill-current" : "text-white"}`} 
                />
              </button>
              {product.featured && (
                <Badge className="absolute top-4 left-4 bg-red-500 text-white">
                  Hot Deal
                </Badge>
              )}
              {product.aiDealAvailable && (
                <Badge className="absolute top-4 left-4 bg-accent text-accent-foreground">
                  AI Deal Available
                </Badge>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-start mb-2">
                <h1 className="text-3xl font-space font-bold">{product.name}</h1>
                <Badge variant="outline" className={conditionColor}>
                  {product.condition}
                </Badge>
              </div>
              <p className="text-muted-foreground text-lg">{product.brand}</p>
              <p className="text-sm text-muted-foreground">Size {product.size}</p>
            </div>

            {/* Price */}
            <div className="flex items-center gap-4">
              <span className="text-4xl font-bold">${product.price}</span>
              {product.originalPrice && product.originalPrice !== product.price && (
                <span className="text-xl text-muted-foreground line-through">
                  ${product.originalPrice}
                </span>
              )}
            </div>

            {/* Seller Info */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={product.seller.avatar || undefined} />
                    <AvatarFallback>
                      {product.seller.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{product.seller.username}</span>
                      {product.seller.verifiedSeller && (
                        <Shield className="h-4 w-4 text-accent" />
                      )}
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
                      <span className="text-sm text-muted-foreground">
                        ({product.seller.rating}) • {product.seller.totalSales} sales
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-3">
              <div className="flex gap-3">
                <Button className="flex-1" size="lg">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Add to Cart
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setIsNegotiationOpen(true)}
                  disabled={!product.aiDealAvailable}
                >
                  {product.aiDealAvailable ? "Negotiate Price" : "Price Fixed"}
                </Button>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Shield className="h-4 w-4" />
                  Authenticity Guaranteed
                </div>
                <div className="flex items-center gap-1">
                  <Truck className="h-4 w-4" />
                  Free Shipping
                </div>
              </div>
            </div>

            {/* Description */}
            {product.description && (
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-muted-foreground">{product.description}</p>
              </div>
            )}

            {/* Product Details */}
            <div>
              <h3 className="font-semibold mb-3">Product Details</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Brand:</span>
                  <span className="ml-2">{product.brand}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Model:</span>
                  <span className="ml-2">{product.model}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Colorway:</span>
                  <span className="ml-2">{product.colorway}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Size:</span>
                  <span className="ml-2">{product.size}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Condition:</span>
                  <span className={`ml-2 ${conditionColor}`}>{product.condition}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Negotiation Modal */}
      {isNegotiationOpen && (
        <NegotiationModal
          product={product}
          onClose={() => setIsNegotiationOpen(false)}
        />
      )}
    </div>
  );
}
