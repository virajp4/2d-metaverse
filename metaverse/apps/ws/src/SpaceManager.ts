import type { SpaceUser } from "./SpaceUser";
import { OutgoingMessage } from "@repo/types";

export class SpaceManager {
  spaces: Map<string, SpaceUser[]> = new Map();
  static instance: SpaceManager;

  private constructor() {
    this.spaces = new Map();
  }

  static getInstance() {
    if (!this.instance) {
      this.instance = new SpaceManager();
    }
    return this.instance;
  }

  public removeUser(user: SpaceUser, spaceId: string) {
    if (!this.spaces.has(spaceId)) {
      return;
    }
    this.spaces.set(spaceId, this.spaces.get(spaceId)?.filter((u) => u.id !== user.id) ?? []);
  }

  public addUser(spaceId: string, user: SpaceUser) {
    if (!this.spaces.has(spaceId)) {
      this.spaces.set(spaceId, [user]);
      return;
    }
    this.spaces.set(spaceId, [...(this.spaces.get(spaceId) ?? []), user]);
  }

  public broadcast(message: OutgoingMessage, user: SpaceUser, roomId: string) {
    if (!this.spaces.has(roomId)) {
      return;
    }
    this.spaces.get(roomId)?.forEach((u) => {
      if (u.id !== user.id) {
        u.send(message);
      }
    });
  }

  public getUsers(spaceId: string): SpaceUser[] {
    return this.spaces.get(spaceId) || [];
  }
}
