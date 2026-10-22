import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"

import type { ApiResponse, Conversation } from "@/types"

import { chatService } from "../controller/chat.service"
import { chatKeys } from "../keys/chat-keys"

/**
 * Pages are fetched newest-first. `initialPageParam` is `undefined` because the
 * first request has no cursor; each later page uses the previous `next_cursor`.
 */
export const useChatMessages = (conversationId: string | null) =>
  useInfiniteQuery({
    queryKey: chatKeys.messages(conversationId ?? "none"),
    queryFn: ({ pageParam }) => {
      if (!conversationId) throw new Error("No conversation selected")
      return chatService.messages(conversationId, pageParam)
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.data?.next_cursor ?? undefined,
    enabled: Boolean(conversationId),
  })

export const useConversations = () =>
  useQuery({
    queryKey: chatKeys.conversations,
    queryFn: chatService.conversations,
  })

export const useChatUsers = () =>
  useQuery({
    queryKey: chatKeys.users,
    queryFn: chatService.users,
    // The participant list changes rarely; avoid refetching it on every mount.
    staleTime: 60_000,
  })

export const useStartDirectConversation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (userId: string) => chatService.startDirect(userId),
    onSuccess: (response) => {
      // Put the conversation in the sidebar immediately instead of waiting for
      // the invalidation round-trip; the fetch below then confirms the order
      // and unread counts.
      const conversation = response.data
      if (conversation) {
        queryClient.setQueryData<ApiResponse<Conversation[]>>(
          chatKeys.conversations,
          (current) => {
            const items = current?.data ?? []
            if (items.some((item) => item.id === conversation.id)) {
              return current
            }
            return current
              ? { ...current, data: [conversation, ...items] }
              : current
          },
        )
      }
      void queryClient.invalidateQueries({ queryKey: chatKeys.conversations })
    },
  })
}

export const useMarkConversationRead = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (conversationId: string) => chatService.markRead(conversationId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: chatKeys.conversations })
    },
  })
}
