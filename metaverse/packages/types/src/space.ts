export interface Space {
  spaceId: string;
  name: string;
  createdBy: string;
}

export interface Coordinate {
  x: number;
  y: number;
}

export interface SpaceUser {
  userId: string;
  x: number;
  y: number;
  role: string;
}
