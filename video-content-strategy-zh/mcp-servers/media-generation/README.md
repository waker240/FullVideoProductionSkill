# media-generation MCP 服务器

一个通过可流式传输的 HTTP（streamable HTTP）暴露两个工具的小型 MCP 服务器，底层依托 [Vercel AI Gateway](https://vercel.com/docs/ai-gateway)，因此只需一个 API key 即可访问多种图像/视频模型（Imagen、Flux、Grok Imagine、Veo、Kling 等）。

## 工具

- **`generate_image`** —— 参数：`model`、`prompt`，可选 `n`、`size` 或 `aspectRatio`、`providerOptions`（JSON 字符串）、`output_dir`。保存 PNG 图片并返回其路径。
- **`generate_video`** —— 参数：`model`，可选 `prompt`、`image`（用于图生视频的路径/URL/base64）、`duration`、`aspectRatio`、`resolution`、`providerOptions`、`output_path`。保存 MP4 文件并返回其路径。

## 运行方式

```bash
npm install
cp .env.example .env      # add your own AI_GATEWAY_API_KEY
npm start                 # → http://localhost:3105/mcp
```

## 接入 Cursor

添加到 `.cursor/mcp.json`：

```json
{
  "mcpServers": {
    "media-generation": {
      "url": "http://localhost:3105/mcp"
    }
  }
}
```

服务器启动后，`GET /health` 会返回 `{"status":"ok"}`。在 agent 调用其工具之前，服务器必须已在本地运行。
