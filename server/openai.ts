import OpenAI from "openai";
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Cocktail, cocktailResponseSchema } from "@shared/schema";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";
import { saveDebugLog, analyzeResponse } from "./debug";

// Type for OpenAI response before adding image URLs
export type CocktailWithoutImage = Omit<Cocktail, 'image_url'>;

// Generate cocktail recommendations using OpenAI
export async function generateCocktailRecommendations(
  apiKey: string,
  model: string,
  ingredients: string,
  requiredIngredients: string[],
  alcohol: string,
  characteristics: string[]
): Promise<CocktailWithoutImage[]> {
  try {
    // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    const openai = new OpenAI({ apiKey });
    
    // Construct the prompt for the OpenAI API
    const systemPrompt = `
      You are an expert bartender who provides cocktail recommendations based on user preferences.
      You should provide unique, creative and detailed cocktail recommendations.
      For each cocktail, include the following:
      - Name: A creative and descriptive name
      - Ingredients: A detailed list of ingredients with measurements
      - Instructions: Step-by-step preparation instructions
      - Characteristics: Flavor profile descriptors (sweet, sour, bitter, spicy, etc.)
      - Serving style: How the drink should be served (e.g., "On the rocks", "Served up", "In a highball glass")
      - Prep time: How long it takes to prepare
      - Whether the cocktail is popular or not (true/false)

      You should respond with a JSON object containing an array of cocktail recommendations (up to 5 cocktails).
      The JSON should follow this format:
      {
        "cocktails": [
          {
            "name": "Cocktail Name",
            "ingredients": ["2 oz Ingredient 1", "1 oz Ingredient 2", ...],
            "instructions": "Instructions for preparation...",
            "characteristics": ["Sweet", "Refreshing", ...],
            "serving_style": "Served in a martini glass",
            "prep_time": "5 minutes",
            "is_popular": true
          },
          ...
        ]
      }
    `;

    const userPrompt = buildUserPrompt(ingredients, requiredIngredients, alcohol, characteristics);

    const response = await openai.chat.completions.create({
      model: model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    // Parse and validate the response
    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No content returned from OpenAI");
    }

    const parsedData = JSON.parse(content);
    const validatedData = cocktailResponseSchema.parse(parsedData);
    
    return validatedData.cocktails;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Invalid response format from OpenAI:", error);
      const readableError = fromZodError(error);
      throw new Error(`The AI returned an invalid response format: ${readableError.message}`);
    }
    
    if (typeof error === 'object' && error !== null && 'response' in error && 
        error.response && typeof error.response === 'object' && 'status' in error.response && 
        error.response.status === 401) {
      throw new Error("Invalid OpenAI API key. Please check your API key and try again.");
    }

    console.error("Error generating cocktail recommendations:", error);
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error(String(error));
    }
  }
}

// Interfaces for image generation strategies
interface ImageStrategy {
  name: string;
  generate: (cocktailName: string, ingredients: string, apiKey: string) => Promise<{url: string, method: string}>;
}

// Default fallback image URL (using unsplash link provided)
const DEFAULT_FALLBACK_IMAGE = "https://unsplash.com/photos/a-glass-of-beer-with-a-cherry-on-top-of-it-6nHFWG-d7qQ";

// The GPT-4o + DALL-E Hybrid Strategy
const gpt4oDalleHybridStrategy: ImageStrategy = {
  name: "GPT4o-DALLE-Hybrid",
  generate: async (cocktailName, ingredients, apiKey) => {
    const strategyName = "GPT4o-DALLE-Hybrid";
    try {
      console.log(`${strategyName}: Creating detailed description with GPT-4o for ${cocktailName}`);
      
      const openai = new OpenAI({ apiKey });
      
      // First, use GPT-4o to create a detailed description
      const descriptionResponse = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an expert mixologist and professional cocktail photographer."
          },
          {
            role: "user",
            content: `Create a detailed visual description of a "${cocktailName}" cocktail containing ${ingredients}. 
            Describe the glass type, colors, garnishes, lighting, reflections, background, and overall composition. 
            Your description will be used to generate a photorealistic image of this cocktail. 
            Be specific and detailed, but keep it under 100 words.`
          }
        ],
        max_tokens: 500
      });
      
      // Save debug information
      saveDebugLog(`${strategyName}_Description`, descriptionResponse);
      
      // Extract the description
      const description = descriptionResponse.choices[0]?.message?.content || "";
      console.log(`${strategyName}: Generated description: ${description}`);
      
      // Now use DALL-E to generate an image based on this description
      console.log(`${strategyName}: Generating image with DALL-E based on the description`);
      
      const prompt = `A professional, high-quality photo of a "${cocktailName}" cocktail. 
      ${description}
      The cocktail contains ${ingredients}.
      Make the image look realistic and appealing, as if taken by a professional food photographer.
      No text or watermarks. Clear background with soft focus. Photorealistic style.`;
      
      const dalleResponse = await openai.images.generate({
        model: "dall-e-3",
        prompt: prompt,
        n: 1,
        size: "1024x1024",
        quality: "standard",
      });
      
      // Save debug information
      saveDebugLog(`${strategyName}_DALLE`, dalleResponse);
      
      // Extract the URL from the response
      const imageUrl = dalleResponse.data[0]?.url;
      
      if (!imageUrl) {
        throw new Error(`No image URL found in ${strategyName} DALL-E response`);
      }
      
      return { url: imageUrl, method: strategyName };
    } catch (error) {
      console.error(`${strategyName} strategy failed:`, error);
      throw error;
    }
  }
};

// DALL-E 3 Strategy
const dalleStrategy: ImageStrategy = {
  name: "DALL-E-3",
  generate: async (cocktailName, ingredients, apiKey) => {
    const strategyName = "DALL-E-3";
    try {
      console.log(`${strategyName}: Generating image for ${cocktailName}`);
      
      const openai = new OpenAI({ apiKey });
      
      const prompt = `A professional, high-quality, appetizing photograph of a "${cocktailName}" cocktail. 
      This cocktail contains ${ingredients}. 
      The image should be well-lit, showing the cocktail in an appropriate glass with proper garnishes.
      Make the image look realistic and appealing, as if taken by a professional food photographer.
      No text or watermarks. Clear background with soft focus. Photorealistic style.`;
      
      const response = await openai.images.generate({
        model: "dall-e-3",
        prompt: prompt,
        n: 1,
        size: "1024x1024",
        quality: "standard",
      });
      
      // Save debug information
      saveDebugLog(strategyName, response);
      
      // Extract the URL from the response
      const imageUrl = response.data[0]?.url;
      
      if (!imageUrl) {
        throw new Error(`No image URL found in ${strategyName} response`);
      }
      
      return { url: imageUrl, method: strategyName };
    } catch (error) {
      console.error(`${strategyName} strategy failed:`, error);
      throw error;
    }
  }
};

// Gemini Strategy
const geminiStrategy: ImageStrategy = {
  name: "Gemini",
  generate: async (cocktailName, ingredients, apiKey) => {
    const strategyName = "Gemini";
    try {
      console.log(`${strategyName}: Generating image for ${cocktailName}`);
      
      // Check if Gemini API key is available
      const geminiApiKey = process.env.GEMINI_API_KEY;
      if (!geminiApiKey) {
        throw new Error("Gemini API key not found in environment variables");
      }
      
      // Initialize the Gemini AI
      const genAI = new GoogleGenerativeAI(geminiApiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
      
      // Create the prompt
      const prompt = `Create a detailed, photorealistic image of a "${cocktailName}" cocktail with these ingredients: ${ingredients}. 
      Make it look like a professional cocktail photography shot with perfect lighting, appropriate glassware, and garnishes.`;
      
      // Generate the image
      const result = await model.generateContent(prompt);
      const response = result.response;
      
      // Save the response for debugging
      saveDebugLog(strategyName, response);
      
      // Extract the parts (simplify to avoid errors - fallback to DALL-E if Gemini fails)
      let imageUrl = "";
      
      try {
        if (response.text().includes("http")) {
          const match = response.text().match(/(https?:\/\/[^\s]+)/);
          if (match && match[0]) {
            imageUrl = match[0];
          }
        }
      } catch (err) {
        console.error("Error parsing Gemini response:", err);
        throw new Error("Failed to extract image URL from Gemini response");
      }
      
      if (!imageUrl) {
        throw new Error(`No image found in ${strategyName} response`);
      }
      
      return { url: imageUrl, method: strategyName };
    } catch (error) {
      console.error(`${strategyName} strategy failed:`, error);
      throw error;
    }
  }
};

// Define the available image strategies in order of preference
const imageStrategies = [
  geminiStrategy,            // Try Gemini first
  gpt4oDalleHybridStrategy,  // Then GPT-4o + DALL-E hybrid
  dalleStrategy,             // Then just DALL-E as fallback
];

// Function to generate a cocktail image
export async function generateCocktailImage(
  apiKey: string,
  cocktailName: string,
  ingredients: string
): Promise<{ url: string, method: string }> {
  console.log(`Generating image for cocktail: ${cocktailName}`);
  
  // Try each strategy in order and log detailed responses
  for (const strategy of imageStrategies) {
    try {
      console.log(`Attempting image generation using ${strategy.name} strategy...`);
      const result = await strategy.generate(cocktailName, ingredients, apiKey);
      console.log(`${strategy.name} strategy succeeded with URL: ${result.url}`);
      
      // If we get here, the strategy succeeded
      return result;
    } catch (error) {
      console.error(`${strategy.name} strategy failed:`, error);
      // Continue to next strategy
    }
  }
  
  // If all strategies fail, return default fallback
  console.log("All strategies failed, using fallback image");
  return { 
    url: DEFAULT_FALLBACK_IMAGE, 
    method: "Fallback" 
  };
}

// Helper function to build the user prompt based on preferences
function buildUserPrompt(
  ingredients: string,
  requiredIngredients: string[],
  alcohol: string,
  characteristics: string[]
): string {
  let prompt = "I would like some cocktail recommendations";

  if (ingredients) {
    prompt += ` using these ingredients: ${ingredients}.`;
  }

  if (requiredIngredients && requiredIngredients.length > 0) {
    prompt += ` The following ingredients MUST be included in all recipes: ${requiredIngredients.join(", ")}.`;
  }

  if (alcohol && alcohol !== 'any') {
    prompt += ` I prefer drinks with ${alcohol}.`;
  }

  if (characteristics && characteristics.length > 0) {
    prompt += ` I enjoy ${characteristics.join(", ")} drinks.`;
  }

  prompt += " Please provide 5 cocktail suggestions that match my preferences.";

  return prompt;
}