export interface WSMessage {
  type: "ping" | "message" | "chunk" | "done" | "error" | "system";
  requestId?: string;
  content?: string;
  error?: string;
  ts?: number;
}

export interface Message {
  role: "user" | "assistant";
  content: string;
  streamId?: string | null;
  isSystem?: boolean;
}

export interface ActiveStream {
  index: number;
  content: string;
}

declare global {
  interface Window {
    ENV?: {
      WS_URL?: string;
    };
  }
}

