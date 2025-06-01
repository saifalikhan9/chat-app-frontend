let socket: WebSocket | null = null;
let messageListener: ((message: MessagePayload) => void) | null = null;
export interface MessagePayload {
  id:number
  text: string;
  senderId: number;
  receiverId: number;
  createdAt: Date
}
export interface Data {
 type: string,
 payload :MessagePayload
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
        messageListener(message.payload); 
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

export function sendMessage(data: Data) {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(data));
  } else {
    console.warn("⚠️ Socket not connected");
  }
}

// New: subscribe to incoming messages
export function subscribeToMessages(callback: (message: MessagePayload) => void) {
  messageListener = callback;
}

// Optional: to clean up
export function unsubscribeFromMessages() {
  messageListener = null;
}
