"use client";

import { move } from "@dnd-kit/helpers";
import {
  DragDropProvider,
  type DragEndEvent,
  type DragOverEvent,
} from "@dnd-kit/react";
import { isSortable, useSortable } from "@dnd-kit/react/sortable";
import { Fragment, useEffect, useRef, useState } from "react";

import Droppable from "@/components/ui/droppable";
import { cn } from "@/lib/utils";
import type { TasksResponse, UpdateTaskStatusType } from "@/types";

import KanbanCardContainer from "./card-container";
import { useTaskMutations } from "@/service/mutations";
import { Inbox, Trash, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@base-ui/react";

interface KanbanRootProps {
  values: TasksResponse[];
}

type StatusEnum = "pending" | "in_progress" | "completed" | "cancelled";

type TaskState = Record<StatusEnum, TasksResponse[]>;

const TASK_TYPE = "task";
const COLUMN_COLLISION_PRIORITY = 1;

const kanbanBoards: {
  id: StatusEnum;
  title: string;
  description: string;
  color: string
}[] = [
    { id: "pending", title: "Pending", description: "Pending tasks", color: "bg-blue-500" },
    { id: "in_progress", title: "In Progress", description: "In Progress tasks", color: "bg-yellow-500" },
    { id: "completed", title: "Completed", description: "Completed tasks", color: "bg-green-500" },
    { id: "cancelled", title: "Cancelled", description: "Cancelled tasks", color: "bg-red-500" },
  ];

function createEmptyState(): TaskState {
  return {
    pending: [],
    in_progress: [],
    completed: [],
    cancelled: [],
  };
}

function groupTasksByStatus(values: TasksResponse[]): TaskState {
  const state = createEmptyState();

  for (const task of values) {
    const status = task.status as StatusEnum;

    if (state[status]) {
      state[status].push(task);
    }
  }

  return state;
}

function syncTaskStatuses(state: TaskState): TaskState {
  return Object.fromEntries(
    Object.entries(state).map(([status, tasks]) => [
      status,
      tasks.map((task) =>
        task.status === status ? task : { ...task, status },
      ),
    ]),
  ) as TaskState;
}

export default function KanbanRoot({ values }: KanbanRootProps) {
  const { update_status } = useTaskMutations()
  const [taskState, setTaskState] = useState<TaskState>(() =>
    groupTasksByStatus(values),
  );
  const previousState = useRef(taskState);
  const isUpdating = update_status.isPending

  useEffect(() => {
    setTaskState(groupTasksByStatus(values));
  }, [values]);

  const handleDragStart = () => {
    previousState.current = taskState;
  };

  const handleDragOver = (event: DragOverEvent) => {
    if (event.operation.source?.type !== TASK_TYPE) return;

    setTaskState((state) => syncTaskStatuses(move(state, event)));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { source, target } = event.operation;

    if (event.canceled) {
      setTaskState(previousState.current);
    }
    if (isSortable(target) && isSortable(source)) {
      const fromIndex = source.initialIndex;
      const toIndex = source.index;

      const payload = {
        task_id: source.id,
        from_index: fromIndex,
        to_index: toIndex,
        status: target.group,
      } as UpdateTaskStatusType

      update_status.mutate(payload)
    }
  };


  return (
    <DragDropProvider
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <section className="grid auto-rows-max gap-2 lg:grid-cols-4">
        {kanbanBoards.map((board) => {
          const taskItems = taskState[board.id]
          const hasItems = Array.isArray(taskItems) && taskItems?.length > 0
          return <Droppable
            key={board.id}
            id={board.id}
            accept={TASK_TYPE}
            collisionPriority={COLUMN_COLLISION_PRIORITY}
            className="h-fit rounded-xl"
          >
            <KanbanCardContainer
              title={board.title}
              // description={board.description}
              color={board?.color}
            >
              {hasItems ?
                <div className="w-full">
                  {
                    taskState[board.id].map((task, index) => (
                      <Fragment key={task?.id}>
                        <TaskListItem
                          key={task.id}
                          task={task}
                          index={index}
                          column={board.id}
                        />
                        <Separator orientation="horizontal" className="w-full h-px bg-muted my-1 last:hidden" />
                      </Fragment>
                    ))
                  }
                </div>
                :
                <div className="p-6 rounded-lg">
                  <p className="text-muted-foreground text-center text-sm flex flex-col items-center justify-center gap-2"><Inbox strokeWidth={1.3} />No tasks</p>
                </div>
              }
            </KanbanCardContainer>

          </Droppable>
        })}
      </section>
    </DragDropProvider>
  );
}

function TaskListItem({
  task,
  index,
  column,
}: {
  task: TasksResponse;
  index: number;
  column: StatusEnum;
}) {
  const { ref, isDragging, isDropTarget } = useSortable({
    id: task.id,
    index,
    group: column,
    type: TASK_TYPE,
    accept: TASK_TYPE,
  });

  return (
    <div
      ref={ref}
      data-dragging={isDragging || undefined}
      className={cn(
        "cursor-grab touch-none space-y-2 p-2 hover:bg-secondary transition-colors group/list_item rounded",
        isDragging && "cursor-grabbing bg-primary/50",
        isDropTarget && "ring ring-primary/40",
      )}
    >
      <div className="flex">
        <h1 className="flex items-center gap-2 text-base font-medium flex-1 truncate">
          <span className="text-sm font-normal text-muted-foreground">
            {index + 1}.
          </span>
          {task.title}
        </h1>
        <Button type="button" className="opacity-0 group-hover/list_item:opacity-100 transition-opacity" variant={"ghost"} size={"icon"}>
          <Trash className="text-muted-foreground" />
        </Button>
      </div>
      <p className="text-sm text-muted-foreground">{task.description}</p>
    </div>
  );
}
