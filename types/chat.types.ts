export type ChatSocketStatus = "connecting" | "open" | "closed" | "error"

export interface ChatUser {
  id: string
  email: string
}

export interface ChatMessage {
  id: string
  content: string
  created_at: string
  user: ChatUser
}

export interface ChatHistory {
  items: ChatMessage[]
  next_cursor: string | null
}
