import { NextResponse } from "next/server";

export async function GET() {
    return NextResponse.json({
        hasClerkSecret: !!process.env.CLERK_SECRET_KEY,
        hasClerkPublishable: !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
        clerkSecretLength: process.env.CLERK_SECRET_KEY?.length || 0,
        clerkPublishableLength: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.length || 0,
        nodeEnv: process.env.NODE_ENV,
    });
}

export const dynamic = "force-dynamic";
