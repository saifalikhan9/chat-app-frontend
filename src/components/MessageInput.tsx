import React from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Send } from "lucide-react";

export const MessageInput = React.memo(
  ({
    newMessage,
    setNewMessage,
    handleSendMessage,
    inputRef,
  }: {
    newMessage: string;
    setNewMessage: React.Dispatch<React.SetStateAction<string>>;
    handleSendMessage: (e: React.FormEvent) => void;
    inputRef: React.RefObject<HTMLInputElement>;
  }) => {
    // Only re-render this component if newMessage, setNewMessage, or handleSendMessage changes.
    // Since setNewMessage and handleSendMessage are memoized in the parent,
    // this component will primarily re-render only when newMessage changes,
    // which is what we want for smooth typing.
    return (
      <div className="p-4 border-t border-slate-700/50 bg-slate-800/30 backdrop-blur-sm">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Input
            ref={inputRef} // Pass the ref down
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)} // Direct state update
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
    );
  }
);