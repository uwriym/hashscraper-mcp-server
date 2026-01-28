# Hashscraper MCP Server

MCP server for AI agents that provides web scraping capabilities. Input a URL and get AI-readable Markdown content, even from sites that block bots.

## Features

- **Direct URL Scraping**: Just input a URL and get content instantly
- **AI-friendly Output**: Automatic HTML to Markdown conversion
- **Content Extraction**: Automatically removes ads, navigation, and other clutter
- **Usage Tracking**: Monitor your API credits and usage

## Quick Start

> **Note**: npm package is not yet published. Please install from source for now.

```bash
git clone https://github.com/bamchi/hashscraper-mcp-server.git
cd hashscraper-mcp-server
npm install && npm run build
```

For detailed setup instructions (API key, Claude Desktop, Cursor configuration), see the **Usage Guide**:

- [English](./docs/USAGE_GUIDE_en.md)
- [한국어](./docs/USAGE_GUIDE_ko.md)

## MCP Tools

| Tool | Description |
|------|-------------|
| `scrape_url` | Scrapes a webpage and returns AI-readable Markdown |
| `get_usage` | Check API usage and remaining credits |

## Development

```bash
npm install        # Install dependencies
npm run build      # Build
npm run dev        # Development mode (watch)
npm run inspector  # Test with MCP Inspector
```

## License

MIT
