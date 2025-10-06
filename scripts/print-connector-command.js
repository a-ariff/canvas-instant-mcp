#!/usr/bin/env node
const [, , maybeTokenFlag, tokenFromArg] = process.argv;
const envToken = process.env.MCP_AUTH_TOKEN;
const token =
  maybeTokenFlag === "--token" && tokenFromArg ? tokenFromArg : envToken;

if (!token) {
  console.error(
    "Missing MCP_AUTH_TOKEN. Either export it or run with --token <value>."
  );
  process.exit(1);
}

const connectorUrl = "https://canvas-instant-mcp.fly.dev";
const schemaPath = "openapi/canvas.yaml";
const headerName = "Authorization";
const headerValue = `Bearer ${token}`;

console.log("Paste these values into the ChatGPT connector dialog:\n");
console.log(`Connector URL: ${connectorUrl}`);
console.log(`OpenAPI schema: ${schemaPath}`);
console.log("Auth type: API Key");
console.log(`Header name: ${headerName}`);
console.log(`Header value: ${headerValue}\n`);

console.log("Ready-to-run health check:\n");
console.log(
  `curl -H '${headerName}: ${headerValue}' ${connectorUrl}/health\n`
);
