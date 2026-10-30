import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from 'cn';
import { Check } from 'lucide-react';
import React from 'react';

interface KanbanCardContainerProps {
 children: React.ReactNode,
 title: string,
 color: string,
 icon: React.ReactNode
}
export default function KanbanCardContainer({ children, title, color, icon }: KanbanCardContainerProps) {

 return (
  <Card className={cn('h-fit', "bg-secondary")}>
   <CardHeader>
    <CardTitle className='flex items-center gap-2'>
     <Button style={{ color: color, borderColor: color }} type='button' disabled variant={"outline"} size={"icon"}>
      {icon}
     </Button>
     <h1>{title}</h1>
    </CardTitle>
    {/* <CardDescription>{description}</CardDescription> */}
   </CardHeader>
   <CardContent className='space-y-2'>
    {children}
   </CardContent>
  </Card>
 );
}