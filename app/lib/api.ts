import axios from "axios";

const BASE_URL = "http://192.168.0.42:4000"; // ✅ PC’nin IP’si

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
