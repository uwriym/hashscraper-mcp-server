import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { scrapeUrl } from "../utils/api.js";

const ScrapeUrlSchema = z.object({
  url: z.string().url().describe("The URL of the webpage to scrape"),
  format: z
    .enum(["markdown", "text"])
    .default("markdown")
    .describe("Output format: markdown (default) or text"),
});

export function registerScrapeUrlTool(server: McpServer) {
  server.tool(
    "scrape_url",
    "Scrapes a webpage and returns the content in AI-readable Markdown format. Can access blocked sites through browser rendering.",
    ScrapeUrlSchema.shape,
    async (params) => {
      const { url, format } = ScrapeUrlSchema.parse(params);

      try {
        // 1. Request browser rendering via Hashscraper API
        const response = await scrapeUrl({
          url,
          format,
          javascript: true,
        });

        if (!response.success) {
          return {
            isError: true,
            content: [
              {
                type: "text" as const,
                text: `Error: ${response.error || "Failed to scrape the page."}`,
              },
            ],
          };
        }

        // 2. Return to AI
        const result = [
          `# ${response.data.title || "Untitled"}`,
          "",
          `> Source: ${response.data.url}`,
          "",
          response.data.content,
        ].join("\n");

        return {
          content: [
            {
              type: "text" as const,
              text: result,
            },
          ],
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return {
          isError: true,
          content: [
            {
              type: "text" as const,
              text: `Error: ${message}`,
            },
          ],
        };
      }
    }
  );
}
