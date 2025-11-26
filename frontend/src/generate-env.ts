import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const envFile = join(__dirname, "..", ".env");
const env: Record<string, string> = {};

try {
  const content = readFileSync(envFile, "utf-8");
  content.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;

    const [key, ...values] = trimmed.split("=");
    if (key && values.length) {
      env[key.trim()] = values
        .join("=")
        .trim()
        .replace(/^["']|["']$/g, "");
    }
  });
} catch (e) {
  console.warn("No .env file found, using defaults");
}

const output = `window.ENV = ${JSON.stringify(env, null, 2)};`;
writeFileSync(join(__dirname, "..", "env.js"), output);

