# WebSocket Chat - ChatGPT/Cursor-like Streaming Chat

<img width="1167" height="670" alt="image" src="https://github.com/
user-attachments/assets/e6c2a2d2-cbb1-40d2-8f4c-a0077acab2c8" />

A real-time chat application with streaming responses, similar to ChatGPT or Cursor. Built with TypeScript, Node.js WebSocket server, and a modern frontend.

## Features

- 🚀 **Streaming Responses**: Messages are delivered in chunks, creating a smooth streaming experience
- 💬 **Real-time Communication**: WebSocket-based bidirectional communication
- 🎨 **Modern UI**: Clean, ChatGPT/Cursor-inspired interface
- 🔧 **TypeScript**: Fully typed codebase for better developer experience
- 🌐 **CORS Enabled**: Ready for cross-origin deployments
- ⚙️ **Environment Configuration**: Easy configuration via `.env` files

## Tech Stack

- **Backend**: Node.js, TypeScript, WebSocket (ws), Faker.js
- **Frontend**: TypeScript, Vite, Vanilla JavaScript
- **Protocol**: WebSocket with JSON message format

## Project Structure

```
├── backend/
│   ├── src/
│   │   ├── server.ts      # WebSocket server
│   │   └── types.ts       # TypeScript types
│   ├── tsconfig.json
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── app.ts         # Main frontend logic
│   │   ├── types.ts       # TypeScript types
│   │   └── generate-env.ts # Environment generator
│   ├── index.html
│   ├── style.css
│   ├── vite.config.ts
│   └── package.json
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Backend Setup

1. Navigate to the backend directory:

```bash
cd backend
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file (optional):

```env
PORT=3001
HOST=0.0.0.0
```

4. Build TypeScript:

```bash
npm run build
```

5. Start the server:

```bash
npm start
```

The WebSocket server will run on `ws://localhost:3001` by default.

### Frontend Setup

1. Navigate to the frontend directory:

```bash
cd frontend
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file:

```env
WS_URL=ws://localhost:3001
```

4. Generate environment configuration:

```bash
npm run build:env
```

5. Start the development server:

```bash
npm run dev
```

Or build for production:

```bash
npm run build
npm run preview
```

## WebSocket Protocol

### Client → Server

Send a message:

```json
{
  "type": "message",
  "content": "Hello, bot!"
}
```

### Server → Client

**Chunk** (streaming response):

```json
{
  "type": "chunk",
  "requestId": "uuid",
  "content": "Partial text..."
}
```

**Done** (streaming complete):

```json
{
  "type": "done",
  "requestId": "uuid"
}
```

**System** (connection message):

```json
{
  "type": "system",
  "content": "WebSocket connected..."
}
```

**Error**:

```json
{
  "type": "error",
  "error": "Error message"
}
```

## Deployment

### Backend (Render, Railway, etc.)

1. Set environment variables in your hosting platform
2. Build command: `npm run build`
3. Start command: `npm start`

### Frontend (Vercel, Netlify, etc.)

1. Set `WS_URL` environment variable to your backend WebSocket URL
2. Build command: `npm run build`
3. Output directory: `dist`

## License

MIT
