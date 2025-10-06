# Canvas Instant MCP Setup

## Live Server
**URL:** https://canvas-instant-mcp.fly.dev
**Auth Token:** _Store this securely via `flyctl secrets` or the ChatGPT connector configuration. Do not commit live tokens._

> **What is this token?** `MCP_AUTH_TOKEN` is **not** your Canvas API key. It is a Fly secret that the server checks on every request. Generate it with `flyctl secrets set MCP_AUTH_TOKEN="$(openssl rand -base64 32)" --app canvas-instant-mcp` and read it back with `flyctl secrets list --app canvas-instant-mcp` when you need to paste it into ChatGPT or local tests. If someone else runs the Fly app for you, they must share the token with you securely.

## Testing with Auth

```bash
AUTH_TOKEN="$(flyctl secrets list --app canvas-instant-mcp | awk '/MCP_AUTH_TOKEN/ {print $3}')"

curl -X POST https://canvas-instant-mcp.fly.dev/mcp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${AUTH_TOKEN}" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
```

## Quick health check

Use the unauthenticated health probe when you just want to confirm the server is live:

```bash
curl https://canvas-instant-mcp.fly.dev/health
```

Expected output:

```json
{"status":"ok","service":"Canvas Instant MCP",...}
```

If the command fails to connect, the Fly app is offline. If authenticated requests return `401`, double-check that you are using the rotated `MCP_AUTH_TOKEN` in the `Authorization: Bearer` header.

## ChatGPT Integration

1. In ChatGPT, go to **Settings → General → Connectors → Add**.
2. Set the connector URL to `https://canvas-instant-mcp.fly.dev` and upload [`openapi/canvas.yaml`](openapi/canvas.yaml).
3. When prompted for auth, pick **Authentication required → API Key**, set the header name to `Authorization`, and paste `Bearer YOUR_MCP_AUTH_TOKEN` (Fly stores it securely).
4. Enable the connector inside a Custom GPT via **Actions → Add from library**, then test a search prompt.

> 💡 If ChatGPT only offers "No authentication" or errors about OAuth, close the dialog, reopen it, and re-upload `openapi/canvas.yaml` so the **API Key** option appears.

> 🧰 Want a ready-to-paste block with your real key? Export `MCP_AUTH_TOKEN` locally and run `npm run connector:command` (or supply it inline via `node scripts/print-connector-command.js --token <value>`). The helper echoes the connector URL, schema file, auth fields, and a health-check `curl` command that already includes your token.

## Update Secrets

```bash
# Update Canvas token
flyctl secrets set CANVAS_API_KEY=your_new_token --app canvas-instant-mcp

# Rotate auth token (generate a fresh value and keep it private)
flyctl secrets set MCP_AUTH_TOKEN="$(openssl rand -base64 32)" --app canvas-instant-mcp
```

## Monitoring

```bash
# View logs
flyctl logs --app canvas-instant-mcp

# Check status
flyctl status --app canvas-instant-mcp
```

## Security Note
Keep your `MCP_AUTH_TOKEN` private! Anyone with this token can access your Canvas data.
