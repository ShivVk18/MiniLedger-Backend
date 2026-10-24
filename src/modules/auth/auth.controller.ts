import { Request, Response } from "express";
import {
    sendOtp,
    verifyOtp
} from "./auth.service.js";

import {
    sendOtpSchema,
    verifyOtpSchema
} from "./auth.validation.js";

export async function sendOtpController(
    req: Request,
    res: Response
) {
    try {
        const { phone } = sendOtpSchema.parse(req.body);

        const result = await sendOtp(phone);

        return res.status(200).json({
            success: true,
            ...result
        });
    } catch (error) {
        if (error instanceof Error) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }

        return res.status(500).json({
            success: false,
            message: "Something went wrong"
        });
    }
}

export async function verifyOtpController(
    req: Request,
    res: Response
) {
    try {
        const { phone, code } = verifyOtpSchema.parse(req.body);

        const result = await verifyOtp(phone, code);

        return res.status(200).json({
            success: true,
            ...result
        });
    } catch (error) {
        if (error instanceof Error) {
            return res.status(401).json({
                success: false,
                message: error.message
            });
        }

        return res.status(500).json({
            success: false,
            message: "Something went wrong"
        });
    }
}