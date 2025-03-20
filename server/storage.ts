import { User, InsertUser, Module, Resource, ChatMessage } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  sessionStore: session.Store;
  
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserLanguage(userId: number, language: string): Promise<User>;
  
  // Module operations
  getModules(language: string): Promise<Module[]>;
  getModule(id: number): Promise<Module | undefined>;
  
  // Resource operations
  getResources(language: string): Promise<Resource[]>;
  getResource(id: number): Promise<Resource | undefined>;
  
  // Chat operations
  saveChatMessage(userId: number, message: string, response: string): Promise<ChatMessage>;
  getChatHistory(userId: number): Promise<ChatMessage[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private modules: Map<number, Module>;
  private resources: Map<number, Resource>;
  private chatMessages: Map<number, ChatMessage>;
  private currentId: number;
  sessionStore: session.Store;

  constructor() {
    this.users = new Map();
    this.modules = new Map();
    this.resources = new Map();
    this.chatMessages = new Map();
    this.currentId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
    
    // Initialize with some sample data
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Add sample modules
    this.modules.set(1, {
      id: 1,
      title: "Introduction to AI",
      description: "Learn the basics of Artificial Intelligence",
      content: "AI is transforming the way we learn and work...",
      language: "en",
      order: 1,
    });
    
    // Add sample resources
    this.resources.set(1, {
      id: 1,
      title: "AI Ethics Guide",
      description: "A comprehensive guide to AI ethics",
      type: "pdf",
      url: "https://example.com/ai-ethics.pdf",
      language: "en",
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async updateUserLanguage(userId: number, language: string): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) throw new Error("User not found");
    
    const updatedUser = { ...user, preferredLanguage: language };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  async getModules(language: string): Promise<Module[]> {
    return Array.from(this.modules.values())
      .filter(module => module.language === language)
      .sort((a, b) => a.order - b.order);
  }

  async getModule(id: number): Promise<Module | undefined> {
    return this.modules.get(id);
  }

  async getResources(language: string): Promise<Resource[]> {
    return Array.from(this.resources.values())
      .filter(resource => resource.language === language);
  }

  async getResource(id: number): Promise<Resource | undefined> {
    return this.resources.get(id);
  }

  async saveChatMessage(userId: number, message: string, response: string): Promise<ChatMessage> {
    const id = this.currentId++;
    const chatMessage: ChatMessage = {
      id,
      userId,
      message,
      response,
      createdAt: new Date(),
    };
    this.chatMessages.set(id, chatMessage);
    return chatMessage;
  }

  async getChatHistory(userId: number): Promise<ChatMessage[]> {
    return Array.from(this.chatMessages.values())
      .filter(msg => msg.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
}

export const storage = new MemStorage();
