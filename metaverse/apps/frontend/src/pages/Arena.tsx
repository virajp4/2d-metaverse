import { useState } from "react";
import { useAuthStore } from "../store/auth";
import { useParams } from "react-router-dom";
import GameCanvas from "../components/game/GameCanvas";
import ChatBox from "../components/game/ChatBox";
import useGameWebSocket from "../hooks/useGameWebSocket";
import useGameControls from "../hooks/useGameControls";
import { CANVAS_HEIGHT, CANVAS_WIDTH, CELL_SIZE } from "@repo/types";

export default function Arena() {
  const { spaceId } = useParams();
  const [connected, setConnected] = useState(false);
  const { token } = useAuthStore();

  const { currentUser, users, handleMove, chatMessages, sendChatMessage } = useGameWebSocket({
    token,
    spaceId,
    setConnected,
  });

  useGameControls({
    currentUser,
    handleMove,
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
    cellSize: CELL_SIZE,
    users,
    isConnected: connected,
  });

  return (
    <div className="flex flex-col w-full max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-4 w-full">
        <h1 className="text-2xl font-bold">Space: {spaceId}</h1>
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${connected ? "bg-green-500" : "bg-red-500"}`} />
          <span className="text-sm text-gray-600">
            {connected ? "Connected" : "Disconnected"} ({users.size} users)
          </span>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <GameCanvas
            currentUser={currentUser}
            users={users}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            cellSize={CELL_SIZE}
          />
          <div className="flex items-start p-2">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-red-500"></div>
              <span className="text-sm text-gray-600">Use arrow keys to move your avatar</span>
            </div>
          </div>
        </div>

        <div className="w-96 h-[620px]">
          <ChatBox
            messages={chatMessages}
            users={users}
            currentUserId={currentUser?.userId}
            currentUser={currentUser}
            onSendMessage={sendChatMessage}
          />
        </div>
      </div>
    </div>
  );
}
