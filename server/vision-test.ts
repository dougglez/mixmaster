import OpenAI from "openai";
import fs from 'fs';
import path from 'path';
import { saveDebugLog, analyzeResponse } from "./debug";

/**
 * This is a standalone test file to test direct GPT-4o vision API image generation.
 * Run this file directly with: `tsx server/vision-test.ts`
 */

// First, check if we have an API key
const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  console.error("Error: OPENAI_API_KEY environment variable not found");
  process.exit(1);
}

// Function to test different approaches
async function testImageGeneration() {
  const openai = new OpenAI({ apiKey });
  const cocktailName = "Strawberry Basil Smash";
  const ingredients = "fresh strawberries, basil leaves, lime juice, simple syrup, and gin";
  
  // Approach 1: Direct image request
  try {
    console.log(`Testing direct image generation for ${cocktailName}...`);
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a world-class cocktail photographer capable of generating photorealistic images of cocktails."
        },
        {
          role: "user", 
          content: [
            {
              type: "text",
              text: `Generate a photorealistic image of a ${cocktailName} cocktail containing ${ingredients}. 
                It should be in an appropriate glass with proper garnishes, well-lit, and look professionally photographed.`
            }
          ]
        }
      ],
      max_tokens: 4096
    });
    
    // Save response for analysis
    saveDebugLog("TestDirect", response);
    
    // Analyze response
    const analysis = analyzeResponse(response);
    console.log("Analysis:", analysis);
    
    console.log("Raw response:", JSON.stringify(response, null, 2));
    
    // Check for content types
    if (response.choices && response.choices[0] && response.choices[0].message) {
      console.log("Content type:", typeof response.choices[0].message.content);
      console.log("Is array?", Array.isArray(response.choices[0].message.content));
      
      if (typeof response.choices[0].message.content === 'object') {
        console.log("Object properties:", Object.keys(response.choices[0].message.content));
      }
      
      if (Array.isArray(response.choices[0].message.content)) {
        console.log("Array items types:", 
          response.choices[0].message.content.map(item => `${item.type}: ${JSON.stringify(item)}`));
      }
    }
  } catch (error) {
    console.error("Direct approach failed:", error);
  }
  
  // Approach 2: Multi-turn conversation
  try {
    console.log(`\nTesting multi-turn image generation for ${cocktailName}...`);
    
    // First get a detailed description
    const descResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a mixologist and cocktail expert."
        },
        {
          role: "user",
          content: `Describe in detail how a ${cocktailName} cocktail with ${ingredients} should look, including glass type, color, garnishes and presentation.`
        }
      ],
      max_tokens: 500
    });
    
    const description = descResponse.choices[0].message.content;
    console.log(`Description: ${description}`);
    
    // Second turn - ask for image
    const imageResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a professional cocktail photographer with image generation capabilities."
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Generate a photorealistic image of this cocktail: ${description}`
            }
          ]
        }
      ],
      max_tokens: 4096
    });
    
    // Save response for analysis
    saveDebugLog("TestMultiTurn", imageResponse);
    
    // Analyze response
    const analysis = analyzeResponse(imageResponse);
    console.log("Analysis:", analysis);
    
    console.log("Multi-turn raw response:", JSON.stringify(imageResponse, null, 2));
  } catch (error) {
    console.error("Multi-turn approach failed:", error);
  }
  
  // Approach 3: Try with vision API
  try {
    console.log(`\nTesting vision API approach for ${cocktailName}...`);
    
    const visionResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You have image generation capabilities. When asked to create an image, generate a photorealistic image directly."
        },
        {
          role: "user",
          content: `Create a photorealistic image of a ${cocktailName} cocktail with ${ingredients}.`
        }
      ],
      max_tokens: 4096
    });
    
    // Save response for analysis
    saveDebugLog("TestVision", visionResponse);
    
    // Analyze response
    const analysis = analyzeResponse(visionResponse);
    console.log("Analysis:", analysis);
    
    console.log("Vision API raw response:", JSON.stringify(visionResponse, null, 2));
  } catch (error) {
    console.error("Vision API approach failed:", error);
  }
  
  // Approach 4: Compare with DALL-E
  try {
    console.log(`\nTesting DALL-E for comparison with ${cocktailName}...`);
    
    const dalleResponse = await openai.images.generate({
      model: "dall-e-3",
      prompt: `A professional, photorealistic image of a ${cocktailName} cocktail with ${ingredients}. The cocktail should be in an appropriate glass with garnishes, well-lit, and look like it was taken by a professional food photographer.`,
      n: 1,
      size: "1024x1024",
      quality: "standard",
    });
    
    // Save response for analysis
    saveDebugLog("TestDallE", dalleResponse);
    
    // Analyze response
    const analysis = analyzeResponse(dalleResponse);
    console.log("Analysis:", analysis);
    
    console.log("DALL-E raw response:", JSON.stringify(dalleResponse, null, 2));
    
    if (dalleResponse.data && dalleResponse.data[0] && dalleResponse.data[0].url) {
      console.log("✅ DALL-E successfully generated an image URL:", dalleResponse.data[0].url);
    }
  } catch (error) {
    console.error("DALL-E approach failed:", error);
  }
}

// Run the test
testImageGeneration().then(() => {
  console.log("Testing complete!");
}).catch(err => {
  console.error("Testing failed:", err);
});