"use client";

import { cn } from "cn";
import type React from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "../sheet";

interface ModalComponentProps {
  children: React.ReactNode;
  title: string;
  description?: string;
  open: boolean;
  setOpen: (value: boolean) => void;
  direction?: "top" | "bottom" | "left" | "right";
  className?: string;
  overlay?: boolean;
  modal?: boolean;
  disableAutoFocus?: boolean;
  dismissOnOutside?: boolean;
}

const baseClass = "max-h-full flex-1 flex flex-col gap-2 overflow-y-auto";

export const ModalDrawer = ({
  children,
  open,
  title,
  description,
  setOpen,
  direction = "right",
  className,
  overlay = true,
  modal = true,
  disableAutoFocus = false,
  dismissOnOutside = true,
}: ModalComponentProps) => {
  return (
    <Sheet
      open={open}
      onOpenChange={setOpen}
      modal={modal}
      disablePointerDismissal={!dismissOnOutside}
    >
      <SheetContent
        side={direction}
        overlay={overlay}
        initialFocus={disableAutoFocus ? false : undefined}
      >
        <SheetHeader>
          <SheetTitle className="capitalize">{title}</SheetTitle>
          {description && (
            <SheetDescription >{description}</SheetDescription>
          )}
        </SheetHeader>
        <div className={cn(baseClass, className)}>
          <div className="h-full">{children}</div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
