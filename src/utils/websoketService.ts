import type {
  DeleteMessageData,
  MessagePayload,
  SendMessageData,
  updateMessageData,
} from "./types";

export interface readData {
  type: string;
  payload: {
    senderId: string;
    receiverId: string;
  };
}

let socket: WebSocket | null = null;
let messageListener: ((message: MessagePayload) => void) | null = null;

export function connectWebSocket(token: string) {
  socket = new WebSocket(`ws://192.168.1.3:3001?token=${token}`);

  socket.onopen = () => {
    console.log("🟢 Connected to WebSocket server");
  };

  socket.onmessage = (event) => {
    const message = JSON.parse(event.data);
    console.log("📥 Incoming:", message);

    if (message.type === "message:created") {
      if (messageListener) {
        messageListener(message);
      }
      if (Notification.permission === "granted") {
        new Notification("📩 New Message", {
          body: message.text,
        });
      }
    }
    if (message.type === "message:updated") {
      if (messageListener) {
        messageListener(message);
      }
    }
    if (message.type === "message:deleted") {
      console.log("deleted");

      if (messageListener) {
        messageListener(message);
      }
    }
    if (message.type === "message:red") {
      if (messageListener) {
        messageListener(message);
      }
    }
  };

  socket.onclose = () => {
    console.log("🔴 WebSocket connection closed");
  };

  socket.onerror = (err) => {
    console.error("❌ WebSocket error", err);
  };

  return socket;
}

export function sendMessage(data: SendMessageData) {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(data));
  } else {
    console.warn("⚠️ Socket not connected");
  }
}
export function deleteMessage(data: DeleteMessageData) {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(data));
  } else {
    console.warn("⚠️ Socket not connected");
  }
}
export function updateMessage(data: updateMessageData) {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(data));
  } else {
    console.warn("⚠️ Socket not connected");
  }
}

export function markMessagesAsRead(data: readData) {
  

  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(data));
  } else {
    console.warn("⚠️ Socket not connected");
  }
}

// New: subscribe to incoming messages
export function subscribeToMessages(
  callback: (message: MessagePayload) => void
) {
  messageListener = callback;
}

// Optional: to clean up
export function unsubscribeFromMessages() {
  messageListener = null;
}
