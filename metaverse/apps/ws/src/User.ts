import { WebSocket } from "ws";
import { RoomManager } from "./RoomManager";
import { IncomingMessage, OutgoingMessage, Position, UserInfo } from "./types";
import client from "@repo/db/client";
import jwt, { JwtPayload } from "jsonwebtoken";
import { config } from "./config";

const generateId = (length: number) =>
  [...Array(length)].map(() => Math.random().toString(36)[2]).join("");

export class User {
  public id: string;
  public userId?: string;
  private spaceId?: string;
  private position: Position;
  private ws: WebSocket;

  constructor(ws: WebSocket) {
    this.id = generateId(10);
    this.position = { x: 0, y: 0 };
    this.ws = ws;
    this.initHandlers();
  }

  private async handleJoin(spaceId: string, token: string) {
    try {
      const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;
      if (!decoded.userId) return false;

      this.userId = decoded.userId;
      const space = await client.space.findFirst({ where: { id: spaceId } });
      if (!space) return false;

      this.spaceId = spaceId;

      this.position = {
        x: Math.floor(Math.random() * 15),
        y: Math.floor(Math.random() * 15),
      };

      const existingUsers = RoomManager.getInstance()
        .getUsers(spaceId)
        .map((user) => ({
          userId: user.userId!,
          x: user.getPosition().x,
          y: user.getPosition().y,
        }));

      RoomManager.getInstance().addUser(spaceId, this);

      this.send({
        type: "space-joined",
        payload: {
          userId: this.userId,
          spawn: this.position,
          users: existingUsers,
        },
      });

      this.broadcastToRoom({
        type: "user-joined",
        payload: {
          userId: this.userId,
          x: this.position.x,
          y: this.position.y,
        },
      });

      return true;
    } catch (e) {
      return false;
    }
  }

  private handleMove(x: number, y: number) {
    const xDiff = Math.abs(this.position.x - x);
    const yDiff = Math.abs(this.position.y - y);

    if ((xDiff === 1 && yDiff === 0) || (xDiff === 0 && yDiff === 1)) {
      this.position = { x, y };
      this.broadcastToRoom({
        type: "movement",
        payload: {
          userId: this.userId!,
          x: this.position.x,
          y: this.position.y,
        },
      });
      return;
    }

    this.send({
      type: "movement-rejected",
      payload: {
        x: this.position.x,
        y: this.position.y,
      },
    });
  }

  private initHandlers() {
    this.ws.on("message", async (data) => {
      try {
        const message = JSON.parse(data.toString()) as IncomingMessage;

        switch (message.type) {
          case "join":
            const success = await this.handleJoin(message.payload.spaceId!, message.payload.token!);
            if (!success) this.ws.close();
            break;

          case "move":
            this.handleMove(message.payload.x!, message.payload.y!);
            break;
        }
      } catch (e) {
        this.ws.close();
      }
    });
  }

  private broadcastToRoom(message: OutgoingMessage) {
    if (this.spaceId) {
      RoomManager.getInstance().broadcast(message, this, this.spaceId);
    }
  }

  public destroy() {
    if (this.spaceId && this.userId) {
      this.broadcastToRoom({
        type: "user-left",
        payload: { userId: this.userId },
      });
      RoomManager.getInstance().removeUser(this, this.spaceId);
    }
  }

  public send(payload: OutgoingMessage) {
    this.ws.send(JSON.stringify(payload));
  }

  public getPosition(): Position {
    return this.position;
  }
}
