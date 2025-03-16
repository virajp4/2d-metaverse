import { useEffect, useRef, useState } from "react";
import { SpaceUser } from "@repo/types";
import { useNavigate } from "react-router-dom";

export interface ChatMessageDisplay {
  userId: string;
  message: string;
  timestamp: number;
}

interface UseGameWebSocketProps {
  token: string | null;
  spaceId: string | undefined;
  setConnected: (connected: boolean) => void;
}

const WS_URL = import.meta.env.VITE_WS_URL;

export default function useGameWebSocket({ token, spaceId, setConnected }: UseGameWebSocketProps) {
  const wsRef = useRef<WebSocket | null>(null);
  const [currentUser, setCurrentUser] = useState<SpaceUser | null>(null);
  const [users, setUsers] = useState<Map<string, SpaceUser>>(new Map());
  const [chatMessages, setChatMessages] = useState<ChatMessageDisplay[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token || !spaceId) {
      navigate("/");
      return;
    }

    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
      ws.send(
        JSON.stringify({
          type: "join",
          payload: {
            spaceId,
            token,
          },
        })
      );
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      handleWebSocketMessage(message);
    };

    ws.onclose = () => {
      setConnected(false);
      // Optional: Implement reconnection logic here
      setTimeout(() => {
        if (!wsRef.current || wsRef.current.readyState === WebSocket.CLOSED) {
          navigate("/");
        }
      }, 1000);
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [token, spaceId, navigate]);

  const handleWebSocketMessage = (message: any) => {
    switch (message.type) {
      case "space-joined":
        setCurrentUser({
          x: message.payload.spawn.x,
          y: message.payload.spawn.y,
          userId: message.payload.userId,
          role: message.payload.role,
          username: message.payload.username,
        });

        const initialUsers = new Map();
        message.payload.users?.forEach((user: any) => {
          if (user.userId !== message.payload.userId) {
            initialUsers.set(user.userId, {
              x: user.x,
              y: user.y,
              userId: user.userId,
              role: user.role,
              username: user.username,
            });
          }
        });
        setUsers(initialUsers);
        break;

      case "user-joined":
        setUsers((prev) => {
          const newUsers = new Map(prev);
          if (message.payload.userId !== currentUser?.userId) {
            newUsers.set(message.payload.userId, {
              x: message.payload.x,
              y: message.payload.y,
              userId: message.payload.userId,
              role: message.payload.role,
              username: message.payload.username,
            });
          }
          return newUsers;
        });
        break;

      case "movement":
        if (message.payload.userId === currentUser?.userId) {
          setCurrentUser((prev: any) => ({
            ...prev,
            x: message.payload.x,
            y: message.payload.y,
          }));
        } else {
          setUsers((prev) => {
            const newUsers = new Map(prev);
            const existingUser = prev.get(message.payload.userId);
            if (existingUser) {
              newUsers.set(message.payload.userId, {
                ...existingUser,
                x: message.payload.x,
                y: message.payload.y,
              });
            }
            return newUsers;
          });
        }
        break;

      case "movement-rejected":
        setCurrentUser((prev: any) => ({
          ...prev,
          x: message.payload.x,
          y: message.payload.y,
        }));
        break;

      case "user-left":
        setUsers((prev) => {
          const newUsers = new Map(prev);
          newUsers.delete(message.payload.userId);
          return newUsers;
        });
        break;

      case "chat-message":
        if (message.payload.userId !== currentUser?.userId) {
          setChatMessages((prev) => {
            const messageExists = prev.some(
              (msg) =>
                msg.timestamp === message.payload.timestamp && msg.userId === message.payload.userId
            );
            if (!messageExists) {
              return [
                ...prev,
                {
                  userId: message.payload.userId,
                  message: message.payload.message,
                  timestamp: message.payload.timestamp,
                },
              ];
            }
            return prev;
          });
        }
        break;
    }
  };

  const handleMove = (newX: number, newY: number) => {
    if (!currentUser || !wsRef.current) return;

    setCurrentUser((prev: any) => ({
      ...prev,
      x: newX,
      y: newY,
    }));

    wsRef.current.send(
      JSON.stringify({
        type: "move",
        payload: {
          x: newX,
          y: newY,
        },
      })
    );
  };

  const sendChatMessage = (message: string) => {
    if (!wsRef.current || !currentUser) return;
    wsRef.current.send(
      JSON.stringify({
        type: "chat",
        payload: {
          message,
        },
      })
    );
  };

  return {
    currentUser,
    users,
    handleMove,
    wsRef,
    chatMessages,
    sendChatMessage,
  };
}
