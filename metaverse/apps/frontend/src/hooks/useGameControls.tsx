import { useEffect } from "react";
import { SpaceUser } from "@repo/types";

interface UseGameControlsProps {
  currentUser: SpaceUser | null;
  handleMove: (x: number, y: number) => void;
}

export default function useGameControls({ currentUser, handleMove }: UseGameControlsProps) {
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

  return null;
}
