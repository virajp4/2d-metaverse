import { useEffect, useRef } from "react";
import { SpaceUser } from "@repo/types";

interface GameCanvasProps {
  currentUser: SpaceUser | null;
  users: Map<string, SpaceUser>;
  width: number;
  height: number;
  cellSize: number;
}

export default function GameCanvas({
  currentUser,
  users,
  width,
  height,
  cellSize,
}: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

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
      drawGrid(ctx, canvas.width, canvas.height);

      // Draw other users in green
      drawOtherUsers(ctx, currentState.users);

      // Draw current user in red
      drawCurrentUser(ctx, currentState.currentUser);
    });

    return () => cancelAnimationFrame(animationFrame);
  }, [currentUser, users]);

  function drawGrid(ctx: CanvasRenderingContext2D, width: number, height: number) {
    const cols = Math.floor(width / cellSize);
    const rows = Math.floor(height / cellSize);

    ctx.strokeStyle = "#eee";
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        ctx.strokeRect(i * cellSize, j * cellSize, cellSize, cellSize);
      }
    }
  }

  function drawOtherUsers(ctx: CanvasRenderingContext2D, users: SpaceUser[]) {
    users.forEach((user) => {
      ctx.fillStyle = "#4CAF50"; // Green color for other users
      ctx.beginPath();
      ctx.arc(
        user.x * cellSize + cellSize / 2,
        user.y * cellSize + cellSize / 2,
        cellSize / 2.5,
        0,
        Math.PI * 2
      );
      ctx.fill();
    });
  }

  function drawCurrentUser(ctx: CanvasRenderingContext2D, user: SpaceUser) {
    ctx.fillStyle = "#FF0000"; // Red color for current user
    ctx.beginPath();
    ctx.arc(
      user.x * cellSize + cellSize / 2,
      user.y * cellSize + cellSize / 2,
      cellSize / 2.5,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <canvas ref={canvasRef} width={width} height={height} className="bg-white" />
    </div>
  );
}
