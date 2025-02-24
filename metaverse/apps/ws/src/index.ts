import { WebSocketServer } from "ws";
import { User } from "./User";
import { config } from "./config";

const wss = new WebSocketServer({ port: config.server.port });

wss.on("connection", (ws) => {
  const user = new User(ws);

  ws.on("error", () => user.destroy());
  ws.on("close", () => user.destroy());
});
