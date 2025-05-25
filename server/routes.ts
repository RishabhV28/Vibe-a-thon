import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertSneakerSchema, insertNegotiationSchema, insertCartItemSchema, type NegotiationMessage } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Get all sneakers with optional filters
  app.get("/api/sneakers", async (req, res) => {
    try {
      const filters = {
        brand: req.query.brand as string,
        size: req.query.size as string,
        minPrice: req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined,
        maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined,
        condition: req.query.condition as string,
        search: req.query.search as string,
      };

      // Remove undefined values
      Object.keys(filters).forEach(key => {
        if (filters[key as keyof typeof filters] === undefined) {
          delete filters[key as keyof typeof filters];
        }
      });

      const sneakers = await storage.getSneakers(filters);
      res.json(sneakers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch sneakers" });
    }
  });

  // Get single sneaker by ID
  app.get("/api/sneakers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const sneaker = await storage.getSneaker(id);
      
      if (!sneaker) {
        return res.status(404).json({ message: "Sneaker not found" });
      }
      
      res.json(sneaker);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch sneaker" });
    }
  });

  // Create new sneaker listing
  app.post("/api/sneakers", async (req, res) => {
    try {
      const validatedData = insertSneakerSchema.parse(req.body);
      const sneaker = await storage.createSneaker(validatedData);
      res.status(201).json(sneaker);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid sneaker data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create sneaker listing" });
    }
  });

  // Start AI negotiation
  app.post("/api/negotiations", async (req, res) => {
    try {
      const validatedData = insertNegotiationSchema.parse(req.body);
      
      // Simulate AI negotiation logic
      const sneaker = await storage.getSneaker(validatedData.sneakerId);
      if (!sneaker) {
        return res.status(404).json({ message: "Sneaker not found" });
      }

      const originalPrice = parseFloat(sneaker.price);
      const initialOffer = Math.max(originalPrice * 0.85, originalPrice - 300); // AI starts with 15% discount or $300 off
      
      const initialMessages: NegotiationMessage[] = [
        {
          id: "1",
          type: "ai",
          message: `I found this ${sneaker.name} for $${originalPrice}. Let me negotiate with the seller for a better price. The current market average is $${(originalPrice * 0.9).toFixed(0)}.`,
          timestamp: new Date().toISOString(),
        }
      ];

      const negotiation = await storage.createNegotiation({
        ...validatedData,
        currentOffer: initialOffer.toFixed(2),
        messages: initialMessages.map(m => JSON.stringify(m)),
        status: "active",
      });

      res.status(201).json(negotiation);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid negotiation data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to start negotiation" });
    }
  });

  // Get negotiation by ID
  app.get("/api/negotiations/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const negotiation = await storage.getNegotiation(id);
      
      if (!negotiation) {
        return res.status(404).json({ message: "Negotiation not found" });
      }
      
      // Parse messages from string array to objects
      const parsedNegotiation = {
        ...negotiation,
        messages: negotiation.messages?.map(msg => JSON.parse(msg)) || [],
      };
      
      res.json(parsedNegotiation);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch negotiation" });
    }
  });

  // Update negotiation (continue AI negotiation)
  app.patch("/api/negotiations/:id/continue", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const negotiation = await storage.getNegotiation(id);
      
      if (!negotiation) {
        return res.status(404).json({ message: "Negotiation not found" });
      }

      if (negotiation.status !== "active") {
        return res.status(400).json({ message: "Negotiation is not active" });
      }

      // Simulate seller response and AI counter-offer
      const currentOffer = parseFloat(negotiation.currentOffer);
      const originalPrice = parseFloat(negotiation.originalPrice);
      
      // Simulate seller counter-offer (usually splitting the difference)
      const sellerCounter = currentOffer + ((originalPrice - currentOffer) * 0.5);
      
      // AI makes another offer (splitting again)
      const aiNewOffer = currentOffer + ((sellerCounter - currentOffer) * 0.7);
      
      const existingMessages: NegotiationMessage[] = negotiation.messages?.map(msg => JSON.parse(msg)) || [];
      
      const newMessages: NegotiationMessage[] = [
        {
          id: (existingMessages.length + 1).toString(),
          type: "seller",
          message: `Thanks for your interest! I can do $${sellerCounter.toFixed(0)} as my lowest price. These are ${negotiation.originalPrice > "1000" ? "rare and authenticated" : "in excellent condition"}.`,
          timestamp: new Date().toISOString(),
        },
        {
          id: (existingMessages.length + 2).toString(),
          type: "ai",
          message: `I understand they're in great condition. Would you consider $${aiNewOffer.toFixed(0)}? I'm seeing similar pairs at that price point, and my client is ready to purchase immediately.`,
          timestamp: new Date().toISOString(),
        }
      ];

      const updatedMessages = [...existingMessages, ...newMessages];
      
      const updatedNegotiation = await storage.updateNegotiation(id, {
        currentOffer: aiNewOffer.toFixed(2),
        messages: updatedMessages.map(m => JSON.stringify(m)),
      });

      if (!updatedNegotiation) {
        return res.status(404).json({ message: "Failed to update negotiation" });
      }

      res.json({
        ...updatedNegotiation,
        messages: updatedMessages,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to continue negotiation" });
    }
  });

  // Accept negotiation deal
  app.patch("/api/negotiations/:id/accept", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const negotiation = await storage.getNegotiation(id);
      
      if (!negotiation) {
        return res.status(404).json({ message: "Negotiation not found" });
      }

      const updatedNegotiation = await storage.updateNegotiation(id, {
        status: "accepted",
        finalPrice: negotiation.currentOffer,
      });

      if (!updatedNegotiation) {
        return res.status(404).json({ message: "Failed to accept negotiation" });
      }

      res.json(updatedNegotiation);
    } catch (error) {
      res.status(500).json({ message: "Failed to accept negotiation" });
    }
  });

  // Get cart items for user
  app.get("/api/cart/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const cartItems = await storage.getCartItems(userId);
      res.json(cartItems);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch cart items" });
    }
  });

  // Add item to cart
  app.post("/api/cart", async (req, res) => {
    try {
      const validatedData = insertCartItemSchema.parse(req.body);
      const cartItem = await storage.addToCart(validatedData);
      res.status(201).json(cartItem);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid cart item data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to add item to cart" });
    }
  });

  // Remove item from cart
  app.delete("/api/cart/:userId/:sneakerId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const sneakerId = parseInt(req.params.sneakerId);
      
      const success = await storage.removeFromCart(userId, sneakerId);
      
      if (!success) {
        return res.status(404).json({ message: "Cart item not found" });
      }
      
      res.json({ message: "Item removed from cart" });
    } catch (error) {
      res.status(500).json({ message: "Failed to remove item from cart" });
    }
  });

  // Get filter options (brands, sizes, etc.)
  app.get("/api/filters", async (req, res) => {
    try {
      const allSneakers = await storage.getSneakers();
      
      const brands = [...new Set(allSneakers.map(s => s.brand))];
      const sizes = [...new Set(allSneakers.map(s => s.size))].sort((a, b) => parseFloat(a) - parseFloat(b));
      const conditions = [...new Set(allSneakers.map(s => s.condition))];
      
      res.json({
        brands: brands.map(brand => ({
          name: brand,
          count: allSneakers.filter(s => s.brand === brand).length,
        })),
        sizes,
        conditions,
        priceRange: {
          min: Math.min(...allSneakers.map(s => parseFloat(s.price))),
          max: Math.max(...allSneakers.map(s => parseFloat(s.price))),
        },
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch filter options" });
    }
  });

  // AI Voice Assistant - Process voice commands
  app.post("/api/voice/process", async (req, res) => {
    try {
      const { query } = req.body;
      
      if (!query) {
        return res.status(400).json({ message: "Voice query is required" });
      }

      // Use Omnidimension API to process natural language
      const omnidimensionResponse = await fetch("https://api.omnidimension.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OMNIDIMENSION_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4",
          messages: [
            {
              role: "system",
              content: `You are an AI assistant for a sneaker marketplace called SneakDeal. Your job is to help users find sneakers based on their voice commands. 
              
              Available brands: Nike, Adidas
              Available sizes: 8.5, 9, 9.5, 10, 11, 12
              Available conditions: New, Like New, Used
              
              Parse the user's request and return a JSON response with:
              - "intent": "search" | "info" | "negotiate"
              - "filters": object with brand, size, condition, maxPrice if mentioned
              - "response": friendly response to the user
              - "productRecommendations": array of product IDs if specific products match
              
              Current available products:
              1. Nike Air Jordan 1 Retro High "Chicago" - Size 10 - $2450 - New
              2. Adidas Yeezy Boost 350 V2 "Zebra" - Size 9.5 - $890 - Like New  
              3. Nike Air Force 1 Low "White" - Size 11 - $120 - New
              4. Nike Air Max 90 "Infrared" - Size 8.5 - $185 - Used
              5. Off-White x Nike Air Jordan 1 - Size 9 - $4850 - New
              6. Adidas Stan Smith "White/Green" - Size 12 - $75 - Like New`
            },
            {
              role: "user",
              content: query
            }
          ],
          temperature: 0.7,
          max_tokens: 500
        })
      });

      if (!omnidimensionResponse.ok) {
        throw new Error(`Omnidimension API error: ${omnidimensionResponse.status}`);
      }

      const aiResult = await omnidimensionResponse.json();
      const aiResponse = aiResult.choices[0].message.content;
      
      let parsedResponse;
      try {
        parsedResponse = JSON.parse(aiResponse);
      } catch {
        // Fallback if AI doesn't return valid JSON
        parsedResponse = {
          intent: "search",
          filters: {},
          response: aiResponse,
          productRecommendations: []
        };
      }

      // If filters are provided, search for matching products
      let matchingProducts = [];
      if (parsedResponse.filters && Object.keys(parsedResponse.filters).length > 0) {
        matchingProducts = await storage.getSneakers(parsedResponse.filters);
      }

      res.json({
        ...parsedResponse,
        matchingProducts: matchingProducts.slice(0, 5) // Limit to top 5 results
      });

    } catch (error) {
      console.error("Voice processing error:", error);
      res.status(500).json({ 
        message: "Failed to process voice command",
        error: error.message 
      });
    }
  });

  // AI Voice Assistant - Text to Speech
  app.post("/api/voice/speak", async (req, res) => {
    try {
      const { text } = req.body;
      
      if (!text) {
        return res.status(400).json({ message: "Text is required" });
      }

      // Use Omnidimension API for text-to-speech
      const omnidimensionResponse = await fetch("https://api.omnidimension.ai/v1/audio/speech", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OMNIDIMENSION_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "tts-1",
          input: text,
          voice: "nova"
        })
      });

      if (!omnidimensionResponse.ok) {
        throw new Error(`Omnidimension TTS API error: ${omnidimensionResponse.status}`);
      }

      const audioBuffer = await omnidimensionResponse.arrayBuffer();
      
      res.set({
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.byteLength.toString()
      });
      
      res.send(Buffer.from(audioBuffer));

    } catch (error) {
      console.error("Text-to-speech error:", error);
      res.status(500).json({ 
        message: "Failed to generate speech",
        error: error.message 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
