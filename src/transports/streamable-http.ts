import { randomUUID } from "node:crypto";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { createMcpExpressApp } from "@modelcontextprotocol/sdk/server/express.js";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";
import { createMcpServer } from "../server.js";
import { authMiddleware } from "../middleware/auth.js";

interface SessionEntry {
  transport: StreamableHTTPServerTransport;
  lastActivity: number;
}

const sessions: Map<string, SessionEntry> = new Map();

const SESSION_TTL_MS = 30 * 60 * 1000; // 30 minutes

function startSessionCleanup() {
  setInterval(async () => {
    const now = Date.now();
    for (const [id, entry] of sessions) {
      if (now - entry.lastActivity > SESSION_TTL_MS) {
        console.log(`[Session] Cleaning up inactive session: ${id}`);
        await entry.transport.close();
        sessions.delete(id);
      }
    }
  }, 60_000);
}

export async function startHttp(port: number) {
  const app = createMcpExpressApp({ host: "0.0.0.0" });

  app.use("/mcp", authMiddleware);

  // POST /mcp
  app.post("/mcp", async (req, res) => {
    const sessionId = req.headers["mcp-session-id"] as string | undefined;

    try {
      if (sessionId && sessions.has(sessionId)) {
        const entry = sessions.get(sessionId)!;
        entry.lastActivity = Date.now();
        await entry.transport.handleRequest(req, res, req.body);
        return;
      }

      if (!sessionId && isInitializeRequest(req.body)) {
        const transport = new StreamableHTTPServerTransport({
          sessionIdGenerator: () => randomUUID(),
          onsessioninitialized: (id) => {
            sessions.set(id, { transport, lastActivity: Date.now() });
          },
          onsessionclosed: (id) => {
            sessions.delete(id);
          },
        });

        transport.onclose = () => {
          if (transport.sessionId) {
            sessions.delete(transport.sessionId);
          }
        };

        const server = createMcpServer();
        await server.connect(transport);
        await transport.handleRequest(req, res, req.body);
        return;
      }

      res.status(400).json({
        jsonrpc: "2.0",
        error: { code: -32000, message: "Bad Request: No valid session" },
        id: null,
      });
    } catch (error) {
      console.error("Error handling MCP POST request:", error);
      if (!res.headersSent) {
        res.status(500).json({
          jsonrpc: "2.0",
          error: { code: -32603, message: "Internal server error" },
          id: null,
        });
      }
    }
  });

  // GET /mcp — SSE stream
  app.get("/mcp", async (req, res) => {
    const sessionId = req.headers["mcp-session-id"] as string | undefined;
    if (!sessionId || !sessions.has(sessionId)) {
      res.status(400).send("Invalid or missing session ID");
      return;
    }

    const lastEventId = req.headers["last-event-id"] as string | undefined;
    if (lastEventId) {
      console.log(
        `[SSE] Client reconnecting with Last-Event-ID: ${lastEventId}`,
      );
    }

    const entry = sessions.get(sessionId)!;
    entry.lastActivity = Date.now();
    await entry.transport.handleRequest(req, res);
  });

  // DELETE /mcp — session termination
  app.delete("/mcp", async (req, res) => {
    const sessionId = req.headers["mcp-session-id"] as string | undefined;
    if (!sessionId || !sessions.has(sessionId)) {
      res.status(400).send("Invalid or missing session ID");
      return;
    }
    await sessions.get(sessionId)!.transport.handleRequest(req, res);
  });

  // Health check (no auth)
  app.get("/health", (_req, res) => {
    res.json({
      status: "ok",
      transport: "streamable-http",
      sessions: sessions.size,
    });
  });

  app.listen(port, () => {
    console.log(`Hashscraper MCP server (Streamable HTTP) on port ${port}`);
    console.log(`  MCP endpoint: http://localhost:${port}/mcp`);
    console.log(`  Health check: http://localhost:${port}/health`);
  });

  startSessionCleanup();

  async function shutdown() {
    console.log("Shutting down...");
    for (const [id, entry] of sessions) {
      await entry.transport.close();
      sessions.delete(id);
    }
    process.exit(0);
  }
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}
