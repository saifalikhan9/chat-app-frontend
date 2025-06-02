import type React from "react";
import { useState, useRef, useEffect } from "react";
import {
  MessageCircle,
  Send,
  ArrowLeft,
  MoreVertical,
  Edit,
  Trash2,
  Check,
  X,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card } from "../components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { Link, useParams } from "react-router-dom";
import apiClient from "@/utils/apiService";
import {
  connectWebSocket,
  deleteMessage,
  sendMessage,
  subscribeToMessages,
  unsubscribeFromMessages,
  updateMessage,
} from "@/utils/websoketService";

interface Message {
  id: number;
  text: string;
  sender: "me" | "friend";
  timestamp: string;
  isEditing?: boolean;
}

export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  createdAt: string;
  updatedAt: string;
}

export default function ChatPage() {
  const params = useParams();
  const friendId = params.friendId!;
  const user = localStorage.getItem("user")!;
  const token = localStorage.getItem("token")!;
  const userObj: User = JSON.parse(user);

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [editingMessage, setEditingMessage] = useState<{
    id: number;
    text: string;
  } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const friendName = userObj.name;

  const fetchMessages = async () => {
    try {
      const res = await apiClient.get(`/getMessages/${friendId}`);
      const messageArray = res.data.messages as Array<{
        id: number;
        text: string;
        senderId: number;
        receiverId: number;
        createdAt: string;
      }>;

      const formatted: Message[] = messageArray.map((msg) => ({
        id: msg.id,
        text: msg.text,
        sender: msg.senderId === userObj.id ? "me" : "friend",
        timestamp: new Date(msg.createdAt).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      }));

      setMessages(formatted);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    fetchMessages();
    connectWebSocket(token);

    subscribeToMessages((msg: any) => {
      if (!msg || !msg.type || !msg.payload) return;

      const { type, payload } = msg;

      if (
        (payload.senderId === userObj.id &&
          payload.receiverId === Number(friendId)) ||
        (payload.senderId === Number(friendId) &&
          payload.receiverId === userObj.id)
      ) {
        if (type === "message:created") {
          const newMsg: Message = {
            id: payload.id,
            text: payload.text,
            sender: payload.senderId === userObj.id ? "me" : "friend",
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
    });

    return () => {
      unsubscribeFromMessages();
    };
  }, []);

  /** Only send via WebSocket; do NOT append locally */
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    // Build payload exactly as server expects
    const payload = {
      type: "message:create",
      payload: {
        text: newMessage,
        senderId: userObj.id,
        receiverId: Number(friendId),
      },
    };

    sendMessage(payload);
    setNewMessage("");
  };

  const handleDeleteMessage = (id: number) => {
    const payload = {
      type: "message:delete",
      payload: {
        id,
      },
    };
    deleteMessage(payload);
  };

  const handleEditMessage = (id: number, currentText: string) => {
  
    setEditingMessage({ id, text: currentText });
  };

  const handleSaveEdit = () => {
    if (editingMessage) {
        const payload = {
      type: "message:update",
      payload:{
        id:editingMessage.id,
        newText:editingMessage.text
      }
    }
    console.log(payload,"payload");
    
    updateMessage(payload)
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === editingMessage.id
            ? { ...msg, text: editingMessage.text }
            : msg
        )
      );
      setEditingMessage(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingMessage(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-black flex flex-col">
      {/* Header */}
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

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.sender === "me" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-xs lg:max-w-md ${
                message.sender === "me" ? "order-2" : "order-1"
              }`}
            >
              <Card
                className={`p-3 ${
                  message.sender === "me"
                    ? "bg-emerald-500 text-white"
                    : "bg-slate-700 text-white"
                }`}
              >
                {editingMessage?.id === message.id ? (
                  <div className="space-y-2">
                    <Input
                      value={editingMessage.text}
                      onChange={(e) =>
                        setEditingMessage({
                          ...editingMessage,
                          text: e.target.value,
                        })
                      }
                      className="bg-transparent border-white/20 text-white placeholder:text-white/70"
                    />
                    <div className="flex justify-end gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleSaveEdit}
                        className="h-6 w-6 p-0 text-white hover:bg-white/20"
                      >
                        <Check className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleCancelEdit}
                        className="h-6 w-6 p-0 text-white hover:bg-white/20"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm">{message.text}</p>
                    {message.sender === "me" && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0 text-white/70 hover:text-white hover:bg-white/20"
                          >
                            <MoreVertical className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-slate-800 border-slate-700">
                          <DropdownMenuItem
                            onClick={() =>
                              handleEditMessage(message.id, message.text)
                            }
                            className="text-white hover:bg-slate-700 cursor-pointer"
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteMessage(message.id)}
                            className="text-red-400 hover:bg-slate-700 cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                )}
              </Card>
              <p
                className={`text-xs text-gray-400 mt-1 ${
                  message.sender === "me" ? "text-right" : "text-left"
                }`}
              >
                {message.timestamp}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-slate-700/50 bg-slate-800/30 backdrop-blur-sm">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-slate-700/50 border-slate-600 text-white placeholder:text-gray-400 focus:border-emerald-500"
          />
          <Button
            type="submit"
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-6"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
