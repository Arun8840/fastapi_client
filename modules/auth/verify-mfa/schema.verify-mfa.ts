import zod from "zod"

export const VerifyMfaSchema = zod.object({
 code: zod
  .string()
  .min(6, "Enter your 6-digit code or a backup code")
  .max(20, "Code is too long"),
})

export type VerifyMfaInputType = zod.infer<typeof VerifyMfaSchema>
