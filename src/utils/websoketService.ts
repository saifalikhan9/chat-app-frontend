let socket: WebSocket | null = null;
let messageListener: ((message: MessagePayload) => void) | null = null;
export interface MessagePayload {
  id: number;
  text: string;
  senderId: number;
  receiverId: number;
  createdAt: Date;
}
export interface SendMessageData {
  type: string;
  payload: {
    text: string;
    senderId: number;
    receiverId: number;
  };
}
export interface DeleteMessageData {
  type: string;
  payload: {
    id: number;
  };
}
export interface updateMessageData {
  type: string;
  payload: {
    newText: string;
    id: number;
  };
}
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
