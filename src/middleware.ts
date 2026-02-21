import { clerkMiddleware, createRouteMatcher } from '@clerk/astro/server';
import { sequence } from 'astro:middleware';

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/diagnostic(.*)',
  '/compte(.*)',
  '/courtier(.*)',
]);

// Middleware pour forcer HTTPS et rediriger www vers non-www
const httpsRedirect = async (context, next) => {
  const url = new URL(context.request.url);
  const forwardedProto = context.request.headers.get('x-forwarded-proto');

  // En production, forcer HTTPS (vérifier le header X-Forwarded-Proto de Railway)
  if (import.meta.env.PROD && forwardedProto === 'http') {
    url.protocol = 'https:';
    return Response.redirect(url.toString(), 301);
  }

  // Rediriger www vers non-www
  if (url.hostname === 'www.dossierpret.fr') {
    url.hostname = 'dossierpret.fr';
    return Response.redirect(url.toString(), 301);
  }

  // Ajouter les headers de sécurité HSTS
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

export const onRequest = sequence(httpsRedirect, clerkAuth);
