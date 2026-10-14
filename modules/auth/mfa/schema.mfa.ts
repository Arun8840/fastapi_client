import zod from "zod"

export const EnableMfaSchema = zod.object({
 password: zod.string().min(6, "Password must be at least 6 characters"),
})

export type EnableMfaInputType = zod.infer<typeof EnableMfaSchema>

export const MfaCodeSchema = zod.object({
 code: zod.string().regex(/^\d{6}$/, "Enter the 6-digit code"),
})

export type MfaCodeInputType = zod.infer<typeof MfaCodeSchema>

export const DisableMfaSchema = zod.object({
 password: zod.string().min(6, "Password must be at least 6 characters"),
 code: zod.string().regex(/^\d{6}$/, "Enter the 6-digit code"),
})

export type DisableMfaInputType = zod.infer<typeof DisableMfaSchema>

export const RegenerateBackupCodesSchema = zod.object({
 password: zod.string().min(6, "Password must be at least 6 characters"),
})

export type RegenerateBackupCodesInputType = zod.infer<typeof RegenerateBackupCodesSchema>
