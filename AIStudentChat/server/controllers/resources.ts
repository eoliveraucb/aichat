import type { Express } from "express";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { resourcesData } from "../../client/src/lib/openai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export function registerResourceRoutes(app: Express) {
  // Get all resources
  app.get("/api/resources", (req, res) => {
    res.json(resourcesData);
  });
  
  // Serve resource files
  app.get("/api/resources/:filename", (req, res) => {
    const filename = req.params.filename;
    const resourcePath = path.join(__dirname, "../../resources", filename);
    
    res.sendFile(resourcePath, (err) => {
      if (err) {
        console.error(`Error sending file ${filename}:`, err);
        res.status(404).json({ message: "Resource not found" });
      }
    });
  });
}
