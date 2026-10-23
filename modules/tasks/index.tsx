"use client"


import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import ErrorState from '@/components/ui/error-state';
import { useGetTasks } from '@/service/query';
import { ListTodo, Plus } from 'lucide-react';
import KanbanRoot from './kanban';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ModalDrawer } from '@/components/ui/drawer/index';
import CreateTask from './create-task';
import { useDrawerState } from '@/hooks/use-drawer-state';

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

export function KanbanSkeleton() {
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
 const { open, isOpen, close, setIsOpen } = useDrawerState({
  value: "create-task"
 })
 const tasks = data?.data || []
 const isEmpty = Array.isArray(tasks) && tasks.length === 0
 const newTaskOrder = tasks?.length + 1

 if (isLoading) {
  return <KanbanSkeleton />
 }

 if (isError) {
  return <ErrorState message={error?.message} />
 }


 return (
  <div className="flex flex-1 flex-col gap-6 p-4">

   <ModalDrawer setOpen={setIsOpen} open={isOpen} title='Add a task' description='Create a new task'>
    <CreateTask newOrder={newTaskOrder} />
   </ModalDrawer>

   <div className='flex justify-between'>
    <div className="space-y-1">
     <h1 className="font-heading text-2xl font-semibold tracking-tight">
      Tasks
     </h1>
     <p className="text-sm text-muted-foreground">
      Keep track of the work that still needs to happen.
     </p>
    </div>

    {/* create task button */}
    <Button size={"lg"} type='button' onClick={open}>
     <Plus /> Create Task
    </Button>
   </div>

   {/* kanban board */}
   {
    isEmpty ?
     <EmptyComp />
     :
     <KanbanRoot values={tasks} />
   }
  </div>
 );
}