## Chat like ChatGPT/Cursor over WebSocket with streaming (chunked) answers

<img width="1167" height="670" alt="image" src="https://github.com/user-attachments/assets/e6c2a2d2-cbb1-40d2-8f4c-a0077acab2c8" />


The project consists of:

- **backend** — Node.js WebSocket server that accepts messages and sends back answers in chunks
- **frontend** — simple chat page connected to WebSocket that assembles the streamed answer

### 1. Requirements

- Node.js 18+
- npm

### 2. Backend start (WebSocket server)

```bash
cd /home/vboxuser/Desktop/gpt/backend
npm install
npm start
```

By default, the WebSocket server listens on `ws://localhost:3001`.

### 3. Frontend start

The frontend consists of static files.

Simple option:

```bash
cd /home/vboxuser/Desktop/gpt/frontend
npm install
npm run serve
```

After that open the URL from the console (usually something like `http://localhost:4173`) — the page will automatically connect to `ws://localhost:3001`.

### 4. Protocol

- The client sends JSON to the WebSocket:

```json
{ "type": "message", "content": "Hello, bot!" }
```

- The server responds with several JSON messages of type `"chunk"`:

```json
{ "type": "chunk", "content": "First part of the answer..." }
{ "type": "chunk", "content": "Second part..." }
```

- At the end the server sends:

```json
{ "type": "done" }
```

The frontend concatenates chunks into a single answer, similar to ChatGPT/Cursor streaming.
