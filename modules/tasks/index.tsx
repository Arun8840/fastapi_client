"use client"


import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import ErrorState from '@/components/ui/error-state';
import LoadingState from '@/components/ui/loading-state';
import { useGetTasks } from '@/service/query';
import { ListTodo } from 'lucide-react';
import KanbanRoot from './kanban';
import { Skeleton } from '@/components/ui/skeleton';

function EmptyComp() {
 return <Empty className="flex-1 border">
  <EmptyHeader>
   <EmptyMedia variant="icon">
    <ListTodo />
   </EmptyMedia>
   <EmptyTitle>No tasks yet</EmptyTitle>
   <EmptyDescription>
    Tasks will show up here once they are created.
   </EmptyDescription>
  </EmptyHeader>
 </Empty>
}

function KanbanSkeleton() {
 return <div className='grid md:grid-cols-2 lg:grid-cols-4 gap-2 p-4'>
  <Skeleton className='col-span-full w-full h-20' />
  <Skeleton className='w-full h-20' />
  <Skeleton className='w-full h-40' />
  <Skeleton className='w-full h-60' />
  <Skeleton className='w-full h-80' />
 </div>
}
export default function TaskPageRoot() {
 const { data, isLoading, isError, error } = useGetTasks()

 const tasks = data?.data || []
 const isEmpty = Array.isArray(tasks) && tasks.length === 0

 if (isLoading) {
  return <KanbanSkeleton />
 }

 if (isError) {
  return <ErrorState message={error?.message} />
 }

 if (isEmpty) {
  return <EmptyComp />
 }
 return (
  <div className="flex flex-1 flex-col gap-6 p-4">
   <div className="space-y-1">
    <h1 className="font-heading text-2xl font-semibold tracking-tight">
     Tasks
    </h1>
    <p className="text-sm text-muted-foreground">
     Keep track of the work that still needs to happen.
    </p>
   </div>

   {/* kanban board */}
   <KanbanRoot values={tasks} />
  </div>
 );
}