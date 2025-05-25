export interface FilterOptions {
  brands: { name: string; count: number }[];
  sizes: string[];
  conditions: string[];
  priceRange: { min: number; max: number };
}

export interface CartItemWithProduct {
  id: number;
  userId: number;
  sneakerId: number;
  quantity: number;
  addedAt: Date;
  sneaker: {
    id: number;
    name: string;
    brand: string;
    price: string;
    images: string[];
    seller: {
      id: number;
      username: string;
      rating: string;
    };
  };
}

export type SortOption = "relevant" | "price-low" | "price-high" | "newest";
export type ViewMode = "grid" | "list";
