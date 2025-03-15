export type Role = "Student" | "Teacher" | "Staff" | "Admin";

export interface User {
  userId: string;
  username: string;
  type: "student" | "teacher" | "staff" | "admin";
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface SignInRequest {
  username: string;
  password: string;
}

export interface SignUpRequest {
  username: string;
  password: string;
  type: "student" | "teacher" | "staff" | "admin";
}
