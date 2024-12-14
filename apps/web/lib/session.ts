import { getServerSession } from "next-auth/next"

import { ExtendedUser } from "@/types/auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function getCurrentUser() {
  const session = await getServerSession(authOptions)

  return session?.user as ExtendedUser
}

export async function isAdmin() {
  const sessionUser = await getCurrentUser()
  if (!sessionUser) return false
  const user = await prisma.user.findUnique({
    where: {
      id: sessionUser.id,
    },
  })

  return user?.admin
}
