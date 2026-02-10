#!/usr/bin/env node

import { startStdio } from "./transports/stdio.js";
import { startHttp } from "./transports/streamable-http.js";

async function main() {
  const mode = process.env.MCP_TRANSPORT || process.argv[2] || "stdio";
  const port = parseInt(process.env.MCP_PORT || "3100", 10);

  switch (mode) {
    case "http":
      await startHttp(port);
      break;
    case "stdio":
    default:
      await startStdio();
      break;
  }
}

main().catch((error) => {
  console.error("Failed to start MCP server:", error);
  process.exit(1);
});
