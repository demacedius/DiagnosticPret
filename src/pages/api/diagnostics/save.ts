import type { APIRoute } from 'astro';
import { createServerSupabaseClient } from '../../../lib/supabase';
import { saveUserDiagnostic } from '../../../lib/diagnostics';

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // Get current user from Clerk
    const user = await locals.currentUser?.();
    if (!user || !user.id) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Parse request body
    const body = await request.json();

    // Validate required fields
    const {
      score,
      tauxEndettement,
      apportPct,
      resteAVivre,
      mensualite,
      hcsfOk,
      revenus,
      charges,
      montant,
      apport,
      diagnosticType,
    } = body;

    if (
      score == null ||
      tauxEndettement == null ||
      apportPct == null ||
      resteAVivre == null ||
      mensualite == null ||
      hcsfOk == null ||
      revenus == null ||
      charges == null ||
      montant == null ||
      apport == null
    ) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Save to Supabase
    const supabase = createServerSupabaseClient();
    const result = await saveUserDiagnostic(supabase, {
      userId: user.id,
      score,
      tauxEndettement,
      apportPct,
      resteAVivre,
      mensualite,
      hcsfOk,
      revenus,
      charges,
      montant,
      apport,
      duree: body.duree,
      tauxInteret: body.tauxInteret,
      contrat: body.contrat,
      anciennete: body.anciennete,
      decouvert: body.decouvert,
      nbEnfants: body.nbEnfants,
      diagnosticType: diagnosticType || 'express',
    });

    if (!result.success) {
      return new Response(JSON.stringify({ error: result.error }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in /api/diagnostics/save:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
