import zod from "zod"

export const LoginSchema = zod.object({
 email: zod.email("Invalid email format"),
 password: zod.string().min(6, "Password must be at least 6 characters"),
})

export type LoginInputType = zod.infer<typeof LoginSchema>