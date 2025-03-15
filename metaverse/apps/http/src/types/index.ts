import z from "zod";
import {
  SignUpRequest,
  SignInRequest,
  UpdateMetadataRequest,
  CreateSpaceRequest,
  DeleteElementRequest,
  AddElementRequest,
  CreateElementRequest,
  UpdateElementRequest,
  CreateAvatarRequest,
  CreateMapRequest,
} from "@repo/types";

export const SignupSchema = z.object({
  username: z.string(),
  password: z.string(),
  type: z.enum(["student", "teacher", "staff", "admin"]),
}) satisfies z.ZodType<SignUpRequest>;

export const SigninSchema = z.object({
  username: z.string(),
  password: z.string(),
}) satisfies z.ZodType<SignInRequest>;

export const UpdateMetadataSchema = z.object({
  avatarId: z.string(),
}) satisfies z.ZodType<UpdateMetadataRequest>;

export const CreateSpaceSchema = z.object({
  name: z.string(),
  mapId: z.string().optional(),
}) satisfies z.ZodType<CreateSpaceRequest>;

export const DeleteElementSchema = z.object({
  id: z.string(),
}) satisfies z.ZodType<DeleteElementRequest>;

export const AddElementSchema = z.object({
  spaceId: z.string(),
  elementId: z.string(),
  x: z.number(),
  y: z.number(),
}) satisfies z.ZodType<AddElementRequest>;

export const CreateElementSchema = z.object({
  imageUrl: z.string(),
  width: z.number(),
  height: z.number(),
  static: z.boolean(),
}) satisfies z.ZodType<CreateElementRequest>;

export const UpdateElementSchema = z.object({
  imageUrl: z.string(),
}) satisfies z.ZodType<UpdateElementRequest>;

export const CreateAvatarSchema = z.object({
  name: z.string(),
  imageUrl: z.string(),
}) satisfies z.ZodType<CreateAvatarRequest>;

export const CreateMapSchema = z.object({
  thumbnail: z.string(),
  name: z.string(),
  defaultElements: z.array(
    z.object({
      elementId: z.string(),
      x: z.number(),
      y: z.number(),
    })
  ),
}) satisfies z.ZodType<CreateMapRequest>;

declare global {
  namespace Express {
    export interface Request {
      role?: "Admin" | "Student" | "Teacher" | "Staff";
      userId?: string;
    }
  }
}
