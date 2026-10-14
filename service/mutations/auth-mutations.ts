import { useMutation } from "@tanstack/react-query"
import { authKeys } from "../keys/auth-keys"
import { authService } from "../controller/auth.service"
import { RegisterInputType } from "@/modules/auth/register/schema.register"
import { LoginInputType } from "@/modules/auth/login/schema.login"
import { VerifyMfaInputType } from "@/modules/auth/verify-mfa/schema.verify-mfa"
import {
 DisableMfaInputType,
 EnableMfaInputType,
 MfaCodeInputType,
 RegenerateBackupCodesInputType,
} from "@/modules/auth/mfa/schema.mfa"


export const useAuthMutations = () => {

 const login = useMutation({
  mutationKey: authKeys.login,
  mutationFn: (body: LoginInputType) => authService.login(body)
 })

 const logout = useMutation({
  mutationKey: authKeys.logout,
  mutationFn: () => authService.logout()
 })

 const register = useMutation({
  mutationKey: authKeys.register,
  mutationFn: (body: RegisterInputType) => authService.register(body)
 })

 const verifyMfa = useMutation({
  mutationKey: authKeys.verifyMfa,
  mutationFn: (body: VerifyMfaInputType) => authService.verifyMfa(body)
 })

 const enableMfa = useMutation({
  mutationKey: authKeys.enableMfa,
  mutationFn: (body: EnableMfaInputType) => authService.enableMfa(body)
 })

 const verifyMfaSetup = useMutation({
  mutationKey: authKeys.verifyMfaSetup,
  mutationFn: (body: MfaCodeInputType) => authService.verifyMfaSetup(body)
 })

 const disableMfa = useMutation({
  mutationKey: authKeys.disableMfa,
  mutationFn: (body: DisableMfaInputType) => authService.disableMfa(body)
 })

 const regenerateBackupCodes = useMutation({
  mutationKey: authKeys.regenerateBackupCodes,
  mutationFn: (body: RegenerateBackupCodesInputType) =>
   authService.regenerateBackupCodes(body)
 })

 return {
  login,
  logout,
  register,
  verifyMfa,
  enableMfa,
  verifyMfaSetup,
  disableMfa,
  regenerateBackupCodes,
 }
}
