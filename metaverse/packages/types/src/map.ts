import { Coordinate } from "./space";

export interface MapElement extends Coordinate {
  elementId: string;
}

export interface Map {
  mapId: string;
  name: string;
  thumbnail: string;
  defaultElements: MapElement[];
  createdBy: string;
}

export interface CreateMapRequest {
  name: string;
  thumbnail: string;
  defaultElements: MapElement[];
}

export interface CreateSpaceRequest {
  name: string;
  mapId?: string;
}
