import { useState, useEffect, useRef } from "react";
import { SpaceUser } from "@repo/types";
import { ChatMessageDisplay } from "../../hooks/useGameWebSocket";

const CELL_PROXIMITY = 1;

interface ChatBoxProps {
  messages: ChatMessageDisplay[];
  users: Map<string, SpaceUser>;
  currentUserId: string | undefined;
  currentUser: SpaceUser | null;
  onSendMessage: (message: string) => void;
}

export default function ChatBox({
  messages,
  users,
  currentUserId,
  currentUser,
  onSendMessage,
}: ChatBoxProps) {
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      onSendMessage(newMessage);
      setNewMessage("");
    }
  };

  useEffect(() => {
    // Scroll to bottom whenever messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const getUserName = (userId: string) => {
    const user = users.get(userId);
    return user ? user.username : "Unknown User";
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const hasNearbyUsers = Array.from(users.values()).some((user) => {
    if (user.userId === currentUserId) return false;

    if (!currentUser) return false;

    const distance = Math.abs(currentUser.x - user.x) + Math.abs(currentUser.y - user.y);
    return distance <= CELL_PROXIMITY;
  });

  return (
    hasNearbyUsers && (
      <div className="flex flex-col h-full border rounded-lg shadow-sm bg-white">
        <div className="border-b px-4 py-2 bg-gray-50">
          <h2 className="font-semibold">Chat</h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex flex-col ${msg.userId === currentUserId ? "items-end" : "items-start"}`}
            >
              <div
                className={`px-3 py-2 rounded-lg max-w-xs ${
                  msg.userId === currentUserId
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-800"
                }`}
              >
                {msg.message}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {getUserName(msg.userId)} • {formatTimestamp(msg.timestamp)}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSubmit} className="border-t p-2 flex">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-3 py-2 border rounded-l-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded-r-lg hover:bg-blue-600 focus:outline-none"
          >
            Send
          </button>
        </form>
      </div>
    )
  );
}
