import express, { type Express } from "express";
import fs from "fs";
import path from "path";

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

export function serveStatic(app: Express) {
  const distPath = path.resolve(process.cwd(), "dist/public");

  // If dist folder doesn't exist, serve a simple API message
  if (!fs.existsSync(distPath)) {
    app.get("*", (_req, res) => {
      res.send(`
        <html>
          <head><title>Heritage Condo API</title></head>
          <body style="font-family: sans-serif; max-width: 600px; margin: 50px auto; padding: 20px;">
            <h1>🏢 Heritage Condo Management API</h1>
            <p>✅ Backend server is running successfully!</p>
            <p>Frontend files not found. Deploy frontend separately or build client.</p>
          </body>
        </html>
      `);
    });
    return;
  }

  // Serve static files if dist exists
  app.use(express.static(distPath));
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
