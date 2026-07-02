# media-generation MCP server

A small MCP server exposing two tools over streamable HTTP, backed by the [Vercel AI Gateway](https://vercel.com/docs/ai-gateway) so a single API key gets you access to many image/video models (Imagen, Flux, Grok Imagine, Veo, Kling, and others).

## Tools

- **`generate_image`** — `model`, `prompt`, optional `n`, `size` or `aspectRatio`, `providerOptions` (JSON string), `output_dir`. Saves PNGs and returns their paths.
- **`generate_video`** — `model`, optional `prompt`, `image` (path/URL/base64 for image-to-video), `duration`, `aspectRatio`, `resolution`, `providerOptions`, `output_path`. Saves an MP4 and returns its path.

## Run it

```bash
npm install
cp .env.example .env      # add your own AI_GATEWAY_API_KEY
npm start                 # → http://localhost:3105/mcp
```

## Wire it into Cursor

Add to `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "media-generation": {
      "url": "http://localhost:3105/mcp"
    }
  }
}
```

`GET /health` returns `{"status":"ok"}` once the server is up. The server must be running locally before the agent can call its tools.
