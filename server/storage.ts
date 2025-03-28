import { 
  users, 
  type User, 
  type InsertUser, 
  type CocktailList, 
  userCocktailLists, 
  type CocktailItem, 
  userCocktailItems,
  insertCocktailListSchema,
  insertCocktailItemSchema,
  type UserFeedback,
  insertFeedbackSchema,
  userFeedback,
  inspirationCocktails,
  type InspirationCocktail,
  insertInspirationCocktailSchema,
  type Cocktail
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, or, inArray, isNull, sql } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByVerificationCode(email: string, code: string): Promise<User | undefined>;
  removeExpiredVerificationCodes(): Promise<void>;
  createUser(user: InsertUser): Promise<User>;
  updateUserPreferences(id: number, preferences: Partial<User>): Promise<User | undefined>;
  
  // Cocktail list methods
  createCocktailList(data: typeof insertCocktailListSchema._type): Promise<CocktailList>;
  getCocktailLists(userId: number): Promise<CocktailList[]>;
  getCocktailList(listId: number): Promise<CocktailList | undefined>;
  
  // Cocktail item methods
  addCocktailToList(data: typeof insertCocktailItemSchema._type): Promise<CocktailItem>;
  getCocktailsInList(listId: number): Promise<CocktailItem[]>;
  removeCocktailFromList(cocktailId: number): Promise<boolean>;
  
  // Feedback methods
  addFeedback(data: typeof insertFeedbackSchema._type): Promise<UserFeedback>;
  
  // Inspiration methods
  addInspirationCocktail(data: typeof insertInspirationCocktailSchema._type): Promise<InspirationCocktail>;
  getRandomInspirationCocktails(count: number): Promise<InspirationCocktail[]>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    if (!username) return undefined;
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }
  
  async getUserByVerificationCode(email: string, code: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(
        and(
          eq(users.email, email),
          eq(users.verification_code, code),
          sql`${users.verification_code_expires} > NOW()`
        )
      );
    return user;
  }
  
  async removeExpiredVerificationCodes(): Promise<void> {
    await db
      .update(users)
      .set({
        verification_code: null,
        verification_code_expires: null
      })
      .where(
        and(
          sql`${users.verification_code_expires} < NOW()`,
          sql`${users.verification_code} IS NOT NULL`
        )
      );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    
    // Create default lists for the user
    const defaultLists = [
      { name: "Favorites", type: "favorites" as const, is_default: true },
      { name: "Want to Make", type: "want_to_make" as const, is_default: true },
      { name: "Made It", type: "made_it" as const, is_default: true },
      { name: "Not For Me", type: "not_for_me" as const, is_default: true }
    ];
    
    for (const list of defaultLists) {
      await db.insert(userCocktailLists).values({
        user_id: user.id,
        name: list.name,
        description: `Your ${list.name.toLowerCase()} cocktails`,
        type: list.type,
        is_default: list.is_default
      });
    }
    
    return user;
  }

  async updateUserPreferences(id: number, preferences: Partial<User>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set({ ...preferences, updated_at: new Date() })
      .where(eq(users.id, id))
      .returning();
    
    return updatedUser;
  }
  
  // Cocktail list methods
  async createCocktailList(data: typeof insertCocktailListSchema._type): Promise<CocktailList> {
    const [cocktailList] = await db
      .insert(userCocktailLists)
      .values(data)
      .returning();
    
    return cocktailList;
  }
  
  async getCocktailLists(userId: number): Promise<CocktailList[]> {
    return db
      .select()
      .from(userCocktailLists)
      .where(eq(userCocktailLists.user_id, userId))
      .orderBy(desc(userCocktailLists.updated_at));
  }
  
  async getCocktailList(listId: number): Promise<CocktailList | undefined> {
    const [cocktailList] = await db
      .select()
      .from(userCocktailLists)
      .where(eq(userCocktailLists.id, listId));
    
    return cocktailList;
  }
  
  // Cocktail item methods
  async addCocktailToList(data: typeof insertCocktailItemSchema._type): Promise<CocktailItem> {
    const [cocktailItem] = await db
      .insert(userCocktailItems)
      .values(data)
      .returning();
    
    return cocktailItem;
  }
  
  async getCocktailsInList(listId: number): Promise<CocktailItem[]> {
    return db
      .select()
      .from(userCocktailItems)
      .where(eq(userCocktailItems.list_id, listId))
      .orderBy(desc(userCocktailItems.created_at));
  }
  
  async removeCocktailFromList(cocktailId: number): Promise<boolean> {
    await db
      .delete(userCocktailItems)
      .where(eq(userCocktailItems.id, cocktailId));
    
    return true;
  }
  
  // Feedback methods
  async addFeedback(data: typeof insertFeedbackSchema._type): Promise<UserFeedback> {
    const [feedback] = await db
      .insert(userFeedback)
      .values(data)
      .returning();
    
    return feedback;
  }
  
  // Inspiration methods
  async addInspirationCocktail(data: typeof insertInspirationCocktailSchema._type): Promise<InspirationCocktail> {
    const [cocktail] = await db
      .insert(inspirationCocktails)
      .values(data)
      .returning();
    
    return cocktail;
  }
  
  async getRandomInspirationCocktails(count: number): Promise<InspirationCocktail[]> {
    // Note: This is a simplified approach that won't be truly random for large datasets
    // A more production-ready version would use SQL's RANDOM() function
    const allCocktails = await db
      .select()
      .from(inspirationCocktails);
    
    // Shuffle array and take the requested count
    const shuffled = [...allCocktails].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }
}

export const storage = new DatabaseStorage();
