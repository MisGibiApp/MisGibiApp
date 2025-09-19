import axios from "axios";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://10.25.0.135:4000";

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

export type RegisterPayload = {
  email: string;
  password: string;
  name: string;
  role: "customer" | "cleaner";
};

export async function registerUser(payload: RegisterPayload) {
  const { data } = await api.post("/auth/register", payload);
  return data as { token: string };
}
