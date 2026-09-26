#!/usr/bin/env node
"use strict";
// Public GPT Image REST adapter. Run from the project root; model is explicit.
const fs = require("node:fs");
const path = require("node:path");
const helper = fs.existsSync(path.join(__dirname, "public-media-api.cjs"))
  ? "./public-media-api.cjs" : "../../fish-audio-api/scripts/public-media-api.cjs";
const { loadProjectEnv, resolveImageConfig, generateImages, writeAtomic } = require(helper);

async function main(args = process.argv.slice(2)) {
  if (args.includes("--help") || args.includes("-h")) {
    console.log("Usage: node scripts/genimg.cjs --out assets/images --prompt-file prompt.txt [--model gpt-image-MODEL] [--name plate.png] [--size 1024x1024] [--n 1] [--overwrite]");
    return;
  }
  const values = {};
  for (let i = 0; i < args.length; i++) {
    const flag = args[i];
    if (flag === "--overwrite") { values[flag] = true; continue; }
    if (!["--out", "--prompt-file", "--model", "--name", "--size", "--n"].includes(flag) || !args[i+1] || args[i+1].startsWith("--")) throw new Error("Unknown option or missing option value. Use --help.");
    values[flag] = args[++i];
  }
  if (!values["--out"]) throw new Error("--out is required.");
  const name = values["--name"];
  if (name && (!/^[a-zA-Z0-9_][a-zA-Z0-9._-]*\.png$/.test(name) || path.basename(name) !== name)) throw new Error("--name must be a simple PNG filename, without directories.");
  loadProjectEnv(process.cwd());
  const config = resolveImageConfig(values["--model"]);
  const n = Number(values["--n"] || "1");
  if (!Number.isInteger(n) || n < 1 || n > 10) throw new Error("--n must be an integer from 1 to 10.");
  const directory = path.resolve(values["--out"]);
  const stem = name ? name.slice(0, -4) : `generated-${Date.now()}`;
  const outputs = Array.from({length:n}, (_,i) => path.join(directory, `${stem}${n > 1 ? `-${i+1}` : ""}.png`));
  if (!values["--overwrite"] && outputs.some(file => fs.existsSync(file))) throw new Error("Output already exists. Choose a new --name or explicitly use --overwrite before making another API request.");
  const prompt = fs.readFileSync(values["--prompt-file"] || 0, "utf8");
  const images = await generateImages({ prompt, config, n, size: values["--size"] || "1024x1024" });
  for (let i=0; i<images.length; i++) writeAtomic(outputs[i], images[i]);
  console.log(outputs.join("\n"));
}
if (require.main === module) main().catch(error => { console.error(`genimg: ${error.message}`); process.exitCode = 1; });
module.exports = { main };
