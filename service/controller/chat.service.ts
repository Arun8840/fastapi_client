import type { ApiResponse, ChatHistory } from "@/types"

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
   * One page of persisted messages, newest first. `cursor` is opaque: pass the
   * `next_cursor` from the previous page and the server returns older rows.
   */
  history: async (cursor?: string) => {
    const res = await privateApi.get<ApiResponse<ChatHistory>>("/chat/messages", {
      params: { cursor, limit: 50 },
    })
    return res.data
  },
}
