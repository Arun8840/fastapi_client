import { useMutation } from "@tanstack/react-query";
import { tasksKeys } from "../keys/task-keys";
import { taskServices } from "../controller/tasks.service";




export const useTaskMutations = () => {

 const create = useMutation({
  mutationKey: tasksKeys.create,
  mutationFn: () => taskServices.create()
 })

 const remove = useMutation({
  mutationKey: tasksKeys.remove,
  mutationFn: (taskId: string) => taskServices.remove(taskId)
 })


 return { create, remove }
}