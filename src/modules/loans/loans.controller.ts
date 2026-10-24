import { Response } from "express";
import { AuthRequest } from "../../middleware/auth.middleware.js";
import { createLoan,getLoans, getSummary, repayLoan } from "./loans.service.js";
import { createLoanSchema } from "./loans.validation.js";


interface LoanParams {
    id: string;
}
export async function createLoanController(
    req: AuthRequest,
    res: Response
) {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }

        const data = createLoanSchema.parse(req.body);

        const loan = await createLoan(
            req.user.userId,
            data
        );

        return res.status(201).json({
            success: true,
            loan
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
            message: "Failed to create loan"
        });
    }
}

export async function getLoansController(
    req: AuthRequest,
    res: Response
) {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }

        const loans = await getLoans(req.user.userId);

        return res.status(200).json({
            success: true,
            loans
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch loans"
        });
    }
}

export async function repayLoanController(
    req: AuthRequest  & { params: LoanParams },
    res: Response
) {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }

        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Loan ID is required"
            });
        }

        const loan = await repayLoan(
            req.user.userId,
            id
        );

        return res.status(200).json({
            success: true,
            loan
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
            message: "Failed to repay loan"
        });
    }
}

export async function getSummaryController(
    req: AuthRequest,
    res: Response
) {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }

        const summary = await getSummary(
            req.user.userId
        );

        return res.status(200).json({
            success: true,
            summary
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch summary"
        });
    }
}