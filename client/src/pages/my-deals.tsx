import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Clock, CheckCircle, XCircle, MessageCircle, Package, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import NavigationHeader from "@/components/navigation-header";
import type { Negotiation, SneakerWithSeller } from "@shared/schema";

interface DealWithProduct extends Negotiation {
  sneaker: SneakerWithSeller;
}

// Mock data for current user deals
const mockDeals: DealWithProduct[] = [
  {
    id: 1,
    sneakerId: 1,
    buyerId: 1,
    sellerId: 2,
    originalPrice: "2450.00",
    currentOffer: "2200.00",
    finalPrice: null,
    status: "active",
    messages: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    sneaker: {
      id: 1,
      name: 'Nike Air Jordan 1 Retro High "Chicago"',
      brand: "Nike",
      model: "Air Jordan 1 Retro High",
      colorway: "Chicago",
      price: "2450.00",
      originalPrice: "2450.00",
      size: "10",
      condition: "New",
      description: "Deadstock Nike Air Jordan 1 Retro High in the iconic Chicago colorway.",
      images: ["https://images.unsplash.com/photo-1584735175315-9d5df23860e6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"],
      sellerId: 2,
      available: true,
      featured: true,
      aiDealAvailable: true,
      createdAt: new Date(),
      seller: {
        id: 2,
        username: "kickscollector",
        email: "collector@example.com",
        password: "password123",
        avatar: "https://images.unsplash.com/photo-1494790108755-2616b79a6e72?w=100&h=100&fit=crop&crop=face",
        rating: "4.8",
        totalSales: 47,
        verifiedSeller: true
      }
    }
  },
  {
    id: 2,
    sneakerId: 4,
    buyerId: 1,
    sellerId: 1,
    originalPrice: "185.00",
    currentOffer: "165.00",
    finalPrice: "165.00",
    status: "accepted",
    messages: [],
    createdAt: new Date(Date.now() - 86400000), // 1 day ago
    updatedAt: new Date(Date.now() - 3600000), // 1 hour ago
    sneaker: {
      id: 4,
      name: 'Nike Air Max 90 "Infrared"',
      brand: "Nike",
      model: "Air Max 90",
      colorway: "Infrared",
      price: "185.00",
      originalPrice: "185.00",
      size: "8.5",
      condition: "Used",
      description: "Well-maintained Air Max 90 in the classic Infrared colorway.",
      images: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"],
      sellerId: 1,
      available: false,
      featured: false,
      aiDealAvailable: true,
      createdAt: new Date(),
      seller: {
        id: 1,
        username: "sneakerking",
        email: "king@example.com",
        password: "password123",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
        rating: "4.9",
        totalSales: 89,
        verifiedSeller: true
      }
    }
  }
];

export default function MyDeals() {
  const [activeTab, setActiveTab] = useState("active");

  // In a real app, you'd fetch deals from API
  const deals = mockDeals;
  
  const activeDeals = deals.filter(deal => deal.status === "active");
  const completedDeals = deals.filter(deal => deal.status === "accepted" || deal.status === "rejected");

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "accepted":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      active: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
      accepted: "bg-green-500/10 text-green-500 border-green-500/20",
      rejected: "bg-red-500/10 text-red-500 border-red-500/20"
    };
    
    return (
      <Badge variant="outline" className={variants[status as keyof typeof variants] || ""}>
        {getStatusIcon(status)}
        <span className="ml-1 capitalize">{status}</span>
      </Badge>
    );
  };

  const DealCard = ({ deal }: { deal: DealWithProduct }) => {
    const savings = parseFloat(deal.originalPrice) - parseFloat(deal.currentOffer || deal.finalPrice || deal.originalPrice);
    
    return (
      <Card className="hover:shadow-lg transition-shadow">
        <CardContent className="p-6">
          <div className="flex gap-4">
            <img
              src={deal.sneaker.images[0]}
              alt={deal.sneaker.name}
              className="w-20 h-20 object-cover rounded-lg"
            />
            
            <div className="flex-1 space-y-2">
              <div className="flex justify-between items-start">
                <h3 className="font-semibold text-foreground">{deal.sneaker.name}</h3>
                {getStatusBadge(deal.status)}
              </div>
              
              <p className="text-sm text-muted-foreground">
                Size {deal.sneaker.size} • {deal.sneaker.condition}
              </p>
              
              <div className="flex items-center gap-2">
                <Avatar className="w-6 h-6">
                  <AvatarImage src={deal.sneaker.seller.avatar || undefined} />
                  <AvatarFallback className="text-xs">
                    {deal.sneaker.seller.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm text-muted-foreground">
                  {deal.sneaker.seller.username}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">Original:</span>
                    <span className="line-through">${deal.originalPrice}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {deal.status === "accepted" ? "Final Price:" : "Current Offer:"}
                    </span>
                    <span className="font-semibold text-accent">
                      ${deal.finalPrice || deal.currentOffer}
                    </span>
                  </div>
                  {savings > 0 && (
                    <div className="text-sm text-green-500">
                      You saved ${savings.toFixed(2)}!
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2">
                  {deal.status === "active" && (
                    <Button size="sm" variant="outline">
                      <MessageCircle className="h-4 w-4 mr-1" />
                      Continue
                    </Button>
                  )}
                  {deal.status === "accepted" && (
                    <Button size="sm">
                      <Package className="h-4 w-4 mr-1" />
                      Track Order
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const stats = {
    totalDeals: deals.length,
    activeDeals: activeDeals.length,
    completedDeals: completedDeals.length,
    totalSavings: deals.reduce((acc, deal) => {
      if (deal.finalPrice) {
        return acc + (parseFloat(deal.originalPrice) - parseFloat(deal.finalPrice));
      }
      return acc;
    }, 0)
  };

  return (
    <div className="min-h-screen bg-background">
      <NavigationHeader onSearchChange={() => {}} />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-space font-bold mb-2">My Deals</h1>
          <p className="text-muted-foreground">
            Track your AI-negotiated deals and purchase history.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Total Deals</p>
                  <p className="text-2xl font-bold">{stats.totalDeals}</p>
                </div>
                <MessageCircle className="h-8 w-8 text-accent" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Active</p>
                  <p className="text-2xl font-bold">{stats.activeDeals}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Completed</p>
                  <p className="text-2xl font-bold">{stats.completedDeals}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Total Saved</p>
                  <p className="text-2xl font-bold">${stats.totalSavings.toFixed(0)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Deals Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="active">
              Active Negotiations ({activeDeals.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Purchase History ({completedDeals.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="active" className="space-y-4 mt-6">
            {activeDeals.length > 0 ? (
              activeDeals.map((deal) => (
                <DealCard key={deal.id} deal={deal} />
              ))
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Active Negotiations</h3>
                  <p className="text-muted-foreground mb-4">
                    Start browsing sneakers and let our AI negotiate the best deals for you!
                  </p>
                  <Button>Browse Sneakers</Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="completed" className="space-y-4 mt-6">
            {completedDeals.length > 0 ? (
              completedDeals.map((deal) => (
                <DealCard key={deal.id} deal={deal} />
              ))
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Completed Purchases</h3>
                  <p className="text-muted-foreground mb-4">
                    Your purchase history will appear here once you complete your first deal.
                  </p>
                  <Button>Start Shopping</Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}