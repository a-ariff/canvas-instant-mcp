import http from "http";
import createServer, { configSchema } from "./index.js";

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

// Create MCP server instance
const mcpServer = createServer({ config });

// Create HTTP server
const PORT = process.env.PORT || 8080;

const server = http.createServer(async (req, res) => {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

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

  // MCP endpoint
  if (req.method === "POST" && req.url === "/mcp") {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", async () => {
      try {
        const jsonRpcRequest = JSON.parse(body);
        console.log(`[MCP] Received request:`, jsonRpcRequest.method);

        // Use the server's request method to handle the request properly
        const response = await (mcpServer as any).request(jsonRpcRequest, {});

        // Send JSON-RPC response
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(response));
      } catch (error: any) {
        console.error(`[MCP] Error:`, error);

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
