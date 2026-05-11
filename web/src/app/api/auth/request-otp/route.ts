import { NextRequest, NextResponse } from "next/server";
import { generateOTP } from "../../../../lib/auth";
import { sendOTPEmail } from "../../../../lib/email";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        if (!body?.email) {
            return NextResponse.json(
                { error: "Email required" },
                { status: 400 }
            );
        }

        const { code, userId } = await generateOTP(body.email);

        await sendOTPEmail(body.email, code);

        return NextResponse.json({ userId });
    } catch (err) {
        console.error("OTP API ERROR:", err);

        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}