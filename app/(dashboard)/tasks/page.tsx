import { Suspense } from "react";

import TaskPageRoot, { KanbanSkeleton } from "@/modules/tasks";

export default function TasksPage() {
  return (
    <Suspense fallback={<KanbanSkeleton />}>
      <TaskPageRoot />
    </Suspense>
  );
}
