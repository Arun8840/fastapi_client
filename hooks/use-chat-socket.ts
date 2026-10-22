"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"

import { resolveChatSocketUrl } from "@/service/controller/chat.service"
import type { ChatMessage, ChatSocketStatus } from "@/types"

const MAX_RECONNECT_ATTEMPTS = 6
const MAX_RECONNECT_DELAY = 15_000
const TYPING_TTL_MS = 4_000
const TYPING_THROTTLE_MS = 2_000

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

export interface ChatTypingUser {
  conversationId: string
  id: string
  email: string
}

interface TypingEntry {
  conversationId: string
  userId: string
  email: string
  expiresAt: number
}

/**
 * Owns one websocket connection for the lifetime of the component.
 *
 * The socket is conversation-agnostic: it carries every frame this user is
 * allowed to see (the room plus their DMs). Frames are tagged with a
 * `conversation_id`, and the UI filters them. That means switching threads
 * never reconnects the socket, and a message for a background thread still
 * refreshes the sidebar.
 */
export function useChatSocket() {
  const [status, setStatus] = useState<ChatSocketStatus>("connecting")
  const [messages, setMessages] = useState<ChatMessage[]>([])
  // `${conversationId}:${userId}` -> entry. Local expiry means a dropped "stop"
  // frame cannot leave someone "typing" forever.
  const [typing, setTyping] = useState<Record<string, TypingEntry>>({})
  const [error, setError] = useState<string | null>(null)
  const [attempt, setAttempt] = useState(0)
  const socketRef = useRef<WebSocket | null>(null)
  // Last "started typing" time per conversation, so a burst of keystrokes in
  // one thread cannot starve another thread's indicator.
  const lastTypingSentRef = useRef<Record<string, number>>({})

  // Drop expired typers even if the server never sends a stop event.
  useEffect(() => {
    const interval = setInterval(() => {
      setTyping((current) => {
        const now = Date.now()
        const alive = Object.entries(current).filter(
          ([, value]) => value.expiresAt > now,
        )
        if (alive.length === Object.keys(current).length) return current
        return Object.fromEntries(alive)
      })
    }, 1_000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    // `attempt` is a reconnect trigger: bumping it tears down the current
    // socket and starts a fresh connection.
    void attempt

    let disposed = false
    let socket: WebSocket | null = null
    let reconnectTimer: ReturnType<typeof setTimeout> | undefined
    let failures = 0

    const connect = () => {
      if (disposed) return

      setStatus("connecting")
      socket = new WebSocket(resolveChatSocketUrl())
      socketRef.current = socket

      socket.onopen = () => {
        if (disposed) return
        failures = 0
        setError(null)
        setTyping({})
        lastTypingSentRef.current = {}
        setStatus("open")
      }

      socket.onmessage = (event) => {
        if (typeof event.data !== "string") return

        let frame: unknown
        try {
          frame = JSON.parse(event.data)
        } catch {
          return
        }
        if (!isRecord(frame)) return

        if (frame.type === "error") {
          setError(
            typeof frame.detail === "string" ? frame.detail : "Message rejected.",
          )
          return
        }

        if (frame.type === "typing") {
          const user = frame.user
          if (
            typeof frame.conversation_id !== "string" ||
            !isRecord(user) ||
            typeof user.id !== "string" ||
            typeof user.email !== "string"
          ) {
            return
          }

          const isTyping = frame.is_typing !== false
          const conversationId = frame.conversation_id
          const userId = user.id
          const userEmail = user.email
          const key = `${conversationId}:${userId}`
          setTyping((current) => {
            if (!isTyping) {
              if (!(key in current)) return current
              const next = { ...current }
              delete next[key]
              return next
            }

            return {
              ...current,
              [key]: {
                conversationId,
                userId,
                email: userEmail,
                expiresAt: Date.now() + TYPING_TTL_MS,
              },
            }
          })
          return
        }

        if (frame.type !== "message") return

        const user = frame.user
        if (
          typeof frame.id !== "string" ||
          typeof frame.conversation_id !== "string" ||
          typeof frame.content !== "string" ||
          typeof frame.created_at !== "string" ||
          !isRecord(user) ||
          typeof user.id !== "string" ||
          typeof user.email !== "string"
        ) {
          return
        }

        const message: ChatMessage = {
          id: frame.id,
          conversation_id: frame.conversation_id,
          content: frame.content,
          created_at: frame.created_at,
          user: { id: user.id, email: user.email },
        }

        // A reconnect can replay frames we already rendered; ids are the
        // server's UUIDs, so this is a cheap and exact dedupe.
        setMessages((current) =>
          current.some((item) => item.id === message.id)
            ? current
            : [...current, message],
        )
        // Seeing the message means the author stopped typing.
        setTyping((current) => {
          const key = `${message.conversation_id}:${message.user.id}`
          if (!(key in current)) return current
          const next = { ...current }
          delete next[key]
          return next
        })
        setError(null)
      }

      socket.onerror = () => {
        if (!disposed) setStatus("error")
      }

      socket.onclose = () => {
        if (disposed) return

        setStatus("closed")
        failures += 1

        if (failures > MAX_RECONNECT_ATTEMPTS) {
          setError("Could not reconnect to the chat server.")
          return
        }

        const delay = Math.min(500 * 2 ** (failures - 1), MAX_RECONNECT_DELAY)
        reconnectTimer = setTimeout(connect, delay)
      }
    }

    connect()

    return () => {
      disposed = true
      if (reconnectTimer) clearTimeout(reconnectTimer)
      socketRef.current = null
      socket?.close()
    }
  }, [attempt])

  const reconnect = useCallback(() => {
    setError(null)
    setStatus("connecting")
    setAttempt((value) => value + 1)
  }, [])

  const sendMessage = useCallback(
    (content: string, conversationId: string) => {
      const socket = socketRef.current
      const message = content.trim()

      if (!message || !socket || socket.readyState !== WebSocket.OPEN) {
        return false
      }

      socket.send(
        JSON.stringify({ content: message, conversation_id: conversationId }),
      )
      return true
    },
    [],
  )

  const sendTyping = useCallback(
    (isTyping: boolean, conversationId: string) => {
      const socket = socketRef.current

      if (!socket || socket.readyState !== WebSocket.OPEN) return

      if (isTyping) {
        // Throttle "started typing" frames so a burst of keystrokes does not
        // flood every other client. The stop frame always goes through.
        const now = Date.now()
        const last = lastTypingSentRef.current[conversationId] ?? 0
        if (now - last < TYPING_THROTTLE_MS) return
        lastTypingSentRef.current[conversationId] = now
      } else {
        lastTypingSentRef.current[conversationId] = 0
      }

      socket.send(
        JSON.stringify({
          type: "typing",
          conversation_id: conversationId,
          is_typing: isTyping,
        }),
      )
    },
    [],
  )

  const typingUsers = useMemo<ChatTypingUser[]>(
    () =>
      Object.values(typing).map((value) => ({
        id: value.userId,
        conversationId: value.conversationId,
        email: value.email,
      })),
    [typing],
  )

  return {
    status,
    messages,
    typingUsers,
    error,
    reconnect,
    sendMessage,
    sendTyping,
  }
}
