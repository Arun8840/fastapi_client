"use client"

import { useCallback, useEffect, useRef, useState } from "react"

import { resolveChatSocketUrl } from "@/service/controller/chat.service"
import type { ChatMessage, ChatSocketStatus } from "@/types"

const MAX_RECONNECT_ATTEMPTS = 6
const MAX_RECONNECT_DELAY = 15_000

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}


export function useChatSocket() {
  const [status, setStatus] = useState<ChatSocketStatus>("connecting")
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [error, setError] = useState<string | null>(null)
  const [attempt, setAttempt] = useState(0)
  const socketRef = useRef<WebSocket | null>(null)

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

  return { status, messages, error, reconnect, sendMessage }
}
