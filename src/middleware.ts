import { clerkMiddleware, createRouteMatcher } from '@clerk/astro/server';
import { sequence } from 'astro:middleware';

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/diagnostic(.*)',
  '/compte(.*)',
  '/courtier(.*)',
]);

// Middleware pour ajouter les headers de sécurité
const securityHeaders = async (context, next) => {
  // Railway gère déjà les redirections HTTPS et www automatiquement
  // On ajoute juste les headers de sécurité
  const response = await next();

  if (import.meta.env.PROD) {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
  }

  return response;
};

const clerkAuth = clerkMiddleware((auth, context) => {
  if (isProtectedRoute(context.request) && !auth().userId) {
    return auth().redirectToSignIn();
  }
});

export const onRequest = sequence(securityHeaders, clerkAuth);
