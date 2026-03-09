import bcrypt from "bcrypt"
import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GithubProvider from "next-auth/providers/github"
import GoogleProvider from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"

import prisma from "@/app/libs/prismadb"

const stableAuthUrl = process.env.NEXTAUTH_URL_PRODUCTION?.trim()
const allowedPreviewHostSuffix = process.env.NEXTAUTH_PREVIEW_HOST_SUFFIX?.trim()
const redirectProxyUrl = process.env.AUTH_REDIRECT_PROXY_URL?.trim()

if (process.env.VERCEL_ENV === "preview" && stableAuthUrl) {
  process.env.NEXTAUTH_URL = stableAuthUrl
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID as string,
      clientSecret: process.env.GITHUB_SECRET as string,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
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
  pages: {
    signIn: "/",
  },
  debug: process.env.NODE_ENV === "development",
  session: {
    strategy: "jwt",
  },
  trustHost: true,
  ...(redirectProxyUrl ? { redirectProxyUrl } : {}),
  callbacks: {
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`
      }

      try {
        const target = new URL(url)
        const currentBase = new URL(baseUrl)

        if (target.origin === currentBase.origin) {
          return url
        }

        if (
          allowedPreviewHostSuffix &&
          target.protocol === "https:" &&
          target.hostname.endsWith(allowedPreviewHostSuffix)
        ) {
          return url
        }
      } catch {}

      return baseUrl
    },
  },
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
})
