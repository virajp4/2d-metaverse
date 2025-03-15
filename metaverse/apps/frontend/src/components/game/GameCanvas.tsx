import { useEffect, useRef, useState } from "react";
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
  const [icons, setIcons] = useState<{
    teacher: HTMLImageElement | null;
    student: HTMLImageElement | null;
  }>({ teacher: null, student: null });

  // Load icons when component mounts
  useEffect(() => {
    // Teacher icon
    const teacherIcon = new Image();
    teacherIcon.src = "/icons/teacher.svg";
    teacherIcon.onload = () => {
      setIcons((prev) => ({ ...prev, teacher: teacherIcon }));
    };

    // Student icon
    const studentIcon = new Image();
    studentIcon.src = "/icons/student.svg";
    studentIcon.onload = () => {
      setIcons((prev) => ({ ...prev, student: studentIcon }));
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !currentUser || !icons.teacher || !icons.student) return;

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

      // Draw other users with role-based icons
      drawOtherUsers(ctx, currentState.users);

      // Draw current user with role-based icon and highlight
      drawCurrentUser(ctx, currentState.currentUser);
    });

    return () => cancelAnimationFrame(animationFrame);
  }, [currentUser, users, icons]);

  function drawGrid(ctx: CanvasRenderingContext2D, width: number, height: number) {
    const cols = Math.floor(width / cellSize);
    const rows = Math.floor(height / cellSize);

    ctx.strokeStyle = "transparent";
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        ctx.strokeRect(i * cellSize, j * cellSize, cellSize, cellSize);
      }
    }
  }

  function drawOtherUsers(ctx: CanvasRenderingContext2D, users: SpaceUser[]) {
    users.forEach((user) => {
      const x = user.x * cellSize;
      const y = user.y * cellSize;

      // Draw the appropriate icon based on role
      const isTeacher = user.role.toLowerCase() === "teacher";
      const icon = isTeacher ? icons.teacher : icons.student;
      if (icon) {
        const iconSize = cellSize * 0.8;
        ctx.drawImage(
          icon,
          x + (cellSize - iconSize) / 2,
          y + (cellSize - iconSize) / 2,
          iconSize,
          iconSize
        );
      }
    });
  }

  function drawCurrentUser(ctx: CanvasRenderingContext2D, user: SpaceUser) {
    const x = user.x * cellSize;
    const y = user.y * cellSize;

    // Draw the appropriate icon based on role
    const isTeacher = user.role.toLowerCase() === "teacher";
    const icon = isTeacher ? icons.teacher : icons.student;
    if (icon) {
      const iconSize = cellSize * 0.8;
      ctx.drawImage(
        icon,
        x + (cellSize - iconSize) / 2,
        y + (cellSize - iconSize) / 2,
        iconSize,
        iconSize
      );
    }
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <canvas ref={canvasRef} width={width} height={height} className="bg-white" />
    </div>
  );
}
