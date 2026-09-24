import { apiGet, apiPost } from "@/lib/api";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: AuthUser;
  message: string;
}

export const fetchCurrentUser = () => apiGet<AuthUser>("/auth/me");
export const loginUser = (payload: LoginRequest) => apiPost<LoginResponse>("/auth/login", payload);