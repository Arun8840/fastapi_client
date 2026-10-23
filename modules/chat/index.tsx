"use client";

import { useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  History,
  Loader2,
  MessageSquarePlus,
  MessagesSquare,
  PanelLeft,
  RefreshCw,
  SendHorizontal,
  TriangleAlert,
  Users,
} from "lucide-react";
import Link from "next/link";
import {
  type FormEvent,
  type KeyboardEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Bubble, BubbleContent } from "@/components/ui/bubble";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from "@/components/ui/item";
import {
  Message,
  MessageAvatar,
  MessageContent,
  MessageFooter,
  MessageHeader,
} from "@/components/ui/message";
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@/components/ui/message-scroller";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useChatSocket } from "@/hooks/use-chat-socket";
import { cn } from "@/lib/utils";
import { getApiErrorMessage } from "@/service/controller/api-client";
import { chatKeys } from "@/service/keys/chat-keys";
import {
  useChatMessages,
  useChatUsers,
  useConversations,
  useCurrentUser,
  useMarkConversationRead,
  useStartDirectConversation,
} from "@/service/query";
import type {
  ChatMessage,
  ChatSocketStatus,
  Conversation,
  ConversationKind,
} from "@/types";

const STATUS: Record<ChatSocketStatus, { label: string; dot: string }> = {
  open: { label: "Live", dot: "bg-emerald-500" },
  connecting: { label: "Connecting", dot: "animate-pulse bg-amber-500" },
  closed: { label: "Offline", dot: "bg-zinc-400" },
  error: { label: "Error", dot: "bg-red-500" },
};

const timeFormatter = new Intl.DateTimeFormat(undefined, {
  hour: "numeric",
  minute: "2-digit",
});

function formatTime(value: string) {
  return timeFormatter.format(new Date(value));
}

function getInitials(email: string) {
  const name = email.split("@")[0] ?? email;
  const parts = name.split(/[.\-_ ]+/).filter(Boolean);
  const initials = parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  return initials || "?";
}

function formatTyping(emails: string[]) {
  const names = emails.map((email) => email.split("@")[0] ?? email);

  if (names.length === 1) return `${names[0]} is typing…`;
  if (names.length === 2) return `${names[0]} and ${names[1]} are typing…`;
  return `${names[0]} and ${names.length - 1} others are typing…`;
}

/** The person on the other side of a DM; the room has no single counterpart. */
function getCounterpart(conversation: Conversation, email?: string) {
  if (conversation.kind === "room") return null;
  return (
    conversation.participants.find((item) => item.email !== email) ??
    conversation.participants[0] ??
    null
  );
}

function conversationTitle(conversation: Conversation, email?: string) {
  if (conversation.kind === "room") return "Room";
  return getCounterpart(conversation, email)?.email ?? "Direct message";
}

function MessageRow({
  message,
  mine,
}: {
  message: ChatMessage;
  mine: boolean;
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
  );
}

function ConversationIcon({
  conversation,
  email,
}: {
  conversation: Conversation;
  email?: string;
}) {
  if (conversation.kind === "room") {
    return (
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <MessagesSquare className="size-5" />
      </span>
    );
  }

  const counterpart = getCounterpart(conversation, email);
  return (
    <Avatar>
      <AvatarFallback>{getInitials(counterpart?.email ?? "?")}</AvatarFallback>
    </Avatar>
  );
}

function ConversationRow({
  conversation,
  email,
  active,
  onSelect,
}: {
  conversation: Conversation;
  email?: string;
  active: boolean;
  onSelect: () => void;
}) {
  const lastMessage = conversation.last_message;
  const counterpart = getCounterpart(conversation, email);
  const title =
    conversation.kind === "room"
      ? "Room"
      : (counterpart?.email ?? "Direct message");
  // While a thread is open its messages are being read, so do not flash a badge
  // before the server round-trip clears it.
  const unread = active ? 0 : conversation.unread_count;
  const preview = lastMessage
    ? `${lastMessage.user.email === email ? "You: " : ""}${lastMessage.content}`
    : conversation.kind === "room"
      ? "Everyone in the workspace"
      : "No messages yet";

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-current={active ? "true" : undefined}
      className={cn(
        "flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition-colors hover:bg-muted/70",
        active && "bg-muted",
      )}
    >
      <ConversationIcon conversation={conversation} email={email} />
      <span className="min-w-0 flex-1">
        <span className="flex items-baseline gap-2">
          <span className="truncate text-sm font-medium">{title}</span>
          {lastMessage && (
            <span className="ml-auto shrink-0 text-[11px] text-muted-foreground">
              {formatTime(lastMessage.created_at)}
            </span>
          )}
        </span>
        <span className="mt-0.5 flex items-center gap-2">
          <span className="truncate text-xs text-muted-foreground">
            {preview}
          </span>
          {unread > 0 && (
            <Badge className="ml-auto h-5 min-w-5 shrink-0 justify-center tabular-nums">
              {unread > 99 ? "99+" : unread}
            </Badge>
          )}
        </span>
      </span>
    </button>
  );
}

function ConversationListSkeleton() {
  return (
    <div className="space-y-1 p-2">
      {[0, 1, 2, 3].map((index) => (
        <div key={index} className="flex items-center gap-3 rounded-lg p-2">
          <Skeleton className="size-9 rounded-lg" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-3.5 w-32" />
            <Skeleton className="h-3 w-44" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ChatRoom({ embedded = false }: { embedded?: boolean }) {
  const queryClient = useQueryClient();
  const { data: user } = useCurrentUser();
  const email = user?.data?.email;
  const {
    status,
    messages: liveFrames,
    typingUsers,
    error,
    reconnect,
    sendMessage,
    sendTyping,
  } = useChatSocket();
  const {
    data: conversationsData,
    isPending: isConversationsPending,
    isError: isConversationsError,
    refetch: refetchConversations,
  } = useConversations();
  const {
    data: users,
    isPending: isUsersPending,
    isError: isUsersError,
    refetch: refetchUsers,
  } = useChatUsers();
  const startDirect = useStartDirectConversation();
  const { mutate: markRead } = useMarkConversationRead();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [mobileList, setMobileList] = useState(false);
  const [draft, setDraft] = useState("");
  const [peopleOpen, setPeopleOpen] = useState(false);
  const handledMessageRef = useRef<string | null>(null);

  const conversations = useMemo(
    () => conversationsData?.data ?? [],
    [conversationsData],
  );
  const room = useMemo(
    () => conversations.find((item) => item.kind === "room"),
    [conversations],
  );
  // Before the user picks a thread, the room is the default.
  const activeConversation = useMemo(
    () => conversations.find((item) => item.id === activeId) ?? room ?? null,
    [conversations, activeId, room],
  );
  const activeConversationId = activeConversation?.id ?? null;
  const counterpart = activeConversation
    ? getCounterpart(activeConversation, email)
    : null;
  const activeTitle = activeConversation
    ? conversationTitle(activeConversation, email)
    : "Chat";

  const {
    data: history,
    isPending: isHistoryPending,
    isError: isHistoryError,
    refetch: refetchHistory,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useChatMessages(activeConversationId);

  /**
   * Pages arrive newest-first ([page0 = newest]). Reverse the page order, then
   * reverse each page, to get one ascending timeline for rendering.
   */
  const historyMessages = useMemo(() => {
    if (!history) return [];

    return [...history.pages]
      .reverse()
      .flatMap((page) => [...(page.data?.items ?? [])].reverse());
  }, [history]);

  const liveMessages = useMemo(
    () =>
      liveFrames.filter(
        (message) => message.conversation_id === activeConversationId,
      ),
    [liveFrames, activeConversationId],
  );

  /**
   * History and live frames overlap: a message that arrived over the socket is
   * also stored in the DB, so a later history fetch (or reconnect) will include
   * it. Dedupe by the server-issued id and sort chronologically.
   */
  const messages = useMemo(() => {
    const byId = new Map<string, ChatMessage>();

    for (const message of historyMessages) byId.set(message.id, message);
    for (const message of liveMessages) byId.set(message.id, message);

    return [...byId.values()].sort((a, b) => {
      const delta = Date.parse(a.created_at) - Date.parse(b.created_at);
      return delta !== 0 ? delta : a.id.localeCompare(b.id);
    });
  }, [historyMessages, liveMessages]);

  // A message for the open thread means it has been read; anything else only
  // refreshes the sidebar preview and its unread badge.
  const lastFrame = liveFrames.at(-1);
  useEffect(() => {
    if (!lastFrame || handledMessageRef.current === lastFrame.id) return;
    handledMessageRef.current = lastFrame.id;

    if (lastFrame.conversation_id === activeConversationId) {
      markRead(lastFrame.conversation_id);
    } else {
      void queryClient.invalidateQueries({ queryKey: chatKeys.conversations });
    }
  }, [lastFrame, activeConversationId, markRead, queryClient]);

  const connected = status === "open";
  const statusInfo = STATUS[status];
  // The server already excludes the sender, but filtering here also covers two
  // tabs signed in with the same account.
  const typers = useMemo(
    () =>
      typingUsers.filter(
        (typer) =>
          typer.conversationId === activeConversationId &&
          typer.email !== email,
      ),
    [typingUsers, activeConversationId, email],
  );
  // Put yourself first, then sort everyone else alphabetically.
  const members = useMemo(() => {
    const list = users?.data ?? [];

    return [...list].sort((a, b) => {
      if (a.email === b.email) return 0;
      if (a.email === email) return -1;
      if (b.email === email) return 1;
      return a.email.localeCompare(b.email);
    });
  }, [users, email]);

  const selectConversation = (conversationId: string) => {
    if (conversationId === activeConversationId) {
      setMobileList(false);
      return;
    }
    if (activeConversationId) sendTyping(false, activeConversationId);
    setActiveId(conversationId);
    setDraft("");
    setMobileList(false);
  };

  const openDirect = (memberId: string) => {
    startDirect.mutate(memberId, {
      onSuccess: (response) => {
        const conversation = response.data;
        if (!conversation) return;
        if (activeConversationId) sendTyping(false, activeConversationId);
        setActiveId(conversation.id);
        setDraft("");
        setMobileList(false);
        setPeopleOpen(false);
      },
    });
  };

  const submit = () => {
    if (!activeConversationId) return;
    // Clear the indicator immediately instead of waiting for the TTL.
    sendTyping(false, activeConversationId);
    if (!sendMessage(draft, activeConversationId)) return;
    setDraft("");
  };

  const handleChange = (value: string) => {
    setDraft(value);
    if (activeConversationId) {
      sendTyping(value.trim().length > 0, activeConversationId);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    submit();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submit();
    }
  };

  return (
    <section
      className={cn(
        "flex flex-col bg-muted/30",
        embedded ? "min-h-0 flex-1" : "h-svh",
      )}
    >
      <div className="flex min-h-0 w-full flex-1">
        <div className="flex min-h-0 flex-1 overflow-hidden">
          <aside
            className={cn(
              "w-full shrink-0 flex-col border-r md:flex md:w-72",
              mobileList ? "flex" : "hidden",
            )}
          >
            <header className="flex shrink-0 items-center gap-2 border-b px-4 py-3">
              <div className="min-w-0 flex-1">
                <h2 className="font-heading text-base font-semibold tracking-tight">
                  Messages
                </h2>
                <p className="truncate text-xs text-muted-foreground">
                  Room and direct chats
                </p>
              </div>
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
            </header>

            <div className="min-h-0 flex-1 overflow-y-auto">
              {isConversationsPending ? (
                <ConversationListSkeleton />
              ) : isConversationsError ? (
                <div className="flex flex-col items-center gap-3 p-6 text-center">
                  <TriangleAlert className="size-5 text-destructive" />
                  <p className="text-sm text-muted-foreground">
                    Could not load conversations.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => void refetchConversations()}
                  >
                    <RefreshCw />
                    Retry
                  </Button>
                </div>
              ) : conversations.length === 0 ? (
                <p className="p-6 text-center text-sm text-muted-foreground">
                  No conversations yet.
                </p>
              ) : (
                <nav
                  aria-label="Conversations"
                  className="flex flex-col gap-0.5 p-2"
                >
                  {conversations.map((conversation) => (
                    <ConversationRow
                      key={conversation.id}
                      conversation={conversation}
                      email={email}
                      active={conversation.id === activeConversationId}
                      onSelect={() => selectConversation(conversation.id)}
                    />
                  ))}
                </nav>
              )}
            </div>
          </aside>

          <div
            className={cn(
              "min-w-0 flex-1 flex-col",
              mobileList ? "hidden md:flex" : "flex",
            )}
          >
            <header className="flex shrink-0 items-center gap-3 border-b px-4 py-3">
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="md:hidden"
                aria-label="Show conversations"
                onClick={() => setMobileList(true)}
              >
                <PanelLeft />
              </Button>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h1 className="truncate font-heading text-base font-semibold tracking-tight">
                    {activeTitle}
                  </h1>
                  <ConversationKindBadge
                    kind={activeConversation?.kind ?? "room"}
                  />
                </div>
                <p className="truncate text-xs text-muted-foreground">
                  {counterpart
                    ? "Private conversation"
                    : email
                      ? `Signed in as ${email}`
                      : "Loading your session…"}
                </p>
              </div>
              <Badge variant="outline" className="gap-1.5">
                <span className={cn("size-2 rounded-full", statusInfo.dot)} />
                {statusInfo.label}
              </Badge>
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
              {activeConversationId ? (
                <MessageScrollerProvider
                  key={activeConversationId}
                  autoScroll
                  defaultScrollPosition="end"
                >
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
                                  {counterpart
                                    ? `Say hello to ${counterpart.email.split("@")[0]}.`
                                    : "Send the first message, or open this page in a second browser to watch it arrive live."}
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
                                mine={
                                  Boolean(email) && message.user.email === email
                                }
                              />
                            ))}
                          </>
                        )}
                      </MessageScrollerContent>
                    </MessageScrollerViewport>
                    <MessageScrollerButton direction="end" />
                  </MessageScroller>
                </MessageScrollerProvider>
              ) : (
                <div className="m-auto flex flex-col items-center gap-3 p-6 text-center">
                  {isConversationsPending ? (
                    <>
                      <Loader2 className="size-5 animate-spin text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Loading conversations…
                      </p>
                    </>
                  ) : (
                    <>
                      <MessagesSquare className="size-5 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Select a conversation to start chatting.
                      </p>
                    </>
                  )}
                </div>
              )}
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
                  onBlur={() => {
                    if (activeConversationId) {
                      sendTyping(false, activeConversationId);
                    }
                  }}
                  placeholder={
                    !activeConversationId
                      ? "Select a conversation…"
                      : !connected
                        ? "Waiting for a connection…"
                        : activeConversation?.kind === "room"
                          ? "Message the room…"
                          : `Message ${counterpart?.email.split("@")[0] ?? "this person"}…`
                  }
                  disabled={!connected || !activeConversationId}
                  rows={1}
                  aria-label="Message"
                  className="max-h-40 min-h-10 resize-none py-2"
                />
                <Button
                  type="submit"
                  size="icon-lg"
                  disabled={
                    !connected ||
                    !activeConversationId ||
                    draft.trim().length === 0
                  }
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
      </div>

      <Sheet open={peopleOpen} onOpenChange={setPeopleOpen}>
        <SheetContent side="right" className="gap-0">
          <SheetHeader className="border-b">
            <SheetTitle>People</SheetTitle>
            <SheetDescription>
              Message anyone directly, or keep talking in the shared room.
            </SheetDescription>
          </SheetHeader>
          <div className="min-h-0 flex-1 overflow-y-auto p-2">
            {startDirect.isError && (
              <p className="mb-2 flex items-center gap-1.5 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                <TriangleAlert className="size-3.5 shrink-0" />
                {getApiErrorMessage(startDirect.error)}
              </p>
            )}
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
                {members.map((member) => {
                  const isSelf = member.email === email;
                  const isStarting =
                    startDirect.isPending &&
                    startDirect.variables === member.id;

                  return (
                    <Item
                      key={member.id}
                      size="sm"
                      variant={isSelf ? "muted" : "default"}
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
                        {isSelf && <ItemDescription>You</ItemDescription>}
                      </ItemContent>
                      {!isSelf && (
                        <ItemActions>
                          <Button
                            type="button"
                            variant="outline"
                            size="xs"
                            disabled={isStarting}
                            onClick={() => openDirect(member.id)}
                          >
                            {isStarting ? (
                              <Loader2 className="animate-spin" />
                            ) : (
                              <MessageSquarePlus />
                            )}
                            Message
                          </Button>
                        </ItemActions>
                      )}
                    </Item>
                  );
                })}
              </ItemGroup>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </section>
  );
}

function ConversationKindBadge({ kind }: { kind: ConversationKind }) {
  if (kind === "direct") {
    return (
      <Badge variant="secondary" className="shrink-0">
        Direct
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="shrink-0">
      Room
    </Badge>
  );
}
