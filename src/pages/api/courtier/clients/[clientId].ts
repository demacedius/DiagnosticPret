import type { APIRoute } from 'astro';
import { createServerSupabaseClient } from '../../../../lib/supabase';
import { getClient, getDossiers } from '../../../../lib/courtier';

export const GET: APIRoute = async ({ locals, params }) => {
  const { userId } = locals.auth();
  if (!userId) return new Response('Unauthorized', { status: 401 });

  const token = await locals.auth().getToken({ template: 'supabase' });
  if (!token) return new Response('Token error', { status: 500 });

  try {
    const supabase = createServerSupabaseClient(token);
    const client = await getClient(params.clientId!, supabase);
    const dossiers = await getDossiers(params.clientId!, supabase);
    return new Response(JSON.stringify({ ...client, dossiers }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('[api/courtier/clients/[id] GET]', err);
    return new Response('Not found', { status: 404 });
  }
};

export const PATCH: APIRoute = async ({ locals, params, request }) => {
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

  try {
    const supabase = createServerSupabaseClient(token);
    const updates: Record<string, string> = {};
    if (body.nom)   updates.nom   = body.nom.trim();
    if (body.email !== undefined) updates.email = body.email.trim();

    const { error } = await supabase
      .from('courtier_clients')
      .update(updates)
      .eq('id', params.clientId!);
    if (error) throw error;

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('[api/courtier/clients/[id] PATCH]', err);
    return new Response('Server error', { status: 500 });
  }
};

export const DELETE: APIRoute = async ({ locals, params }) => {
  const { userId } = locals.auth();
  if (!userId) return new Response('Unauthorized', { status: 401 });

  const token = await locals.auth().getToken({ template: 'supabase' });
  if (!token) return new Response('Token error', { status: 500 });

  try {
    const supabase = createServerSupabaseClient(token);
    const { error } = await supabase
      .from('courtier_clients')
      .delete()
      .eq('id', params.clientId!);
    if (error) throw error;

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('[api/courtier/clients/[id] DELETE]', err);
    return new Response('Server error', { status: 500 });
  }
};
