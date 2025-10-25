import { apiRequest } from "./queryClient";

export interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  unitId?: string | null;
}

export interface AuthResponse {
  user: User;
  token: string;
}

const TOKEN_KEY = "heritage_auth_token";
const USER_KEY = "heritage_user";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export function getUser(): User | null {
  const userStr = localStorage.getItem(USER_KEY);
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

export function setUser(user: User): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function removeUser(): void {
  localStorage.removeItem(USER_KEY);
}

export function isAuthenticated(): boolean {
  return !!getToken() && !!getUser();
}

export async function login(username: string, password: string): Promise<User> {
  console.log("🔐 Login attempt:", username);
  
  const res = await apiRequest("POST", "/api/auth/login", { username, password });
  console.log("✅ API response received:", res.status, res.statusText);
  
  const response: AuthResponse = await res.json();
  console.log("📦 Parsed response:", response);

  setToken(response.token);
  setUser(response.user);
  console.log("💾 Saved to localStorage");
  
  return response.user;
}

export async function register(username: string, email: string, password: string, role: string): Promise<User> {
  const res = await apiRequest("POST", "/api/auth/register", { username, email, password, role, unitId: null, active: true });
  const response: AuthResponse = await res.json();

  setToken(response.token);
  setUser(response.user);
  
  return response.user;
}

export function logout(): void {
  removeToken();
  removeUser();
}
