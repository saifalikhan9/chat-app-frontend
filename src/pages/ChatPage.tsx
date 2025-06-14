import React, {
  useState,
  useRef,
  useEffect,
  useCallback,

  useContext,
} from "react";
import { MessageCircle, ArrowLeft } from "lucide-react";
import { Button } from "../components/ui/button";

import { Link, useParams } from "react-router-dom";
import apiClient from "@/utils/apiService";
import {
  deleteMessage,
  sendMessage,
  subscribeToMessages,
  unsubscribeFromMessages,
  updateMessage,
} from "@/utils/websoketService";
import { MessageItem } from "@/components/MessageItem";
import { MessageInput } from "@/components/MessageInput";
import { Contexts } from "@/context/Contexts";

export interface Message {
  id: number;
  text: string;
  sender: "me" | "friend";
  timestamp: string;
  isEditing?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  createdAt: string;
  updatedAt: string;
}

export default function ChatPage() {
  const params = useParams();
  const friendId = params.friendId!;
const {user} = useContext(Contexts)


  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [editingMessage, setEditingMessage] = useState<{
    id: number;
    text: string;
  } | null>(null);

  const friendName = user?.name || "Friend";

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const fetchMessages = useCallback(async () => {
    try {
      const res = await apiClient.get(`/getMessages/${friendId}`);
      const messageArray = res.data.messages as Array<{
        id: number;
        text: string;
        senderId: string;
        receiverId: string;
        createdAt: string;
      }>;

      const formatted: Message[] = messageArray.map((msg) => ({
        id: msg.id,
        text: msg.text,
        sender: msg.senderId === user?.id ? "me" : "friend",
        timestamp: new Date(msg.createdAt).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      }));

      setMessages(formatted);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  }, [friendId, user?.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleWebSocketMessage = useCallback(
    (msg: any) => {
      if (!msg || !msg.type || !msg.payload) return;

      const { type, payload } = msg;

      if (
        (payload.senderId === user?.id && payload.receiverId === friendId) ||
        (payload.senderId === friendId && payload.receiverId === user?.id)
      ) {
        if (type === "message:created") {
          const newMsg: Message = {
            id: payload.id,
            text: payload.text,
            sender: payload.senderId === user?.id ? "me" : "friend",
            timestamp: new Date(payload.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          };
          setMessages((prev) => [...prev, newMsg]);
        }

        if (type === "message:deleted") {
          setMessages((prev) => prev.filter((msg) => msg.id !== payload.id));
        }

        if (type === "message:updated") {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === payload.id ? { ...msg, text: payload.text } : msg
            )
          );
        }
      }
    },
    [friendId, user?.id]
  );

  useEffect(() => {
    inputRef.current?.focus();
    fetchMessages();

    subscribeToMessages(handleWebSocketMessage);

    return () => {
      unsubscribeFromMessages();
    };
  }, []);

  const handleSendMessage = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!newMessage.trim()) return;

      const payload = {
        type: "message:create",
        payload: {
          text: newMessage,
          senderId: user?.id,
          receiverId: friendId,
        },
      };

      sendMessage(payload);
      setNewMessage("");
    },
    [newMessage, user?.id, friendId]
  );

  const handleDeleteMessage = useCallback((id: number) => {
    const payload = {
      type: "message:delete",
      payload: {
        id,
      },
    };
    deleteMessage(payload);
  }, []);

  const handleEditMessage = useCallback((id: number, currentText: string) => {
    setEditingMessage({ id, text: currentText });
  }, []);

  const handleSaveEdit = useCallback(() => {
    if (editingMessage) {
      const payload = {
        type: "message:update",
        payload: {
          id: editingMessage.id,
          newText: editingMessage.text,
        },
      };
      updateMessage(payload);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === editingMessage.id
            ? { ...msg, text: editingMessage.text }
            : msg
        )
      );
      setEditingMessage(null);
    }
  }, [editingMessage]);

  const handleCancelEdit = useCallback(() => {
    setEditingMessage(null);
  }, []);

  const handleEditInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (editingMessage) {
        setEditingMessage({
          ...editingMessage,
          text: e.target.value,
        });
      }
    },
    [editingMessage]
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-black flex flex-col">
      {/* Header (No changes needed here for input lag) */}
      <header className="flex items-center justify-between p-4 border-b border-slate-700/50 bg-slate-800/30 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <Link to="/friends">
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-slate-700"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white font-semibold">
              {friendName.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <h2 className="font-semibold text-white">{friendName}</h2>
              <p className="text-sm text-green-400">Online</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <MessageCircle className="h-6 w-6 text-white" />
        </div>
      </header>

      {/* Messages (Optimized in previous step with MessageItem) */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <MessageItem
            key={message.id}
            message={message}
            isMyMessage={message.sender === "me"}
            onEdit={handleEditMessage}
            onDelete={handleDeleteMessage}
            editingMessage={editingMessage}
            onSaveEdit={handleSaveEdit}
            onCancelEdit={handleCancelEdit}
            onEditInputChange={handleEditInputChange}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input - Now using a memoized component */}
      <MessageInput
        newMessage={newMessage}
        setNewMessage={setNewMessage}
        handleSendMessage={handleSendMessage}
        inputRef={inputRef}
      />
    </div>
  );
}
