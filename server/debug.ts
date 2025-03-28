import fs from 'fs';
import path from 'path';

// Create a debug folder if it doesn't exist
const debugDir = path.join(process.cwd(), 'debug_logs');
if (!fs.existsSync(debugDir)) {
  fs.mkdirSync(debugDir, { recursive: true });
}

// Function to save a debug log with timestamp
export function saveDebugLog(strategyName: string, data: any): void {
  try {
    // Format timestamp for the filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = path.join(debugDir, `${strategyName}_${timestamp}.json`);
    
    // Save the data as formatted JSON
    fs.writeFileSync(filename, JSON.stringify(data, null, 2));
    console.log(`Debug log saved to ${filename}`);
  } catch (error) {
    console.error('Failed to save debug log:', error);
  }
}

// Function to analyze and extract useful info from a response
export function analyzeResponse(response: any): { 
  hasImageContent: boolean, 
  contentType: string, 
  urls: string[] 
} {
  const result = {
    hasImageContent: false,
    contentType: 'unknown',
    urls: [] as string[]
  };
  
  try {
    // Check the type of content
    if (!response) {
      result.contentType = 'null';
      return result;
    }
    
    // Check if it's a DALL-E style response
    if (response.data && Array.isArray(response.data)) {
      result.contentType = 'dalle-style';
      response.data.forEach((item: any) => {
        if (item.url) {
          result.urls.push(item.url);
          result.hasImageContent = true;
        }
      });
    }
    
    // Check if it's a chat completion response
    if (response.choices && Array.isArray(response.choices)) {
      result.contentType = 'chat-completion';
      
      // Check each choice's message content
      response.choices.forEach((choice: any) => {
        if (!choice.message || !choice.message.content) return;
        
        // String content - look for URLs
        if (typeof choice.message.content === 'string') {
          const urlMatches = choice.message.content.match(/https?:\/\/[^\s"')]+/g);
          if (urlMatches) {
            result.urls.push(...urlMatches);
            result.hasImageContent = true;
          }
        }
        
        // Array content - look for image_url types
        if (Array.isArray(choice.message.content)) {
          choice.message.content.forEach((item: any) => {
            if (item.type === 'image_url' && item.image_url && item.image_url.url) {
              result.urls.push(item.image_url.url);
              result.hasImageContent = true;
            }
          });
        }
        
        // Object content - check for images property
        if (typeof choice.message.content === 'object' && !Array.isArray(choice.message.content)) {
          if (choice.message.content.images && Array.isArray(choice.message.content.images)) {
            result.urls.push(...choice.message.content.images);
            result.hasImageContent = true;
          }
        }
      });
    }
    
    return result;
  } catch (error) {
    console.error('Error analyzing response:', error);
    return result;
  }
}