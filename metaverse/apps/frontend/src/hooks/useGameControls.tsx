import { useEffect } from "react";
import { SpaceUser } from "@repo/types";

interface UseGameControlsProps {
  currentUser: SpaceUser | null;
  handleMove: (x: number, y: number) => void;
  width: number;
  height: number;
  cellSize: number;
  users: Map<string, SpaceUser>;
  isConnected: boolean;
}

export default function useGameControls({
  currentUser,
  handleMove,
  width,
  height,
  cellSize,
  users,
  isConnected,
}: UseGameControlsProps) {
  const isPositionOccupied = (x: number, y: number): boolean => {
    if (!users.size) return false;

    for (const [, user] of users.entries()) {
      if (user.x === x && user.y === y) {
        return true;
      }
    }
    return false;
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!currentUser || !isConnected) return;
      const yCellBound = height / cellSize;
      const xCellBound = width / cellSize;

      let { x, y } = currentUser;
      switch (e.key) {
        case "ArrowUp":
          if (y > 0) y = y - 1;
          break;
        case "ArrowDown":
          if (y < yCellBound - 1) y = y + 1;
          break;
        case "ArrowLeft":
          if (x > 0) x = x - 1;
          break;
        case "ArrowRight":
          if (x < xCellBound - 1) x = x + 1;
          break;
      }
      if (!isPositionOccupied(x, y)) {
        handleMove(x, y);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [currentUser, isConnected, users]);

  return null;
}
