"use client"

import React, { ComponentProps } from 'react';
import { Spinner } from './spinner';
import { cn } from '@/lib/utils';
import { AlertCircle } from 'lucide-react';


interface ErrorStateProps extends ComponentProps<"div"> {
 message?: string
}
export default function ErrorState({ className, message, children, ...props }: ErrorStateProps) {
 return (
  <div className={cn("flex flex-col h-screen w-full items-center justify-center", className)} {...props}>
   <AlertCircle className="text-red-500" />
   <small>{message ?? "Something went wrong"}</small>
   {children}
  </div>
 );
}
ErrorState.displayName = "ErrorState";