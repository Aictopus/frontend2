import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from 'next/server'

const publicRoutes = createRouteMatcher(['/site', '/api/uploadthing']);

export default clerkMiddleware((auth, req) => {
  const url = req.nextUrl
  const searchParams = url.searchParams.toString()
  let hostname = req.headers

  const pathWithSearchParams = `${url.pathname}${
    searchParams.length > 0 ? `?${searchParams}` : ''
  }`

  // const customSubDomain = hostname
  //   .get('host')
  //   ?.split(`${process.env.NEXT_PUBLIC_DOMAIN}`)
  //   .filter(Boolean)[0]
  
  const host = req.headers.get('host') || ''
  const domainParts = host.split('.')
  const customSubDomain = domainParts.length > 2 ? domainParts[0] : null

    if (customSubDomain) {
      return NextResponse.rewrite(
        new URL(`/${customSubDomain}${pathWithSearchParams}`, req.url)
      )
    }

  if (url.pathname === '/sign-in' || url.pathname === '/sign-up') {
    return NextResponse.redirect(new URL(`/agency/sign-in`, req.url))
  }

  // 修改这里的逻辑
  if (url.pathname === '/') {
    return NextResponse.rewrite(new URL('/site', req.url))
  }

  if (url.pathname === '/app') {
    return NextResponse.rewrite(new URL('/', req.url))
  }

  if (
    url.pathname.startsWith('/agency') ||
    url.pathname.startsWith('/subaccount')
  ) {
    return NextResponse.rewrite(new URL(`${pathWithSearchParams}`, req.url))
  }

  if (publicRoutes(req)) {
    return NextResponse.next()
  }

  // Protect all other routes
  // auth().protect();
});

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};