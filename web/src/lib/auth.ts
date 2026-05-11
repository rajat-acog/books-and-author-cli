import { randomUUID } from "crypto";

/**
 * TEMP in-memory store (for dev only)
 */
const otpStore: Record<
    string,
    { code: string; expires: number }
> = {};

/**
 * Generate OTP
 */
export async function generateOTP(email: string) {
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    const userId = randomUUID();

    otpStore[userId] = {
        code,
        expires: Date.now() + 10 * 60 * 1000, // 10 min
    };

    console.log("OTP for", email, "=", code); // 👈 debug

    return { code, userId };
}

/**
 * Verify OTP
 */
export function verifyOTP(userId: string, otp: string) {
    const record = otpStore[userId];

    if (!record) return false;

    if (record.code !== otp) return false;

    if (Date.now() > record.expires) return false;

    delete otpStore[userId]; // one-time use

    return true;
}