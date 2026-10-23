import { TasksResponse } from "@/types";
import KanbanCardContainer from "./card-container";
import { useState } from "react";

interface KanbanRootProps {
  values: TasksResponse[];
}

type StatusEnum = "pending" | "in_progress" | "completed" | "cancelled";

type TaskStateType = {
  [key in StatusEnum]: TasksResponse[];
};

const kanbanBoards = [
  {
    id: 1,
    title: "Pending",
    description: "Pending tasks",
    status: "pending",
  },
  {
    id: 2,
    title: "In Progress",
    description: "In Progress tasks",
    status: "in_progress",
  },
  {
    id: 3,
    title: "Completed",
    description: "Completed tasks",
    status: "completed",
  },
  {
    id: 4,
    title: "Cancelled",
    description: "Cancelled tasks",
    status: "cancelled",
  },
]

export default function KanbanRoot({ values }: KanbanRootProps) {

  const [taskState, setTaskState] = useState<TaskStateType>(() => {
    const initialState: TaskStateType = {
      pending: [],
      in_progress: [],
      completed: [],
      cancelled: []
    }
    values.forEach((task) => {
      if (initialState[task.status as StatusEnum]) {
        initialState[task.status as StatusEnum].push(task);
      }
    })
    return initialState
  })

  return (
    <section className="grid gap-2 lg:grid-cols-4 auto-rows-max">
      {kanbanBoards.map((board) => {
        const tasks = taskState[board.status as StatusEnum]
        return (
          <KanbanCardContainer key={String(board.id)} title={board.title} description={board.description}>
            {tasks.map((task, taskIdx) => (
              <TaskListItem key={task.id} task={task} taskIdx={taskIdx} />
            ))}
          </KanbanCardContainer>
        )
      })}
    </section>
  );
}


function TaskListItem({ task, taskIdx }: { task: TasksResponse, taskIdx: number }) {
  return (
    <div key={task.id} className="space-y-2 border p-2 bg-card rounded-lg">
      <h1 className="font-medium text-base flex items-center gap-2"><span className="text-muted-foreground text-sm font-normal">{taskIdx + 1}.</span>{task?.title}</h1>
      <p className="text-muted-foreground text-sm">{task?.description}</p>
    </div>
  )
}