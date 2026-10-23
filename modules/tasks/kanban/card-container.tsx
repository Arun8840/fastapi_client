import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from 'cn';
import React from 'react';

interface KanbanCardContainerProps {
 children: React.ReactNode,
 title: string,
 description: string
 color: string
}
export default function KanbanCardContainer({ children, title, description, color }: KanbanCardContainerProps) {
 return (
  <Card className='h-fit'>
   <CardHeader>
    <CardTitle className='flex items-center gap-2'><span className={cn('size-2 rounded-full', color)} />{title}</CardTitle>
    <CardDescription>{description}</CardDescription>
   </CardHeader>
   <CardContent className='space-y-2'>
    {children}
   </CardContent>
  </Card>
 );
}