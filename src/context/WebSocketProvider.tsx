// WebSocketProvider.tsx
import React, { createContext, useEffect } from "react";
import { connectWebSocket } from "@/utils/websoketService";

export const WebSocketContext = createContext(null);

export const WebSocketProvider = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      connectWebSocket(token);
    }
  }, []);

  return <WebSocketContext.Provider value={null}>{children}</WebSocketContext.Provider>;
};
