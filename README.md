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

### For ChatGPT (Custom GPT with Search)

1. Visit **Settings → General → Connectors** in ChatGPT and click **Add** to register a new connector.
2. Give it a name (for example, `Canvas`) and set the **MCP Server URL** field to `https://canvas-instant-mcp.fly.dev`.
3. When prompted for the schema, upload [`openapi/canvas.yaml`](openapi/canvas.yaml) (or paste its contents into the editor window).
4. When the dialog asks about authentication, pick **Authentication required**, choose **API Key** from the dropdown, set the header name to `Authorization`, and paste `Bearer YOUR_MCP_AUTH_TOKEN` as the value. ChatGPT will store the secret securely.
5. Save the connector, then enable it inside a Custom GPT via the **Actions → Add from library** flow.
6. Test with prompts like "List my Canvas courses" or "What assignments are due this week?"—the non-consequential search operations will execute automatically during Search.

> **Field-by-field reference**
>
> | Connector dialog field | Value to enter |
> | --- | --- |
> | MCP Server URL | `https://canvas-instant-mcp.fly.dev` |
> | OpenAPI schema | Upload `openapi/canvas.yaml` or paste its YAML |
> | Authentication | `API Key` → header `Authorization`, value `Bearer YOUR_MCP_AUTH_TOKEN` |
>
> ⚠️ Paste each value into its matching field—do **not** put the entire reference block into the URL field like in the screenshot.

> **Need the values with your real token?** Once you export the secret locally, run `npm run connector:command` (or `node scripts/print-connector-command.js --token <value>`) and the helper will print the connector URL, schema path, header name, header value, and a ready-to-run `curl` health check that already includes your key.

> 💡 If the dialog only offers "No authentication" or throws `Error fetching OAuth configuration`, it is still holding on to an older cached schema. Close the connector editor, open it again, re-upload `openapi/canvas.yaml`, and the **API Key** option will appear alongside OAuth.

> **Why a new schema?** The `openapi/canvas.yaml` document enumerates the read-only `GET /canvas/*` endpoints, tags them as non-consequential search actions, and tells ChatGPT to treat them as safe during Search.

#### Check that the server is running

You can confirm the public Fly.io deployment is healthy without any credentials by calling the health endpoint:

```bash
curl https://canvas-instant-mcp.fly.dev/health
```

You should see a small JSON blob (status, version, timestamp). If the command times out or returns a 5xx, the hosted server is down and you will need to redeploy or contact whoever operates the Fly app. A `401` from any `/canvas/*` request means the server is up but you have not supplied the `MCP_AUTH_TOKEN` header.

#### What's the `MCP_AUTH_TOKEN`?

The `MCP_AUTH_TOKEN` is **not** your personal Canvas API token. It is a separate bearer token that proves your ChatGPT connector (or any other client) is allowed to call this MCP server. Only whoever operates the Fly.io deployment can mint or read it. If you run the deployment yourself, generate and fetch the token like this:

```bash
# Generate a new 32-byte token and store it as a Fly secret
flyctl secrets set MCP_AUTH_TOKEN="$(openssl rand -base64 32)" --app canvas-instant-mcp

# Confirm the value locally when you need to paste it into ChatGPT
flyctl secrets list --app canvas-instant-mcp | awk '/MCP_AUTH_TOKEN/ {print $3}'
```

If you do **not** control the Fly app, ask the person who deployed the server to share the token with you securely—there is no way to derive it from your Canvas account. Only share the token with trusted clients (for example, ChatGPT's connector configuration). Anyone who has it can query the server on your behalf.

#### Double-check the latest repository changes

Wondering whether anything new landed in the repo? Run these commands from the project root:

```bash
git status -sb
git log -1 --oneline
```

The `git status` line tells you if there are uncommitted edits, and `git log -1` prints the most recent commit message so you can confirm exactly what was last pushed.

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

# Type-check the project
npm test
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
