import { pgTable, text, serial, integer, boolean, jsonb, timestamp, varchar, pgEnum, primaryKey, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Auth provider enum
export const authProviderEnum = pgEnum('auth_provider', ['email', 'google', 'apple']);

// User table with expanded fields
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  username: text("username"),
  verification_code: text("verification_code"),
  verification_code_expires: timestamp("verification_code_expires"),
  is_verified: boolean("is_verified").default(false).notNull(),
  auth_provider: authProviderEnum("auth_provider").notNull().default('email'),
  auth_provider_id: text("auth_provider_id"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
  avatar_url: text("avatar_url"),
  
  // Default preferences
  default_alcohol: text("default_alcohol"),
  default_characteristics: text("default_characteristics").array(),
  default_ingredients: text("default_ingredients").array(),

  // Theme preferences
  theme: text("theme").default('system'),
  theme_color: text("theme_color").default('blue'),
  title_font: text("title_font").default('default'),
});

// User schema relations
export const usersRelations = relations(users, ({ many }) => ({
  cocktailLists: many(userCocktailLists),
  feedback: many(userFeedback),
}));

// Base cocktail lists (favorites, want to make, made it, not for me)
export const cocktailListTypes = pgEnum('cocktail_list_type', [
  'favorites', 
  'want_to_make', 
  'made_it', 
  'not_for_me',
  'custom'
]);

// User cocktail lists
export const userCocktailLists = pgTable("user_cocktail_lists", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text("name").notNull(),
  description: text("description"),
  type: cocktailListTypes("type").notNull().default('custom'),
  is_default: boolean("is_default").default(false),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

// User cocktail lists relations
export const userCocktailListsRelations = relations(userCocktailLists, ({ one, many }) => ({
  user: one(users, {
    fields: [userCocktailLists.user_id],
    references: [users.id],
  }),
  cocktails: many(userCocktailItems),
}));

// Stored cocktails in user lists
export const userCocktailItems = pgTable("user_cocktail_items", {
  id: serial("id").primaryKey(),
  list_id: integer("list_id").notNull().references(() => userCocktailLists.id, { onDelete: 'cascade' }),
  name: text("name").notNull(),
  image_url: text("image_url").notNull(),
  ingredients: text("ingredients").array().notNull(),
  instructions: text("instructions").notNull(),
  characteristics: text("characteristics").array().notNull(),
  prep_time: text("prep_time"),
  serving_style: text("serving_style").notNull(),
  is_popular: boolean("is_popular"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  notes: text("notes"),
});

// User cocktail items relations
export const userCocktailItemsRelations = relations(userCocktailItems, ({ one }) => ({
  list: one(userCocktailLists, {
    fields: [userCocktailItems.list_id],
    references: [userCocktailLists.id],
  }),
}));

// Inspiration cocktails table
export const inspirationCocktails = pgTable("inspiration_cocktails", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  image_url: text("image_url").notNull(),
  ingredients: text("ingredients").array().notNull(),
  instructions: text("instructions").notNull(),
  characteristics: text("characteristics").array().notNull(),
  prep_time: text("prep_time"),
  serving_style: text("serving_style").notNull(),
  is_popular: boolean("is_popular"),
});

// User feedback for recommendations
export const userFeedback = pgTable("user_feedback", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").references(() => users.id, { onDelete: 'cascade' }),
  cocktail_name: text("cocktail_name").notNull(),
  image_quality_rating: integer("image_quality_rating"),
  recipe_quality_rating: integer("recipe_quality_rating"),
  feedback_text: text("feedback_text"),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

// User feedback relations
export const userFeedbackRelations = relations(userFeedback, ({ one }) => ({
  user: one(users, {
    fields: [userFeedback.user_id],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  username: true,
  verification_code: true,
  verification_code_expires: true,
  is_verified: true,
  auth_provider: true,
  auth_provider_id: true,
  avatar_url: true,
});

export const insertCocktailListSchema = createInsertSchema(userCocktailLists).pick({
  user_id: true,
  name: true,
  description: true,
  type: true,
  is_default: true,
});

export const insertCocktailItemSchema = createInsertSchema(userCocktailItems).pick({
  list_id: true,
  name: true,
  image_url: true,
  ingredients: true,
  instructions: true,
  characteristics: true,
  prep_time: true,
  serving_style: true,
  is_popular: true,
  notes: true,
});

export const insertFeedbackSchema = createInsertSchema(userFeedback).pick({
  user_id: true,
  cocktail_name: true,
  image_quality_rating: true,
  recipe_quality_rating: true,
  feedback_text: true,
});

export const insertInspirationCocktailSchema = createInsertSchema(inspirationCocktails).pick({
  name: true,
  image_url: true,
  ingredients: true,
  instructions: true,
  characteristics: true,
  prep_time: true,
  serving_style: true,
  is_popular: true,
});

// Export types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type CocktailList = typeof userCocktailLists.$inferSelect;
export type CocktailItem = typeof userCocktailItems.$inferSelect;
export type UserFeedback = typeof userFeedback.$inferSelect;
export type InspirationCocktail = typeof inspirationCocktails.$inferSelect;

// Define the Cocktail type for the app
export interface Cocktail {
  name: string;
  image_url: string;
  ingredients: string[];
  instructions: string;
  characteristics: string[];
  prep_time?: string;
  serving_style: string;
  is_popular?: boolean;
}

// Define the OpenAI request type
export interface CocktailRequestParams {
  ingredients: string;
  requiredIngredients: string[];
  alcohol: string;
  characteristics: string[];
}

// Define the OpenAI response schema
export const cocktailResponseSchema = z.object({
  cocktails: z.array(
    z.object({
      name: z.string(),
      ingredients: z.array(z.string()),
      instructions: z.string(),
      characteristics: z.array(z.string()),
      prep_time: z.string().optional(),
      serving_style: z.string(),
      is_popular: z.boolean().optional(),
    })
  ),
});

export type CocktailResponse = z.infer<typeof cocktailResponseSchema>;
