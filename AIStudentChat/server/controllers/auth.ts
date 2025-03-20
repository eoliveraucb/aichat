import type { Express } from "express";
import { storage } from "../storage";
import { insertUserSchema } from "@shared/schema";
import { z } from "zod";

export function registerAuthRoutes(app: Express) {
  // Register a new user
  app.post("/api/auth/register", async (req, res) => {
    try {
      // Validate the request body
      const result = insertUserSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid registration data", 
          errors: result.error.errors 
        });
      }
      
      // Check if username is already taken
      const existingUser = await storage.getUserByUsername(result.data.username);
      
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      // Create the user
      const user = await storage.createUser(result.data);
      
      // Return user data (exclude password)
      const { password, ...userData } = user;
      return res.status(201).json(userData);
      
    } catch (error) {
      console.error("Registration error:", error);
      return res.status(500).json({ message: "Error registering user" });
    }
  });
  
  // Login route
  app.post("/api/auth/login", async (req, res) => {
    try {
      const loginSchema = z.object({
        username: z.string(),
        password: z.string()
      });
      
      const result = loginSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid login data", 
          errors: result.error.errors 
        });
      }
      
      // Find user by username
      const user = await storage.getUserByUsername(result.data.username);
      
      if (!user || user.password !== result.data.password) {
        return res.status(401).json({ message: "Invalid username or password" });
      }
      
      // Return user data (exclude password)
      const { password, ...userData } = user;
      return res.json(userData);
      
    } catch (error) {
      console.error("Login error:", error);
      return res.status(500).json({ message: "Error logging in" });
    }
  });
}
