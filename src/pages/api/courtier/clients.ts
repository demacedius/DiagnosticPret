import type { APIRoute } from 'astro';
import { createServerSupabaseClient } from '../../../lib/supabase';
import { getClients, createClient } from '../../../lib/courtier';

export const GET: APIRoute = async ({ locals }) => {
  const { userId } = locals.auth();
  if (!userId) return new Response('Unauthorized', { status: 401 });

  const token = await locals.auth().getToken({ template: 'supabase' });
  if (!token) return new Response('Token error', { status: 500 });

  try {
    const supabase = createServerSupabaseClient(token);
    const clients = await getClients(userId, supabase);
    return new Response(JSON.stringify(clients), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('[api/courtier/clients GET]', err);
    return new Response('Server error', { status: 500 });
  }
};

export const POST: APIRoute = async ({ locals, request }) => {
  const { userId } = locals.auth();
  if (!userId) return new Response('Unauthorized', { status: 401 });

  const token = await locals.auth().getToken({ template: 'supabase' });
  if (!token) return new Response('Token error', { status: 500 });

  let body: { nom?: string; email?: string };
  try {
    body = await request.json();
  } catch {
    return new Response('Invalid JSON', { status: 400 });
  }

  if (!body.nom?.trim()) {
    return new Response('Nom requis', { status: 400 });
  }

  try {
    const supabase = createServerSupabaseClient(token);
    const client = await createClient(userId, body.nom.trim(), body.email?.trim() || null, supabase);
    return new Response(JSON.stringify(client), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('[api/courtier/clients POST]', err);
    return new Response('Server error', { status: 500 });
  }
};
