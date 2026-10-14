import { useQuery } from "@tanstack/react-query"
import { authKeys } from "../keys/auth-keys"
import { authService } from "../controller/auth.service"

export const useCurrentUser = (enabled = true) =>
 useQuery({
  queryKey: authKeys.me,
  queryFn: authService.me,
  enabled,
  retry: false,
 })
