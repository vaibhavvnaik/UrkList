import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(req: NextRequest) {
  const { nextUrl, headers } = req
  const host = headers.get('host') || ''

  // Redirect per-deployment Vercel URLs to the stable branch alias URL.
  // Per-deployment: urk-{hash}-ncgcompany2023-s-team.vercel.app  (changes every build)
  // Branch alias:   urk-git-{branch}-ncgcompany2023-s-team.vercel.app (stable per branch, registered in GCP)
  const isVercelPerDeployment =
    host.endsWith('ncgcompany2023-s-team.vercel.app') &&
    !host.startsWith('urk-git-')

  if (isVercelPerDeployment && process.env.VERCEL_BRANCH_URL) {
    const url = `https://${process.env.VERCEL_BRANCH_URL}${nextUrl.pathname}${nextUrl.search}`
    return NextResponse.redirect(url, 308)
  }

  // Protect authenticated routes
  const token = await getToken({ req })
  const protectedPaths = ['/trips', '/reservations', '/properties', '/favorites']
  const isProtected = protectedPaths.some(p => nextUrl.pathname.startsWith(p))

  if (isProtected && !token) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
