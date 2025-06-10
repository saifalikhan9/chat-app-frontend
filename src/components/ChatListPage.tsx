import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import apiClient from "@/utils/apiService";
import {
  markMessagesAsRead,
  subscribeToMessages,
  unsubscribeFromMessages,
} from "@/utils/websoketService";

interface ChatSummary {
  friendId: string;
  name: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
}

export default function ChatListPage() {
  const [chats, setChats] = useState<ChatSummary[]>([]);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user")!);

  const fetchChatList = async () => {
    try {
      const res = await apiClient.get(`/recentChats/${user.id}`);
      setChats(res.data.data);
    } catch (err) {
      console.error("Failed to load chat list:", err);
    }
  };

  const handleChatOpen = async (friendId: string) => {
    // Optimistically update unreadCount to 0
    const payload = {
      type: "message:read",
      payload: {
        senderId: friendId,
        receiverId: user.id,
      },
    };
    markMessagesAsRead(payload);
    navigate(`/chat/${friendId}`);
  };

  useEffect(() => {
    fetchChatList();

    subscribeToMessages((msg: any) => {
      const { senderId, receiverId, text, timestamp } = msg.payload;

      // 1️⃣ When you receive a brand-new message...
      if (msg.type === "message:created" && receiverId === user.id) {
        setChats((prevChats) =>
          prevChats.map((chat) =>
            // match the chat row whose friend sent it
            chat.friendId === senderId
              ? {
                  ...chat,
                  // bump the badge count
                  unreadCount: chat.unreadCount + 1,
                  // optionally update preview and time
                  lastMessage: text,
                  timestamp,
                }
              : chat
          )
        );
      }

      // 2️⃣ When someone else marks read (you opened the chat)...
      if (msg.type === "message:red" && senderId === user.id) {
        setChats((prevChats) =>
          prevChats.map((chat) =>
            chat.friendId === senderId ? { ...chat, unreadCount: 0 } : chat
          )
        );
      }
    });

    return () => unsubscribeFromMessages();
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4 space-y-4">
      <h1 className="text-xl font-semibold mb-4">Recent Chats</h1>

      {chats.map((chat) => (
        <Card
          key={chat.friendId}
          onClick={() => handleChatOpen(chat.friendId)}
          className="bg-slate-800 hover:bg-slate-700 transition cursor-pointer"
        >
          <CardContent className="flex items-center gap-4 p-4">
            <Avatar>
              <AvatarFallback>
                {chat.name?.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex justify-between items-center">
                <h2 className="font-semibold text-white">{chat.name}</h2>
                <span className="text-xs text-gray-400">
                  {chat.timestamp &&
                    new Date(chat.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                </span>
              </div>
              <div className="text-sm text-gray-300 truncate">
                {chat.lastMessage}
              </div>
            </div>
            {chat.unreadCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {chat.unreadCount}
              </Badge>
            )}
          </CardContent>
        </Card>
      ))}

      {chats.length === 0 && (
        <p className="text-gray-400 text-center mt-10">No recent chats yet.</p>
      )}
    </div>
  );
}
