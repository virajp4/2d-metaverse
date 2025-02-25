import { Coordinate, SpaceUser } from "./space";

export enum MessageType {
  JOIN = "join",
  SPACE_JOINED = "space-joined",
  USER_JOINED = "user-joined",
  MOVE = "move",
  MOVEMENT = "movement",
  MOVEMENT_REJECTED = "movement-rejected",
  USER_LEFT = "user-left",
}

export interface WebSocketMessage {
  type: MessageType;
  payload: any;
}

export interface JoinMessage extends WebSocketMessage {
  type: MessageType.JOIN;
  payload: {
    spaceId: string;
    token: string;
  };
}

export interface SpaceJoinedMessage extends WebSocketMessage {
  type: MessageType.SPACE_JOINED;
  payload: {
    userId: string;
    spawn: Coordinate;
    users: SpaceUser[];
  };
}

export interface UserJoinedMessage extends WebSocketMessage {
  type: MessageType.USER_JOINED;
  payload: SpaceUser;
}

export interface MoveMessage extends WebSocketMessage {
  type: MessageType.MOVE;
  payload: {
    x: number;
    y: number;
  };
}

export interface MovementMessage extends WebSocketMessage {
  type: MessageType.MOVEMENT;
  payload: {
    userId: string;
    x: number;
    y: number;
  };
}

export interface MovementRejectedMessage extends WebSocketMessage {
  type: MessageType.MOVEMENT_REJECTED;
  payload: {
    x: number;
    y: number;
  };
}

export interface UserLeftMessage extends WebSocketMessage {
  type: MessageType.USER_LEFT;
  payload: {
    userId: string;
  };
}

export type OutgoingMessage =
  | SpaceJoinedMessage
  | UserJoinedMessage
  | MovementMessage
  | UserLeftMessage
  | MovementRejectedMessage;

export type IncomingMessage = JoinMessage | MoveMessage;
