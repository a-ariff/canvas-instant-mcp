# Canvas Instant MCP

[![smithery badge](https://smithery.ai/badge/@a-ariff/canvas-instant-mcp)](https://smithery.ai/server/@a-ariff/canvas-instant-mcp)
Ready-to-use Canvas MCP server for ChatGPT and AI assistants. This proxy forwards requests to a production Cloudflare Workers backend, giving you instant Canvas LMS integration without any deployment hassle.

## Architecture

```
Smithery → This Proxy → Cloudflare Workers (canvas-mcp-sse.ariff.dev) → Canvas API
```

## How It Works

This server connects to a production-grade Canvas MCP backend running on Cloudflare Workers. You get instant access without deploying your own infrastructure:

1. Accepting configuration from Smithery (Canvas API token, base URL, etc.)
2. Forwarding all MCP tool calls to the actual Cloudflare Workers server
3. Returning results back to Smithery/Claude

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
