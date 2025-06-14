import React, { useState, useEffect, type FormEvent } from "react";
import {
  MessageCircle,
  Plus,
  Trash2,
  MessageSquare,
  LogOut,
  Search,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent } from "../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import { Label } from "../components/ui/label";
import { useNavigate } from "react-router-dom";
import {
  addFriend,
  deleteFriend,
  getFriends,
  logout,
} from "@/utils/apiService";

// Match backend's User model shape
interface Friend {
  id: number;
  name: string;
  email: string;
}

export default function FriendsPage() {
  const navigate = useNavigate();

  const [friends, setFriends] = useState<Friend[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [newFriendEmail, setNewFriendEmail] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const res = await getFriends();
        console.log(res);

        setFriends(res);
      } catch (error) {
        console.error("Failed to load friends", error);
      }
    };
    fetchFriends();
  }, []);

  const filteredFriends = friends.filter(
    (friend) =>
      friend.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      friend.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddFriend = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await addFriend({ email: newFriendEmail });
      setNewFriendEmail("");
      setIsAddDialogOpen(false);

      // Refresh the friends list after adding
      const updatedFriends = await getFriends();
      setFriends(updatedFriends);
    } catch (error) {
      console.error("Failed to add friend", error);
    }
  };

  const handleDeleteFriend = async (id: number) => {
    try {
      const res = await deleteFriend({ id });
      console.log(res);
    } catch (error) {
      console.log(error);
    }
    setFriends((prev) => prev.filter((friend) => friend.id !== id));
  };

  const handleStartChat = (friendId: number) => {
    navigate(`/chat/${friendId}`);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-black">
      {/* Header */}
      <header className="flex items-center justify-between p-6 lg:px-12 border-b border-slate-700/50">
        <div className="flex items-center gap-3">
          <MessageCircle className="h-8 w-8 text-white" />
          <span className="text-xl font-bold text-white tracking-wider">
            CHAT APP
          </span>
        </div>
        <Button
          onClick={handleLogout}
          variant="outline"
          className="bg-transparent hover:bg-slate-800 text-white border-slate-600 hover:border-slate-500 px-6 py-2 rounded-full"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Friends</h1>
          <p className="text-gray-400">
            Manage your connections and start conversations
          </p>
        </div>

        {/* Search & Add */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search friends..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-gray-400 focus:border-emerald-500"
            />
          </div>

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Friend
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-800 border-slate-700 text-white">
              <DialogHeader>
                <DialogTitle>Add New Friend</DialogTitle>
                <DialogDescription className="text-gray-400">
                  Enter your friend's email address to send them a friend
                  request.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddFriend} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="friendEmail">Email Address</Label>
                  <Input
                    id="friendEmail"
                    type="email"
                    placeholder="friend@example.com"
                    value={newFriendEmail}
                    onChange={(e) => setNewFriendEmail(e.target.value)}
                    className="bg-slate-700/50 border-slate-600 text-white placeholder:text-gray-400 focus:border-emerald-500"
                    required
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddDialogOpen(false)}
                    className="bg-transparent border-slate-600 text-white hover:bg-slate-700"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-emerald-500 hover:bg-emerald-600 text-white"
                  >
                    Add Friend
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Friends List */}
        <div className="space-y-4">
          {filteredFriends.length === 0 ? (
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-8 text-center">
                <p className="text-gray-400">
                  No friends found. Add some friends to start chatting!
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredFriends.map((friend) => (
              <Card
                key={friend.id}
                className="bg-slate-800/50 border-slate-700 hover:bg-slate-700/50 transition-colors"
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div>
                        <h3 className="font-semibold text-white">
                          {friend.name}
                        </h3>
                        <p className="text-sm text-gray-400">{friend.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => handleStartChat(friend.id)}
                        size="sm"
                        className="bg-emerald-500 hover:bg-emerald-600 text-white"
                      >
                        <MessageSquare className="h-4 w-4 mr-1" />
                        Chat
                      </Button>
                      <Button
                        onClick={() => handleDeleteFriend(friend.id)}
                        size="sm"
                        variant="outline"
                        className="bg-transparent border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
