import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
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
  debug: z
    .boolean()
    .default(false)
    .describe("Enable debug logging"),
  gradescopeEmail: z
    .string()
    .optional()
    .describe("Gradescope email for authentication (optional)"),
  gradescopePassword: z
    .string()
    .optional()
    .describe("Gradescope password (optional)"),
});

export type Config = z.infer<typeof configSchema>;

// Mark this as a stateless server for Smithery
export const stateless = true;

// Canvas API client
class CanvasAPI {
  constructor(
    private apiKey: string,
    private baseUrl: string
  ) {}

  private async fetch(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}/api/v1${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`Canvas API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async listCourses() {
    return this.fetch("/courses?enrollment_state=active&per_page=100");
  }

  async getAssignments(courseId: number) {
    return this.fetch(`/courses/${courseId}/assignments?per_page=100`);
  }

  async getUpcomingAssignments() {
    const courses = await this.listCourses();
    const allAssignments = await Promise.all(
      courses.map((course: any) =>
        this.getAssignments(course.id).catch(() => [])
      )
    );

    const now = new Date();
    const upcoming = allAssignments
      .flat()
      .filter((a: any) => a.due_at && new Date(a.due_at) > now)
      .sort((a: any, b: any) => new Date(a.due_at).getTime() - new Date(b.due_at).getTime())
      .slice(0, 20);

    return upcoming;
  }

  async getGrades(courseId: number) {
    return this.fetch(`/courses/${courseId}/enrollments?user_id=self&include[]=total_scores`);
  }

  async getUserProfile() {
    return this.fetch("/users/self/profile");
  }

  async getModules(courseId: number) {
    return this.fetch(`/courses/${courseId}/modules?per_page=100`);
  }

  async getAnnouncements(courseId: number) {
    return this.fetch(`/courses/${courseId}/discussion_topics?only_announcements=true&per_page=20`);
  }

  async getDiscussions(courseId: number) {
    return this.fetch(`/courses/${courseId}/discussion_topics?per_page=50`);
  }

  async getCalendarEvents() {
    const startDate = new Date().toISOString();
    return this.fetch(`/calendar_events?start_date=${startDate}&per_page=50`);
  }

  async getTodoItems() {
    return this.fetch("/users/self/todo");
  }

  async getQuizzes(courseId: number) {
    return this.fetch(`/courses/${courseId}/quizzes?per_page=100`);
  }

  async getSubmissionStatus(courseId: number, assignmentId: number) {
    return this.fetch(`/courses/${courseId}/assignments/${assignmentId}/submissions/self`);
  }
}

export default function createServer({ config }: { config: Config }) {
  const server = new Server(
    {
      name: "Canvas Instant MCP",
      version: "2.0.0",
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  const canvas = new CanvasAPI(config.canvasApiKey, config.canvasBaseUrl);

  // List available tools
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [
        {
          name: "list_courses",
          description: "Get all active Canvas courses for the authenticated user",
          inputSchema: {
            type: "object",
            properties: {},
          },
        },
        {
          name: "get_assignments",
          description: "Get assignments for a specific Canvas course",
          inputSchema: {
            type: "object",
            properties: {
              course_id: { type: "number", description: "Canvas course ID" },
            },
            required: ["course_id"],
          },
        },
        {
          name: "get_upcoming_assignments",
          description: "Get upcoming assignments across all courses with due dates in the next 7 days",
          inputSchema: {
            type: "object",
            properties: {},
          },
        },
        {
          name: "get_grades",
          description: "Get current grades for a Canvas course, including assignment scores and overall grade",
          inputSchema: {
            type: "object",
            properties: {
              course_id: { type: "number", description: "Canvas course ID" },
            },
            required: ["course_id"],
          },
        },
        {
          name: "get_user_profile",
          description: "Get the authenticated user's Canvas profile information",
          inputSchema: {
            type: "object",
            properties: {},
          },
        },
        {
          name: "get_modules",
          description: "Get all modules for a specific Canvas course",
          inputSchema: {
            type: "object",
            properties: {
              course_id: { type: "number", description: "Canvas course ID" },
            },
            required: ["course_id"],
          },
        },
        {
          name: "get_announcements",
          description: "Get recent announcements for a Canvas course",
          inputSchema: {
            type: "object",
            properties: {
              course_id: { type: "number", description: "Canvas course ID" },
            },
            required: ["course_id"],
          },
        },
        {
          name: "get_discussions",
          description: "Get discussion topics for a Canvas course",
          inputSchema: {
            type: "object",
            properties: {
              course_id: { type: "number", description: "Canvas course ID" },
            },
            required: ["course_id"],
          },
        },
        {
          name: "get_calendar_events",
          description: "Get calendar events for the authenticated user",
          inputSchema: {
            type: "object",
            properties: {},
          },
        },
        {
          name: "get_todo_items",
          description: "Get todo items (assignments that need action) for the authenticated user",
          inputSchema: {
            type: "object",
            properties: {},
          },
        },
        {
          name: "get_quizzes",
          description: "Get all quizzes for a specific Canvas course",
          inputSchema: {
            type: "object",
            properties: {
              course_id: { type: "number", description: "Canvas course ID" },
            },
            required: ["course_id"],
          },
        },
        {
          name: "get_submission_status",
          description: "Check submission status for a specific assignment",
          inputSchema: {
            type: "object",
            properties: {
              course_id: { type: "number", description: "Canvas course ID" },
              assignment_id: { type: "number", description: "Assignment ID" },
            },
            required: ["course_id", "assignment_id"],
          },
        },
      ],
    };
  });

  // Handle tool execution
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    try {
      let result;
      switch (name) {
        case "list_courses":
          result = await canvas.listCourses();
          break;
        case "get_assignments":
          result = await canvas.getAssignments((args as any).course_id);
          break;
        case "get_upcoming_assignments":
          result = await canvas.getUpcomingAssignments();
          break;
        case "get_grades":
          result = await canvas.getGrades((args as any).course_id);
          break;
        case "get_user_profile":
          result = await canvas.getUserProfile();
          break;
        case "get_modules":
          result = await canvas.getModules((args as any).course_id);
          break;
        case "get_announcements":
          result = await canvas.getAnnouncements((args as any).course_id);
          break;
        case "get_discussions":
          result = await canvas.getDiscussions((args as any).course_id);
          break;
        case "get_calendar_events":
          result = await canvas.getCalendarEvents();
          break;
        case "get_todo_items":
          result = await canvas.getTodoItems();
          break;
        case "get_quizzes":
          result = await canvas.getQuizzes((args as any).course_id);
          break;
        case "get_submission_status":
          result = await canvas.getSubmissionStatus(
            (args as any).course_id,
            (args as any).assignment_id
          );
          break;
        default:
          throw new Error(`Unknown tool: ${name}`);
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error: any) {
      return {
        content: [
          {
            type: "text",
            text: `Error: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  });

  return server;
}
