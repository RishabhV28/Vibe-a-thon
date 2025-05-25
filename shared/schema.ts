import { pgTable, text, serial, integer, boolean, decimal, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  avatar: text("avatar"),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0.00"),
  totalSales: integer("total_sales").default(0),
  verifiedSeller: boolean("verified_seller").default(false),
});

export const sneakers = pgTable("sneakers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  brand: text("brand").notNull(),
  model: text("model").notNull(),
  colorway: text("colorway").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  originalPrice: decimal("original_price", { precision: 10, scale: 2 }),
  size: text("size").notNull(),
  condition: text("condition").notNull(), // "New", "Like New", "Used"
  description: text("description"),
  images: text("images").array().notNull(),
  sellerId: integer("seller_id").notNull(),
  available: boolean("available").default(true),
  featured: boolean("featured").default(false),
  aiDealAvailable: boolean("ai_deal_available").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const negotiations = pgTable("negotiations", {
  id: serial("id").primaryKey(),
  sneakerId: integer("sneaker_id").notNull(),
  buyerId: integer("buyer_id").notNull(),
  sellerId: integer("seller_id").notNull(),
  originalPrice: decimal("original_price", { precision: 10, scale: 2 }).notNull(),
  currentOffer: decimal("current_offer", { precision: 10, scale: 2 }).notNull(),
  finalPrice: decimal("final_price", { precision: 10, scale: 2 }),
  status: text("status").notNull(), // "active", "accepted", "rejected", "expired"
  messages: text("messages").array().default([]),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const cartItems = pgTable("cart_items", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  sneakerId: integer("sneaker_id").notNull(),
  quantity: integer("quantity").default(1),
  addedAt: timestamp("added_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  rating: true,
  totalSales: true,
  verifiedSeller: true,
});

export const insertSneakerSchema = createInsertSchema(sneakers).omit({
  id: true,
  createdAt: true,
});

export const insertNegotiationSchema = createInsertSchema(negotiations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCartItemSchema = createInsertSchema(cartItems).omit({
  id: true,
  addedAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertSneaker = z.infer<typeof insertSneakerSchema>;
export type Sneaker = typeof sneakers.$inferSelect;
export type InsertNegotiation = z.infer<typeof insertNegotiationSchema>;
export type Negotiation = typeof negotiations.$inferSelect;
export type InsertCartItem = z.infer<typeof insertCartItemSchema>;
export type CartItem = typeof cartItems.$inferSelect;

export interface SneakerWithSeller extends Sneaker {
  seller: User;
}

export interface NegotiationMessage {
  id: string;
  type: "ai" | "seller" | "buyer";
  message: string;
  timestamp: string;
}
