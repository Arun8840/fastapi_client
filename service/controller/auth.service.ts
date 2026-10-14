
import { RegisterInputType } from "@/modules/auth/register/schema.register"
import { publicApi } from "./api-client"
import { ApiResponse } from "@/types"


export const authService = {
 register: async (body: RegisterInputType) => {
  const res = await publicApi.post<ApiResponse>("/auth/register", body)
  return res.data
 }
}