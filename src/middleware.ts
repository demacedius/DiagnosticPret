import { clerkMiddleware, createRouteMatcher } from '@clerk/astro/server';
import { sequence } from 'astro:middleware';

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/diagnostic(.*)',
  '/compte(.*)',
  '/courtier(.*)',
]);

async function wwwRedirect({ request }: { request: Request }, next: () => Promise<Response>) {
  const url = new URL(request.url);
  if (url.hostname.startsWith('www.')) {
    url.hostname = url.hostname.slice(4);
    return Response.redirect(url.toString(), 308);
  }
  return next();
}

export const onRequest = sequence(
  wwwRedirect,
  clerkMiddleware((auth, context) => {
    if (isProtectedRoute(context.request) && !auth().userId) {
      return auth().redirectToSignIn();
    }
  })
);
