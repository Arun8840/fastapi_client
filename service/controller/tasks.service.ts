import { ApiResponse, TasksResponse, UpdateTaskStatusType, CreateTaskInputType } from "@/types"
import { privateApi } from "./api-client"


export const taskServices = {
 getTasks: async () => {
  const response = await privateApi.get<ApiResponse<TasksResponse[]>>("/task/tasks")
  return response?.data
 },
 create: async (data: CreateTaskInputType) => {
  const response = await privateApi.post<ApiResponse>("/task/create", data)
  return response?.data
 },
 remove: async (taskId: string) => {
  const response = await privateApi.delete<ApiResponse>(`/task/remove/${taskId}`)
  return response?.data
 },
 update_status: async (payload: UpdateTaskStatusType) => {
  const response = await privateApi.post<ApiResponse<TasksResponse>>(`/task/update-status`, payload)
  return response?.data
 }
}