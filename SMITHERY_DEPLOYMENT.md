# Smithery Deployment Guide

## ✅ Status: Ready for Deployment

**Last Update:** October 5, 2025  
**Latest Commit:** `84bee72` - Remove remotes section to fix Smithery deployment

---

## What Was Fixed

### ❌ Previous Error:
```
Error code: publishSandboxError
An internal error occurred when creating proxy endpoint
```

### ✅ Root Cause Identified:
Smithery was trying to create a remote proxy endpoint at:
```
https://server.smithery.ai/@a-ariff/canvas-instant-mcp/mcp
```

But `canvas-instant-mcp` is designed for **local stdio use** (Claude Desktop, Cursor, VS Code), not remote proxy.

### ✅ Fix Applied:
- Removed `remotes` section from smithery.yaml
- Smithery will now publish as **NPM package only**
- Users install via: `npx @smithery/cli install canvas-instant-mcp`
- No dependency on Smithery's proxy infrastructure

---

## Deployment Methods

### Method 1: Smithery Web Dashboard (Recommended)

**Steps:**
1. Go to: https://smithery.ai
2. Click: **"Submit Server"** or **"Add Server"**
3. Enter GitHub URL: `https://github.com/a-ariff/canvas-instant-mcp`
4. Smithery will:
   - Clone the repo
   - Detect `smithery.yaml`
   - Validate configuration
   - Build the package
   - Publish to registry

**Expected Result:**
```
✅ Server published successfully
✅ Available at: https://smithery.ai/server/@a-ariff/canvas-instant-mcp
✅ Install via: npx @smithery/cli install canvas-instant-mcp
```

### Method 2: GitHub Webhook (Automatic)

If you've connected your GitHub account to Smithery:
- Smithery automatically detects pushes with `smithery.yaml`
- Auto-validates and publishes new versions
- No manual submission needed

**Check if connected:**
1. Go to: https://smithery.ai/settings (or similar)
2. Look for: "GitHub Integration" or "Connected Repositories"
3. Verify: `a-ariff/canvas-instant-mcp` is listed

---

## Verification After Deployment

### 1. Check Registry
```bash
npx -y @smithery/cli search canvas-instant-mcp
```

**Expected output:**
```
Found 1 server:
  canvas-instant-mcp by a-ariff
  Instant Canvas LMS integration for AI assistants
```

### 2. Inspect Server Details
```bash
npx -y @smithery/cli inspect canvas-instant-mcp
```

**Expected output:**
```json
{
  "name": "canvas-instant-mcp",
  "version": "2.0.0",
  "description": "Instant Canvas LMS integration for AI assistants via ChatGPT",
  "author": "a-ariff",
  "homepage": "https://github.com/a-ariff/canvas-instant-mcp",
  "runtime": "typescript"
}
```

### 3. Test Installation
```bash
# Install to a test directory
cd /tmp
npx -y @smithery/cli install canvas-instant-mcp

# Should download and configure the package
```

### 4. Test in Claude Desktop
Add to Claude Desktop config:
```json
{
  "mcpServers": {
    "canvas": {
      "command": "npx",
      "args": ["-y", "@smithery/cli", "run", "canvas-instant-mcp"],
      "env": {
        "CANVAS_API_KEY": "your-api-key",
        "CANVAS_BASE_URL": "https://learn.mywhitecliffe.com"
      }
    }
  }
}
```

---

## Current Configuration

**smithery.yaml:**
```yaml
name: canvas-instant-mcp
description: Instant Canvas LMS integration for AI assistants via ChatGPT
version: "2.0.0"
author: a-ariff
homepage: https://github.com/a-ariff/canvas-instant-mcp
runtime: "typescript"
```

**No `remotes` section** = NPM-only deployment ✅

**package.json (key fields):**
```json
{
  "name": "canvas-instant-mcp",
  "version": "2.0.0",
  "main": "dist/index.js",
  "bin": {
    "canvas-instant-mcp": "dist/index.js"
  },
  "repository": {
    "type": "git",
    "url": "https://github.com/a-ariff/canvas-instant-mcp.git"
  }
}
```

**src/index.ts exports:**
- ✅ `export const configSchema` (line 10)
- ✅ `export const stateless = true`
- ✅ `export function createServer(config: Config): Server`

---

## Troubleshooting

### If Smithery Still Fails

**Error: "publishSandboxError"**
- This means Smithery is still trying to create a proxy
- Verify `smithery.yaml` has NO `remotes` section
- Check git commit is pushed: `git log -1`
- Clear Smithery cache (may need to contact support)

**Error: "Validation failed"**
- Check `configSchema` is exported: `grep "export const configSchema" src/index.ts`
- Verify build succeeds: `npm run build && ls dist/`
- Ensure package.json has all required fields

**Error: "Package not found"**
- Repo must be public: https://github.com/a-ariff/canvas-instant-mcp/settings
- Repo must have `smithery.yaml` in root
- GitHub URL must be exact (case-sensitive)

### Contact Smithery Support

If deployment still fails with internal errors:
1. Go to: https://smithery.ai/support (or Discord/email)
2. Provide:
   - GitHub URL: https://github.com/a-ariff/canvas-instant-mcp
   - Error code: `publishSandboxError`
   - Note: "Removed remotes section but still failing"
   - Latest commit: `84bee72`

---

## Expected Timeline

- **Submission:** 1 minute (manual)
- **Validation:** 2-5 minutes (Smithery builds and validates)
- **Publication:** Immediate after validation
- **Registry Propagation:** 1-5 minutes
- **Total:** 5-10 minutes typically

---

## Success Criteria

✅ Server appears in search: `npx @smithery/cli search canvas-instant-mcp`  
✅ Server inspectable: `npx @smithery/cli inspect canvas-instant-mcp`  
✅ Installation works: `npx @smithery/cli install canvas-instant-mcp`  
✅ Claude Desktop integration works  
✅ Listed on Smithery marketplace: https://smithery.ai/server/@a-ariff/canvas-instant-mcp

---

## Next Steps

**RIGHT NOW:**
1. Go to https://smithery.ai
2. Submit: https://github.com/a-ariff/canvas-instant-mcp
3. Wait for validation (5-10 minutes)
4. Verify in registry (commands above)

**AFTER SUCCESS:**
- Update README with Smithery installation instructions
- Share on social media / Canvas community
- Monitor Smithery analytics (if available)

---

**Status:** ✅ Ready for immediate deployment  
**Configuration:** ✅ Validated  
**Git Status:** ✅ Clean and pushed  
**Action Required:** Manual submission to Smithery dashboard
