import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prismaClient";

export const getUser = async () => {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      throw new Error("Unauthorized");
    }
  
    const user = await prisma.user.findUnique({
      where: {
        externalId: clerkId,
      },
      select: {
        id: true,
      },
    });
  
    if (!user) {
      throw new Error("User not found");
    }
  
    return user;
  };