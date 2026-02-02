import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getScraperServerStatus, ScraperServerInfo } from "../utils/api.js";

function formatStatus(server: ScraperServerInfo): string {
  if (server.circuit_open) return "OPEN";
  if (server.healthy === true) return "OK";
  if (server.healthy === false) return "FAIL";
  return "N/A";
}

function formatTime(iso: string | null): string {
  if (!iso) return "-";
  const d = new Date(iso);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  const ss = String(d.getSeconds()).padStart(2, "0");
  return `${mm}/${dd} ${hh}:${mi}:${ss}`;
}

export function registerScraperServerStatusTool(server: McpServer) {
  server.tool(
    "scraper_server_status",
    "Check the status of all ScraperServer instances. Shows server health, circuit breaker state, failure counts, and last success/failure times.",
    {},
    async () => {
      try {
        const response = await getScraperServerStatus();

        if (!response.success) {
          return {
            isError: true,
            content: [
              {
                type: "text" as const,
                text: `Error: ${response.error || "Failed to retrieve ScraperServer status."}`,
              },
            ],
          };
        }

        const { total, available, servers } = response.data;

        const lines: string[] = [
          "## ScraperServer Status",
          "",
          `Total: ${total} | Available: ${available}`,
          "",
          "| Name | OS | Status | Failures | Last Success | Last Failure |",
          "|------|----|--------|----------|--------------|--------------|",
        ];

        for (const s of servers) {
          const status = formatStatus(s);
          lines.push(
            `| ${s.name} | ${s.os} | ${status} | ${s.failure_count} | ${formatTime(s.last_success)} | ${formatTime(s.last_failure)} |`
          );
        }

        // Show circuit breaker and error details for problem servers
        const problems = servers.filter(
          (s) => s.circuit_open || s.healthy === false
        );
        if (problems.length > 0) {
          lines.push("");
          lines.push("### Issues");
          for (const s of problems) {
            if (s.circuit_open && s.circuit_open_until) {
              lines.push(
                `- **${s.name}**: Circuit breaker open until ${formatTime(s.circuit_open_until)}`
              );
            }
            if (s.last_error) {
              lines.push(`- **${s.name}**: ${s.last_error}`);
            }
          }
        }

        return {
          content: [
            {
              type: "text" as const,
              text: lines.join("\n"),
            },
          ],
        };
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unknown error";
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
