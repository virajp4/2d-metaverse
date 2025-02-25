import { WebSocketServer } from "ws";
import { SpaceUser } from "./SpaceUser";
import { config } from "./config";

const wss = new WebSocketServer({ port: config.server.port });

wss.on("connection", (ws) => {
  const user = new SpaceUser(ws);

  ws.on("error", () => user.destroy());
  ws.on("close", () => user.destroy());
});
