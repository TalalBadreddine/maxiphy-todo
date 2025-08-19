import { z } from "zod"

export const priorityEnum = z.enum(["LOW", "MEDIUM", "HIGH"])
export const statusEnum = z.enum(["TODO", "IN_PROGRESS", "DONE"])

export const createTodoSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(100, "Title too long (max 100 chars)")
    .trim(),
  description: z
    .string()
    .max(500, "Description too long")
    .trim()
    .optional()
    .default(""),
  priority: priorityEnum.default("MEDIUM"),
  status: statusEnum.default("TODO"),
  dueDate: z
    .date()
    .min(new Date(new Date().setHours(0, 0, 0, 0)), "Can't be in the past")
})

export const updateTodoSchema = z.object({
  id: z.string().uuid("Invalid todo ID"),
  title: z
    .string()
    .min(1, "Title is required")
    .max(100, "Title must not exceed 100 characters")
    .trim()
    .optional(),
  description: z
    .string()
    .max(500, "Description must not exceed 500 characters")
    .trim()
    .optional(),
  priority: priorityEnum.optional(),
  status: statusEnum.optional(),
  completed: z.boolean().optional(),
  pinned: z.boolean().optional(),
  dueDate: z.date().optional()
})

export const todoFiltersSchema = z.object({
  search: z.string().trim().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "ALL"]).optional(),
  completed: z.union([z.boolean(), z.literal("ALL")]).optional(),
  sortBy: z.enum(["date", "priority", "title"]).default("date"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10) // max 100 per page
})

export type CreateTodoFormData = z.infer<typeof createTodoSchema>
export type UpdateTodoFormData = z.infer<typeof updateTodoSchema>
export type TodoFiltersFormData = z.infer<typeof todoFiltersSchema>