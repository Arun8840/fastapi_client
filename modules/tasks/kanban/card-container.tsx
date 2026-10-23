import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import React from 'react';

interface KanbanCardContainerProps {
 children: React.ReactNode,
 title: string,
 description: string
}
export default function KanbanCardContainer({ children, title, description }: KanbanCardContainerProps) {
 return (
  <Card className='h-fit'>
   <CardHeader>
    <CardTitle>{title}</CardTitle>
    <CardDescription>{description}</CardDescription>
   </CardHeader>
   <CardContent className='space-y-2'>
    {children}
   </CardContent>
  </Card>
 );
}