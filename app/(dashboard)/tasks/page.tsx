import { ListTodo } from "lucide-react";

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

export default function TasksPage() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <div className="space-y-1">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Tasks
        </h1>
        <p className="text-sm text-muted-foreground">
          Keep track of the work that still needs to happen.
        </p>
      </div>

      <Empty className="flex-1 border">
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
    </div>
  );
}
