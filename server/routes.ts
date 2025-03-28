import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateCocktailRecommendations, generateCocktailImage, CocktailWithoutImage } from "./openai";
import { 
  CocktailRequestParams, 
  Cocktail, 
  insertUserSchema, 
  insertCocktailListSchema,
  insertCocktailItemSchema,
  insertFeedbackSchema,
  insertInspirationCocktailSchema,
  User
} from "@shared/schema";
import { z } from "zod";
import session from "express-session";
import PgSession from "connect-pg-simple";
import { pool } from "./db";
import { fromZodError } from "zod-validation-error";
import { 
  generateVerificationCode, 
  sendVerificationEmail 
} from "./email";

// Add session properties to Express.Session
declare module 'express-session' {
  interface SessionData {
    userId?: number;
  }
}

// Extended cocktail type with image generation method
interface CocktailWithImageMethod extends Cocktail {
  image_method?: string;
}

// Setup session middleware
const setupSession = (app: Express) => {
  const PgStore = PgSession(session);
  
  app.use(
    session({
      store: new PgStore({
        pool,
        tableName: 'session', // Default session table name
        createTableIfMissing: true
      }),
      secret: process.env.SESSION_SECRET || 'cocktail-app-secret',
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      },
    })
  );
};

// Authentication middleware
const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (req.session && req.session.userId) {
    return next();
  }
  res.status(401).json({ message: 'Not authenticated' });
};

// Verification middleware
const isVerified = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  
  const user = await storage.getUser(req.session.userId);
  
  if (!user) {
    return res.status(401).json({ message: 'User not found' });
  }
  
  if (!user.is_verified) {
    return res.status(403).json({ message: 'Email not verified', needsVerification: true });
  }
  
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Add a ping route for health checks
  app.get("/api/ping", (req, res) => {
    res.json({ status: "ok" });
  });
  
  // Initialize session
  setupSession(app);
  
  // Authentication routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      // Validate request body with email
      const userSchema = insertUserSchema.pick({
        email: true,
        username: true,
      }).extend({
        email: z.string().email("Invalid email format"),
      });
      
      const result = userSchema.safeParse(req.body);
      
      if (!result.success) {
        const validationError = fromZodError(result.error);
        return res.status(400).json({ message: validationError.message });
      }
      
      const { email, username } = result.data;
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "User with this email already exists" });
      }
      
      // Generate verification code
      const verificationCode = generateVerificationCode();
      const verificationExpires = new Date();
      verificationExpires.setMinutes(verificationExpires.getMinutes() + 15); // 15 minutes expiry
      
      // Create user
      const user = await storage.createUser({
        email,
        username,
        verification_code: verificationCode,
        verification_code_expires: verificationExpires,
        is_verified: false,
        auth_provider: 'email',
      });
      
      // Send verification email
      await sendVerificationEmail(email, verificationCode);
      
      // Return user data (without setting session yet)
      res.status(201).json({ 
        email: user.email,
        id: user.id,
        needsVerification: true
      });
    } catch (error) {
      console.error("Error registering user:", error);
      res.status(500).json({ message: "Failed to register user" });
    }
  });
  
  app.post("/api/auth/verify", async (req, res) => {
    try {
      const { email, code } = req.body;
      
      if (!email || !code) {
        return res.status(400).json({ message: "Email and verification code are required" });
      }
      
      // Find user
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(400).json({ message: "Invalid email" });
      }
      
      // Check if code matches and isn't expired
      if (user.verification_code !== code) {
        return res.status(400).json({ message: "Invalid verification code" });
      }
      
      if (user.verification_code_expires && new Date() > user.verification_code_expires) {
        return res.status(400).json({ message: "Verification code expired" });
      }
      
      // Update user to verified status
      const updatedUser = await storage.updateUserPreferences(user.id, {
        is_verified: true,
        verification_code: null,
        verification_code_expires: null
      });
      
      if (!updatedUser) {
        return res.status(500).json({ message: "Failed to verify user" });
      }
      
      // Set session
      req.session.userId = user.id;
      
      res.json({ 
        id: updatedUser.id,
        email: updatedUser.email,
        username: updatedUser.username,
        is_verified: updatedUser.is_verified
      });
    } catch (error) {
      console.error("Error verifying user:", error);
      res.status(500).json({ message: "Failed to verify user" });
    }
  });
  
  app.post("/api/auth/resend-code", async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }
      
      // Find user
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(400).json({ message: "Invalid email" });
      }
      
      // Generate new verification code
      const verificationCode = generateVerificationCode();
      const verificationExpires = new Date();
      verificationExpires.setMinutes(verificationExpires.getMinutes() + 15); // 15 minutes expiry
      
      // Update user with new code
      await storage.updateUserPreferences(user.id, {
        verification_code: verificationCode,
        verification_code_expires: verificationExpires
      });
      
      // Send verification email
      await sendVerificationEmail(email, verificationCode);
      
      res.json({ message: "Verification code sent" });
    } catch (error) {
      console.error("Error resending verification code:", error);
      res.status(500).json({ message: "Failed to resend verification code" });
    }
  });
  
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }
      
      // Find user
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({ message: "User not found. Please register first." });
      }
      
      // Special case for testing: auto-login with the test account
      if (email === 'maxfield.douglas@gmail.com') {
        // Set session
        req.session.userId = user.id;
        
        // Return user without verification step
        return res.json({
          id: user.id,
          email: user.email,
          username: user.username,
          is_verified: true,
          auth_provider: user.auth_provider,
          default_alcohol: user.default_alcohol,
          default_characteristics: user.default_characteristics,
          default_ingredients: user.default_ingredients,
          theme: user.theme,
          theme_color: user.theme_color,
          title_font: user.title_font
        });
      }
      
      // For all other accounts, use normal verification flow
      // Generate verification code
      const verificationCode = generateVerificationCode();
      const verificationExpires = new Date();
      verificationExpires.setMinutes(verificationExpires.getMinutes() + 15); // 15 minutes expiry
      
      // Update user with verification code
      await storage.updateUserPreferences(user.id, {
        verification_code: verificationCode,
        verification_code_expires: verificationExpires
      });
      
      // Send verification email
      await sendVerificationEmail(email, verificationCode);
      
      res.json({ 
        email: user.email,
        message: "Verification code sent",
        needsVerification: true
      });
    } catch (error) {
      console.error("Error sending login code:", error);
      res.status(500).json({ message: "Failed to send login code" });
    }
  });
  
  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error("Error destroying session:", err);
        return res.status(500).json({ message: "Failed to logout" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });
  
  app.get("/api/auth/me", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId;
      const user = await storage.getUser(userId!);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json({
        id: user.id,
        email: user.email,
        username: user.username,
        is_verified: user.is_verified,
        auth_provider: user.auth_provider,
        default_alcohol: user.default_alcohol,
        default_characteristics: user.default_characteristics,
        default_ingredients: user.default_ingredients,
        theme: user.theme,
        theme_color: user.theme_color,
        title_font: user.title_font
      });
    } catch (error) {
      console.error("Error getting current user:", error);
      res.status(500).json({ message: "Failed to get user information" });
    }
  });
  
  // User preferences routes
  app.patch("/api/user/preferences", isAuthenticated, isVerified, async (req, res) => {
    try {
      const userId = req.session.userId;
      const { default_alcohol, default_characteristics, default_ingredients, theme, theme_color, title_font } = req.body;
      
      const updatedUser = await storage.updateUserPreferences(userId!, {
        default_alcohol,
        default_characteristics,
        default_ingredients,
        theme,
        theme_color,
        title_font
      });
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json({
        id: updatedUser.id,
        email: updatedUser.email,
        username: updatedUser.username,
        is_verified: updatedUser.is_verified,
        default_alcohol: updatedUser.default_alcohol,
        default_characteristics: updatedUser.default_characteristics,
        default_ingredients: updatedUser.default_ingredients,
        theme: updatedUser.theme,
        theme_color: updatedUser.theme_color,
        title_font: updatedUser.title_font
      });
    } catch (error) {
      console.error("Error updating user preferences:", error);
      res.status(500).json({ message: "Failed to update preferences" });
    }
  });
  
  // Cocktail lists routes
  app.post("/api/cocktail-lists", isAuthenticated, isVerified, async (req, res) => {
    try {
      const userId = req.session.userId;
      
      const listData = insertCocktailListSchema.parse({
        ...req.body,
        user_id: userId
      });
      
      const cocktailList = await storage.createCocktailList(listData);
      res.status(201).json(cocktailList);
    } catch (error) {
      console.error("Error creating cocktail list:", error);
      res.status(500).json({ message: "Failed to create cocktail list" });
    }
  });
  
  app.get("/api/cocktail-lists", isAuthenticated, isVerified, async (req, res) => {
    try {
      const userId = req.session.userId;
      const lists = await storage.getCocktailLists(userId!);
      
      res.json(lists);
    } catch (error) {
      console.error("Error getting cocktail lists:", error);
      res.status(500).json({ message: "Failed to get cocktail lists" });
    }
  });
  
  app.get("/api/cocktail-lists/:listId", isAuthenticated, isVerified, async (req, res) => {
    try {
      const listId = parseInt(req.params.listId);
      const list = await storage.getCocktailList(listId);
      
      if (!list) {
        return res.status(404).json({ message: "Cocktail list not found" });
      }
      
      // Check ownership
      if (list.user_id !== req.session.userId) {
        return res.status(403).json({ message: "You don't have permission to access this list" });
      }
      
      // Get cocktails in list
      const cocktails = await storage.getCocktailsInList(listId);
      
      res.json({ ...list, cocktails });
    } catch (error) {
      console.error("Error getting cocktail list:", error);
      res.status(500).json({ message: "Failed to get cocktail list" });
    }
  });
  
  // Cocktail items routes
  app.post("/api/cocktail-lists/:listId/cocktails", isAuthenticated, isVerified, async (req, res) => {
    try {
      const listId = parseInt(req.params.listId);
      const list = await storage.getCocktailList(listId);
      
      if (!list) {
        return res.status(404).json({ message: "Cocktail list not found" });
      }
      
      // Check ownership
      if (list.user_id !== req.session.userId) {
        return res.status(403).json({ message: "You don't have permission to modify this list" });
      }
      
      const cocktailData = insertCocktailItemSchema.parse({
        ...req.body,
        list_id: listId
      });
      
      const cocktail = await storage.addCocktailToList(cocktailData);
      res.status(201).json(cocktail);
    } catch (error) {
      console.error("Error adding cocktail to list:", error);
      res.status(500).json({ message: "Failed to add cocktail to list" });
    }
  });
  
  app.delete("/api/cocktail-items/:cocktailId", isAuthenticated, isVerified, async (req, res) => {
    try {
      const cocktailId = parseInt(req.params.cocktailId);
      
      // TODO: Check ownership
      
      await storage.removeCocktailFromList(cocktailId);
      res.json({ message: "Cocktail removed from list successfully" });
    } catch (error) {
      console.error("Error removing cocktail from list:", error);
      res.status(500).json({ message: "Failed to remove cocktail from list" });
    }
  });
  
  // Feedback routes
  app.post("/api/feedback", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId;
      
      const feedbackData = insertFeedbackSchema.parse({
        ...req.body,
        user_id: userId
      });
      
      const feedback = await storage.addFeedback(feedbackData);
      res.status(201).json(feedback);
    } catch (error) {
      console.error("Error submitting feedback:", error);
      res.status(500).json({ message: "Failed to submit feedback" });
    }
  });
  
  // Inspiration cocktails routes
  app.get("/api/inspiration-cocktails", async (req, res) => {
    try {
      const count = parseInt(req.query.count as string) || 3;
      const cocktails = await storage.getRandomInspirationCocktails(count);
      
      res.json(cocktails);
    } catch (error) {
      console.error("Error getting inspiration cocktails:", error);
      res.status(500).json({ message: "Failed to get inspiration cocktails" });
    }
  });
  
  // API endpoint for cocktail recommendations
  app.post("/api/cocktails/recommendations", async (req, res) => {
    try {
      // Get API key from request headers
      const apiKey = req.headers["x-openai-api-key"] as string || process.env.OPENAI_API_KEY;
      const model = req.headers["x-openai-model"] as string || process.env.OPENAI_MODEL || "gpt-4o";
      
      if (!apiKey) {
        return res.status(400).json({ message: "OpenAI API key is required. Please configure it in the app settings." });
      }

      // Get request body parameters
      const { ingredients, requiredIngredients, alcohol, characteristics } = req.body as CocktailRequestParams;

      // Generate cocktail recommendations using OpenAI
      const cocktailsWithoutImages = await generateCocktailRecommendations(
        apiKey,
        model,
        ingredients,
        requiredIngredients || [],
        alcohol,
        characteristics
      );

      // Generate images for each cocktail
      const cocktailsWithMethods: CocktailWithImageMethod[] = await Promise.all(
        cocktailsWithoutImages.map(async (cocktail) => {
          try {
            // The updated function now returns an object with url and method
            const imageResult = await generateCocktailImage(
              apiKey,
              cocktail.name,
              cocktail.ingredients.join(", ")
            );
            
            // Return cocktail with image and method information
            return {
              ...cocktail,
              image_url: imageResult.url,
              image_method: imageResult.method
            };
          } catch (error) {
            console.error(`Error generating image for ${cocktail.name}:`, error);
            // Return cocktail with fallback image if image generation fails
            return {
              ...cocktail,
              image_url: "https://unsplash.com/photos/a-glass-of-beer-with-a-cherry-on-top-of-it-6nHFWG-d7qQ",
              image_method: "Error-Fallback"
            };
          }
        })
      );

      // Convert back to standard Cocktail[] for response
      const cocktails = cocktailsWithMethods.map(cocktail => {
        // Add method as a characteristic so it shows on the card
        const characteristics = [...cocktail.characteristics, `Image: ${cocktail.image_method}`];
        
        // Convert to standard Cocktail format
        return {
          ...cocktail,
          characteristics,
          // Remove the image_method property before sending
          image_method: undefined
        } as Cocktail;
      });

      res.json({ cocktails });
    } catch (error) {
      console.error("Error generating cocktail recommendations:", error as Error);
      let errorMessage = "An unexpected error occurred";
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      res.status(500).json({
        message: `Error generating recommendations: ${errorMessage}`,
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}