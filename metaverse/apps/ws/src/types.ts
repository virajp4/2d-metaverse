export type Position = {
  x: number;
  y: number;
};

export type UserInfo = {
  userId: string;
  x: number;
  y: number;
};

export type OutgoingMessage = {
  type: "space-joined" | "movement" | "movement-rejected" | "user-joined" | "user-left";
  payload: {
    spawn?: Position;
    users?: UserInfo[];
    userId?: string;
    x?: number;
    y?: number;
  };
};

export type IncomingMessage = {
  type: "join" | "move";
  payload: {
    spaceId?: string;
    token?: string;
    x?: number;
    y?: number;
  };
};
