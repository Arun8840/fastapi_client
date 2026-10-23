import { useMutation, useQueryClient } from "@tanstack/react-query";
import { tasksKeys } from "../keys/task-keys";
import { taskServices } from "../controller/tasks.service";
import { UpdateTaskStatusType, CreateTaskInputType } from "@/types";




export const useTaskMutations = () => {
 const queryClient = useQueryClient()

 const create = useMutation({
  mutationKey: tasksKeys.create,
  mutationFn: (data: CreateTaskInputType) => taskServices.create(data),
  onSuccess() {
   queryClient.invalidateQueries({ queryKey: tasksKeys.all })
  },
 })

 const remove = useMutation({
  mutationKey: tasksKeys.remove,
  mutationFn: (taskId: string) => taskServices.remove(taskId),
  onSuccess() {
   queryClient.invalidateQueries({ queryKey: tasksKeys.all })
  },
 })

 const update_status = useMutation({
  mutationKey: tasksKeys.update_status,
  mutationFn: (payload: UpdateTaskStatusType) => taskServices.update_status(payload)
 })


 return { create, remove, update_status }
}