import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { generateAIResponse } from "./openai";

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  // Language routes
  app.patch("/api/user/language", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const { language } = req.body;
    const user = await storage.updateUserLanguage(req.user.id, language);
    res.json(user);
  });

  // Module routes
  app.get("/api/modules", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const language = req.user.preferredLanguage;
    const modules = await storage.getModules(language);
    res.json(modules);
  });

  app.get("/api/modules/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const module = await storage.getModule(parseInt(req.params.id));
    if (!module) return res.sendStatus(404);
    res.json(module);
  });

  // Resource routes
  app.get("/api/resources", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const language = req.user.preferredLanguage;
    const resources = await storage.getResources(language);
    res.json(resources);
  });

  app.get("/api/resources/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const resource = await storage.getResource(parseInt(req.params.id));
    if (!resource) return res.sendStatus(404);
    res.json(resource);
  });

  // Chat routes
  app.post("/api/chat", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const { message } = req.body;
    if (!message) return res.status(400).send("Message is required");

    try {
      const response = await generateAIResponse(message);
      const chatMessage = await storage.saveChatMessage(req.user.id, message, response);
      res.json(chatMessage);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/chat/history", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const history = await storage.getChatHistory(req.user.id);
    res.json(history);
  });

  const httpServer = createServer(app);
  return httpServer;
}
