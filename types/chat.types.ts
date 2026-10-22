export type ChatSocketStatus = "connecting" | "open" | "closed" | "error"

export type ConversationKind = "room" | "direct"

export interface ChatUser {
  id: string
  email: string
}

export interface ChatMessage {
  id: string
  conversation_id: string
  content: string
  created_at: string
  user: ChatUser
}

export interface ChatHistory {
  items: ChatMessage[]
  next_cursor: string | null
}

export interface Conversation {
  id: string
  kind: ConversationKind
  created_at: string
  participants: ChatUser[]
  last_message: ChatMessage | null
  unread_count: number
}
