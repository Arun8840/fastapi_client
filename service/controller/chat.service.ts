import type { ApiResponse, ChatHistory, ChatUser, Conversation } from "@/types"

import { privateApi } from "./api-client"

const DEFAULT_API_URL = "http://localhost:8000/api/v1"

export function resolveChatSocketUrl(): string {
  const base = process.env.NEXT_PUBLIC_API_URL ?? DEFAULT_API_URL
  const url = new URL(base)

  url.protocol = url.protocol === "https:" ? "wss:" : "ws:"
  url.pathname = `${url.pathname.replace(/\/$/, "")}/chat/ws/chat`
  url.search = ""
  url.hash = ""

  return url.toString()
}

export const chatService = {
  /**
   * The shared room plus every direct conversation this user belongs to,
   * already sorted by latest activity.
   */
  conversations: async () => {
    const res = await privateApi.get<ApiResponse<Conversation[]>>(
      "/chat/conversations",
    )
    return res.data
  },

  /**
   * One page of a conversation, newest first. `cursor` is opaque: pass the
   * `next_cursor` from the previous page and the server returns older rows.
   * Fetching a direct conversation also marks it as read.
   */
  messages: async (conversationId: string, cursor?: string) => {
    const res = await privateApi.get<ApiResponse<ChatHistory>>(
      `/chat/conversations/${conversationId}/messages`,
      { params: { cursor, limit: 50 } },
    )
    return res.data
  },

  /** Idempotent: returns the existing DM when the two users already have one. */
  startDirect: async (userId: string) => {
    const res = await privateApi.post<ApiResponse<Conversation>>(
      `/chat/conversations/direct/${userId}`,
    )
    return res.data
  },

  /** Advanced while a thread is open so its unread badge stays at zero. */
  markRead: async (conversationId: string) => {
    const res = await privateApi.post<ApiResponse<null>>(
      `/chat/conversations/${conversationId}/read`,
    )
    return res.data
  },

  /** Lean participant list that every signed-in member is allowed to read. */
  users: async () => {
    const res = await privateApi.get<ApiResponse<ChatUser[]>>("/chat/users")
    return res.data
  },
}
