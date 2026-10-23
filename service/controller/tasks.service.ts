import { ApiResponse, TasksResponse } from "@/types"
import { privateApi } from "./api-client"



export const taskServices = {
 getTasks: async () => {
  const response = await privateApi.get<ApiResponse<TasksResponse[]>>("/task/tasks")
  return response?.data
 },
 create: async () => {
  const response = await privateApi.post<ApiResponse>("/task/create")
  return response?.data
 },
 remove: async (taskId: string) => {
  const response = await privateApi.delete<ApiResponse>(`/task/remove/${taskId}`)
  return response?.data
 },
}