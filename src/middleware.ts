import { clerkMiddleware, createRouteMatcher } from '@clerk/astro/server';

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/diagnostic(.*)',
  '/compte(.*)',
]);

export const onRequest = clerkMiddleware((auth, context) => {
  if (isProtectedRoute(context.request) && !auth().userId) {
    return auth().redirectToSignIn();
  }
});
