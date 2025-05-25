import { 
  users, 
  sneakers, 
  negotiations, 
  cartItems,
  type User, 
  type InsertUser, 
  type Sneaker, 
  type InsertSneaker,
  type SneakerWithSeller,
  type Negotiation,
  type InsertNegotiation,
  type CartItem,
  type InsertCartItem
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Sneaker methods
  getSneakers(filters?: {
    brand?: string;
    size?: string;
    minPrice?: number;
    maxPrice?: number;
    condition?: string;
    search?: string;
  }): Promise<SneakerWithSeller[]>;
  getSneaker(id: number): Promise<SneakerWithSeller | undefined>;
  createSneaker(sneaker: InsertSneaker): Promise<Sneaker>;
  updateSneaker(id: number, updates: Partial<Sneaker>): Promise<Sneaker | undefined>;

  // Negotiation methods
  getNegotiation(id: number): Promise<Negotiation | undefined>;
  createNegotiation(negotiation: InsertNegotiation): Promise<Negotiation>;
  updateNegotiation(id: number, updates: Partial<Negotiation>): Promise<Negotiation | undefined>;
  getNegotiationsBySneaker(sneakerId: number): Promise<Negotiation[]>;

  // Cart methods
  getCartItems(userId: number): Promise<(CartItem & { sneaker: SneakerWithSeller })[]>;
  addToCart(cartItem: InsertCartItem): Promise<CartItem>;
  removeFromCart(userId: number, sneakerId: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private sneakers: Map<number, Sneaker>;
  private negotiations: Map<number, Negotiation>;
  private cartItems: Map<number, CartItem>;
  private currentUserId: number;
  private currentSneakerId: number;
  private currentNegotiationId: number;
  private currentCartItemId: number;

  constructor() {
    this.users = new Map();
    this.sneakers = new Map();
    this.negotiations = new Map();
    this.cartItems = new Map();
    this.currentUserId = 1;
    this.currentSneakerId = 1;
    this.currentNegotiationId = 1;
    this.currentCartItemId = 1;

    this.seedData();
  }

  private seedData() {
    // Create sample users
    const sampleUsers: InsertUser[] = [
      {
        username: "sneakerking",
        email: "king@example.com",
        password: "password123",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
      },
      {
        username: "kickscollector",
        email: "collector@example.com",
        password: "password123",
        avatar: "https://images.unsplash.com/photo-1494790108755-2616b79a6e72?w=100&h=100&fit=crop&crop=face",
      },
      {
        username: "hypebeast23",
        email: "hype@example.com",
        password: "password123",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
      },
    ];

    sampleUsers.forEach(user => {
      const id = this.currentUserId++;
      const fullUser: User = {
        ...user,
        id,
        rating: (Math.random() * 2 + 3).toFixed(1),
        totalSales: Math.floor(Math.random() * 100),
        verifiedSeller: Math.random() > 0.3,
      };
      this.users.set(id, fullUser);
    });

    // Create sample sneakers
    const sampleSneakers: InsertSneaker[] = [
      {
        name: 'Nike Air Jordan 1 Retro High "Chicago"',
        brand: "Nike",
        model: "Air Jordan 1 Retro High",
        colorway: "Chicago",
        price: "2450.00",
        originalPrice: "2450.00",
        size: "10",
        condition: "New",
        description: "Deadstock Nike Air Jordan 1 Retro High in the iconic Chicago colorway. Includes original box and accessories.",
        images: ["https://images.unsplash.com/photo-1584735175315-9d5df23860e6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"],
        sellerId: 1,
        aiDealAvailable: true,
        featured: true,
      },
      {
        name: 'Adidas Yeezy Boost 350 V2 "Zebra"',
        brand: "Adidas",
        model: "Yeezy Boost 350 V2",
        colorway: "Zebra",
        price: "890.00",
        originalPrice: "890.00",
        size: "9.5",
        condition: "Like New",
        description: "Excellent condition Yeezy Boost 350 V2 in Zebra colorway. Worn twice, no visible wear.",
        images: ["https://images.unsplash.com/photo-1552346154-21d32810aba3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"],
        sellerId: 2,
        aiDealAvailable: false,
      },
      {
        name: 'Nike Air Force 1 Low "White"',
        brand: "Nike",
        model: "Air Force 1 Low",
        colorway: "White",
        price: "120.00",
        originalPrice: "150.00",
        size: "11",
        condition: "New",
        description: "Classic Nike Air Force 1 Low in triple white. Brand new with box.",
        images: ["https://images.unsplash.com/photo-1549298916-b41d501d3772?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"],
        sellerId: 3,
        featured: true,
      },
      {
        name: 'Nike Air Max 90 "Infrared"',
        brand: "Nike",
        model: "Air Max 90",
        colorway: "Infrared",
        price: "185.00",
        originalPrice: "185.00",
        size: "8.5",
        condition: "Used",
        description: "Well-maintained Air Max 90 in the classic Infrared colorway. Some signs of wear but lots of life left.",
        images: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"],
        sellerId: 1,
        aiDealAvailable: true,
      },
      {
        name: 'Off-White x Nike Air Jordan 1',
        brand: "Nike",
        model: "Air Jordan 1",
        colorway: "Off-White Chicago",
        price: "4850.00",
        originalPrice: "4850.00",
        size: "9",
        condition: "New",
        description: "Extremely rare Off-White x Nike Air Jordan 1 collaboration. Deadstock with all accessories.",
        images: ["https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"],
        sellerId: 2,
        featured: true,
      },
      {
        name: 'Adidas Stan Smith "White/Green"',
        brand: "Adidas",
        model: "Stan Smith",
        colorway: "White/Green",
        price: "75.00",
        originalPrice: "75.00",
        size: "12",
        condition: "Like New",
        description: "Classic Adidas Stan Smith in white with green accents. Minimal wear, excellent condition.",
        images: ["https://images.unsplash.com/photo-1560769629-975ec94e6a86?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"],
        sellerId: 3,
      },
    ];

    sampleSneakers.forEach(sneaker => {
      const id = this.currentSneakerId++;
      const fullSneaker: Sneaker = {
        ...sneaker,
        id,
        available: true,
        createdAt: new Date(),
      };
      this.sneakers.set(id, fullSneaker);
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = {
      ...insertUser,
      id,
      rating: "0.00",
      totalSales: 0,
      verifiedSeller: false,
    };
    this.users.set(id, user);
    return user;
  }

  async getSneakers(filters?: {
    brand?: string;
    size?: string;
    minPrice?: number;
    maxPrice?: number;
    condition?: string;
    search?: string;
  }): Promise<SneakerWithSeller[]> {
    let sneakerList = Array.from(this.sneakers.values()).filter(s => s.available);

    if (filters) {
      if (filters.brand) {
        sneakerList = sneakerList.filter(s => 
          s.brand.toLowerCase().includes(filters.brand!.toLowerCase())
        );
      }
      if (filters.size) {
        sneakerList = sneakerList.filter(s => s.size === filters.size);
      }
      if (filters.minPrice) {
        sneakerList = sneakerList.filter(s => parseFloat(s.price) >= filters.minPrice!);
      }
      if (filters.maxPrice) {
        sneakerList = sneakerList.filter(s => parseFloat(s.price) <= filters.maxPrice!);
      }
      if (filters.condition) {
        sneakerList = sneakerList.filter(s => s.condition === filters.condition);
      }
      if (filters.search) {
        const search = filters.search.toLowerCase();
        sneakerList = sneakerList.filter(s => 
          s.name.toLowerCase().includes(search) ||
          s.brand.toLowerCase().includes(search) ||
          s.colorway.toLowerCase().includes(search)
        );
      }
    }

    return sneakerList.map(sneaker => ({
      ...sneaker,
      seller: this.users.get(sneaker.sellerId)!,
    }));
  }

  async getSneaker(id: number): Promise<SneakerWithSeller | undefined> {
    const sneaker = this.sneakers.get(id);
    if (!sneaker) return undefined;

    const seller = this.users.get(sneaker.sellerId);
    if (!seller) return undefined;

    return {
      ...sneaker,
      seller,
    };
  }

  async createSneaker(insertSneaker: InsertSneaker): Promise<Sneaker> {
    const id = this.currentSneakerId++;
    const sneaker: Sneaker = {
      ...insertSneaker,
      id,
      available: true,
      featured: false,
      createdAt: new Date(),
    };
    this.sneakers.set(id, sneaker);
    return sneaker;
  }

  async updateSneaker(id: number, updates: Partial<Sneaker>): Promise<Sneaker | undefined> {
    const sneaker = this.sneakers.get(id);
    if (!sneaker) return undefined;

    const updatedSneaker = { ...sneaker, ...updates };
    this.sneakers.set(id, updatedSneaker);
    return updatedSneaker;
  }

  async getNegotiation(id: number): Promise<Negotiation | undefined> {
    return this.negotiations.get(id);
  }

  async createNegotiation(insertNegotiation: InsertNegotiation): Promise<Negotiation> {
    const id = this.currentNegotiationId++;
    const negotiation: Negotiation = {
      ...insertNegotiation,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.negotiations.set(id, negotiation);
    return negotiation;
  }

  async updateNegotiation(id: number, updates: Partial<Negotiation>): Promise<Negotiation | undefined> {
    const negotiation = this.negotiations.get(id);
    if (!negotiation) return undefined;

    const updatedNegotiation = { 
      ...negotiation, 
      ...updates,
      updatedAt: new Date(),
    };
    this.negotiations.set(id, updatedNegotiation);
    return updatedNegotiation;
  }

  async getNegotiationsBySneaker(sneakerId: number): Promise<Negotiation[]> {
    return Array.from(this.negotiations.values()).filter(n => n.sneakerId === sneakerId);
  }

  async getCartItems(userId: number): Promise<(CartItem & { sneaker: SneakerWithSeller })[]> {
    const userCartItems = Array.from(this.cartItems.values()).filter(item => item.userId === userId);
    
    return userCartItems.map(item => {
      const sneaker = this.sneakers.get(item.sneakerId);
      const seller = sneaker ? this.users.get(sneaker.sellerId) : undefined;
      
      return {
        ...item,
        sneaker: {
          ...sneaker!,
          seller: seller!,
        },
      };
    });
  }

  async addToCart(insertCartItem: InsertCartItem): Promise<CartItem> {
    const id = this.currentCartItemId++;
    const cartItem: CartItem = {
      ...insertCartItem,
      id,
      addedAt: new Date(),
    };
    this.cartItems.set(id, cartItem);
    return cartItem;
  }

  async removeFromCart(userId: number, sneakerId: number): Promise<boolean> {
    const item = Array.from(this.cartItems.values()).find(
      item => item.userId === userId && item.sneakerId === sneakerId
    );
    
    if (item) {
      this.cartItems.delete(item.id);
      return true;
    }
    return false;
  }
}

export const storage = new MemStorage();
