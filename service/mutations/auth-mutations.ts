import { useMutation } from "@tanstack/react-query"
import { authKeys } from "../keys/auth-keys"
import { authService } from "../controller/auth.service"
import { RegisterInputType } from "@/modules/auth/register/schema.register"


export const useAuthMutations = () => {

 const register = useMutation({
  mutationKey: authKeys.register,
  mutationFn: (body: RegisterInputType) => authService.register(body)
 })

 return {
  register
 }
}