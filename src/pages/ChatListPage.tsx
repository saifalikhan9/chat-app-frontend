import {
  useEffect,
  useState,
  useRef,
  useCallback,
  useMemo,
  useContext,
} from "react";
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
import { Contexts } from "@/context/Contexts";

interface ChatSummary {
  friendId: string;
  name: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
}

export default function ChatListPage() {
  const [chats, setChats] = useState<ChatSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);
  const navigate = useNavigate();

  // Memoize user to prevent unnecessary re-renders

  const { user } = useContext(Contexts);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const messageCallbackRef = useRef<((msg: any) => void) | null>(null);

  // Initialize audio once
  useEffect(() => {
    const initializeAudio = () => {
      audioRef.current = new Audio("/assets/notification.mp3");
      audioRef.current.load();
    };

    initializeAudio();

    const handleFirstInteraction = () => {
      if (!audioRef.current) {
        initializeAudio();
      }
      document.removeEventListener("click", handleFirstInteraction);
      document.removeEventListener("keydown", handleFirstInteraction);
    };

    document.addEventListener("click", handleFirstInteraction);
    document.addEventListener("keydown", handleFirstInteraction);

    return () => {
      document.removeEventListener("click", handleFirstInteraction);
      document.removeEventListener("keydown", handleFirstInteraction);
    };
  }, []);

  // Memoized fetch function with caching
  const fetchChatList = useCallback(
    async (forceRefresh = false) => {
      const now = Date.now();
      const CACHE_DURATION = 30000; // 30 seconds cache

      // Skip fetch if data is fresh (unless forced)
      if (
        !forceRefresh &&
        now - lastFetchTime < CACHE_DURATION &&
        chats.length > 0
      ) {
        return;
      }

      try {
        setIsLoading(true);
        const res = await apiClient.get(`/recentChats/${user?.id}`);
        setChats(res.data.data);
        setLastFetchTime(now);
      } catch (err) {
        console.error("Failed to load chat list:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [user?.id, lastFetchTime, chats.length]
  );

  // Memoized chat open handler
  const handleChatOpen = useCallback(
    async (friendId: string) => {
      const payload = {
        type: "message:read",
        payload: {
          senderId: friendId,
          receiverId: user?.id,
        },
      };
      markMessagesAsRead(payload);
      navigate(`/chat/${friendId}`);
    },
    [user?.id, navigate]
  );

  // Optimized message handler with memoization
  const handleIncomingMessage = useCallback(
    (msg: any) => {
      const { senderId, receiverId, text, timestamp } = msg.payload;

      // 1️⃣ Handle new messages
      if (msg.type === "message:created" && receiverId === user?.id) {
        // Play audio for messages from others
        if (senderId !== user?.id && audioRef.current) {
          audioRef.current.play().catch(() => {
            // Silently handle audio play errors
          });
        }

        // Show browser notification
        if (Notification.permission === "granted" && senderId !== user?.id) {
          new Notification("📩 New Message", {
            body: text,
            icon: "/assets/notification-icon.png", // Optional icon
          });
        }

        // Update chats optimistically
        setChats((prevChats) => {
          const updatedChats = prevChats.map((chat) =>
            chat.friendId === senderId
              ? {
                  ...chat,
                  unreadCount: chat.unreadCount + 1,
                  lastMessage: text,
                  timestamp,
                }
              : chat
          );

          // If sender not in chat list, add them (optional enhancement)
          const senderExists = prevChats.some(
            (chat) => chat.friendId === senderId
          );
          if (!senderExists) {
            // You might want to fetch sender info here or handle it differently
            return updatedChats;
          }

          return updatedChats;
        });
      }

      // 2️⃣ Handle read receipts
      if (msg.type === "message:red" && senderId === user?.id) {
        setChats((prevChats) =>
          prevChats.map((chat) =>
            chat.friendId === senderId ? { ...chat, unreadCount: 0 } : chat
          )
        );
      }
    },
    [user?.id]
  );

  // Store the callback in ref to avoid re-subscription
  useEffect(() => {
    messageCallbackRef.current = handleIncomingMessage;
  }, [handleIncomingMessage]);

  // Main effect for initialization
  useEffect(() => {
    if (!user?.id) return;

    // Initial fetch
    fetchChatList(true);

    // Subscribe to messages with stable callback
    const messageHandler = (msg: any) => {
      messageCallbackRef.current?.(msg);
    };

    subscribeToMessages(messageHandler);

    // Request notification permission
    if (Notification.permission === "default") {
      Notification.requestPermission();
    }

    return () => {
      unsubscribeFromMessages();
    };
  }, []);

  // Auto-refresh periodically (optional)
  useEffect(() => {
    const interval = setInterval(() => {
      fetchChatList(false); // Use cache if available
    }, 60000); // Refresh every minute

    return () => clearInterval(interval);
  }, [fetchChatList]);

  // Memoized sorted chats by timestamp
  const sortedChats = useMemo(() => {
    return [...chats].sort((a, b) => {
      const timeA = new Date(a.timestamp).getTime();
      const timeB = new Date(b.timestamp).getTime();
      return timeB - timeA; // Latest first
    });
  }, [chats]);

  // Memoized total unread count
  const totalUnreadCount = useMemo(() => {
    return chats.reduce((total, chat) => total + chat.unreadCount, 0);
  }, [chats]);

  // Update document title with unread count
  useEffect(() => {
    const baseTitle = "Recent Chats";
    document.title =
      totalUnreadCount > 0 ? `(${totalUnreadCount}) ${baseTitle}` : baseTitle;
  }, [totalUnreadCount]);

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <p className="text-red-400">Please log in to view chats.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4 space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold">
          Recent Chats {totalUnreadCount > 0 && `(${totalUnreadCount})`}
        </h1>
        <button
          onClick={() => fetchChatList(true)}
          disabled={isLoading}
          className="px-3 py-1 text-sm bg-slate-700 hover:bg-slate-600 rounded-lg disabled:opacity-50"
        >
          {isLoading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {isLoading && chats.length === 0 ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      ) : (
        sortedChats.map((chat) => (
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
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center">
                  <h2 className="font-semibold text-white truncate">
                    {chat.name}
                  </h2>
                  <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
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
                <Badge variant="secondary" className="text-xs flex-shrink-0">
                  {chat.unreadCount > 99 ? "99+" : chat.unreadCount}
                </Badge>
              )}
            </CardContent>
          </Card>
        ))
      )}

      {!isLoading && sortedChats.length === 0 && (
        <p className="text-gray-400 text-center mt-10">No recent chats yet.</p>
      )}
    </div>
  );
}
