# 🚀 Quick Start Guide

## ⚡ Immediate Actions Required

### 1. Restart Claude Desktop (30 seconds)
```bash
# macOS
killall "Claude" && open -a "Claude"

# Or manually: Cmd+Q, then reopen
```

### 2. Set ChatGPT GPT to "Only me" (2 minutes) 🔐
```
1. ChatGPT → Profile → "My GPTs"
2. Find your Canvas GPT → "..." → "Edit GPT"
3. Bottom: "Who can access this GPT?" → "Only me"
4. Click "Update"
5. Verify 🔒 lock icon appears
```

**⚠️ SECURITY CRITICAL:** Your GPT uses YOUR Canvas API key. If public, anyone can see YOUR courses and grades!

---

## ✅ Quick Test

### Test Claude Desktop
```
1. Open Claude Desktop
2. New conversation
3. Type: "Show my Canvas courses"
4. Should see: IT8101, IT8102, IT8103, IT8106
```

### Test Fly.io
```bash
curl https://canvas-instant-mcp.fly.dev/health
# Expected: {"status":"ok",...}
```

### Test Cloudflare
```bash
curl https://canvas-mcp-sse.ariff.dev/.well-known/oauth-authorization-server | jq '.'
# Expected: OAuth config JSON
```

---

## 📊 System Status

| Component | Status | Notes |
|-----------|--------|-------|
| Claude Desktop | ✅ Fixed | Config updated, restart required |
| Fly.io | ✅ Healthy | https://canvas-instant-mcp.fly.dev |
| Cloudflare | ✅ Operational | https://canvas-mcp-sse.ariff.dev |
| ChatGPT GPT | ⚠️ Action Required | Set to "Only me" |
| Smithery | ⏳ Ready | Manual submission needed |

---

## 📚 Full Documentation

- **Detailed Report:** `TROUBLESHOOTING_REPORT.md` (this directory)
- **Setup Guide:** `SETUP.md` (this directory)
- **Environment:** `.env.example` (this directory)

---

## 🆘 If Something Breaks

1. Check `TROUBLESHOOTING_REPORT.md` → "TROUBLESHOOTING GUIDE" section
2. Run verification checklist (in report)
3. Check deployment logs:
   ```bash
   # Fly.io
   flyctl logs --app canvas-instant-mcp
   
   # Test endpoints
   curl https://canvas-instant-mcp.fly.dev/health
   ```

---

**Last Updated:** October 5, 2025
**All Systems:** ✅ Operational (after restart)
