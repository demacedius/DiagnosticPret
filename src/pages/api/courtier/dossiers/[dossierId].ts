import type { APIRoute } from 'astro';
import { createServerSupabaseClient } from '../../../../lib/supabase';
import { getDossier, getDiagnostics, updateDossierStatut } from '../../../../lib/courtier';

export const GET: APIRoute = async ({ locals, params }) => {
  const { userId } = locals.auth();
  if (!userId) return new Response('Unauthorized', { status: 401 });

  const token = await locals.auth().getToken({ template: 'supabase' });
  if (!token) return new Response('Token error', { status: 500 });

  try {
    const supabase = createServerSupabaseClient(token);
    const dossier = await getDossier(params.dossierId!, supabase);
    const diagnostics = await getDiagnostics(params.dossierId!, supabase);
    return new Response(JSON.stringify({ ...dossier, diagnostics }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('[api/courtier/dossiers/[id] GET]', err);
    return new Response('Not found', { status: 404 });
  }
};

export const PATCH: APIRoute = async ({ locals, params, request }) => {
  const { userId } = locals.auth();
  if (!userId) return new Response('Unauthorized', { status: 401 });

  const token = await locals.auth().getToken({ template: 'supabase' });
  if (!token) return new Response('Token error', { status: 500 });

  let body: { statut?: string; titre?: string };
  try {
    body = await request.json();
  } catch {
    return new Response('Invalid JSON', { status: 400 });
  }

  const validStatuts = ['en_attente', 'en_cours', 'accorde', 'refuse'];

  try {
    const supabase = createServerSupabaseClient(token);

    if (body.statut) {
      if (!validStatuts.includes(body.statut)) {
        return new Response('Statut invalide', { status: 400 });
      }
      await updateDossierStatut(params.dossierId!, body.statut, supabase);
    }

    if (body.titre) {
      const { error } = await supabase
        .from('courtier_dossiers')
        .update({ titre: body.titre.trim(), updated_at: new Date().toISOString() })
        .eq('id', params.dossierId!);
      if (error) throw error;
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('[api/courtier/dossiers/[id] PATCH]', err);
    return new Response('Server error', { status: 500 });
  }
};
