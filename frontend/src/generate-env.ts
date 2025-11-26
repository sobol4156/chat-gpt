import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const envFile = join(__dirname, "..", ".env");
const env: Record<string, string> = {};

env.WS_URL = process.env.WS_URL || process.env.VITE_WS_URL || "";

try {
  const content = readFileSync(envFile, "utf-8");
  content.split("\n").forEach((line: string) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;

    const [key, ...values] = trimmed.split("=");
    if (key && values.length) {
      const value = values.join("=").trim().replace(/^["']|["']$/g, "");

      if (!env[key.trim()]) {
        env[key.trim()] = value;
      }
    }
  });
} catch (e) {
  console.warn("No .env file found, using environment variables or defaults");
}

const output = `window.ENV = ${JSON.stringify(env, null, 2)};`;
writeFileSync(join(__dirname, "..", "env.js"), output);

