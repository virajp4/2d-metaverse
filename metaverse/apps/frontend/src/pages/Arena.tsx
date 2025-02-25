import { useState } from "react";
import { useAuthStore } from "../store/auth";
import { useParams } from "react-router-dom";
import GameCanvas from "../components/game/GameCanvas";
import useGameWebSocket from "../hooks/useGameWebSocket";
import useGameControls from "../hooks/useGameControls";

export default function Arena() {
  const { spaceId } = useParams();
  const [connected, setConnected] = useState(false);
  const { token } = useAuthStore();

  const { currentUser, users, handleMove } = useGameWebSocket({
    token,
    spaceId,
    setConnected,
  });

  useGameControls({
    currentUser,
    handleMove,
  });

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
        <GameCanvas currentUser={currentUser} users={users} width={750} height={750} />
        <p className="mt-2 text-sm text-gray-500">
          Use arrow keys to move your avatar (red circle)
        </p>
      </div>
    </div>
  );
}
