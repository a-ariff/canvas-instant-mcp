# Canvas Instant MCP

Model Context Protocol (MCP) server for Canvas LMS - giving you instant Canvas integration with AI assistants like Claude Desktop and ChatGPT.

🚀 **Live Server:** https://canvas-instant-mcp.fly.dev

## Quick Start

### For Claude Desktop

Add to your Claude Desktop config:

```json
{
  "mcpServers": {
    "canvas": {
      "command": "npx",
      "args": ["-y", "@a-ariff/canvas-instant-mcp"],
      "env": {
        "CANVAS_API_KEY": "your_canvas_api_token",
        "CANVAS_BASE_URL": "https://canvas.instructure.com"
      }
    }
  }
}
```

### For ChatGPT (Custom GPT)

1. Create a new Custom GPT at https://chat.openai.com/gpts/editor
2. In the **Actions** section, click "Create new action"
3. Use this OpenAPI schema:

```yaml
openapi: 3.1.0
info:
  title: Canvas LMS MCP
  version: 1.0.0
servers:
  - url: https://canvas-instant-mcp.fly.dev
paths:
  /mcp:
    post:
      operationId: callMcpTool
      summary: Call Canvas LMS tools
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                jsonrpc:
                  type: string
                  default: "2.0"
                method:
                  type: string
                  enum: [initialize, tools/list, tools/call]
                params:
                  type: object
                id:
                  type: integer
      responses:
        '200':
          description: Successful response
```

4. Save and test with: "List my Canvas courses"

## Architecture

```
AI Assistant → Canvas Instant MCP (Fly.io) → Canvas LMS API
```

## Available Tools

All 12 Canvas tools are proxied:

### Course Management
- `list_courses` - Get all active courses
- `get_modules` - Get course modules
- `get_user_profile` - Get user profile

### Assignment Tools
- `get_assignments` - Get course assignments
- `get_upcoming_assignments` - Get upcoming assignments
- `get_submission_status` - Check submission status
- `get_todo_items` - Get todo list
- `get_grades` - Get course grades

### Communication
- `get_announcements` - Get course announcements
- `get_discussions` - Get discussion topics
- `get_calendar_events` - Get calendar events

### Quiz Tools
- `get_quizzes` - Get course quizzes

## Configuration

When adding this server in Smithery, you'll need to provide:

- **canvasApiKey** (required): Your Canvas API access token
- **canvasBaseUrl** (optional): Your Canvas instance URL (defaults to canvas.instructure.com)
- **debug** (optional): Enable debug logging
- **gradescopeEmail** (optional): Gradescope email
- **gradescopePassword** (optional): Gradescope password

## Development

```bash
# Install dependencies
npm install

# Run locally (requires Smithery CLI)
npm run dev

# Build
npm run build
```

## Deployment

This repo is designed to be deployed via Smithery:

1. Go to Smithery
2. Click "Add Server" → "Continue with Git"
3. Select this repository: `a-ariff/canvas-instant-mcp`
4. Base directory: `.` (root)
5. Branch: `main`
6. Configure your Canvas credentials
7. Deploy!

## Main Server

The actual Canvas MCP server implementation is at:
- GitHub: https://github.com/a-ariff/canvas-student-mcp-server
- Live: https://canvas-mcp-sse.ariff.dev

For Claude Desktop users, we recommend using the main server directly with OAuth instead of this proxy.

## License

MIT
