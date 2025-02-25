import { useEffect, useRef, useState } from "react";
import { SpaceUser } from "@repo/types";
import { useNavigate } from "react-router-dom";
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
        });

        const initialUsers = new Map();
        message.payload.users?.forEach((user: any) => {
          if (user.userId !== message.payload.userId) {
            initialUsers.set(user.userId, {
              x: user.x,
              y: user.y,
              userId: user.userId,
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
            newUsers.set(message.payload.userId, {
              x: message.payload.x,
              y: message.payload.y,
              userId: message.payload.userId,
            });
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

  return {
    currentUser,
    users,
    handleMove,
    wsRef,
  };
}
