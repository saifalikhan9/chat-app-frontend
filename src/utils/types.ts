import type { AxiosResponse } from "axios";

// ------------------------------
// Auth Types
// ------------------------------

export interface SignupPayload {
  name: string;
  email: string;
  password: string;
  confirmPassword: string; // Used only for client-side validation
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  // Do NOT include password or sensitive fields here
}

export interface AuthResponse {
  token: string;
  user: User;
}

export type AuthAxiosResponse = AxiosResponse<AuthResponse>;

// ------------------------------
// Friend System Types
// ------------------------------

export interface FriendPayload {
  email?: string;
  id?: number
}

export interface Friend {
  id: number;
  user: User;      // The user who sent the request
  userId: number;
  friend: User;    // The friend being added
  friendId: number;
}

// ------------------------------
// Message Types
// ------------------------------

export interface Message {
  id: number;
  text: string;
  senderId: number;
  receiverId: number;
  createdAt: string;
  updatedAt: string;
  user?: User; // optional, for populating sender info if needed
}

// ------------------------------
// WebSocket Event Types
// ------------------------------

export type WebSocketMessage =
  | CreateMessageEvent
  | UpdateMessageEvent
  | DeleteMessageEvent
  | MessageCreatedEvent
  | MessageUpdatedEvent
  | MessageDeletedEvent
  | ErrorEvent
  | SuccessEvent;

export interface CreateMessageEvent {
  type: "message:create";
  payload: {
    text: string;
    receiverId: number;
    senderId: number;
  };
}

export interface UpdateMessageEvent {
  type: "message:update";
  payload: {
    id: number;
    newText: string;
  };
}

export interface DeleteMessageEvent {
  type: "message:delete";
  payload: {
    id: number;
  };
}

export interface MessageCreatedEvent {
  type: "message:created";
  payload: Message;
}

export interface MessageUpdatedEvent {
  type: "message:updated";
  payload: Message;
}

export interface MessageDeletedEvent {
  type: "message:deleted";
  payload: {
    id: number;
  };
}

// ------------------------------
// WebSocket Generic Events
// ------------------------------

export interface ErrorEvent {
  type: "error";
  status: number;
  message: string;
}

export interface SuccessEvent {
  type: "success";
  status: number;
  message: string;
  data: object;
}
