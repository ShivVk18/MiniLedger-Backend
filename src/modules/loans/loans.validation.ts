import { z } from "zod";

export const createLoanSchema = z.object({
    friendName: z
        .string()
        .trim()
        .min(1, "Friend name is required")
        .max(100, "Friend name is too long"),

    amount: z
        .number()
        .positive("Amount must be greater than 0"),

    dueDate: z
        .string()
        .datetime("Due date must be a valid ISO date")
});

export type CreateLoanInput = z.infer<typeof createLoanSchema>;