import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

// Configuration schema for Smithery
export const configSchema = z.object({
  canvasApiKey: z
    .string()
    .describe(
      "Your Canvas API access token (Get from Canvas → Account → Settings → Approved Integrations)"
    ),
  canvasBaseUrl: z
    .string()
    .url()
    .default("https://canvas.instructure.com")
    .describe(
      "Your Canvas instance URL (e.g., https://canvas.instructure.com)"
    ),
  debug: z
    .boolean()
    .optional()
    .default(false)
    .describe("Enable debug logging"),
  gradescopeEmail: z
    .string()
    .email()
    .optional()
    .describe("Your Gradescope email address (optional)"),
  gradescopePassword: z
    .string()
    .optional()
    .describe("Your Gradescope password (optional)"),
});

export type Config = z.infer<typeof configSchema>;

export default function createServer({ config }: { config: Config }) {
  const server = new McpServer({
    name: "Canvas Student MCP",
    version: "2.0.0",
  });

  // Proxy URL to actual Cloudflare Workers server
  const proxyUrl = "https://canvas-mcp-sse.ariff.dev/public";

  // Helper function to call the actual Canvas server
  async function proxyToCanvasServer(toolName: string, args: any) {
    const url = new URL(proxyUrl);
    url.searchParams.set("canvasApiKey", config.canvasApiKey);
    url.searchParams.set("canvasBaseUrl", config.canvasBaseUrl);
    if (config.debug) url.searchParams.set("debug", "true");
    if (config.gradescopeEmail)
      url.searchParams.set("gradescopeEmail", config.gradescopeEmail);
    if (config.gradescopePassword)
      url.searchParams.set("gradescopePassword", config.gradescopePassword);

    const response = await fetch(url.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json, text/event-stream",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "tools/call",
        params: { name: toolName, arguments: args },
        id: Math.random(),
      }),
    });

    if (!response.ok) {
      throw new Error(`Server responded with ${response.status}: ${await response.text()}`);
    }

    const data = await response.json();
    return data.result || data;
  }

  // Register all Canvas tools

  server.registerTool(
    "list_courses",
    {
      title: "List Courses",
      description: "Get all active Canvas courses for the authenticated user",
      inputSchema: {},
    },
    async () => {
      return await proxyToCanvasServer("list_courses", {});
    }
  );

  server.registerTool(
    "get_assignments",
    {
      title: "Get Course Assignments",
      description: "Get assignments for a specific Canvas course",
      inputSchema: {
        course_id: z.number().describe("Canvas course ID"),
      },
    },
    async ({ course_id }) => {
      return await proxyToCanvasServer("get_assignments", { course_id });
    }
  );

  server.registerTool(
    "get_upcoming_assignments",
    {
      title: "Get Upcoming Assignments",
      description:
        "Get upcoming assignments across all courses with due dates in the next 7 days",
      inputSchema: {},
    },
    async () => {
      return await proxyToCanvasServer("get_upcoming_assignments", {});
    }
  );

  server.registerTool(
    "get_grades",
    {
      title: "Get Grades",
      description:
        "Get current grades for a Canvas course, including assignment scores and overall grade",
      inputSchema: {
        course_id: z.number().describe("Canvas course ID"),
      },
    },
    async ({ course_id }) => {
      return await proxyToCanvasServer("get_grades", { course_id });
    }
  );

  server.registerTool(
    "get_user_profile",
    {
      title: "Get User Profile",
      description:
        "Get the authenticated user's Canvas profile information including name, email, and avatar",
      inputSchema: {},
    },
    async () => {
      return await proxyToCanvasServer("get_user_profile", {});
    }
  );

  server.registerTool(
    "get_modules",
    {
      title: "Get Course Modules",
      description: "Get all modules for a specific Canvas course",
      inputSchema: {
        course_id: z.number().describe("Canvas course ID"),
      },
    },
    async ({ course_id }) => {
      return await proxyToCanvasServer("get_modules", { course_id });
    }
  );

  server.registerTool(
    "get_announcements",
    {
      title: "Get Course Announcements",
      description: "Get recent announcements for a specific Canvas course",
      inputSchema: {
        course_id: z.number().describe("Canvas course ID"),
      },
    },
    async ({ course_id }) => {
      return await proxyToCanvasServer("get_announcements", { course_id });
    }
  );

  server.registerTool(
    "get_discussions",
    {
      title: "Get Discussion Topics",
      description: "Get discussion topics for a specific Canvas course",
      inputSchema: {
        course_id: z.number().describe("Canvas course ID"),
      },
    },
    async ({ course_id }) => {
      return await proxyToCanvasServer("get_discussions", { course_id });
    }
  );

  server.registerTool(
    "get_calendar_events",
    {
      title: "Get Calendar Events",
      description:
        "Get upcoming calendar events for the authenticated user across all courses",
      inputSchema: {},
    },
    async () => {
      return await proxyToCanvasServer("get_calendar_events", {});
    }
  );

  server.registerTool(
    "get_todo_items",
    {
      title: "Get Todo Items",
      description: "Get todo items (assignments needing attention) for the user",
      inputSchema: {},
    },
    async () => {
      return await proxyToCanvasServer("get_todo_items", {});
    }
  );

  server.registerTool(
    "get_quizzes",
    {
      title: "Get Course Quizzes",
      description: "Get all quizzes for a specific Canvas course",
      inputSchema: {
        course_id: z.number().describe("Canvas course ID"),
      },
    },
    async ({ course_id }) => {
      return await proxyToCanvasServer("get_quizzes", { course_id });
    }
  );

  server.registerTool(
    "get_submission_status",
    {
      title: "Get Submission Status",
      description:
        "Check submission status for a specific assignment in a course",
      inputSchema: {
        course_id: z.number().describe("Canvas course ID"),
        assignment_id: z.number().describe("Assignment ID"),
      },
    },
    async ({ course_id, assignment_id }) => {
      return await proxyToCanvasServer("get_submission_status", {
        course_id,
        assignment_id,
      });
    }
  );

  return server.server;
}
