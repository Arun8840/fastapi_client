import { useMutation } from "@tanstack/react-query"
import { authKeys } from "../keys/auth-keys"
import { authService } from "../controller/auth.service"
import { RegisterInputType } from "@/modules/auth/register/schema.register"
import { LoginInputType } from "@/modules/auth/login/schema.login"


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

 return {
  login,
  logout,
  register
 }
}