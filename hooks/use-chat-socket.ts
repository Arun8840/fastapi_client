"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"

import { resolveChatSocketUrl } from "@/service/controller/chat.service"
import type { ChatMessage, ChatSocketStatus, ChatUser } from "@/types"

const MAX_RECONNECT_ATTEMPTS = 6
const MAX_RECONNECT_DELAY = 15_000
const TYPING_TTL_MS = 4_000
const TYPING_THROTTLE_MS = 2_000

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

/**
 * Owns one websocket connection for the lifetime of the component.
 *
 * The server persists every message and broadcasts the stored row back to
 * everyone (including the sender). This hook keeps the *live* messages and the
 * typing indicator state; scrollback comes from the history query. History and
 * live messages are merged by id in the UI, which also makes reconnects
 * duplicate-free.
 */
export function useChatSocket() {
  const [status, setStatus] = useState<ChatSocketStatus>("connecting")
  const [messages, setMessages] = useState<ChatMessage[]>([])
  // userId -> { email, expiresAt }. Local expiry means a dropped "stop" frame
  // cannot leave someone "typing" forever.
  const [typing, setTyping] = useState<
    Record<string, { email: string; expiresAt: number }>
  >({})
  const [error, setError] = useState<string | null>(null)
  const [attempt, setAttempt] = useState(0)
  const socketRef = useRef<WebSocket | null>(null)
  const lastTypingSentRef = useRef(0)

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
            !isRecord(user) ||
            typeof user.id !== "string" ||
            typeof user.email !== "string"
          ) {
            return
          }

          const isTyping = frame.is_typing !== false
          const userId = user.id
          const userEmail = user.email
          setTyping((current) => {
            if (!isTyping) {
              if (!(userId in current)) return current
              const next = { ...current }
              delete next[userId]
              return next
            }

            return {
              ...current,
              [userId]: {
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

  const sendMessage = useCallback((content: string) => {
    const socket = socketRef.current
    const message = content.trim()

    if (!message || !socket || socket.readyState !== WebSocket.OPEN) {
      return false
    }

    socket.send(JSON.stringify({ content: message }))
    return true
  }, [])

  const sendTyping = useCallback((isTyping = true) => {
    const socket = socketRef.current

    if (!socket || socket.readyState !== WebSocket.OPEN) return

    if (isTyping) {
      // Throttle "started typing" frames so a burst of keystrokes does not
      // flood every other client. The stop frame always goes through.
      const now = Date.now()
      if (now - lastTypingSentRef.current < TYPING_THROTTLE_MS) return
      lastTypingSentRef.current = now
    } else {
      lastTypingSentRef.current = 0
    }

    socket.send(JSON.stringify({ type: "typing", is_typing: isTyping }))
  }, [])

  const typingUsers = useMemo<ChatUser[]>(
    () =>
      Object.entries(typing).map(([id, value]) => ({
        id,
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
