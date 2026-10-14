
import { RegisterInputType } from "@/modules/auth/register/schema.register"
import { privateApi, publicApi } from "./api-client"
import { ApiResponse } from "@/types"
import { LoginInputType } from "@/modules/auth/login/schema.login"
import { VerifyMfaInputType } from "@/modules/auth/verify-mfa/schema.verify-mfa"
import {
 DisableMfaInputType,
 EnableMfaInputType,
 MfaCodeInputType,
 RegenerateBackupCodesInputType,
} from "@/modules/auth/mfa/schema.mfa"
import {
 LoginData,
 MfaBackupCodesData,
 MfaSetupData,
 User,
} from "@/types"


export const authService = {
 login: async (body: LoginInputType) => {
  const res = await privateApi.post<ApiResponse<LoginData>>("/auth/login", body)
  return res.data
 },
 logout: async () => {
  const res = await privateApi.post<ApiResponse>("/auth/logout")
  return res.data
 },
 register: async (body: RegisterInputType) => {
  const res = await publicApi.post<ApiResponse>("/auth/register", body)
  return res.data
 },
 me: async () => {
  const res = await privateApi.get<ApiResponse<User>>("/auth/me")
  return res.data
 },
 verifyMfa: async (body: VerifyMfaInputType) => {
  const res = await privateApi.post<ApiResponse<LoginData>>("/auth/verify-mfa", body)
  return res.data
 },
 enableMfa: async (body: EnableMfaInputType) => {
  const res = await privateApi.post<ApiResponse<MfaSetupData>>("/auth/enable-mfa", body)
  return res.data
 },
 verifyMfaSetup: async (body: MfaCodeInputType) => {
  const res = await privateApi.post<ApiResponse<MfaBackupCodesData>>(
   "/auth/verify-mfa-setup",
   body
  )
  return res.data
 },
 disableMfa: async (body: DisableMfaInputType) => {
  const res = await privateApi.post<ApiResponse<null>>("/auth/disable-mfa", body)
  return res.data
 },
 regenerateBackupCodes: async (body: RegenerateBackupCodesInputType) => {
  const res = await privateApi.post<ApiResponse<MfaBackupCodesData>>(
   "/auth/regenerate-backup-codes",
   body
  )
  return res.data
 },
}
