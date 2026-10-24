import { z } from "zod";

export const sendOtpSchema = z.object({
    phone: z
        .string()
        .regex(/^[0-9]{10}$/, "Phone number must be 10 digits")
});

export const verifyOtpSchema = z.object({
    phone: z
        .string()
        .regex(/^[0-9]{10}$/, "Phone number must be 10 digits"),

    code: z
        .string()
        .regex(/^[0-9]{6}$/, "OTP must be 6 digits")
});

