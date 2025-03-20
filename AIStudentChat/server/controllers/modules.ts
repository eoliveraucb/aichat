import type { Express } from "express";
import { moduleData } from "../../client/src/lib/openai";

export function registerModuleRoutes(app: Express) {
  // Get all modules
  app.get("/api/modules", (req, res) => {
    res.json({
      module1: moduleData.module1,
      module2: moduleData.module2
    });
  });
  
  // Get a specific module
  app.get("/api/modules/:id", (req, res) => {
    const moduleId = req.params.id;
    
    if (moduleId === "1") {
      return res.json(moduleData.module1);
    } else if (moduleId === "2") {
      return res.json(moduleData.module2);
    } else {
      return res.status(404).json({ message: "Module not found" });
    }
  });
  
  // Get lessons for a specific module
  app.get("/api/modules/:id/lessons", (req, res) => {
    const moduleId = req.params.id;
    
    if (moduleId === "1") {
      return res.json(moduleData.module1.lessons);
    } else if (moduleId === "2") {
      return res.json(moduleData.module2.lessons);
    } else {
      return res.status(404).json({ message: "Module not found" });
    }
  });
  
  // Get a specific lesson
  app.get("/api/modules/:moduleId/lessons/:lessonId", (req, res) => {
    const { moduleId, lessonId } = req.params;
    
    if (moduleId === "1") {
      const lesson = moduleData.module1.lessons.find(l => l.id === lessonId);
      if (lesson) {
        return res.json({
          ...lesson,
          content: "This is the content for module 1, lesson " + lessonId
        });
      }
    } else if (moduleId === "2") {
      const lesson = moduleData.module2.lessons.find(l => l.id === lessonId);
      if (lesson) {
        return res.json({
          ...lesson,
          content: "This is the content for module 2, lesson " + lessonId
        });
      }
    }
    
    return res.status(404).json({ message: "Lesson not found" });
  });
}
