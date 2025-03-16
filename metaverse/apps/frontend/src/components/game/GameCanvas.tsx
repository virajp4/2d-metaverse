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
    blackboard: HTMLImageElement | null;
    bench: HTMLImageElement | null;
  }>({ teacher: null, student: null, blackboard: null, bench: null });

  useEffect(() => {
    const teacherIcon = new Image();
    teacherIcon.src = "/icons/teacher.svg";
    teacherIcon.onload = () => {
      setIcons((prev) => ({ ...prev, teacher: teacherIcon }));
    };

    const studentIcon = new Image();
    studentIcon.src = "/icons/student.svg";
    studentIcon.onload = () => {
      setIcons((prev) => ({ ...prev, student: studentIcon }));
    };

    const blackboardIcon = new Image();
    blackboardIcon.src = "/icons/blackboard.svg";
    blackboardIcon.onload = () => {
      setIcons((prev) => ({ ...prev, blackboard: blackboardIcon }));
    };

    const benchIcon = new Image();
    benchIcon.src = "/icons/bench.svg";
    benchIcon.onload = () => {
      setIcons((prev) => ({ ...prev, bench: benchIcon }));
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !currentUser) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const currentState = {
      users: Array.from(users.values()),
      currentUser,
    };

    const animationFrame = requestAnimationFrame(() => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      drawGrid(ctx, canvas.width, canvas.height);
      drawClassroom(ctx, canvas.width);
      drawOtherUsers(ctx, currentState.users);
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

  function drawClassroom(ctx: CanvasRenderingContext2D, width: number) {
    const cols = Math.floor(width / cellSize);

    if (icons.blackboard) {
      const blackboardCells = 4;
      const blackboardX = Math.floor((cols - blackboardCells) / 2) * cellSize;
      const blackboardY = 0;
      const blackboardWidth = blackboardCells * cellSize;
      const blackboardHeight = cellSize;

      ctx.drawImage(icons.blackboard, blackboardX, blackboardY, blackboardWidth, blackboardHeight);
    }
    if (icons.bench) {
      const benchRows = 3;
      const benchesPerRow = 4;
      const startRow = 3;
      const startCol = 3;

      for (let row = 0; row < benchRows; row++) {
        for (let col = 0; col < benchesPerRow; col++) {
          const benchX = (startCol + col * 2 + 1) * cellSize;
          const benchY = (startRow + row * 2) * cellSize;
          const benchWidth = cellSize;
          const benchHeight = cellSize;

          ctx.drawImage(icons.bench, benchX, benchY, benchWidth, benchHeight);
        }
      }
    }
  }

  function drawOtherUsers(ctx: CanvasRenderingContext2D, users: SpaceUser[]) {
    users.forEach((user) => {
      const x = user.x * cellSize;
      const y = user.y * cellSize;

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
