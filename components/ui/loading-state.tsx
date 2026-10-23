"use client"

import React, { ComponentProps } from 'react';
import { Spinner } from './spinner';
import { cn } from '@/lib/utils';


interface LoadingStateProps extends ComponentProps<"div"> {
 message?: string
}
export default function LoadingState({ className, message, children, ...props }: LoadingStateProps) {
 return (
  <div className={cn("flex h-screen w-full items-center justify-center", className)} {...props}>
   <Spinner />
   {message && <span className="ml-2">{message}</span>}
   {children}
  </div>
 );
}
LoadingState.displayName = "LoadingState";