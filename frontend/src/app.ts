import type { WSMessage, Message, ActiveStream } from "./types.js";

const WS_URL =
  window.ENV?.WS_URL ||
  (location.hostname === "localhost" || location.hostname === "127.0.0.1"
    ? "ws://localhost:3001"
    : "wss://chat-gpt-pq6b.onrender.com");

const messagesEl = document.getElementById("messages") as HTMLElement;
const formEl = document.getElementById("message-form") as HTMLElement;
const inputEl = document.getElementById("message-input") as HTMLTextAreaElement;
const sendBtnEl = document.getElementById("send-btn") as HTMLButtonElement;
const statusEl = document.getElementById("ws-status") as HTMLElement;

let ws: WebSocket | null = null;
let connected = false;
let isSending = false;

const messages: Message[] = [];
const activeStreams = new Map<string, ActiveStream>();

function addMessage({
  role,
  content,
  streamId = null,
  isSystem = false,
}: Message): void {
  messages.push({ role, content, streamId, isSystem });
  renderMessages();
}

function renderMessages(): void {
  if (!messagesEl) return;

  messagesEl.innerHTML = "";

  messages.forEach((msg) => {
    const row = document.createElement("div");
    row.className =
      "message-row " + (msg.role === "user" ? "user" : "assistant");

    const bubble = document.createElement("div");
    bubble.className =
      "message-bubble " +
      (msg.isSystem ? "system" : msg.role === "user" ? "user" : "assistant");

    if (!msg.isSystem) {
      const roleBadge = document.createElement("div");
      roleBadge.className = "role-badge";
      roleBadge.textContent = msg.role === "user" ? "You" : "Bot";
      bubble.appendChild(roleBadge);
    }

    const content = document.createElement("div");
    content.textContent = msg.content;
    bubble.appendChild(content);

    if (msg.isSystem) {
      row.style.justifyContent = "center";
    }

    row.appendChild(bubble);
    messagesEl.appendChild(row);
  });

  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function setStatus(text: string, mode: string): void {
  if (!statusEl) return;
  statusEl.textContent = text;
  statusEl.classList.remove("online", "offline");
  if (mode) statusEl.classList.add(mode);
}

function setSending(next: boolean): void {
  isSending = next;
  if (!sendBtnEl) return;
  sendBtnEl.disabled = next || !connected;
  if (next) {
    sendBtnEl.textContent = "Waiting for reply...";
  } else {
    sendBtnEl.textContent = "Send";
  }
}

function connectWS(): void {
  setStatus("Connecting...", "");

  try {
    ws = new WebSocket(WS_URL);
  } catch (e) {
    console.error("WS connect error:", e);
    setStatus("Failed to create connection", "offline");
    return;
  }

  ws.onopen = () => {
    connected = true;
    setStatus("Online", "online");
    if (sendBtnEl) sendBtnEl.disabled = false;
  };

  ws.onclose = () => {
    connected = false;
    setStatus("Offline (reconnecting...)", "offline");
    if (sendBtnEl) sendBtnEl.disabled = true;
    setTimeout(() => {
      if (!connected) connectWS();
    }, 1500);
  };

  ws.onerror = () => {
    setStatus("Connection error", "offline");
  };

  ws.onmessage = (event: MessageEvent) => {
    try {
      const msg: WSMessage = JSON.parse(event.data);

      if (msg.type === "system") {
        addMessage({
          role: "assistant",
          content: msg.content || "",
          isSystem: true,
        });
        return;
      }

      if (msg.type === "error") {
        addMessage({
          role: "assistant",
          content: msg.error || "",
          isSystem: true,
        });
        setSending(false);
        return;
      }

      if (msg.type === "chunk" && msg.requestId) {
        const { requestId, content } = msg;
        let current = activeStreams.get(requestId);
        if (!current) {
          current = { index: messages.length, content: "" };
          activeStreams.set(requestId, current);
          messages.push({
            role: "assistant",
            content: "",
            streamId: requestId,
          });
        }
        current.content += content || "";
        messages[current.index].content = current.content;
        renderMessages();
        return;
      }

      if (msg.type === "done" && msg.requestId) {
        const { requestId } = msg;
        activeStreams.delete(requestId);

        if (activeStreams.size === 0) setSending(false);
        return;
      }
    } catch (e) {
      console.error("WS message error:", e);
    }
  };
}

connectWS();

function handleSend(): void {
  if (isSending || activeStreams.size > 0 || !inputEl) return;

  const text = inputEl.value.trim();
  if (!text || !connected) return;

  inputEl.value = "";
  inputEl.style.height = "auto";

  addMessage({ role: "user", content: text });
  setSending(true);

  if (!ws || ws.readyState !== WebSocket.OPEN) {
    addMessage({
      role: "assistant",
      content:
        "No connection to the server. Please wait for reconnection and try again.",
      isSystem: true,
    });
    setSending(false);
    return;
  }

  try {
    ws.send(
      JSON.stringify({
        type: "message",
        content: text,
      })
    );
  } catch (e) {
    console.error("WS send error:", e);
    addMessage({
      role: "assistant",
      content: "Failed to send message to the server. Please try again.",
      isSystem: true,
    });
    setSending(false);
  }
}

if (sendBtnEl) {
  sendBtnEl.addEventListener("click", (e) => {
    e.preventDefault();
    handleSend();
  });
}

if (inputEl) {
  inputEl.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      e.stopPropagation();
      handleSend();
    }
  });

  inputEl.addEventListener("input", () => {
    inputEl.style.height = "auto";
    inputEl.style.height = `${Math.min(inputEl.scrollHeight, 140)}px`;
  });
}

