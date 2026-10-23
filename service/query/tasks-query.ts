import { useQuery } from "@tanstack/react-query"
import { tasksKeys } from "../keys/task-keys"
import { taskServices } from "../controller/tasks.service"


export const useGetTasks = () => {
 return useQuery({
  queryKey: tasksKeys.all,
  queryFn: () => taskServices.getTasks(),
 })
}