

export interface TasksResponse {
  id: string,
  user_id: string,
  create_at: string,
  update_at: string,
  is_completed: boolean,
  due_date: string | null,
  priority: string,
  status: string,
  title: string,
  description: string
  order: number
}


export interface CreateTaskInputType {
  title: string,
  description?: string,
  due_date?: string | null,
  status?: string,
  order?: number
}


export interface UpdateTaskStatusType {
  task_id: string,
  status: string,
  from_index: number,
  to_index: number
}