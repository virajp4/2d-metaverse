import { useEffect, useRef, useState } from "react";
import { useAuthStore } from "../store/auth";
import { useNavigate, useParams } from "react-router-dom";

const WS_URL = import.meta.env.VITE_WS_URL;

export default function Arena() {
  const { spaceId } = useParams();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [users, setUsers] = useState<Map<string, { x: number; y: number; userId: string }>>(
    new Map()
  );
  const [connected, setConnected] = useState(false);
  const { token } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!token || !spaceId) {
      navigate("/");
      return;
    }

    // Create WebSocket connection
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

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !currentUser) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Store current state
    const currentState = {
      users: Array.from(users.values()),
      currentUser,
    };

    // Animation frame for smooth rendering
    const animationFrame = requestAnimationFrame(() => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw grid
      ctx.strokeStyle = "#eee";
      for (let i = 0; i < 15; i++) {
        for (let j = 0; j < 15; j++) {
          ctx.strokeRect(i * 50, j * 50, 50, 50);
        }
      }

      // Draw other users in green
      currentState.users.forEach((user) => {
        ctx.fillStyle = "#4CAF50"; // Green color for other users
        ctx.beginPath();
        ctx.arc(user.x * 50 + 25, user.y * 50 + 25, 20, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw current user in red
      ctx.fillStyle = "#FF0000"; // Red color for current user
      ctx.beginPath();
      ctx.arc(
        currentState.currentUser.x * 50 + 25,
        currentState.currentUser.y * 50 + 25,
        20,
        0,
        Math.PI * 2
      );
      ctx.fill();
    });

    return () => cancelAnimationFrame(animationFrame);
  }, [currentUser, users]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!currentUser) return;

      const { x, y } = currentUser;
      switch (e.key) {
        case "ArrowUp":
          if (y > 0) handleMove(x, y - 1);
          break;
        case "ArrowDown":
          if (y < 14) handleMove(x, y + 1);
          break;
        case "ArrowLeft":
          if (x > 0) handleMove(x - 1, y);
          break;
        case "ArrowRight":
          if (x < 14) handleMove(x + 1, y);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentUser]);

  return (
    <div className="p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Space: {spaceId}</h1>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${connected ? "bg-green-500" : "bg-red-500"}`} />
            <span className="text-sm text-gray-600">
              {connected ? "Connected" : "Disconnected"}
            </span>
          </div>
        </div>
        <div className="border rounded-lg overflow-hidden">
          <canvas ref={canvasRef} width={750} height={750} className="bg-white" />
        </div>
        <p className="mt-2 text-sm text-gray-500">
          Use arrow keys to move your avatar (red circle)
        </p>
      </div>
    </div>
  );
}
