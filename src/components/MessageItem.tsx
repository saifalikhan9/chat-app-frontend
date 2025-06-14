import type { Message } from "@/pages/ChatPage";
import { Card } from "../components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { MoreVertical, Edit, Trash2, Check, X } from "lucide-react";
import React from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

export const MessageItem = React.memo(
  ({
    message,
    isMyMessage,
    onEdit,
    onDelete,
    editingMessage,
    onSaveEdit,
    onCancelEdit,
    onEditInputChange,
  }: {
    message: Message;
    isMyMessage: boolean;
    onEdit: (id: number, text: string) => void;
    onDelete: (id: number) => void;
    editingMessage: { id: number; text: string } | null;
    onSaveEdit: () => void;
    onCancelEdit: () => void;
    onEditInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  }) => {
    return (
      <div
        key={message.id}
        className={`flex ${isMyMessage ? "justify-end" : "justify-start"}`}
      >
        <div
          className={`max-w-xs lg:max-w-md ${
            isMyMessage ? "order-2" : "order-1"
          }`}
        >
          <Card
            className={`p-3 ${
              isMyMessage
                ? "bg-emerald-500 text-white"
                : "bg-slate-700 text-white"
            }`}
          >
            {editingMessage?.id === message.id ? (
              <div className="space-y-2">
                <Input
                  value={editingMessage.text}
                  onChange={onEditInputChange}
                  className="bg-transparent border-white/20 text-white placeholder:text-white/70"
                />
                <div className="flex justify-end gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={onSaveEdit}
                    className="h-6 w-6 p-0 text-white hover:bg-white/20"
                  >
                    <Check className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={onCancelEdit}
                    className="h-6 w-6 p-0 text-white hover:bg-white/20"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm">{message.text}</p>
                {isMyMessage && (
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
                        onClick={() => onEdit(message.id, message.text)}
                        className="text-white hover:bg-slate-700 cursor-pointer"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onDelete(message.id)}
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
              isMyMessage ? "text-right" : "text-left"
            }`}
          >
            {message.timestamp}
          </p>
        </div>
      </div>
    );
  }
);
