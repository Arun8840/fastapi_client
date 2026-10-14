import zod from "zod"

export const RegisterSchema = zod.object({
 email: zod.email("Invalid email format"),
 password: zod.string().min(6, "Password must be at least 6 characters"),
 name: zod.string().min(3, "Name must be at least 3 characters"),
 confirmPassword: zod.string().min(6, "Password must be at least 6 characters"),
}).refine((data) => data.password === data.confirmPassword, {
 message: "Passwords do not match",
 path: ["confirmPassword"],
})

export type RegisterInputType = zod.infer<typeof RegisterSchema>