import prisma from "@/prisma/prisma";
import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
    try {
        const user = await currentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        let resp = await prisma.userChatHistory.findFirst({
            where: {
                userId: user.id,
            },
        });

        if (!resp) {
            resp = await prisma.userChatHistory.create({
                data: {
                    userId: user.id,
                    messages: [],
                },
            });
        }

        return NextResponse.json({ chatHistory: resp.messages });
    } catch (error) {
        console.error("Error fetching chat history:", error);
        return NextResponse.json(
            { error: "Failed to fetch chat history" },
            { status: 500 }
        );
    }
}
