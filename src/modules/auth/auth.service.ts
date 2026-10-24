import { Temporal } from "temporal-polyfill";
import { db } from "../../prisma/db.js";
import jwt from 'jsonwebtoken'
const OTP_EXPIRY_MINUTES = 5;

function generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
}


export const sendOtp = async(phone:string) => {
    const otp =  generateOtp()

   

    const expiresAt = Temporal.Instant.fromEpochMilliseconds(
  Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000
);

    
   await db.orm.public.OtpCode.create({
     code:otp,
     phone:phone,
     expiresAt:expiresAt
   })
    console.log(`OTP for ${phone}: ${otp}`);

    return {
        message: "OTP sent successfully"
    };
}

export async function verifyOtp(
    phone: string,
    code: string
) {
    const otpRecord = await db.orm.public.OtpCode
    .where({ phone, code })
    .orderBy((o) => o.createdAt.desc())
    .first();

    if (!otpRecord) {
        throw new Error("Invalid OTP");
    }

    if (Temporal.Instant.compare(otpRecord.expiresAt, Temporal.Now.instant()) < 0) {
  throw new Error("OTP has expired");
}

    let user = await db.orm.public.User.where({
        phone:phone
    }).first();

    if (!user) {
        user = await db.orm.public.User.create({
            phone:phone
        });
    }

    await db.orm.public.OtpCode.where({
    
            id: otpRecord.id
       
    }).deleteAll();

    const token = jwt.sign(
        {
            userId: user.id,
            phone: user.phone
        },
        process.env.JWT_SECRET as string,
        {
            expiresIn: "7d"
        }
    );

    return {
        token,
        user: {
            id: user.id,
            phone: user.phone
        }
    };
}

