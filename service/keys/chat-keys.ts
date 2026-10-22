export const chatKeys = {
  conversations: ["chat-conversations"],
  messages: (conversationId: string) => ["chat-messages", conversationId],
  users: ["chat-users"],
}
