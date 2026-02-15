import type { APIRoute } from 'astro';
import { createServerSupabaseClient } from '../../../lib/supabase';
import { createDossier } from '../../../lib/courtier';

export const POST: APIRoute = async ({ locals, request }) => {
  const { userId } = locals.auth();
  if (!userId) return new Response('Unauthorized', { status: 401 });


  let body: { clientId?: string; titre?: string };
  try {
    body = await request.json();
  } catch {
    return new Response('Invalid JSON', { status: 400 });
  }

  if (!body.clientId) return new Response('clientId requis', { status: 400 });

  try {
    const supabase = createServerSupabaseClient();
    const dossier = await createDossier(
      userId,
      body.clientId,
      body.titre?.trim() || 'Nouveau dossier',
      supabase
    );
    return new Response(JSON.stringify(dossier), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('[api/courtier/dossiers POST]', err);
    return new Response('Server error', { status: 500 });
  }
};
