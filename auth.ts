import bcrypt from "bcrypt"
import NextAuth from "next-auth"
import authConfig from "@/auth.config"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"

import prisma from "@/app/libs/prismadb"

const redirectProxyUrl = process.env.AUTH_REDIRECT_PROXY_URL?.trim()

if (process.env.VERCEL_ENV === "preview" && redirectProxyUrl) {
  try {
    process.env.NEXTAUTH_URL = new URL(redirectProxyUrl).origin
  } catch {}
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  providers: [
    ...(authConfig.providers ?? []),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "email", type: "text" },
        password: { label: "password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials")
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        })

        if (!user || !user.hashedPassword) {
          throw new Error("Invalid credentials")
        }

        const isCorrectPassword = await bcrypt.compare(
          credentials.password,
          user.hashedPassword
        )

        if (!isCorrectPassword) {
          throw new Error("Invalid credentials")
        }

        return user
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
})
