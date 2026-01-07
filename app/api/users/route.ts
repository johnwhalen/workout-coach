/**
 * Users API endpoint
 *
 * POST /api/users - Create or get the current user
 */

import prisma from "@/prisma/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/utils/logger";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const user = await currentUser();

  if (!user) {
    return NextResponse.json({ error: "User Not Signed In" }, { status: 401 });
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: {
        user_id: user.id,
      },
    });

    let newUser = null;
    if (!existingUser) {
      newUser = await prisma.user.create({
        data: {
          user_id: user.id,
          email: String(user.primaryEmailAddress?.emailAddress),
          password: "",
        },
      });
      logger.info("New user created", { source: "api/users", userId: user.id });
    } else {
      newUser = existingUser;
    }

    return NextResponse.json({
      data: {
        user_id: newUser.user_id,
        email: newUser.email,
        profile_complete: newUser.profile_complete,
        isNewUser: !existingUser,
      },
      message: "User Created Successfully",
    });
  } catch (error) {
    logger.error("Error creating user", { source: "api/users", userId: user.id }, error as Error);
    return NextResponse.json({ error: "Failed to create user" }, { status: 400 });
  }
}
