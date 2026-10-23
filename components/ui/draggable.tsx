"use client";

import { useDraggable } from "@dnd-kit/react";
import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

interface DraggableProps extends Omit<ComponentProps<"div">, "id"> {
  id: string | number;
  type?: string;
  disabled?: boolean;
}

export default function Draggable({
  id,
  type,
  disabled,
  className,
  children,
  ...props
}: DraggableProps) {
  const { ref, isDragging } = useDraggable({ id, type, disabled });

  return (
    <div
      ref={ref}
      data-dragging={isDragging || undefined}
      className={cn(
        "touch-none",
        isDragging && "cursor-grabbing opacity-50",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
