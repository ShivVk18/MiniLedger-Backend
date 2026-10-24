import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware.js";
import { createLoanController, getLoansController, getSummaryController, repayLoanController } from "./loans.controller.js";

const router = Router();

router.post(
    "/",
    authenticate,
    createLoanController
);

router.get(
    "/",
    authenticate,
    getLoansController
);

router.patch(
    "/:id/repay",
    authenticate,
    repayLoanController
);

router.get(
    "/summary",
    authenticate,
    getSummaryController
);

export default router;