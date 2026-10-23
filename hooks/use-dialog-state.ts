import { parseAsBoolean, useQueryState } from "nuqs"

interface DialogStateProps {
  value: string
}
export const useDialogState = ({
  value = "sample-value",
}: DialogStateProps) => {
  const [isOpen, setIsOpen] = useQueryState(
    value,
    parseAsBoolean.withDefault(false).withOptions({ clearOnDefault: true }),
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
