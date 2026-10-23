


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
}