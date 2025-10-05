# Canvas Instant MCP Setup

## Live Server
**URL:** https://canvas-instant-mcp.fly.dev
**Auth Token:** `WfywO70HOwi69xbBnw5ZIBc4pAFVMTRwlsk83OnvFr8=`

## Testing with Auth

```bash
curl -X POST https://canvas-instant-mcp.fly.dev/mcp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer WfywO70HOwi69xbBnw5ZIBc4pAFVMTRwlsk83OnvFr8=" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
```

## ChatGPT Integration

Add this to your Custom GPT action:

```yaml
servers:
  canvas-instant-mcp:
    type: http
    url: https://canvas-instant-mcp.fly.dev/mcp
    headers:
      Authorization: "Bearer WfywO70HOwi69xbBnw5ZIBc4pAFVMTRwlsk83OnvFr8="
```

## Update Secrets

```bash
# Update Canvas token
flyctl secrets set CANVAS_API_KEY=your_new_token --app canvas-instant-mcp

# Rotate auth token
flyctl secrets set MCP_AUTH_TOKEN=new_secure_token --app canvas-instant-mcp
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
