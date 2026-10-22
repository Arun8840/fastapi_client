"use client"

import {
  ArrowLeft,
  History,
  Loader2,
  MessagesSquare,
  RefreshCw,
  SendHorizontal,
  TriangleAlert,
  Users,
} from "lucide-react"
import Link from "next/link"
import { type FormEvent, type KeyboardEvent, useMemo, useState } from "react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Bubble, BubbleContent } from "@/components/ui/bubble"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/ui/dark-mode-switcher"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from "@/components/ui/item"
import {
  Message,
  MessageAvatar,
  MessageContent,
  MessageFooter,
  MessageHeader,
} from "@/components/ui/message"
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@/components/ui/message-scroller"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { useChatSocket } from "@/hooks/use-chat-socket"
import { cn } from "@/lib/utils"
import { useChatMessages, useChatUsers, useCurrentUser } from "@/service/query"
import type { ChatMessage, ChatSocketStatus } from "@/types"

const STATUS: Record<ChatSocketStatus, { label: string; dot: string }> = {
  open: { label: "Live", dot: "bg-emerald-500" },
  connecting: { label: "Connecting", dot: "animate-pulse bg-amber-500" },
  closed: { label: "Offline", dot: "bg-zinc-400" },
  error: { label: "Error", dot: "bg-red-500" },
}

const timeFormatter = new Intl.DateTimeFormat(undefined, {
  hour: "numeric",
  minute: "2-digit",
})

function formatTime(value: string) {
  return timeFormatter.format(new Date(value))
}

function getInitials(email: string) {
  const name = email.split("@")[0] ?? email
  const parts = name.split(/[.\-_ ]+/).filter(Boolean)
  const initials = parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")

  return initials || "?"
}

function formatTyping(emails: string[]) {
  const names = emails.map((email) => email.split("@")[0] ?? email)

  if (names.length === 1) return `${names[0]} is typing…`
  if (names.length === 2) return `${names[0]} and ${names[1]} are typing…`
  return `${names[0]} and ${names.length - 1} others are typing…`
}

function MessageRow({
  message,
  mine,
}: {
  message: ChatMessage
  mine: boolean
}) {
  return (
    <MessageScrollerItem messageId={message.id}>
      <Message align={mine ? "end" : "start"}>
        {!mine && (
          <MessageAvatar className="size-8 text-xs font-semibold">
            {getInitials(message.user.email)}
          </MessageAvatar>
        )}
        <MessageContent>
          <MessageHeader>
            <span className="truncate">
              {mine ? "You" : message.user.email}
            </span>
          </MessageHeader>
          <Bubble
            align={mine ? "end" : "start"}
            variant={mine ? "default" : "secondary"}
          >
            <BubbleContent>{message.content}</BubbleContent>
          </Bubble>
          <MessageFooter>{formatTime(message.created_at)}</MessageFooter>
        </MessageContent>
      </Message>
    </MessageScrollerItem>
  )
}

export default function ChatRoom() {
  const {
    status,
    messages: liveMessages,
    typingUsers,
    error,
    reconnect,
    sendMessage,
    sendTyping,
  } = useChatSocket()
  const { data: user } = useCurrentUser()
  const {
    data: history,
    isPending: isHistoryPending,
    isError: isHistoryError,
    refetch: refetchHistory,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useChatMessages()
  const {
    data: users,
    isPending: isUsersPending,
    isError: isUsersError,
    refetch: refetchUsers,
  } = useChatUsers()
  const [draft, setDraft] = useState("")
  const [peopleOpen, setPeopleOpen] = useState(false)

  /**
   * Pages arrive newest-first ([page0 = newest]). Reverse the page order, then
   * reverse each page, to get one ascending timeline for rendering.
   */
  const historyMessages = useMemo(() => {
    if (!history) return []

    return [...history.pages]
      .reverse()
      .flatMap((page) => [...(page.data?.items ?? [])].reverse())
  }, [history])

  /**
   * History and live frames overlap: a message that arrived over the socket is
   * also stored in the DB, so a later history fetch (or reconnect) will include
   * it. Dedupe by the server-issued id and sort chronologically.
   */
  const messages = useMemo(() => {
    const byId = new Map<string, ChatMessage>()

    for (const message of historyMessages) byId.set(message.id, message)
    for (const message of liveMessages) byId.set(message.id, message)

    return [...byId.values()].sort((a, b) => {
      const delta = Date.parse(a.created_at) - Date.parse(b.created_at)
      return delta !== 0 ? delta : a.id.localeCompare(b.id)
    })
  }, [historyMessages, liveMessages])

  const connected = status === "open"
  const email = user?.data?.email
  const statusInfo = STATUS[status]
  // The server already excludes the sender, but filtering here also covers two
  // tabs signed in with the same account.
  const typers = useMemo(
    () => typingUsers.filter((typer) => typer.email !== email),
    [typingUsers, email],
  )
  // Put yourself first, then sort everyone else alphabetically.
  const members = useMemo(() => {
    const list = users?.data ?? []

    return [...list].sort((a, b) => {
      if (a.email === b.email) return 0
      if (a.email === email) return -1
      if (b.email === email) return 1
      return a.email.localeCompare(b.email)
    })
  }, [users, email])

  const submit = () => {
    // Clear the indicator immediately instead of waiting for the TTL.
    sendTyping(false)
    if (!sendMessage(draft)) return
    setDraft("")
  }

  const handleChange = (value: string) => {
    setDraft(value)
    sendTyping(value.trim().length > 0)
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    submit()
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault()
      submit()
    }
  }

  return (
    <section className="flex h-svh flex-col bg-muted/30">
      <div className="mx-auto flex min-h-0 w-full max-w-3xl flex-1 flex-col p-3 sm:p-6">
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl bg-card text-card-foreground ring-1 ring-foreground/10">
          <header className="flex shrink-0 items-center gap-3 border-b px-4 py-3">
            <span className="hidden size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground sm:flex">
              <MessagesSquare className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
              <h1 className="font-heading text-base font-semibold tracking-tight">
                Room chat
              </h1>
              <p className="truncate text-xs text-muted-foreground">
                {email ? `Signed in as ${email}` : "Loading your session…"}
              </p>
            </div>
            <Badge variant="outline" className="gap-1.5">
              <span className={cn("size-2 rounded-full", statusInfo.dot)} />
              {statusInfo.label}
            </Badge>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setPeopleOpen(true)}
            >
              <Users />
              <span className="hidden sm:inline">People</span>
              {members.length > 0 && (
                <span className="tabular-nums text-muted-foreground">
                  {members.length}
                </span>
              )}
            </Button>
            {!connected && (
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                aria-label="Reconnect"
                onClick={reconnect}
              >
                <RefreshCw />
              </Button>
            )}
            <ModeToggle />
            <Button
              variant="ghost"
              size="icon-sm"
              nativeButton={false}
              render={
                <Link href="/" aria-label="Back home">
                  <ArrowLeft />
                </Link>
              }
            />
          </header>

          <div className="flex min-h-0 flex-1 flex-col">
            <MessageScrollerProvider autoScroll defaultScrollPosition="end">
              <MessageScroller>
                <MessageScrollerViewport
                  className="px-4 py-4"
                  preserveScrollOnPrepend
                >
                  <MessageScrollerContent className="gap-4">
                    {isHistoryPending && messages.length === 0 ? (
                      <div className="m-auto flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="size-4 animate-spin" />
                        Loading messages…
                      </div>
                    ) : messages.length === 0 ? (
                      isHistoryError ? (
                        <div className="m-auto flex flex-col items-center gap-3 text-center">
                          <TriangleAlert className="size-5 text-destructive" />
                          <div className="space-y-1">
                            <p className="text-sm font-medium">
                              Could not load past messages
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Check your connection and try again.
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => void refetchHistory()}
                          >
                            <RefreshCw />
                            Retry
                          </Button>
                        </div>
                      ) : (
                        <Empty className="m-auto border border-dashed">
                          <EmptyHeader>
                            <EmptyMedia variant="icon">
                              <MessagesSquare />
                            </EmptyMedia>
                            <EmptyTitle>No messages yet</EmptyTitle>
                            <EmptyDescription>
                              Send the first message, or open this page in a
                              second browser to watch it arrive live.
                            </EmptyDescription>
                          </EmptyHeader>
                        </Empty>
                      )
                    ) : (
                      <>
                        {isHistoryError && (
                          <div className="flex items-center justify-center gap-2 rounded-lg border border-dashed px-3 py-2 text-xs text-muted-foreground">
                            <TriangleAlert className="size-3.5 shrink-0 text-destructive" />
                            Could not load older messages.
                            <Button
                              type="button"
                              variant="ghost"
                              size="xs"
                              onClick={() => void refetchHistory()}
                            >
                              Retry
                            </Button>
                          </div>
                        )}
                        {hasNextPage && (
                          <div className="flex justify-center">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => void fetchNextPage()}
                              disabled={isFetchingNextPage}
                            >
                              {isFetchingNextPage ? (
                                <Loader2 className="animate-spin" />
                              ) : (
                                <History />
                              )}
                              Load earlier messages
                            </Button>
                          </div>
                        )}
                        {messages.map((message) => (
                          <MessageRow
                            key={message.id}
                            message={message}
                            mine={Boolean(email) && message.user.email === email}
                          />
                        ))}
                      </>
                    )}
                  </MessageScrollerContent>
                </MessageScrollerViewport>
                <MessageScrollerButton direction="end" />
              </MessageScroller>
            </MessageScrollerProvider>
          </div>

          <footer className="shrink-0 border-t bg-muted/40 p-3">
            {error && (
              <p className="mb-2 flex items-center gap-1.5 text-xs text-destructive">
                <TriangleAlert className="size-3.5 shrink-0" />
                {error}
              </p>
            )}
            <div
              aria-live="polite"
              className="mb-1.5 flex h-4 items-center text-xs text-muted-foreground"
            >
              {typers.length > 0 && (
                <span className="truncate">
                  {formatTyping(typers.map((typer) => typer.email))}
                </span>
              )}
            </div>
            <form onSubmit={handleSubmit} className="flex items-end gap-2">
              <Textarea
                value={draft}
                onChange={(event) => handleChange(event.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={() => sendTyping(false)}
                placeholder={
                  connected ? "Message the room…" : "Waiting for a connection…"
                }
                disabled={!connected}
                rows={1}
                aria-label="Message"
                className="max-h-40 min-h-10 resize-none py-2"
              />
              <Button
                type="submit"
                size="icon-lg"
                disabled={!connected || draft.trim().length === 0}
                aria-label="Send message"
              >
                <SendHorizontal />
              </Button>
            </form>
            <p className="mt-2 hidden text-[11px] text-muted-foreground sm:block">
              Enter to send · Shift + Enter for a new line
            </p>
          </footer>
        </div>
      </div>

      <Sheet open={peopleOpen} onOpenChange={setPeopleOpen}>
        <SheetContent side="right" className="gap-0">
          <SheetHeader className="border-b">
            <SheetTitle>People</SheetTitle>
            <SheetDescription>
              Everyone with an account can join this room.
            </SheetDescription>
          </SheetHeader>
          <div className="min-h-0 flex-1 overflow-y-auto p-2">
            {isUsersPending ? (
              <div className="space-y-1 p-2">
                {[0, 1, 2, 3].map((index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 rounded-lg p-2"
                  >
                    <Skeleton className="size-6 rounded-full" />
                    <Skeleton className="h-3.5 w-40" />
                  </div>
                ))}
              </div>
            ) : isUsersError ? (
              <div className="flex flex-col items-center gap-3 p-6 text-center">
                <TriangleAlert className="size-5 text-destructive" />
                <p className="text-sm text-muted-foreground">
                  Could not load people.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => void refetchUsers()}
                >
                  <RefreshCw />
                  Retry
                </Button>
              </div>
            ) : members.length === 0 ? (
              <p className="p-6 text-center text-sm text-muted-foreground">
                No one has joined yet.
              </p>
            ) : (
              <ItemGroup className="gap-0.5">
                {members.map((member) => (
                  <Item
                    key={member.id}
                    size="sm"
                    variant={member.email === email ? "muted" : "default"}
                  >
                    <Avatar size="sm">
                      <AvatarFallback>
                        {getInitials(member.email)}
                      </AvatarFallback>
                    </Avatar>
                    <ItemContent>
                      <ItemTitle className="w-full truncate">
                        {member.email}
                      </ItemTitle>
                      {member.email === email && (
                        <ItemDescription>You</ItemDescription>
                      )}
                    </ItemContent>
                  </Item>
                ))}
              </ItemGroup>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </section>
  )
}
