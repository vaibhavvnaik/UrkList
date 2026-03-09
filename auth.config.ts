import GithubProvider from "next-auth/providers/github"
import GoogleProvider from "next-auth/providers/google"
import type { NextAuthConfig } from "next-auth"

const redirectProxyUrl = process.env.AUTH_REDIRECT_PROXY_URL?.trim()

const authConfig: NextAuthConfig = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID as string,
      clientSecret: process.env.GITHUB_SECRET as string,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
  pages: {
    signIn: "/",
  },
  debug: process.env.NODE_ENV === "development",
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
          process.env.VERCEL_ENV === "preview" &&
          target.protocol === "https:" &&
          target.hostname.endsWith(".vercel.app")
        ) {
          return url
        }
      } catch {}

      return baseUrl
    },
  },
}

export default authConfig
