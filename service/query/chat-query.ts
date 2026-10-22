import { useInfiniteQuery, useQuery } from "@tanstack/react-query"

import { chatService } from "../controller/chat.service"
import { chatKeys } from "../keys/chat-keys"

/**
 * Pages are fetched newest-first. `initialPageParam` is `undefined` because the
 * first request has no cursor; each later page uses the previous `next_cursor`.
 */
export const useChatMessages = () =>
  useInfiniteQuery({
    queryKey: chatKeys.messages,
    queryFn: ({ pageParam }) => chatService.history(pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.data?.next_cursor ?? undefined,
  })

export const useChatUsers = () =>
  useQuery({
    queryKey: chatKeys.users,
    queryFn: chatService.users,
    // The participant list changes rarely; avoid refetching it on every mount.
    staleTime: 60_000,
  })
