#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import createServer, { configSchema } from "./index.js";

// Read environment variables and validate them
const rawConfig = {
  canvasApiKey: process.env.CANVAS_API_KEY || "",
  canvasBaseUrl: process.env.CANVAS_BASE_URL || "https://canvas.instructure.com",
  debug: process.env.DEBUG === "true",
};

// Only validate required fields if they are actually provided
// This allows the server to start up in sandbox environments
// For Smithery sandbox: don't require API key at startup
if (!rawConfig.canvasApiKey) {
  console.error("Warning: CANVAS_API_KEY not provided. Tools will fail without it.");
}

const config = {
  canvasApiKey: rawConfig.canvasApiKey,
  canvasBaseUrl: rawConfig.canvasBaseUrl,
  debug: rawConfig.debug,
};

// Create and run the server
async function main() {
  try {
    const server = createServer({ config });
    const transport = new StdioServerTransport();
    
    await server.connect(transport);
    
    if (config.debug) {
      console.error("Canvas Instant MCP Server running on stdio");
    }
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
