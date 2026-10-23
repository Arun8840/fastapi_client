import zod from "zod"

export const CreateTaskSchema = zod.object({
 title: zod.string().min(1, "Title is required").max(100, "Title must be at most 100 characters"),
 description: zod.string().max(500, "Description must be at most 500 characters").optional(),
 due_date: zod.string().datetime({ offset: true }).nullable().optional(),
 status: zod.enum(["pending", "in_progress", "completed", "cancelled"]),
 order: zod.number().optional(),
})

export type CreateTaskInputType = zod.infer<typeof CreateTaskSchema>