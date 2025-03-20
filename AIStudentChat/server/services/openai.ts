import OpenAI from "openai";
import { getPredefinedResponse } from "../../client/src/lib/openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const MODEL = "gpt-4o";
const IMAGE_MODEL = "dall-e-3";

// Helper function to get a clean API key
function getCleanApiKey(apiKey: string): string {
  if (!apiKey) return "";
  
  let cleanApiKey = apiKey.trim();
  
  // Check if the API key starts with "https://" or contains a URL
  if (cleanApiKey.startsWith('http')) {
    console.log("API key appears to be a URL. Attempting to extract just the key.");
    try {
      // Try to extract just the API key if it's embedded in a URL
      const matches = cleanApiKey.match(/[a-zA-Z0-9_-]{30,}/);
      if (matches && matches[0]) {
        cleanApiKey = matches[0];
      }
    } catch (error) {
      console.error("Error cleaning API key:", error);
    }
  }
  
  // Check if the key starts with "sk-" which is the standard format for OpenAI keys
  if (!cleanApiKey.startsWith('sk-')) {
    console.log("Warning: API key doesn't appear to be in standard OpenAI format");
  }
  
  return cleanApiKey;
}

// OpenAI API integration with fallback to predefined responses
// Interface for the image generation response
export interface ImageGenerationResponse {
  success: boolean;
  url?: string;
  message?: string;
}

// Function to check if message is requesting image generation
function isImageGenerationRequest(message: string): boolean {
  const lowerCaseMessage = message.toLowerCase();
  const imageKeywords = [
    'genera una imagen', 'crea una imagen', 'dibuja', 'generate an image', 
    'create an image', 'draw', 'make a picture', 'dall-e', 'dalle', 
    'imagen de', 'picture of', 'visualiza', 'visualize'
  ];
  
  return imageKeywords.some(keyword => lowerCaseMessage.includes(keyword));
}

// Function to handle image generation requests
export async function generateImage(prompt: string, language: string): Promise<ImageGenerationResponse> {
  try {
    // Check if OpenAI API key is available
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      console.log("No OpenAI API key found for image generation.");
      return { 
        success: false, 
        message: language === 'es' 
          ? "No se pudo generar la imagen: clave de API no encontrada." 
          : "Couldn't generate image: API key not found."
      };
    }
    
    // Get a clean API key
    const cleanApiKey = getCleanApiKey(apiKey);
    
    console.log("Attempting to generate image with DALL-E");
    
    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: cleanApiKey
    });
    
    // Process prompt to extract just the description part
    let imagePrompt = prompt;
    
    // Remove common prefixes like "genera una imagen de" or "create an image of"
    const prefixes = [
      'genera una imagen de', 'crea una imagen de', 'dibuja', 'generate an image of', 
      'create an image of', 'draw', 'make a picture of', 'dall-e', 'dalle', 
      'imagen de', 'picture of', 'visualiza', 'visualize'
    ];
    
    for (const prefix of prefixes) {
      if (imagePrompt.toLowerCase().includes(prefix)) {
        imagePrompt = imagePrompt.toLowerCase().replace(prefix, '').trim();
        break;
      }
    }
    
    // Enhance the prompt for better image generation
    const enhancedPrompt = language === 'es'
      ? `Imagen educativa y apropiada para estudiantes: ${imagePrompt}. Estilo claro, bien iluminado y profesional.`
      : `Educational image appropriate for students: ${imagePrompt}. Clear, well-lit, professional style.`;
    
    // Generate the image using DALL-E 3
    const response = await openai.images.generate({
      model: IMAGE_MODEL,
      prompt: enhancedPrompt,
      n: 1,
      size: "1024x1024",
      quality: "standard",
    });
    
    // Return the image URL
    return {
      success: true,
      url: response.data[0].url
    };
  
  } catch (error) {
    console.error("Error generating image:", error);
    return {
      success: false,
      message: language === 'es'
        ? "Ocurrió un error al generar la imagen. Por favor, intenta con una descripción diferente."
        : "An error occurred while generating the image. Please try with a different description."
    };
  }
}

export async function handleChatRequest(message: string, language: string): Promise<string> {
  try {
    // Check if OpenAI API key is available
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      console.log("No OpenAI API key found. Using predefined response.");
      return getPredefinedResponse(message, language);
    }
    
    // Check if this is an image generation request
    if (isImageGenerationRequest(message)) {
      console.log("Detected image generation request, forwarding to DALL-E");
      
      // Try to generate an image
      const imageResult = await generateImage(message, language);
      
      // Format the response depending on success or failure
      if (imageResult.success && imageResult.url) {
        return language === 'es'
          ? `He generado esta imagen para ti: ${imageResult.url}`
          : `I've generated this image for you: ${imageResult.url}`;
      } else {
        return imageResult.message || 
          (language === 'es' 
            ? "No pude generar la imagen"
            : "Couldn't generate the image");
      }
    }
    
    // Get a clean API key
    const cleanApiKey = getCleanApiKey(apiKey);
    
    console.log("Attempting to use OpenAI API with provided key");
    
    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: cleanApiKey
    });
    
    // Create a system prompt that focuses on educational prompt design
    const systemPrompt = language === 'es' 
      ? "Eres un asistente educativo especializado en enseñar diseño de prompts para IA. Proporciona respuestas concisas y educativas sobre cómo crear buenos prompts. Las respuestas deben ser de máximo 150 palabras y apropiadas para estudiantes."
      : "You are an educational assistant specialized in teaching AI prompt design. Provide concise, educational responses about how to create good prompts. Responses should be maximum 150 words and appropriate for students.";
    
    try {
      // Make OpenAI API call
      const response = await openai.chat.completions.create({
        model: MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ],
        max_tokens: 250,
        temperature: 0.7,
      });
      
      return response.choices[0].message.content || 
        getPredefinedResponse(message, language); // Fallback if empty response
    } catch (apiError) {
      console.error("OpenAI API call failed:", apiError);
      return getPredefinedResponse(message, language);
    }
    
  } catch (error) {
    console.error("OpenAI API error:", error);
    // Fallback to predefined responses on error
    return getPredefinedResponse(message, language);
  }
}
