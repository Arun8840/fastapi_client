"use client"

import { parseAsBoolean, useQueryState } from "nuqs"

interface CreateProjectModalProps {
  value: string
}
export const useDrawerState = ({
  value = "create",
}: CreateProjectModalProps) => {
  const [isOpen, setIsOpen] = useQueryState(
    value,
    parseAsBoolean.withDefault(false),
  )

  const open = () => setIsOpen(true)
  const close = () => setIsOpen(false)

  return {
    isOpen,
    open,
    close,
    setIsOpen,
  }
}
