import http from "http";
import createServer, { configSchema } from "./index.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";

// Get configuration from environment variables
const config = {
  canvasApiKey: process.env.CANVAS_API_KEY || "",
  canvasBaseUrl: process.env.CANVAS_BASE_URL || "https://canvas.instructure.com",
  debug: process.env.DEBUG === "true" || false,
  gradescopeEmail: process.env.GRADESCOPE_EMAIL,
  gradescopePassword: process.env.GRADESCOPE_PASSWORD,
};

// Validate configuration
if (!config.canvasApiKey) {
  console.error("ERROR: CANVAS_API_KEY environment variable is required");
  process.exit(1);
}

console.log("Initializing Canvas MCP Server...");
console.log(`Canvas Base URL: ${config.canvasBaseUrl}`);

// Create HTTP server
const PORT = process.env.PORT || 8080;

const server = http.createServer(async (req, res) => {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, Mcp-Session-Id");
  res.setHeader("Access-Control-Expose-Headers", "Mcp-Session-Id");

  // Handle preflight
  if (req.method === "OPTIONS") {
    res.writeHead(200);
    res.end();
    return;
  }

  // Health check endpoint
  if (req.method === "GET" && req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        status: "ok",
        service: "Canvas Instant MCP",
        version: "2.0.0",
        timestamp: new Date().toISOString(),
      })
    );
    return;
  }

  // Root endpoint - server info
  if (req.method === "GET" && req.url === "/") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        name: "Canvas Instant MCP Server",
        version: "2.0.0",
        description: "Model Context Protocol server for Canvas LMS integration",
        endpoints: {
          health: "/health",
          mcp: "/mcp (POST with JSON-RPC)",
        },
        tools: [
          "list_courses",
          "get_assignments",
          "get_upcoming_assignments",
          "get_grades",
          "get_user_profile",
          "get_modules",
          "get_announcements",
          "get_discussions",
          "get_calendar_events",
          "get_todo_items",
          "get_quizzes",
          "get_submission_status",
        ],
        repository: "https://github.com/a-ariff/canvas-instant-mcp",
      })
    );
    return;
  }

  // MCP endpoint - Handle POST requests with StreamableHTTP transport
  if (req.url === "/mcp" && (req.method === "POST" || req.method === "GET" || req.method === "DELETE")) {
    // Authentication check - REQUIRED for security
    const authHeader = req.headers.authorization;
    const expectedToken = process.env.MCP_AUTH_TOKEN;

    // Always require authentication
    if (!expectedToken) {
      console.error("SECURITY ERROR: MCP_AUTH_TOKEN not configured!");
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Server misconfigured - authentication not set up" }));
      return;
    }

    if (!authHeader || authHeader !== `Bearer ${expectedToken}`) {
      console.warn(`[SECURITY] Unauthorized MCP access attempt from ${req.socket.remoteAddress}`);
      res.writeHead(401, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Unauthorized - valid API key required" }));
      return;
    }

    let body = "";

    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", async () => {
      try {
        // Parse body for POST requests
        const parsedBody = body ? JSON.parse(body) : undefined;

        // Fix Accept header for ChatGPT compatibility
        // ChatGPT doesn't send the required Accept header, so we add it
        if (!req.headers.accept || !req.headers.accept.includes("text/event-stream")) {
          req.headers.accept = "application/json, text/event-stream";
        }

        // Create a new server instance for EACH request (stateless mode)
        const mcpServer = createServer({ config });

        // Create transport in stateless mode
        const transport = new StreamableHTTPServerTransport({
          sessionIdGenerator: undefined, // Stateless mode
        });

        // Clean up when request completes
        res.on("close", () => {
          transport.close();
        });

        // Connect the server to the transport
        await mcpServer.connect(transport);

        // Let the transport handle the request - this properly validates MCP protocol
        await transport.handleRequest(req, res, parsedBody);
      } catch (error: any) {
        console.error(`[MCP] Error:`, error);

        if (!res.headersSent) {
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({
              jsonrpc: "2.0",
              id: null,
              error: {
                code: -32603,
                message: error.message || "Internal server error",
              },
            })
          );
        }
      }
    });

    return;
  }

  // 404 for unknown routes
  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(
    JSON.stringify({
      error: "Not found",
      message: "Use POST /mcp for JSON-RPC requests or GET /health for status",
    })
  );
});

server.listen(PORT, () => {
  console.log(`✅ Canvas MCP Server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`🔧 MCP endpoint: http://localhost:${PORT}/mcp`);
  console.log(`🎓 Canvas API: ${config.canvasBaseUrl}`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully...");
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});
