import { useState } from "react";
import { X, MessageCircle, Bot, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNegotiation } from "@/hooks/use-negotiation";
import type { SneakerWithSeller, NegotiationMessage } from "@shared/schema";

interface NegotiationModalProps {
  product: SneakerWithSeller;
  onClose: () => void;
}

export default function NegotiationModal({ product, onClose }: NegotiationModalProps) {
  const [buyerId] = useState(1); // Mock buyer ID
  const { 
    negotiation, 
    isLoading, 
    startNegotiation, 
    continueNegotiation, 
    acceptDeal 
  } = useNegotiation();

  const [hasStarted, setHasStarted] = useState(false);

  const handleStartNegotiation = async () => {
    if (!hasStarted) {
      await startNegotiation({
        sneakerId: product.id,
        buyerId,
        sellerId: product.sellerId,
        originalPrice: product.price,
        currentOffer: product.price,
        status: "active",
      });
      setHasStarted(true);
    }
  };

  const handleContinueNegotiation = () => {
    if (negotiation) {
      continueNegotiation(negotiation.id);
    }
  };

  const handleAcceptDeal = () => {
    if (negotiation) {
      acceptDeal(negotiation.id);
    }
  };

  // Auto-start negotiation when modal opens
  if (!hasStarted && !isLoading) {
    handleStartNegotiation();
  }

  const messages: NegotiationMessage[] = negotiation?.messages || [];
  const originalPrice = parseFloat(product.price);
  const currentOffer = negotiation ? parseFloat(negotiation.currentOffer) : originalPrice;
  const savings = originalPrice - currentOffer;

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="bg-secondary max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <DialogHeader>
          <div className="flex justify-between items-center">
            <div>
              <DialogTitle className="text-xl font-space font-semibold text-accent">
                AI Deal Negotiation
              </DialogTitle>
              <p className="text-muted-foreground text-sm">
                {product.name} - Size {product.size}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Chat Messages */}
        <div className="h-96 overflow-y-auto p-4 space-y-4 bg-muted/10 rounded-lg">
          {isLoading && !hasStarted ? (
            <div className="flex justify-center items-center h-full">
              <div className="text-muted-foreground">Starting AI negotiation...</div>
            </div>
          ) : (
            <>
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex items-start gap-3 ${
                    message.type === "seller" ? "justify-end" : ""
                  }`}
                >
                  {message.type !== "seller" && (
                    <div className="bg-accent text-accent-foreground w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium">
                      {message.type === "ai" ? <Bot className="h-4 w-4" /> : <UserIcon className="h-4 w-4" />}
                    </div>
                  )}
                  
                  <div
                    className={`rounded-lg p-3 max-w-xs ${
                      message.type === "seller"
                        ? "bg-blue-600 text-white"
                        : "bg-card text-card-foreground"
                    }`}
                  >
                    <p className="text-sm">{message.message}</p>
                    <span className="text-xs opacity-70">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  
                  {message.type === "seller" && (
                    <div className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium">
                      S
                    </div>
                  )}
                </div>
              ))}

              {/* Typing Indicator */}
              {isLoading && hasStarted && (
                <div className="flex items-start gap-3 justify-end">
                  <div className="bg-blue-600 rounded-lg p-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                      <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                    </div>
                  </div>
                  <div className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium">
                    S
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Deal Summary */}
        <Card>
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Original Price:</span>
                <span className="text-muted-foreground line-through">${originalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">AI Negotiated:</span>
                <span className="text-accent font-semibold">${currentOffer.toFixed(2)}</span>
              </div>
              {savings > 0 && (
                <div className="flex justify-between items-center text-accent">
                  <span className="font-medium">You Save:</span>
                  <span className="font-bold">${savings.toFixed(2)}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={handleContinueNegotiation}
            disabled={isLoading || !negotiation || negotiation.status !== "active"}
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            Keep Negotiating
          </Button>
          <Button
            className="flex-1"
            onClick={handleAcceptDeal}
            disabled={!negotiation || negotiation.status !== "active"}
          >
            Accept Deal
          </Button>
        </div>

        {negotiation?.status === "accepted" && (
          <div className="text-center">
            <Badge className="bg-green-500 text-white">
              Deal Accepted! Proceeding to checkout...
            </Badge>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
