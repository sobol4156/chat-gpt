export interface WSMessage {
    type: "ping" | "message" | "chunk" | "done" | "error" | "system";
    requestId?: string;
    content?: string;
    error?: string;
    ts?: number;
}
export interface ChunkPayload {
    type: "chunk";
    requestId: string;
    content: string;
}
export interface DonePayload {
    type: "done";
    requestId: string;
}
//# sourceMappingURL=types.d.ts.map