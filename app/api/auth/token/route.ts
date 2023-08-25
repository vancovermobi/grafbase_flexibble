import { NextRequest, NextResponse } from 'next/server';
import { getToken } from "next-auth/jwt"

const secret= process.env.NEXTAUTH_SECRET as string

export async function GET(req: NextRequest) {
    const token = await getToken({ req, secret, raw: true })
    console.log("Toenk:", token);
    return NextResponse.json({ token }, { status: 200 })
}