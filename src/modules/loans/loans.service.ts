
import { Temporal } from "temporal-polyfill";
import { db } from "../../prisma/db.js";
import { CreateLoanInput } from "./loans.validation.js";

export async function createLoan(
    userId: string,
    data: CreateLoanInput
) {
    const loan = await db.orm.public.Loan.create({
        
            userId,
            friendName: data.friendName,
            amount: data.amount,
            dueDate: Temporal.Instant.from(data.dueDate)
        
    });

    return loan;
}

export async function getLoans(userId: string) {
    const loans = await db.orm.public.Loan.where(
      {
            userId
       
      } 
    ).orderBy((o) => o.createdAt.desc()).all()
   
  

    return loans.map((loan) => ({
        ...loan,
        isOverdue:
    loan.status === "PENDING" &&
    Temporal.Instant.compare(
        loan.dueDate,
        Temporal.Now.instant()
    ) < 0
    }));
}

export async function repayLoan(
    userId: string,
    loanId: string
) {
    const loan = await db.orm.public.Loan.where({
         
            id: loanId,
            userId
}).first();

    if (!loan) {
        throw new Error("Loan not found");
    }

    if (loan.status === "REPAID") {
        throw new Error("Loan is already repaid");
    }

    const updatedLoan = await db.orm.public.Loan.where({id: loan.id}).update({
       
            status: "REPAID",
            repaidAt: Temporal.Now.instant()
       
    });


    return updatedLoan;
}

export async function getSummary(userId: string) {
    const loans = await db.orm.public.Loan.where({
        
            userId
        
    }).all();

    const now = Temporal.Now.instant();

    const totalLent = loans.reduce(
        (total, loan) => total + Number(loan.amount),
        0
    );

    const totalRepaid = loans
        .filter((loan) => loan.status === "REPAID")
        .reduce(
            (total, loan) => total + Number(loan.amount),
            0
        );

    const overdueAmount = loans
        .filter(
            (loan) =>
                loan.status === "PENDING" &&
                Temporal.Instant.compare(
                    loan.dueDate,
                    now
                ) < 0
        )
        .reduce(
            (total, loan) => total + Number(loan.amount),
            0
        );

    return {
        totalLent,
        totalRepaid,
        overdueAmount
    };
}