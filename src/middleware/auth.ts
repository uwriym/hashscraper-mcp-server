import { Request, Response, NextFunction } from "express";

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (process.env.MCP_AUTH_DISABLED === "true") {
    return next();
  }

  const apiKey = req.headers["x-api-key"] as string;
  const validKeys = (process.env.MCP_ALLOWED_API_KEYS || "")
    .split(",")
    .filter(Boolean);

  if (validKeys.length === 0) {
    console.warn("[Auth] MCP_ALLOWED_API_KEYS not set, skipping auth");
    return next();
  }

  if (!apiKey || !validKeys.includes(apiKey)) {
    res.status(401).json({
      jsonrpc: "2.0",
      error: { code: -32001, message: "Unauthorized: Invalid API key" },
      id: null,
    });
    return;
  }

  next();
}
