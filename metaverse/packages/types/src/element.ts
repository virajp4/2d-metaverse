import { Coordinate } from "./space";

export interface Element {
  elementId: string;
  imageUrl: string;
  width: number;
  height: number;
  static: boolean;
}

export interface SpaceElement extends Coordinate {
  id: string;
  spaceId: string;
  elementId: string;
}

export interface CreateElementRequest {
  imageUrl: string;
  width: number;
  height: number;
  static: boolean;
}

export interface UpdateElementRequest {
  imageUrl: string;
}

export interface AddElementRequest extends Coordinate {
  spaceId: string;
  elementId: string;
}

export interface DeleteElementRequest {
  id: string;
}
