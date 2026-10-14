
import { RegisterInputType } from "@/modules/auth/register/schema.register"
import { privateApi, publicApi } from "./api-client"
import { ApiResponse } from "@/types"
import { LoginInputType } from "@/modules/auth/login/schema.login"


export const authService = {
 login: async (body: LoginInputType) => {
  const res = await privateApi.post<ApiResponse>("/auth/login", body)
  return res.data
 },
 logout: async () => {
  const res = await privateApi.post<ApiResponse>("/auth/logout")
  return res.data
 },
 register: async (body: RegisterInputType) => {
  const res = await publicApi.post<ApiResponse>("/auth/register", body)
  return res.data
 }
}