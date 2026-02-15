import type { APIRoute } from 'astro';
import { createServerSupabaseClient } from '../../../lib/supabase';
import { saveDiagnostic, getDossier } from '../../../lib/courtier';
import type { DiagnosticResult, DiagnosticInput } from '../../../lib/courtier-types';

export const POST: APIRoute = async ({ locals, request }) => {
  const { userId } = locals.auth();
  if (!userId) return new Response('Unauthorized', { status: 401 });


  let body: { dossierId?: string; result?: DiagnosticResult; inputs?: DiagnosticInput };
  try {
    body = await request.json();
  } catch {
    return new Response('Invalid JSON', { status: 400 });
  }

  if (!body.dossierId || !body.result || !body.inputs) {
    return new Response('dossierId, result et inputs requis', { status: 400 });
  }

  try {
    const supabase = createServerSupabaseClient();

    // Vérifier que le courtier est bien propriétaire du dossier
    const dossier = await getDossier(body.dossierId, supabase);
    if (dossier.broker_id !== userId) {
      return new Response('Forbidden', { status: 403 });
    }

    const diagnostic = await saveDiagnostic(
      userId,
      body.dossierId,
      body.result,
      body.inputs,
      supabase
    );

    return new Response(JSON.stringify({ id: diagnostic.id }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('[api/courtier/diagnostics POST]', err);
    return new Response('Server error', { status: 500 });
  }
};
