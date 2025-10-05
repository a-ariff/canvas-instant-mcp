import { z } from "zod";

// Configuration schema for Smithery
export const configSchema = z.object({
  canvasApiKey: z
    .string()
    .describe("Your Canvas API access token"),
  canvasBaseUrl: z
    .string()
    .default("https://canvas.instructure.com")
    .describe("Your Canvas instance URL"),
});

export type Config = z.infer<typeof configSchema>;

export default function createServer({ config }: { config: Config }) {
  // Proxy URL to actual Cloudflare Workers server
  const proxyUrl = "https://canvas-mcp-sse.ariff.dev/public";

  // Helper function to call the actual Canvas server
  async function proxyToCanvasServer(toolName: string, args: any) {
    const url = new URL(proxyUrl);
    url.searchParams.set("canvasApiKey", config.canvasApiKey);
    url.searchParams.set("canvasBaseUrl", config.canvasBaseUrl);

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

    const data = (await response.json()) as any;
    return data.result || data;
  }

  return {
    name: "Canvas Instant MCP",
    version: "1.0.0",
    tools: {
      list_courses: {
        description: "Get all active Canvas courses for the authenticated user",
        parameters: z.object({}),
        execute: async () => {
          return await proxyToCanvasServer("list_courses", {});
        },
      },
      get_assignments: {
        description: "Get assignments for a specific Canvas course",
        parameters: z.object({
          course_id: z.number().describe("Canvas course ID"),
        }),
        execute: async (params: { course_id: number }) => {
          return await proxyToCanvasServer("get_assignments", params);
        },
      },
      get_upcoming_assignments: {
        description: "Get upcoming assignments across all courses with due dates in the next 7 days",
        parameters: z.object({}),
        execute: async () => {
          return await proxyToCanvasServer("get_upcoming_assignments", {});
        },
      },
      get_grades: {
        description: "Get current grades for a Canvas course, including assignment scores and overall grade",
        parameters: z.object({
          course_id: z.number().describe("Canvas course ID"),
        }),
        execute: async (params: { course_id: number }) => {
          return await proxyToCanvasServer("get_grades", params);
        },
      },
      get_user_profile: {
        description: "Get the authenticated user's Canvas profile information including name, email, and avatar",
        parameters: z.object({}),
        execute: async () => {
          return await proxyToCanvasServer("get_user_profile", {});
        },
      },
      get_modules: {
        description: "Get all modules for a specific Canvas course",
        parameters: z.object({
          course_id: z.number().describe("Canvas course ID"),
        }),
        execute: async (params: { course_id: number }) => {
          return await proxyToCanvasServer("get_modules", params);
        },
      },
      get_announcements: {
        description: "Get recent announcements for a specific Canvas course",
        parameters: z.object({
          course_id: z.number().describe("Canvas course ID"),
        }),
        execute: async (params: { course_id: number }) => {
          return await proxyToCanvasServer("get_announcements", params);
        },
      },
      get_discussions: {
        description: "Get discussion topics for a specific Canvas course",
        parameters: z.object({
          course_id: z.number().describe("Canvas course ID"),
        }),
        execute: async (params: { course_id: number }) => {
          return await proxyToCanvasServer("get_discussions", params);
        },
      },
      get_calendar_events: {
        description: "Get upcoming calendar events for the authenticated user across all courses",
        parameters: z.object({}),
        execute: async () => {
          return await proxyToCanvasServer("get_calendar_events", {});
        },
      },
      get_todo_items: {
        description: "Get todo items (assignments needing attention) for the user",
        parameters: z.object({}),
        execute: async () => {
          return await proxyToCanvasServer("get_todo_items", {});
        },
      },
      get_quizzes: {
        description: "Get all quizzes for a specific Canvas course",
        parameters: z.object({
          course_id: z.number().describe("Canvas course ID"),
        }),
        execute: async (params: { course_id: number }) => {
          return await proxyToCanvasServer("get_quizzes", params);
        },
      },
      get_submission_status: {
        description: "Check submission status for a specific assignment in a course",
        parameters: z.object({
          course_id: z.number().describe("Canvas course ID"),
          assignment_id: z.number().describe("Assignment ID"),
        }),
        execute: async (params: { course_id: number; assignment_id: number }) => {
          return await proxyToCanvasServer("get_submission_status", params);
        },
      },
    },
  };
}
