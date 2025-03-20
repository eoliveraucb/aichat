import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { registerAuthRoutes } from "./controllers/auth";
import { registerModuleRoutes } from "./controllers/modules";
import { registerResourceRoutes } from "./controllers/resources";
import { handleChatRequest, generateImage } from "./services/openai";
import OpenAI from "openai";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  registerAuthRoutes(app);
  
  // Module routes
  registerModuleRoutes(app);
  
  // Resource routes
  registerResourceRoutes(app);
  
  // Chat API (OpenAI)
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, language } = req.body;
      
      if (!message) {
        return res.status(400).json({ message: "Message is required" });
      }
      
      const response = await handleChatRequest(message, language || 'es');
      return res.json({ message: response });
    } catch (error) {
      console.error("Chat API error:", error);
      return res.status(500).json({ message: "Error processing chat request" });
    }
  });
  
  // Image Generation API Endpoint
  app.post("/api/images/generate", async (req, res) => {
    try {
      const { prompt, language } = req.body;
      
      if (!prompt) {
        return res.status(400).json({ 
          success: false, 
          message: language === 'es' ? "Se requiere descripción para la imagen" : "Image description is required" 
        });
      }
      
      // Check if interactions limit is enforced (optional)
      // Logic can be added here if needed
      
      // Call the image generation service
      const result = await generateImage(prompt, language || 'es');
      
      // Return the result with properly translated messages if needed
      if (result.success && result.url) {
        const selectedLanguage = language || 'es';
        return res.json({
          success: true,
          url: result.url,
          message: selectedLanguage === 'es' ? 
            "He generado esta imagen para ti" : 
            "I've generated this image for you"
        });
      }
      
      return res.json(result);
    } catch (error) {
      const reqLanguage = req.body.language || 'es';
      console.error("Image generation API error:", error);
      return res.status(500).json({ 
        success: false, 
        message: reqLanguage === 'es' ? 
          "No pude generar la imagen" : 
          "Couldn't generate the image"
      });
    }
  });
  
  // API key validation endpoint
  app.get("/api/openai/validate", async (req, res) => {
    try {
      let apiKey = process.env.OPENAI_API_KEY;
      
      if (!apiKey) {
        return res.json({ 
          valid: false, 
          message: "No API key found in environment variables" 
        });
      }
      
      try {
        // Clean and format the API key
        apiKey = apiKey.trim();
        
        // Check if the API key is a URL or contains extra formatting
        if (apiKey.startsWith('http')) {
          console.log("API key appears to be a URL. Attempting to extract the key.");
          try {
            // Try to extract just the API key if it's embedded in a URL
            const matches = apiKey.match(/[a-zA-Z0-9_-]{30,}/);
            if (matches && matches[0]) {
              apiKey = matches[0];
              console.log("Successfully extracted API key from URL format");
            }
          } catch (extractError) {
            console.error("Error extracting API key from URL:", extractError);
          }
        }
        
        // Check if key starts with "sk-" which is standard OpenAI format
        if (!apiKey.startsWith('sk-')) {
          console.log("Warning: API key doesn't start with 'sk-' prefix");
        }
        
        // Log key format for debugging (without exposing the key)
        const keyPreview = apiKey.substring(0, 5) + "..." + apiKey.substring(apiKey.length - 3);
        console.log(`API key format: preview=${keyPreview}, length=${apiKey.length}`);
        
        // Create OpenAI instance with the cleaned API key
        const openai = new OpenAI({ apiKey });
        
        // Make a simple API call to verify the key works
        await openai.models.list();
        
        return res.json({ 
          valid: true, 
          message: "API key is valid" 
        });
      } catch (apiError: any) {
        console.error("OpenAI API validation error:", apiError);
        return res.json({ 
          valid: false, 
          message: `API key validation failed: ${apiError.message || 'Unknown error'}` 
        });
      }
    } catch (error) {
      console.error("API validation error:", error);
      return res.status(500).json({ 
        valid: false, 
        message: "Error validating API key" 
      });
    }
  });

  // Simple resource file serving for PDFs and other documents
  const resourcesDir = path.join(__dirname, "../resources");
  
  // Create resources directory if it doesn't exist
  if (!fs.existsSync(resourcesDir)) {
    fs.mkdirSync(resourcesDir, { recursive: true });
    
    // Create placeholder files for resources
    const placeholders = [
      { name: "guide.pdf", content: "Placeholder for Prompt Design Guide" },
      { name: "templates.xlsx", content: "Placeholder for Exercise Templates" },
      { name: "examples.pdf", content: "Placeholder for Prompt Examples" },
      { name: "glossary.pdf", content: "Placeholder for AI Glossary" }
    ];
    
    placeholders.forEach(file => {
      fs.writeFileSync(path.join(resourcesDir, file.name), file.content);
    });
  }

  const httpServer = createServer(app);
  return httpServer;
}
