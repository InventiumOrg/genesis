import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isPublicRoute = createRouteMatcher([
  '/',
  '/pricing',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/sso-callback',
  '/api/webhooks(.*)',
]);

const isApiRoute = createRouteMatcher(['/api/(.*)']);

export default clerkMiddleware(async (auth, request) => {
  if (isPublicRoute(request)) return;

  const { userId } = await auth();
  if (userId) return;

  // The data API answers callers, not browsers: a JSON 401 is the honest
  // reply, where `auth.protect()` would hand an API client an HTML page.
  if (isApiRoute(request)) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  // Send a signed-out visitor to the sign-in screen rather than Clerk's
  // default 404, which is what an unauthenticated /dashboard used to get.
  await auth.protect({
    unauthenticatedUrl: new URL('/sign-in', request.url).toString(),
  });
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
