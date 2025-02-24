import { useEffect, useRef, useState } from "react";

const Arena = () => {
  const canvasRef = useRef<any>(null);
  const wsRef = useRef<any>(null);
  const [currentUser, setCurrentUser] = useState<{
    x: number;
    y: number;
    userId: string;
  } | null>(null);
  const [users, setUsers] = useState(new Map());
  const [params, setParams] = useState({ token: "", spaceId: "" });

  // Initialize WebSocket connection and handle URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token") || "";
    const spaceId = urlParams.get("spaceId") || "";
    setParams({ token, spaceId });

    // Initialize WebSocket
    wsRef.current = new WebSocket("ws://localhost:3001"); // Replace with your WS_URL

    wsRef.current.onopen = () => {
      // Join the space once connected
      wsRef.current.send(
        JSON.stringify({
          type: "join",
          payload: {
            spaceId,
            token,
          },
        })
      );
    };

    wsRef.current.onmessage = (event: any) => {
      const message = JSON.parse(event.data);
      handleWebSocketMessage(message);
    };

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const handleWebSocketMessage = (message: any) => {
    switch (message.type) {
      case "space-joined":
        setCurrentUser({
          x: message.payload.spawn.x,
          y: message.payload.spawn.y,
          userId: message.payload.userId,
        });
        // Initialize other users with colors
        const userMap = new Map();
        message.payload.users.forEach((user: any) => {
          userMap.set(user.userId, {
            ...user,
            color: user.color,
          });
        });
        setUsers(userMap);
        break;

      case "user-joined":
        setUsers((prev) =>
          new Map(prev).set(message.payload.userId, {
            x: message.payload.x,
            y: message.payload.y,
            userId: message.payload.userId,
            color: message.payload.color,
          })
        );
        break;

      case "movement":
        setUsers((prev) => {
          const newUsers = new Map(prev);
          const user = newUsers.get(message.payload.userId);
          if (user) {
            newUsers.set(message.payload.userId, {
              ...user,
              x: message.payload.x,
              y: message.payload.y,
            });
          }
          return newUsers;
        });
        break;

      case "movement-rejected":
        // Reset current user position if movement was rejected
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

  // Handle user movement
  const handleMove = (newX: number, newY: number) => {
    if (!currentUser) return;

    // Update local state immediately
    setCurrentUser((prev) => (prev ? { ...prev, x: newX, y: newY } : null));

    // Send movement request
    wsRef.current.send(
      JSON.stringify({
        type: "move",
        payload: {
          x: newX,
          y: newY,
          userId: currentUser.userId,
        },
      })
    );
  };

  // Draw the arena
  useEffect(() => {
    console.log("render");
    const canvas = canvasRef.current;
    if (!canvas) return;
    console.log("below render");

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = "#eee";
    for (let i = 0; i < canvas.width; i += 50) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, canvas.height);
      ctx.stroke();
    }
    for (let i = 0; i < canvas.height; i += 50) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(canvas.width, i);
      ctx.stroke();
    }

    console.log("before curerntusert");
    console.log(JSON.stringify(currentUser));
    // Draw other users
    users.forEach((user) => {
      ctx.beginPath();
      ctx.fillStyle = user.color;
      ctx.arc(user.x * 50, user.y * 50, 20, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw current user
    if (currentUser) {
      ctx.beginPath();
      ctx.arc(currentUser.x * 50, currentUser.y * 50, 20, 0, Math.PI * 2);
      ctx.fill();
    }
  }, [currentUser, users]);

  const handleKeyDown = (e: any) => {
    if (!currentUser) return;

    const { x, y } = currentUser;
    switch (e.key) {
      case "ArrowUp":
        handleMove(x, y - 1);
        break;
      case "ArrowDown":
        handleMove(x, y + 1);
        break;
      case "ArrowLeft":
        handleMove(x - 1, y);
        break;
      case "ArrowRight":
        handleMove(x + 1, y);
        break;
    }
  };

  return (
    <div className="p-4" onKeyDown={handleKeyDown} tabIndex={0}>
      <h1 className="text-2xl font-bold mb-4">Arena</h1>
      <div className="mb-4">
        <p className="text-sm text-gray-600">Token: {params.token}</p>
        <p className="text-sm text-gray-600">Space ID: {params.spaceId}</p>
        <p className="text-sm text-gray-600">
          Connected Users: {users.size + (currentUser ? 1 : 0)}
        </p>
      </div>
      <div className="border rounded-lg overflow-hidden">
        <canvas ref={canvasRef} width={2000} height={2000} className="bg-white" />
      </div>
      <p className="mt-2 text-sm text-gray-500">Use arrow keys to move your avatar</p>
    </div>
  );
};

export default Arena;
