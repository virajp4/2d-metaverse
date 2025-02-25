export interface User {
  userId: string;
  username: string;
  type: "user" | "admin";
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
  type: "user" | "admin";
}
