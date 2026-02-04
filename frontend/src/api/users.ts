import client from "./client"
import type { User } from "../types"

export const usersApi = {
  getAll: () => client.get<User[]>("/api/v1/users"),
  getById: (id: string) => client.get(`/api/v1/users/${id}`),
  getMe: () => client.get("/api/v1/users/me"),  // ✅ added
}
