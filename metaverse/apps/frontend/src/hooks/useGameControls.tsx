import { useEffect } from "react";
import { SpaceUser } from "@repo/types";

interface UseGameControlsProps {
  currentUser: SpaceUser | null;
  handleMove: (x: number, y: number) => void;
  width: number;
  height: number;
  cellSize: number;
}

export default function useGameControls({
  currentUser,
  handleMove,
  width,
  height,
  cellSize,
}: UseGameControlsProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!currentUser) return;
      const yCellBound = height / cellSize;
      const xCellBound = width / cellSize;

      const { x, y } = currentUser;
      switch (e.key) {
        case "ArrowUp":
          if (y > 0) handleMove(x, y - 1);
          break;
        case "ArrowDown":
          if (y < yCellBound - 1) handleMove(x, y + 1);
          break;
        case "ArrowLeft":
          if (x > 0) handleMove(x - 1, y);
          break;
        case "ArrowRight":
          if (x < xCellBound - 1) handleMove(x + 1, y);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentUser]);

  return null;
}
