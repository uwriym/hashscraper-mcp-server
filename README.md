# 🔗 Hashscraper MCP Server

> MCP server that converts URLs to clean Markdown/Text for LLM agents

[![npm version](https://badge.fury.io/js/hashscraper-mcp-server.svg)](https://www.npmjs.com/package/hashscraper-mcp-server)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## What is this?

An [MCP (Model Context Protocol)](https://modelcontextprotocol.io/) server that lets AI agents fetch and read web pages. Simply give it a URL, and it returns clean, LLM-ready content.

**Before:** AI can't read web pages directly  
**After:** "Summarize this article" just works ✨

## Features

- 🌐 **URL → Markdown**: Preserves headings, lists, links
- 📄 **URL → Text**: Plain text extraction
- 🏷️ **Metadata**: Title, author, date, images
- 🧹 **Clean Output**: No ads, no navigation, no scripts
- ⚡ **Fast Response**: Results returned in 1-2 seconds on average
- 🎭 **JavaScript Rendering**: Works with SPAs
- 🛡️ **Advanced Bypass**: Reliably handles hard-to-access sites

## Quick Start

### Installation

```bash
npm install -g hashscraper-mcp-server
```

### Get API Key

1. Sign up at [hashscraper.com](https://hashscraper.com) (no credit card required)
2. Log in and find your API key in [My Info](https://www.hashscraper.com/users/change_userinfo)

### Configure MCP Client

**Claude Desktop** (`claude_desktop_config.json`):
```json
{
  "mcpServers": {
    "hashscraper": {
      "command": "hashscraper-mcp-server",
      "env": {
        "HASHSCRAPER_API_KEY": "your-api-key"
      }
    }
  }
}
```

**Cline / Other MCP Clients:**
```json
{
  "mcpServers": {
    "hashscraper": {
      "command": "npx",
      "args": ["hashscraper-mcp-server"],
      "env": {
        "HASHSCRAPER_API_KEY": "your-api-key"
      }
    }
  }
}
```

## Available Tools

### `fetch_url`

Fetches a URL and returns clean content.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `url` | string | ✅ | URL to fetch |
| `format` | string | | `markdown` (default) or `text` |
| `include_metadata` | boolean | | Include title, author, date |

**Example:**
```
User: Summarize this article https://example.com/news/ai-trends
AI Agent:
1. Calls fetch_url("https://example.com/news/ai-trends")
2. Receives clean markdown
3. Summarizes content
4. Returns answer
```

### `fetch_multiple`

Fetches multiple URLs in parallel.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `urls` | string[] | ✅ | URLs to fetch (max 10) |
| `format` | string | | `markdown` or `text` |

## Why Hashscraper?

Built by the [Hashscraper](https://hashscraper.com) team with 7+ years of web scraping experience:

- ✅ 5000+ production crawlers
- ✅ Reliably handles hard-to-access sites
- ✅ Fast response times
- ✅ JavaScript rendering support
- ✅ 99.9% uptime

## Development

```bash
# Clone
git clone https://github.com/hashscraper/hashscraper-mcp-server.git
cd hashscraper-mcp-server

# Install
npm install

# Run locally
HASHSCRAPER_API_KEY=your-key npm run dev

# Build
npm run build

# Test
npm test
```

## Related

- [Hashscraper](https://hashscraper.com) - Web scraping platform
- [MCP Protocol](https://modelcontextprotocol.io/) - Model Context Protocol

## License

MIT © [Hashscraper](https://hashscraper.com)

---

**Questions?** Open an issue or email help@hashscraper.com
