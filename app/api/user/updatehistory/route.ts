import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { z } from "zod";

export const dynamic = "force-dynamic";

const UpdateHistorySchema = z.object({
    messages: z.array(z.string()),
});

export async function POST(req: NextRequest) {
    try {
        const user = await currentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const reqBody = await req.json();
        const parseResult = UpdateHistorySchema.safeParse(reqBody);
        if (!parseResult.success) {
            return NextResponse.json(
                { error: "Invalid request", details: parseResult.error.issues },
                { status: 400 }
            );
        }

        const { messages } = parseResult.data;

        await prisma.userChatHistory.upsert({
            where: { userId: user.id },
            update: { messages },
            create: { userId: user.id, messages },
        });

        return NextResponse.json({ message: "Chat history updated" });
    } catch (error) {
        console.error("Error updating user history:", error);
        return NextResponse.json(
            { error: "Error updating user history" },
            { status: 500 }
        );
    }
}
