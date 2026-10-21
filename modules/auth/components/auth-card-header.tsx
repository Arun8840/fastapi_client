import type { LucideIcon } from "lucide-react"

import { CardDescription, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type AuthCardHeaderProps = {
 icon: LucideIcon
 title: string
 description: React.ReactNode
 eyebrow?: string
 className?: string
}

export function AuthCardHeader({
 icon: Icon,
 title,
 description,
 eyebrow,
 className,
}: AuthCardHeaderProps) {
 return (
  <div className={cn("space-y-4", className)}>
   <div className='flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15'>
    <Icon className='size-5' />
   </div>
   <div className='space-y-1.5'>
    {eyebrow ? (
     <p className='text-xs font-medium uppercase tracking-wider text-muted-foreground'>{eyebrow}</p>
    ) : null}
    <CardTitle className='text-xl font-semibold tracking-tight'>{title}</CardTitle>
    <CardDescription>{description}</CardDescription>
   </div>
  </div>
 )
}
