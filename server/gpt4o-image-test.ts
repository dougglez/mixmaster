import OpenAI from "openai";
import fs from 'fs';
import path from 'path';
import { saveDebugLog } from "./debug";
import axios from 'axios';

/**
 * This is a standalone test file to test direct GPT-4o image generation based on the python examples.
 * Run this file directly with: `tsx server/gpt4o-image-test.ts`
 */

// First, check if we have an API key
const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  console.error("Error: OPENAI_API_KEY environment variable not found");
  process.exit(1);
}

// Method 1: Using the OpenAI client library (like the first Python example)
async function testOpenAIClientMethod() {
  console.log("Testing Method 1: Using OpenAI client library...");
  
  try {
    const openai = new OpenAI({ apiKey });
    const prompt = "A futuristic city skyline at sunset.";
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{
        role: "user", 
        content: prompt
      }]
    });
    
    saveDebugLog("Method1_Response", response);
    console.log("Response saved to debug logs");
    
    // Try to extract the image data or URL
    const message = response.choices[0]?.message;
    console.log("Message content type:", typeof message.content);
    
    // If content is a list/array with an image
    if (Array.isArray(message.content)) {
      console.log("Content is an array with", message.content.length, "items");
      
      for (const item of message.content) {
        if (item.type === "image") {
          console.log("Found image item:", item);
          
          // If the image is returned as base64 data
          if (item.image?.base64) {
            const imageData = Buffer.from(item.image.base64, 'base64');
            const outputPath = path.join(process.cwd(), 'gpt4o_image_method1.png');
            fs.writeFileSync(outputPath, imageData);
            console.log(`Image saved to ${outputPath}`);
          }
          // Or if the image is provided as a URL
          else if (item.image?.url) {
            const outputPath = path.join(process.cwd(), 'gpt4o_image_method1.png');
            const imageResponse = await axios.get(item.image.url, { responseType: 'arraybuffer' });
            fs.writeFileSync(outputPath, imageResponse.data);
            console.log(`Image saved to ${outputPath}`);
          }
        }
      }
    } else {
      console.log("No image array found in response");
      console.log("Content:", message.content);
    }
  } catch (error) {
    console.error("Method 1 failed:", error);
  }
}

// Method 2: Using direct API call with axios (like the second Python example)
async function testDirectAPIMethod() {
  console.log("\nTesting Method 2: Using direct API call...");
  
  try {
    const apiUrl = "https://api.openai.com/v1/chat/completions";
    const headers = {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    };
    const data = {
      "model": "gpt-4o",
      "messages": [
        {"role": "user", "content": "A futuristic city skyline at sunset."}
      ]
    };
    
    const response = await axios.post(apiUrl, data, { headers });
    saveDebugLog("Method2_Response", response.data);
    console.log("Response saved to debug logs");
    
    // Extract the image from the result
    const message = response.data.choices[0].message;
    console.log("Message content type:", typeof message.content);
    
    if (Array.isArray(message.content)) {
      console.log("Content is an array with", message.content.length, "items");
      
      for (const item of message.content) {
        if (item.type === "image") {
          console.log("Found image item:", item);
          
          // Check for base64 image data
          if (item.image?.base64) {
            const imageData = Buffer.from(item.image.base64, 'base64');
            const outputPath = path.join(process.cwd(), 'gpt4o_image_method2.png');
            fs.writeFileSync(outputPath, imageData);
            console.log(`Image saved to ${outputPath}`);
          }
          // Or check for image URL
          else if (item.image?.url) {
            const outputPath = path.join(process.cwd(), 'gpt4o_image_method2.png');
            const imageResponse = await axios.get(item.image.url, { responseType: 'arraybuffer' });
            fs.writeFileSync(outputPath, imageResponse.data);
            console.log(`Image saved to ${outputPath}`);
          }
        }
      }
    } else {
      console.log("No image array found in response");
      console.log("Content:", message.content);
    }
  } catch (error) {
    console.error("Method 2 failed:", error);
  }
}

// Method 3: Testing with a specific image generation prompt and response_format: json_object
async function testImageGenerationPrompt() {
  console.log("\nTesting Method 3: With specific image generation prompt...");
  
  try {
    const openai = new OpenAI({ apiKey });
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an AI assistant that can generate images. When asked to generate an image, respond with the image directly."
        },
        {
          role: "user",
          content: "Generate an image of a cocktail called 'Sunset Paradise' made with rum, pineapple juice, and orange liqueur."
        }
      ]
    });
    
    saveDebugLog("Method3_Response", response);
    console.log("Response saved to debug logs");
    
    // Try to extract the image
    const message = response.choices[0]?.message;
    console.log("Message content type:", typeof message.content);
    
    if (Array.isArray(message.content)) {
      console.log("Content is an array with", message.content.length, "items");
      
      for (const item of message.content) {
        console.log("Item type:", item.type);
        
        if (item.type === "image_url" && item.image_url) {
          console.log("Found image_url item:", item.image_url);
          const outputPath = path.join(process.cwd(), 'gpt4o_image_method3.png');
          const imageResponse = await axios.get(item.image_url.url, { responseType: 'arraybuffer' });
          fs.writeFileSync(outputPath, imageResponse.data);
          console.log(`Image saved to ${outputPath}`);
        }
        else if (item.type === "image" && item.image) {
          console.log("Found image item:", item.image);
          if (item.image.base64) {
            const imageData = Buffer.from(item.image.base64, 'base64');
            const outputPath = path.join(process.cwd(), 'gpt4o_image_method3.png');
            fs.writeFileSync(outputPath, imageData);
            console.log(`Image saved to ${outputPath}`);
          } 
          else if (item.image.url) {
            const outputPath = path.join(process.cwd(), 'gpt4o_image_method3.png');
            const imageResponse = await axios.get(item.image.url, { responseType: 'arraybuffer' });
            fs.writeFileSync(outputPath, imageResponse.data);
            console.log(`Image saved to ${outputPath}`);
          }
        }
      }
    } else {
      console.log("No image array found in response");
      console.log("Content:", message.content);
    }
  } catch (error) {
    console.error("Method 3 failed:", error);
  }
}

// Method 4: Try with vision API style request
async function testVisionAPIStyle() {
  console.log("\nTesting Method 4: Using vision API style with array content...");
  
  try {
    const openai = new OpenAI({ apiKey });
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You have image generation capabilities. Create images when asked."
        },
        {
          role: "user", 
          content: [
            {
              type: "text",
              text: "Create an image of a mojito cocktail in a tall glass with mint leaves and lime."
            }
          ]
        }
      ]
    });
    
    saveDebugLog("Method4_Response", response);
    console.log("Response saved to debug logs");
    
    // Try to extract the image
    const message = response.choices[0]?.message;
    console.log("Message content type:", typeof message.content);
    
    // If content is an array, look for image type content
    if (Array.isArray(message.content)) {
      for (const item of message.content) {
        console.log("Found item of type:", item.type);
        
        if (item.type === "image_url" && item.image_url?.url) {
          console.log("Found image URL:", item.image_url.url);
          const outputPath = path.join(process.cwd(), 'gpt4o_image_method4.png');
          const imageResponse = await axios.get(item.image_url.url, { responseType: 'arraybuffer' });
          fs.writeFileSync(outputPath, imageResponse.data);
          console.log(`Image saved to ${outputPath}`);
        }
      }
    } else {
      console.log("No array content found");
      console.log("Content:", message.content);
    }
    
  } catch (error) {
    console.error("Method 4 failed:", error);
  }
}

// Run all tests
async function runAllTests() {
  try {
    await testOpenAIClientMethod();
    await testDirectAPIMethod();  
    await testImageGenerationPrompt();
    await testVisionAPIStyle();
    console.log("\nAll tests completed!");
  } catch (error) {
    console.error("Testing failed:", error);
  }
}

runAllTests();