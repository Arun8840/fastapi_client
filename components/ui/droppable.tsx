"use client";

import { useDroppable } from "@dnd-kit/react";
import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

interface DroppableProps extends Omit<ComponentProps<"div">, "id"> {
  id: string | number;
  accept?: string | string[];
  type?: string;
  collisionPriority?: number;
}

export default function Droppable({
  id,
  accept,
  type,
  collisionPriority,
  className,
  children,
  ...props
}: DroppableProps) {
  const { ref, isDropTarget } = useDroppable({
    id,
    accept,
    type,
    collisionPriority,
  });

  return (
    <div
      ref={ref}
      data-drop-target={isDropTarget || undefined}
      className={cn(
        "transition-colors",
        isDropTarget && "ring-2 ring-primary/40",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
