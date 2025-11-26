import { WebSocketServer } from "ws";
import { randomUUID } from "crypto";
import { faker } from "@faker-js/faker";

const PORT = process.env.PORT || 3001;

function streamFakeAnswer(ws, requestId, userText) {
  if (ws.readyState !== ws.OPEN) return;

  const question = (userText || "").trim();

  const title = faker.hacker.phrase();
  const intro = faker.lorem.paragraph();
  const details = faker.lorem.paragraphs({ min: 1, max: 2 }, "\n\n");

  const prefix = question
    ? `You asked: "${question}". Here is a generated answer:\n\n`
    : "Here is an example of a generated answer using faker:\n\n";

  const fullText = `${prefix}# ${title}\n\n${intro}\n\n${details}`;

  const chunkSize = 18;
  const chunks = [];
  for (let i = 0; i < fullText.length; i += chunkSize) {
    chunks.push(fullText.slice(i, i + chunkSize));
  }

  let index = 0;

  function sendNextChunk() {
    if (ws.readyState !== ws.OPEN) return;

    if (index < chunks.length) {
      const payload = {
        type: "chunk",
        requestId,
        content: chunks[index],
      };
      ws.send(JSON.stringify(payload));
      index += 1;
      setTimeout(sendNextChunk, 80);
    } else {
      const done = {
        type: "done",
        requestId,
      };
      ws.send(JSON.stringify(done));
    }
  }

  sendNextChunk();
}

const wss = new WebSocketServer({ port: PORT });

wss.on("connection", (ws) => {
  console.log("Client connected to WebSocket");

  ws.on("message", (raw) => {
    try {
      const msg = JSON.parse(raw.toString("utf8"));

      if (msg.type === "ping") {
        ws.send(JSON.stringify({ type: "pong", ts: Date.now() }));
        return;
      }

      if (msg.type === "message") {
        const requestId = msg.requestId || randomUUID();
        const userText = msg.content ?? "";

        streamFakeAnswer(ws, requestId, userText);
        return;
      }
    } catch (err) {
      console.error("Error while handling message:", err);
      ws.send(
        JSON.stringify({
          type: "error",
          error: "Invalid message format. JSON is expected.",
        })
      );
    }
  });

  ws.on("close", () => {
    console.log("Client disconnected from WebSocket");
  });

  ws.send(
    JSON.stringify({
      type: "system",
      content:
        "WebSocket connected. Send a message and I will answer in chunks, similar to a streaming ChatGPT/Cursor response.",
    })
  );
});

console.log(`WebSocket server is running at ws://localhost:${PORT}`);
